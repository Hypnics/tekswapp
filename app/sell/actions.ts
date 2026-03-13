'use server'

import { revalidatePath } from 'next/cache'
import { CATEGORY_SPEC_FIELDS, LISTING_CONDITIONS, MARKETPLACE_CATEGORIES } from '@/lib/marketplace-config'
import { canUserPublishListings } from '@/lib/dashboard-data'
import { getOrCreateProfile } from '@/lib/dashboard-server'
import { isValidImageSrcInput, normalizeImageSrc } from '@/lib/image-src'
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

function normalizeImeiStatus(value: string): 'Clean' | 'Reported' | 'Unknown' | null {
  if (!value) return null
  const normalized = value.toLowerCase()
  if (normalized === 'clean') return 'Clean'
  if (normalized === 'reported') return 'Reported'
  if (normalized === 'unknown') return 'Unknown'
  return null
}

function isMissingListingsTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const knownCodes = new Set(['PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) return true

  const message = (error.message ?? '').toLowerCase()
  return message.includes("could not find the table 'public.listings'") || message.includes('relation "listings" does not exist')
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
      message: 'You must be signed in to publish a listing.',
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
  const image = cleanString(formData.get('image'))
  const description = cleanString(formData.get('description'))
  const sellerNotes = cleanString(formData.get('seller_notes'))
  const priceRaw = cleanString(formData.get('price'))
  const originalPriceRaw = cleanString(formData.get('original_price'))

  if (!title || !brand || !model || !image || !description || !priceRaw) {
    return {
      status: 'error',
      message: 'Fill in title, brand, model, price, cover image, and description.',
    }
  }

  if (!isValidImageSrcInput(image)) {
    return {
      status: 'error',
      message: 'Cover image must be a valid URL (http/https) or start with "/".',
    }
  }

  const normalizedImage = normalizeImageSrc(image)

  const price = parseNumber(priceRaw)
  const originalPrice = parseNumber(originalPriceRaw)

  if (price === null || price <= 0) {
    return { status: 'error', message: 'Price must be greater than 0.' }
  }

  if (originalPrice !== null && originalPrice < price) {
    return { status: 'error', message: 'Original price must be greater than or equal to listing price.' }
  }

  const requiredSpecFields = CATEGORY_SPEC_FIELDS[category]
  const deviceSpecs: Record<string, string> = {}

  for (const field of requiredSpecFields) {
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

      if (field.key === 'battery_health' && (parsed < 0 || parsed > 100)) {
        return { status: 'error', message: 'Battery health must be between 0 and 100.' }
      }

      deviceSpecs[field.key] = String(parsed)
      continue
    }

    deviceSpecs[field.key] = value
  }

  const batteryHealth = parseNumber(deviceSpecs.battery_health ?? '')
  const imeiStatus = normalizeImeiStatus(deviceSpecs.imei_status ?? '')
  const sellerName =
    profile.full_name ||
    (typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null) ||
    user.email?.split('@')[0] ||
    'Seller'

  const sellerVerified = profile.seller_enabled || profile.verification_status === 'verified'

  const payload = {
    seller_id: user.id,
    seller_name: sellerName,
    seller_verified: sellerVerified,
    seller_rating: 5,
    seller_total_sales: 0,
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
    image: normalizedImage,
    description,
    imei_status: imeiStatus,
    seller_notes: sellerNotes || null,
    device_specs: deviceSpecs,
    verified: sellerVerified,
    status: 'pending_review',
    views: 0,
    watchers: 0,
  }

  const { error } = await supabase.from('listings').insert(payload)
  if (isMissingListingsTableError(error)) {
    return {
      status: 'error',
      message: 'Supabase setup required: create the public.listings table before publishing.',
    }
  }
  if (error) {
    return {
      status: 'error',
      message: `Publish failed: ${error.message}`,
    }
  }

  revalidatePath('/')
  revalidatePath('/listings')
  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath('/admin')

  return {
    status: 'success',
    message: 'Listing submitted. TekSwapp staff will review and approve it before it goes live.',
  }
}
