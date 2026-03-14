import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { COUNTRY_OPTIONS, getCountryName, isCountryCode } from '@/lib/countries'
import { formatPrice } from '@/lib/utils'
import { CurrencyCode, Listing, ShippingMode, ShippingProfile, ShippingRate } from '@/types/listing'

export const DEFAULT_CURRENCY: CurrencyCode = 'USD'
export const MARKETPLACE_FEE_RATE = 0.05
export const TECH_PRODUCT_TAX_CODE = 'txcd_99999999'
export const CHECKOUT_RESERVATION_MINUTES = 30

export interface ResolvedShippingRate extends ShippingRate {
  label: string
}

interface ShippingFormFields {
  mode: ShippingMode
  sellerCountryCode: string
  domesticAmount: number | null
  domesticMinDays: number | null
  domesticMaxDays: number | null
  internationalAmount: number | null
  internationalMinDays: number | null
  internationalMaxDays: number | null
  advancedRates: ShippingRate[]
}

export interface FinalizedOrderRecord {
  id: string
  orderNumber: string
  listingTitle: string
  totalAmount: number
  shippingAmount: number
  taxAmount: number
  currencyCode: string
  shippingCountry?: string
  buyerEmail?: string
}

export interface ListingCheckoutReservation {
  id: string
  listingId: string
  buyerId: string
  stripeSessionId?: string
  checkoutUrl?: string
  shippingCountryCode?: string
  reservedUntil: string
}

export interface ListingCheckoutAvailability {
  available: boolean
  reservation?: ListingCheckoutReservation
  reservedByViewer: boolean
}

function cleanString(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function parseOptionalNumber(value: string): number | null {
  if (!value) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function parseOptionalInteger(value: string): number | null {
  const parsed = parseOptionalNumber(value)
  if (parsed === null) return null
  return Math.round(parsed)
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

function getReservationExpiryDate(from = new Date()): Date {
  return new Date(from.getTime() + CHECKOUT_RESERVATION_MINUTES * 60 * 1000)
}

function mapReservationRow(row: Record<string, unknown>): ListingCheckoutReservation {
  return {
    id: String(row.id),
    listingId: String(row.listing_id),
    buyerId: String(row.buyer_id),
    stripeSessionId: typeof row.stripe_session_id === 'string' ? row.stripe_session_id : undefined,
    checkoutUrl: typeof row.checkout_url === 'string' ? row.checkout_url : undefined,
    shippingCountryCode: typeof row.shipping_country_code === 'string' ? row.shipping_country_code : undefined,
    reservedUntil: String(row.reserved_until),
  }
}

function formatDeliveryWindow(minDays?: number, maxDays?: number): string | null {
  if (!minDays && !maxDays) return null
  if (minDays && maxDays) return `${minDays}-${maxDays} business days`
  if (minDays) return `${minDays}+ business days`
  return `Up to ${maxDays} business days`
}

function buildShippingLabelLegacy(base: string, rate: Pick<ShippingRate, 'minDays' | 'maxDays'>): string {
  const window = formatDeliveryWindow(rate.minDays, rate.maxDays)
  return window ? `${base} · ${window}` : base
}

void buildShippingLabelLegacy

function buildShippingLabel(base: string, rate: Pick<ShippingRate, 'minDays' | 'maxDays'>): string {
  const window = formatDeliveryWindow(rate.minDays, rate.maxDays)
  return window ? `${base} - ${window}` : base
}

function normalizeShippingMode(value: string): ShippingMode {
  if (value === 'basic' || value === 'advanced') return value
  return 'none'
}

function normalizeRate(raw: unknown): ShippingRate | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const row = raw as Record<string, unknown>
  const countryCode = typeof row.countryCode === 'string' ? row.countryCode.trim().toUpperCase() : ''
  const amount = typeof row.amount === 'number' ? row.amount : Number(row.amount)

  if (!isCountryCode(countryCode) || !Number.isFinite(amount) || amount < 0) return null

  return {
    countryCode,
    countryName:
      typeof row.countryName === 'string' && row.countryName.trim()
        ? row.countryName.trim()
        : getCountryName(countryCode),
    amount: roundCurrency(amount),
    minDays: typeof row.minDays === 'number' && row.minDays > 0 ? Math.round(row.minDays) : undefined,
    maxDays: typeof row.maxDays === 'number' && row.maxDays > 0 ? Math.round(row.maxDays) : undefined,
  }
}

function normalizeShippingProfileRaw(raw: unknown): ShippingProfile | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined

  const input = raw as Record<string, unknown>
  const sellerCountryCode =
    typeof input.sellerCountryCode === 'string' ? input.sellerCountryCode.trim().toUpperCase() : ''

  if (!isCountryCode(sellerCountryCode)) return undefined

  const advancedRates = Array.isArray(input.advancedRates)
    ? input.advancedRates.map((rate) => normalizeRate(rate)).filter((rate): rate is ShippingRate => Boolean(rate))
    : undefined

  return {
    sellerCountryCode,
    sellerCountryName:
      typeof input.sellerCountryName === 'string' && input.sellerCountryName.trim()
        ? input.sellerCountryName.trim()
        : getCountryName(sellerCountryCode),
    domesticAmount:
      typeof input.domesticAmount === 'number' && input.domesticAmount >= 0
        ? roundCurrency(input.domesticAmount)
        : undefined,
    domesticMinDays:
      typeof input.domesticMinDays === 'number' && input.domesticMinDays > 0
        ? Math.round(input.domesticMinDays)
        : undefined,
    domesticMaxDays:
      typeof input.domesticMaxDays === 'number' && input.domesticMaxDays > 0
        ? Math.round(input.domesticMaxDays)
        : undefined,
    internationalAmount:
      typeof input.internationalAmount === 'number' && input.internationalAmount >= 0
        ? roundCurrency(input.internationalAmount)
        : undefined,
    internationalMinDays:
      typeof input.internationalMinDays === 'number' && input.internationalMinDays > 0
        ? Math.round(input.internationalMinDays)
        : undefined,
    internationalMaxDays:
      typeof input.internationalMaxDays === 'number' && input.internationalMaxDays > 0
        ? Math.round(input.internationalMaxDays)
        : undefined,
    advancedRates: advancedRates?.length ? advancedRates : undefined,
  }
}

function parseAdvancedRates(value: string): ShippingRate[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((rate) => normalizeRate(rate))
      .filter((rate): rate is ShippingRate => Boolean(rate))
  } catch {
    return []
  }
}

function parseShippingFormFields(formData: FormData): ShippingFormFields {
  const sellerCountryCode = cleanString(formData.get('shipping_seller_country_code')).toUpperCase()

  return {
    mode: normalizeShippingMode(cleanString(formData.get('shipping_mode'))),
    sellerCountryCode,
    domesticAmount: parseOptionalNumber(cleanString(formData.get('shipping_domestic_amount'))),
    domesticMinDays: parseOptionalInteger(cleanString(formData.get('shipping_domestic_min_days'))),
    domesticMaxDays: parseOptionalInteger(cleanString(formData.get('shipping_domestic_max_days'))),
    internationalAmount: parseOptionalNumber(cleanString(formData.get('shipping_international_amount'))),
    internationalMinDays: parseOptionalInteger(cleanString(formData.get('shipping_international_min_days'))),
    internationalMaxDays: parseOptionalInteger(cleanString(formData.get('shipping_international_max_days'))),
    advancedRates: parseAdvancedRates(cleanString(formData.get('shipping_advanced_rates'))),
  }
}

function validateBusinessDays(minDays: number | null, maxDays: number | null): string | null {
  if (minDays !== null && minDays <= 0) return 'Delivery windows must be at least 1 business day.'
  if (maxDays !== null && maxDays <= 0) return 'Delivery windows must be at least 1 business day.'
  if (minDays !== null && maxDays !== null && minDays > maxDays) {
    return 'Delivery window minimum must be less than or equal to the maximum.'
  }
  return null
}

export function parseShippingProfileFromForm(formData: FormData): {
  shippingMode: ShippingMode
  shippingProfile?: ShippingProfile
  error?: string
} {
  const fields = parseShippingFormFields(formData)

  if (fields.mode === 'none') {
    return { shippingMode: 'none' }
  }

  if (!isCountryCode(fields.sellerCountryCode)) {
    return {
      shippingMode: fields.mode,
      error: 'Choose the country the item ships from before publishing.',
    }
  }

  const domesticWindowError = validateBusinessDays(fields.domesticMinDays, fields.domesticMaxDays)
  if (domesticWindowError) {
    return { shippingMode: fields.mode, error: domesticWindowError }
  }

  const internationalWindowError = validateBusinessDays(
    fields.internationalMinDays,
    fields.internationalMaxDays
  )
  if (internationalWindowError) {
    return { shippingMode: fields.mode, error: internationalWindowError }
  }

  if (fields.mode === 'basic') {
    const hasDomesticRate = fields.domesticAmount !== null
    const hasInternationalRate = fields.internationalAmount !== null

    if (!hasDomesticRate && !hasInternationalRate) {
      return {
        shippingMode: 'basic',
        error: 'Add at least one shipping price in the basic shipping setup.',
      }
    }

    return {
      shippingMode: 'basic',
      shippingProfile: {
        sellerCountryCode: fields.sellerCountryCode,
        sellerCountryName: getCountryName(fields.sellerCountryCode),
        domesticAmount: fields.domesticAmount ?? undefined,
        domesticMinDays: fields.domesticMinDays ?? undefined,
        domesticMaxDays: fields.domesticMaxDays ?? undefined,
        internationalAmount: fields.internationalAmount ?? undefined,
        internationalMinDays: fields.internationalMinDays ?? undefined,
        internationalMaxDays: fields.internationalMaxDays ?? undefined,
      },
    }
  }

  if (fields.advancedRates.length === 0) {
    return {
      shippingMode: 'advanced',
      error: 'Add at least one country-specific shipping price in advanced mode.',
    }
  }

  for (const rate of fields.advancedRates) {
    const rateWindowError = validateBusinessDays(rate.minDays ?? null, rate.maxDays ?? null)
    if (rateWindowError) {
      return { shippingMode: 'advanced', error: rateWindowError }
    }
  }

  return {
    shippingMode: 'advanced',
    shippingProfile: {
      sellerCountryCode: fields.sellerCountryCode,
      sellerCountryName: getCountryName(fields.sellerCountryCode),
      advancedRates: fields.advancedRates,
    },
  }
}

export function normalizeShippingProfile(raw: unknown): ShippingProfile | undefined {
  return normalizeShippingProfileRaw(raw)
}

export function getAllowedShippingCountries(listing: Pick<Listing, 'shippingMode' | 'shippingProfile'>): string[] {
  if (!listing.shippingProfile) return []

  if (listing.shippingMode === 'basic') {
    const countries = new Set<string>()
    if (listing.shippingProfile.domesticAmount !== undefined) {
      countries.add(listing.shippingProfile.sellerCountryCode)
    }
    if (listing.shippingProfile.internationalAmount !== undefined) {
      for (const option of COUNTRY_OPTIONS) {
        countries.add(option.code)
      }
    }
    return Array.from(countries)
  }

  if (listing.shippingMode === 'advanced') {
    return (listing.shippingProfile.advancedRates ?? []).map((rate) => rate.countryCode)
  }

  return []
}

function getBasicShippingRate(
  profile: ShippingProfile,
  destinationCountryCode: string
): ResolvedShippingRate | null {
  const normalizedDestination = destinationCountryCode.trim().toUpperCase()

  if (normalizedDestination === profile.sellerCountryCode && profile.domesticAmount !== undefined) {
    return {
      countryCode: normalizedDestination,
      countryName: getCountryName(normalizedDestination),
      amount: profile.domesticAmount,
      minDays: profile.domesticMinDays,
      maxDays: profile.domesticMaxDays,
      label: buildShippingLabel(`Domestic shipping to ${profile.sellerCountryName}`, {
        minDays: profile.domesticMinDays,
        maxDays: profile.domesticMaxDays,
      }),
    }
  }

  if (profile.internationalAmount !== undefined) {
    return {
      countryCode: normalizedDestination,
      countryName: getCountryName(normalizedDestination),
      amount: profile.internationalAmount,
      minDays: profile.internationalMinDays,
      maxDays: profile.internationalMaxDays,
      label: buildShippingLabel(`International shipping to ${getCountryName(normalizedDestination)}`, {
        minDays: profile.internationalMinDays,
        maxDays: profile.internationalMaxDays,
      }),
    }
  }

  return null
}

export function resolveShippingRate(
  listing: Pick<Listing, 'shippingMode' | 'shippingProfile'>,
  destinationCountryCode: string
): ResolvedShippingRate | null {
  if (!listing.shippingProfile || listing.shippingMode === 'none') return null

  const normalizedDestination = destinationCountryCode.trim().toUpperCase()
  if (!isCountryCode(normalizedDestination)) return null

  if (listing.shippingMode === 'basic') {
    return getBasicShippingRate(listing.shippingProfile, normalizedDestination)
  }

  const matchedRate = (listing.shippingProfile.advancedRates ?? []).find(
    (rate) => rate.countryCode === normalizedDestination
  )

  if (!matchedRate) return null

  return {
    ...matchedRate,
    label: buildShippingLabel(`Shipping to ${matchedRate.countryName}`, matchedRate),
  }
}

export function calculateMarketplaceFee(subtotal: number, shippingAmount: number): number {
  return roundCurrency((subtotal + shippingAmount) * MARKETPLACE_FEE_RATE)
}

export function formatCheckoutCurrency(amount: number, currencyCode: string): string {
  return formatPrice(amount, currencyCode)
}

async function deleteExpiredReservationsForListing(listingId: string) {
  const admin = createAdminClient()
  await admin
    .from('listing_checkout_reservations')
    .delete()
    .eq('listing_id', listingId)
    .lte('reserved_until', new Date().toISOString())
}

async function getActiveReservationForListing(listingId: string): Promise<ListingCheckoutReservation | null> {
  await deleteExpiredReservationsForListing(listingId)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('listing_checkout_reservations')
    .select('id,listing_id,buyer_id,stripe_session_id,checkout_url,shipping_country_code,reserved_until')
    .eq('listing_id', listingId)
    .gt('reserved_until', new Date().toISOString())
    .maybeSingle()

  if (error || !data) return null
  return mapReservationRow(data as Record<string, unknown>)
}

export async function getListingCheckoutAvailability(
  listingId: string,
  viewerId?: string | null
): Promise<ListingCheckoutAvailability> {
  const reservation = await getActiveReservationForListing(listingId)
  if (!reservation) {
    return {
      available: true,
      reservedByViewer: false,
    }
  }

  return {
    available: viewerId ? reservation.buyerId === viewerId : false,
    reservation,
    reservedByViewer: viewerId ? reservation.buyerId === viewerId : false,
  }
}

export async function reserveListingForCheckout(params: {
  listingId: string
  buyerId: string
  shippingCountryCode: string
}): Promise<
  | { status: 'reserved'; reservation: ListingCheckoutReservation }
  | { status: 'existing'; reservation: ListingCheckoutReservation }
  | { status: 'conflict'; reservation: ListingCheckoutReservation }
> {
  const existingReservation = await getActiveReservationForListing(params.listingId)

  if (existingReservation) {
    if (existingReservation.buyerId === params.buyerId) {
      return { status: 'existing', reservation: existingReservation }
    }

    return { status: 'conflict', reservation: existingReservation }
  }

  const admin = createAdminClient()
  const reservedUntil = getReservationExpiryDate().toISOString()
  const { data, error } = await admin
    .from('listing_checkout_reservations')
    .insert({
      listing_id: params.listingId,
      buyer_id: params.buyerId,
      shipping_country_code: params.shippingCountryCode,
      reserved_until: reservedUntil,
    })
    .select('id,listing_id,buyer_id,stripe_session_id,checkout_url,shipping_country_code,reserved_until')
    .single()

  if (!error && data) {
    return {
      status: 'reserved',
      reservation: mapReservationRow(data as Record<string, unknown>),
    }
  }

  const conflictReservation = await getActiveReservationForListing(params.listingId)
  if (conflictReservation) {
    if (conflictReservation.buyerId === params.buyerId) {
      return { status: 'existing', reservation: conflictReservation }
    }

    return { status: 'conflict', reservation: conflictReservation }
  }

  throw new Error(error?.message ?? 'Could not reserve this listing for checkout.')
}

export async function attachStripeSessionToReservation(params: {
  reservationId: string
  sessionId: string
  checkoutUrl: string
  reservedUntil: string
}): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('listing_checkout_reservations')
    .update({
      stripe_session_id: params.sessionId,
      checkout_url: params.checkoutUrl,
      reserved_until: params.reservedUntil,
    })
    .eq('id', params.reservationId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function releaseListingReservation(options: {
  listingId?: string
  sessionId?: string
}): Promise<void> {
  const admin = createAdminClient()

  if (options.sessionId) {
    await admin.from('listing_checkout_reservations').delete().eq('stripe_session_id', options.sessionId)
  }

  if (options.listingId) {
    await admin.from('listing_checkout_reservations').delete().eq('listing_id', options.listingId)
  }
}

function centsToAmount(value: number | null | undefined): number {
  return roundCurrency((value ?? 0) / 100)
}

function buildOrderNumber(): string {
  return `TS-${Date.now().toString().slice(-8)}`
}

async function getExistingOrderBySessionId(sessionId: string): Promise<FinalizedOrderRecord | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('orders')
    .select('id,order_number,listing_title,total_amount,shipping_amount,tax_amount,currency_code,shipping_country,stripe_customer_email')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    orderNumber: data.order_number,
    listingTitle: data.listing_title,
    totalAmount: Number(data.total_amount ?? 0),
    shippingAmount: Number(data.shipping_amount ?? 0),
    taxAmount: Number(data.tax_amount ?? 0),
    currencyCode: data.currency_code ?? DEFAULT_CURRENCY,
    shippingCountry: data.shipping_country ?? undefined,
    buyerEmail: data.stripe_customer_email ?? undefined,
  }
}

function getBuyerDisplayName(email: string | null | undefined): string {
  if (!email) return 'Buyer'
  return email.split('@')[0]
}

export async function finalizeStripeCheckoutSession(
  sessionId: string
): Promise<FinalizedOrderRecord | null> {
  const existingOrder = await getExistingOrderBySessionId(sessionId)
  if (existingOrder) {
    await releaseListingReservation({ sessionId })
    return existingOrder
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'shipping_cost.shipping_rate'],
  })

  if (session.mode !== 'payment' || session.payment_status !== 'paid') {
    return null
  }

  const listingId = session.metadata?.listingId
  const buyerId = session.metadata?.buyerId
  const sellerId = session.metadata?.sellerId

  if (!listingId || !buyerId || !sellerId) {
    return null
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    expand: ['data.price.product'],
    limit: 20,
  })
  const metadata = session.metadata ?? {}

  const itemSubtotal = centsToAmount(
    lineItems.data.reduce((total, item) => total + (item.amount_subtotal ?? item.amount_total ?? 0), 0)
  )
  const shippingAmount = centsToAmount(session.shipping_cost?.amount_total)
  const taxAmount = centsToAmount(session.total_details?.amount_tax)
  const totalAmount = centsToAmount(session.amount_total)
  const feeAmount = calculateMarketplaceFee(itemSubtotal, shippingAmount)
  const sellerNetAmount = roundCurrency(itemSubtotal + shippingAmount - feeAmount)

  const shippingCountryCode =
    session.collected_information?.shipping_details?.address?.country ?? metadata.shipToCountry ?? null
  const shippingCountry = shippingCountryCode ? getCountryName(shippingCountryCode) : null
  const shippingLabel =
    typeof session.shipping_cost?.shipping_rate === 'object' && session.shipping_cost.shipping_rate
      ? session.shipping_cost.shipping_rate.display_name
      : metadata.shippingLabel ?? 'Seller shipping'
  const orderNumber = buildOrderNumber()
  const buyerEmail = session.customer_details?.email ?? session.customer_email ?? null
  const listingTitle =
    metadata.listingTitle ??
    lineItems.data[0]?.description ??
    lineItems.data[0]?.price?.nickname ??
    'TekSwapp listing'

  const admin = createAdminClient()

  const { data: soldOrder } = await admin
    .from('orders')
    .select('id')
    .eq('listing_id', listingId)
    .limit(1)
    .maybeSingle()

  if (soldOrder) {
    await releaseListingReservation({ sessionId, listingId })
    return null
  }

  const payload = {
    order_number: orderNumber,
    listing_id: listingId,
    listing_title: listingTitle,
    item_title: listingTitle,
    seller_id: sellerId,
    seller_name: metadata.sellerName ?? 'Seller',
    buyer_id: buyerId,
    buyer_name: getBuyerDisplayName(buyerEmail),
    buyer_handle: buyerEmail ? `@${buyerEmail.split('@')[0]}` : '@buyer',
    status: 'processing',
    shipping_status: 'label_created',
    payout_status: 'on_hold',
    total_amount: totalAmount,
    subtotal_amount: itemSubtotal,
    shipping_amount: shippingAmount,
    tax_amount: taxAmount,
    marketplace_fee_amount: feeAmount,
    seller_net_amount: sellerNetAmount,
    currency_code: (session.currency ?? DEFAULT_CURRENCY).toUpperCase(),
    shipping_country_code: shippingCountryCode,
    shipping_country: shippingCountry,
    shipping_rate_label: shippingLabel,
    stripe_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
    stripe_payment_status: session.payment_status,
    stripe_customer_email: buyerEmail,
    metadata,
  }

  const { data, error } = await admin.from('orders').insert(payload).select(
    'id,order_number,listing_title,total_amount,shipping_amount,tax_amount,currency_code,shipping_country,stripe_customer_email'
  ).single()

  if (error || !data) {
    return null
  }

  await admin.from('listings').update({ status: 'sold' }).eq('id', listingId).eq('status', 'active')
  await releaseListingReservation({ sessionId, listingId })

  return {
    id: data.id,
    orderNumber: data.order_number,
    listingTitle: data.listing_title,
    totalAmount: Number(data.total_amount ?? 0),
    shippingAmount: Number(data.shipping_amount ?? 0),
    taxAmount: Number(data.tax_amount ?? 0),
    currencyCode: data.currency_code ?? DEFAULT_CURRENCY,
    shippingCountry: data.shipping_country ?? undefined,
    buyerEmail: data.stripe_customer_email ?? undefined,
  }
}

export async function getAuthenticatedCheckoutContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabase, user }
}
