'use server'

import { revalidatePath } from 'next/cache'
import { DEFAULT_CURRENCY, normalizeCurrencyCode } from '@/lib/currency/config'
import {
  CATEGORY_SPEC_FIELDS,
  getListingSpecFields,
  LISTING_CONDITIONS,
  MARKETPLACE_CATEGORIES,
} from '@/lib/marketplace-config'
import { canUserPublishListings } from '@/lib/dashboard-data'
import { getOrCreateProfile } from '@/lib/dashboard-server'
import { parseShippingProfileFromForm } from '@/lib/checkout'
import { isValidImageSrcInput, normalizeImageList, normalizeImageSrc } from '@/lib/image-src'
import { createClient } from '@/lib/supabase/server'
import { Category, Condition } from '@/types/listing'
import type { PublishListingState } from './state'

function assertConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || !url.startsWith('https://')) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
    )
  }
}

function cleanString(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function createInternalFailure(
  publicMessage: string,
  technicalDetails: string,
  context?: Record<string, unknown>
): PublishListingState {
  console.error('[publishListing]', technicalDetails, context ?? {})
  return {
    status: 'error',
    message: publicMessage,
    technicalDetails,
  }
}

function parseNumber(value: string): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeCategory(value: string): Category | null {
  return MARKETPLACE_CATEGORIES.includes(value as Category) ? (value as Category) : null
}

function normalizeCondition(value: string): Condition | null {
  return LISTING_CONDITIONS.includes(value as Condition) ? (value as Condition) : null
}

function isMissingListingsTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const knownCodes = new Set(['PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) return true

  const message = (error.message ?? '').toLowerCase()
  return message.includes("could not find the table 'public.listings'") || message.includes('relation "listings" does not exist')
}

function isMissingListingsColumnError(
  error: { code?: string; message?: string } | null,
  column: string
): boolean {
  if (!error) return false
  const message = (error.message ?? '').toLowerCase()
  const normalizedColumn = column.toLowerCase()

  return (
    message.includes(`could not find the '${normalizedColumn}' column of 'listings'`) ||
    message.includes(`column listings.${normalizedColumn} does not exist`) ||
    message.includes(`column "${normalizedColumn}" of relation "listings" does not exist`)
  )
}

function isMissingPrivateDetailsTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const knownCodes = new Set(['PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) return true

  const message = (error.message ?? '').toLowerCase()
  return (
    message.includes("could not find the table 'public.listing_private_details'") ||
    message.includes('relation "listing_private_details" does not exist')
  )
}

function buildSpecPayload(formData: FormData): Record<string, string> {
  const specs: Record<string, string> = {}

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('spec_') || typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) specs[key.replace(/^spec_/, '')] = trimmed
  }

  return specs
}

async function savePrivateIdentifiers(
  listingId: string,
  sellerId: string,
  imei: string,
  serialNumber: string
): Promise<{ error?: string; technicalDetails?: string }> {
  const supabase = await createClient()

  if (!imei && !serialNumber) {
    const { error } = await supabase
      .from('listing_private_details')
      .delete()
      .eq('listing_id', listingId)
      .eq('seller_id', sellerId)

    if (isMissingPrivateDetailsTableError(error)) return {}
    if (error) return { error: error.message }
    return {}
  }

  const { error } = await supabase.from('listing_private_details').upsert(
    {
      listing_id: listingId,
      seller_id: sellerId,
      imei: imei || null,
      serial_number: serialNumber || null,
    },
    { onConflict: 'listing_id' }
  )

  if (isMissingPrivateDetailsTableError(error)) {
    return {
      error: 'Your listing was saved, but some private device details could not be stored. Please edit the listing and try again.',
      technicalDetails:
        'Missing listing_private_details table while saving private identifiers. Run supabase/sql/listing_media_and_trust_upgrade.sql.',
    }
  }

  if (error) {
    return {
      error: 'Your listing was saved, but some private device details could not be stored. Please edit the listing and try again.',
      technicalDetails: error.message,
    }
  }
  return {}
}

function buildLegacyListingPayload<T extends Record<string, unknown>>(payload: T): Omit<T, 'images'> {
  const { images, ...legacyPayload } = payload
  void images
  return legacyPayload
}

function normalizeDuplicateText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeDuplicateNumber(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(2)
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed.toFixed(2) : ''
  }
  return ''
}

function serializeDuplicateSpecs(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''

  return Object.entries(value as Record<string, unknown>)
    .map(([key, raw]) => [key, typeof raw === 'string' ? normalizeDuplicateText(raw) : String(raw ?? '')] as const)
    .filter(([, raw]) => raw)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, raw]) => `${key}:${raw}`)
    .join('|')
}

function createDuplicateListingSignature(payload: {
  category: string
  title: string
  brand: string
  model: string
  currencyCode: string
  price: number
  originalPrice: number | null
  condition: string
  description: string
  sellerNotes: string
  deviceSpecs: Record<string, string>
}): string {
  return [
    normalizeDuplicateText(payload.category),
    normalizeDuplicateText(payload.title),
    normalizeDuplicateText(payload.brand),
    normalizeDuplicateText(payload.model),
    normalizeDuplicateText(payload.currencyCode),
    normalizeDuplicateNumber(payload.price),
    normalizeDuplicateNumber(payload.originalPrice),
    normalizeDuplicateText(payload.condition),
    normalizeDuplicateText(payload.description),
    normalizeDuplicateText(payload.sellerNotes),
    serializeDuplicateSpecs(payload.deviceSpecs),
  ].join('||')
}

async function findDuplicateListing(params: {
  supabase: Awaited<ReturnType<typeof createClient>>
  sellerId: string
  listingId?: string
  category: Category
  title: string
  brand: string
  model: string
  currencyCode: string
  price: number
  originalPrice: number | null
  condition: Condition
  description: string
  sellerNotes: string
  deviceSpecs: Record<string, string>
}): Promise<{ duplicateId?: string; error?: PublishListingState }> {
  const candidateSignature = createDuplicateListingSignature({
    category: params.category,
    title: params.title,
    brand: params.brand,
    model: params.model,
    currencyCode: params.currencyCode,
    price: params.price,
    originalPrice: params.originalPrice,
    condition: params.condition,
    description: params.description,
    sellerNotes: params.sellerNotes,
    deviceSpecs: params.deviceSpecs,
  })

  let query = params.supabase
    .from('listings')
    .select('id,category,title,brand,model,currency_code,price,original_price,condition,description,seller_notes,device_specs,status')
    .eq('seller_id', params.sellerId)
    .in('status', ['draft', 'pending_review', 'active', 'paused'])

  if (params.listingId) {
    query = query.neq('id', params.listingId)
  }

  const { data, error } = await query.limit(100)

  if (isMissingListingsTableError(error)) {
    return {
      error: createInternalFailure(
        'We could not publish your listing right now. Please try again in a moment.',
        'Missing public.listings table while checking duplicate listings.'
      ),
    }
  }

  if (error) {
    return {
      error: createInternalFailure(
        'We could not publish your listing right now. Please try again in a moment.',
        error.message,
        { sellerId: params.sellerId, listingId: params.listingId, duplicateCheck: true }
      ),
    }
  }

  const duplicate = (data ?? []).find((row) => {
    const existingSignature = createDuplicateListingSignature({
      category: typeof row.category === 'string' ? row.category : '',
      title: typeof row.title === 'string' ? row.title : '',
      brand: typeof row.brand === 'string' ? row.brand : '',
      model: typeof row.model === 'string' ? row.model : '',
      currencyCode: typeof row.currency_code === 'string' ? row.currency_code : DEFAULT_CURRENCY,
      price: typeof row.price === 'number' ? row.price : Number(row.price ?? 0),
      originalPrice:
        typeof row.original_price === 'number' ? row.original_price : row.original_price ? Number(row.original_price) : null,
      condition: typeof row.condition === 'string' ? row.condition : '',
      description: typeof row.description === 'string' ? row.description : '',
      sellerNotes: typeof row.seller_notes === 'string' ? row.seller_notes : '',
      deviceSpecs:
        row.device_specs && typeof row.device_specs === 'object' && !Array.isArray(row.device_specs)
          ? Object.fromEntries(
              Object.entries(row.device_specs as Record<string, unknown>)
                .filter(([, raw]) => typeof raw === 'string' || typeof raw === 'number')
                .map(([key, raw]) => [key, String(raw)])
            )
          : {},
    })

    return existingSignature === candidateSignature
  })

  if (!duplicate) return {}

  return {
    duplicateId: typeof duplicate.id === 'string' ? duplicate.id : undefined,
  }
}

export async function publishListing(
  _prevState: PublishListingState,
  formData: FormData
): Promise<PublishListingState> {
  assertConfigured()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: 'error',
      message: 'You must be signed in to save a listing.',
    }
  }

  const profile = await getOrCreateProfile(supabase, user)
  const canPublish = canUserPublishListings(profile, Boolean(user.email_confirmed_at))

  if (!canPublish) {
    return {
      status: 'error',
      message: 'Complete seller verification before publishing listings.',
    }
  }

  const listingId = cleanString(formData.get('listing_id'))
  const categoryInput = cleanString(formData.get('category'))
  const conditionInput = cleanString(formData.get('condition'))
  const category = normalizeCategory(categoryInput)
  const condition = normalizeCondition(conditionInput)

  if (!category) {
    return { status: 'error', message: 'Choose a valid device category.' }
  }

  if (!condition) {
    return { status: 'error', message: 'Choose a valid device condition.' }
  }

  const title = cleanString(formData.get('title'))
  const brand = cleanString(formData.get('brand'))
  const model = cleanString(formData.get('model'))
  const description = cleanString(formData.get('description'))
  const sellerNotes = cleanString(formData.get('seller_notes'))
  const currencyCode = normalizeCurrencyCode(cleanString(formData.get('currency_code')), DEFAULT_CURRENCY)
  const priceRaw = cleanString(formData.get('price'))
  const originalPriceRaw = cleanString(formData.get('original_price'))
  const listingImages = normalizeImageList(cleanString(formData.get('listing_images')))
  const privateImei = cleanString(formData.get('private_imei'))
  const privateSerialNumber = cleanString(formData.get('private_serial_number'))

  if (!title || !brand || !model || !description || !priceRaw) {
    return {
      status: 'error',
      message: 'Fill in title, brand, model, price, and description before submitting.',
    }
  }

  if (listingImages.length === 0) {
    return {
      status: 'error',
      message: 'Add at least one listing photo before submitting.',
    }
  }

  if (listingImages.length > 20) {
    return {
      status: 'error',
      message: 'Listings can include up to 20 photos.',
    }
  }

  if (listingImages.some((image) => !isValidImageSrcInput(image))) {
    return {
      status: 'error',
      message: 'Every listing photo must be a valid URL (http/https) or start with "/".',
    }
  }

  const price = parseNumber(priceRaw)
  const originalPrice = parseNumber(originalPriceRaw)

  if (price === null || price <= 0) {
    return { status: 'error', message: 'Price must be greater than 0.' }
  }

  if (originalPrice !== null && originalPrice < price) {
    return { status: 'error', message: 'Original price must be greater than or equal to listing price.' }
  }

  const rawSpecs = buildSpecPayload(formData)
  const activeSpecFields =
    typeof getListingSpecFields === 'function'
      ? getListingSpecFields(category, {
          brand,
          model,
          specs: rawSpecs,
        })
      : CATEGORY_SPEC_FIELDS[category] ?? []
  const deviceSpecs: Record<string, string> = {}

  for (const field of activeSpecFields) {
    const value = cleanString(formData.get(`spec_${field.key}`))

    if (field.required && !value) {
      return { status: 'error', message: `${field.label} is required for ${category}.` }
    }

    if (!value) continue

    if (field.type === 'number') {
      const parsed = parseNumber(value)
      if (parsed === null) {
        return { status: 'error', message: `${field.label} must be numeric.` }
      }

      if (field.min !== undefined && parsed < field.min) {
        return { status: 'error', message: `${field.label} must be at least ${field.min}.` }
      }

      if (field.max !== undefined && parsed > field.max) {
        return { status: 'error', message: `${field.label} must be ${field.max} or less.` }
      }

      deviceSpecs[field.key] = String(parsed)
      continue
    }

    deviceSpecs[field.key] = value
  }

  const batteryHealth = parseNumber(deviceSpecs.battery_health ?? '')
  const { shippingMode, shippingProfile, error: shippingError } = parseShippingProfileFromForm(formData)

  if (shippingError) {
    return { status: 'error', message: shippingError }
  }

  const duplicateCheck = await findDuplicateListing({
    supabase,
    sellerId: user.id,
    listingId: listingId || undefined,
    category,
    title,
    brand,
    model,
    currencyCode,
    price,
    originalPrice,
    condition,
    description,
    sellerNotes,
    deviceSpecs,
  })

  if (duplicateCheck.error) {
    return duplicateCheck.error
  }

  if (duplicateCheck.duplicateId) {
    return {
      status: 'error',
      message:
        'Duplicate listing detected. It looks like this item is already listed on your account. Update the existing listing instead of submitting the same listing again.',
      technicalDetails: `Duplicate listing matched listing ${duplicateCheck.duplicateId}.`,
    }
  }

  const sellerName =
    profile.full_name ||
    (typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null) ||
    user.email?.split('@')[0] ||
    'Seller'

  const sellerVerified = profile.seller_enabled || profile.verification_status === 'verified'
  const normalizedImages = listingImages.map((image) => normalizeImageSrc(image)).slice(0, 20)

  const basePayload = {
    seller_id: user.id,
    seller_name: sellerName,
    seller_verified: sellerVerified,
    title,
    category,
    brand,
    model,
    price,
    original_price: originalPrice,
    condition,
    storage: deviceSpecs.storage ?? null,
    battery_health: batteryHealth,
    color: deviceSpecs.color ?? null,
    image: normalizedImages[0],
    image_url: normalizedImages[0],
    images: normalizedImages,
    description,
    imei_status: null,
    seller_notes: sellerNotes || null,
    device_specs: deviceSpecs,
    currency_code: currencyCode,
    shipping_mode: shippingMode,
    shipping_profile: shippingProfile ?? {},
    verified: sellerVerified,
  }
  const insertPayload = {
    ...basePayload,
    seller_rating: 5,
    seller_total_sales: 0,
  }

  let savedListingId = listingId
  let successMessage = 'Listing submitted. TekSwapp staff will review and approve it before it goes live.'
  let successTechnicalDetails: string | undefined

  if (listingId) {
    const { data: existingListing, error: existingError } = await supabase
      .from('listings')
      .select('id,status')
      .eq('id', listingId)
      .eq('seller_id', user.id)
      .maybeSingle()

    if (isMissingListingsTableError(existingError)) {
      return createInternalFailure(
        'We could not save your listing changes right now. Please try again in a moment.',
        'Missing public.listings table while saving seller listing.'
      )
    }

    if (existingError) {
      return createInternalFailure(
        'We could not save your listing changes right now. Please try again in a moment.',
        existingError.message,
        { listingId, userId: user.id }
      )
    }

    if (!existingListing) {
      return {
        status: 'error',
        message: 'That listing could not be found for your account.',
      }
    }

    const { data: updatedListing, error } = await supabase
      .from('listings')
      .update({
        ...basePayload,
        status: existingListing.status ?? 'pending_review',
      })
      .eq('id', listingId)
      .eq('seller_id', user.id)
      .select('id')
      .single()

    if (isMissingListingsColumnError(error, 'images')) {
      const legacyPayload = buildLegacyListingPayload({
        ...basePayload,
        status: existingListing.status ?? 'pending_review',
      })
      const { data: legacyUpdatedListing, error: legacyError } = await supabase
        .from('listings')
        .update(legacyPayload)
        .eq('id', listingId)
        .eq('seller_id', user.id)
        .select('id')
        .single()

      if (legacyError) {
        return createInternalFailure(
          'We could not save your listing changes right now. Please try again in a moment.',
          legacyError.message,
          { listingId, userId: user.id }
        )
      }

      savedListingId = legacyUpdatedListing?.id ?? listingId
      successMessage =
        'Listing updated. Right now only the cover photo is attached to this listing.'
      successTechnicalDetails =
        'Updated listing with legacy image fallback because the images column is missing. Run supabase/sql/listing_media_and_trust_upgrade.sql to enable multi-photo listings.'
    } else {
      if (isMissingListingsTableError(error)) {
        return createInternalFailure(
          'We could not save your listing changes right now. Please try again in a moment.',
          'Missing public.listings table while saving seller listing.'
        )
      }

      if (error) {
        return createInternalFailure(
          'We could not save your listing changes right now. Please try again in a moment.',
          error.message,
          { listingId, userId: user.id }
        )
      }

      savedListingId = updatedListing?.id ?? listingId
      successMessage = 'Listing updated successfully.'
    }
  } else {
    const { data: insertedListing, error } = await supabase
      .from('listings')
      .insert({
        ...insertPayload,
        status: 'pending_review',
        views: 0,
        watchers: 0,
      })
      .select('id')
      .single()

    if (isMissingListingsColumnError(error, 'images')) {
      const legacyInsertPayload = buildLegacyListingPayload({
        ...insertPayload,
        status: 'pending_review',
        views: 0,
        watchers: 0,
      })
      const { data: legacyInsertedListing, error: legacyError } = await supabase
        .from('listings')
        .insert(legacyInsertPayload)
        .select('id')
        .single()

      if (legacyError) {
        return createInternalFailure(
          'We could not publish your listing right now. Please try again in a moment.',
          legacyError.message,
          { userId: user.id }
        )
      }

      savedListingId = legacyInsertedListing?.id ?? savedListingId
      successMessage =
        'Listing submitted successfully. Right now only the cover photo is attached to this listing.'
      successTechnicalDetails =
        'Inserted listing with legacy image fallback because the images column is missing. Run supabase/sql/listing_media_and_trust_upgrade.sql to enable multi-photo listings.'
    } else {
      if (isMissingListingsTableError(error)) {
        return createInternalFailure(
          'We could not publish your listing right now. Please try again in a moment.',
          'Missing public.listings table while publishing seller listing.'
        )
      }
      if (error) {
        return createInternalFailure(
          'We could not publish your listing right now. Please try again in a moment.',
          error.message,
          { userId: user.id }
        )
      }

      savedListingId = insertedListing?.id ?? savedListingId
    }
  }

  if (savedListingId) {
    const privateSave = await savePrivateIdentifiers(savedListingId, user.id, privateImei, privateSerialNumber)
    if (privateSave.error) {
      return createInternalFailure(
        privateSave.error,
        privateSave.technicalDetails ?? privateSave.error,
        { listingId: savedListingId, userId: user.id }
      )
    }
  }

  revalidatePath('/')
  revalidatePath('/listings')
  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath('/admin')
  if (savedListingId) {
    revalidatePath(`/product/${savedListingId}`)
  }

  return {
    status: 'success',
    message: successMessage,
    technicalDetails: successTechnicalDetails,
  }
}
