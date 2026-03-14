import { createClient } from '@/lib/supabase/server'
import {
  MarketplaceFilters,
  LISTING_CONDITIONS,
  MARKETPLACE_CATEGORIES,
  normalizeCategoryFilter,
  normalizeConditionFilter,
  normalizeSortFilter,
  normalizeVerifiedFilter,
} from '@/lib/marketplace-config'
import { DEFAULT_CURRENCY, normalizeShippingProfile } from '@/lib/checkout'
import { normalizeImageSrc } from '@/lib/image-src'
import { Category, Condition, CurrencyCode, Listing, ShippingMode } from '@/types/listing'

type ListingStatus = 'active' | 'draft' | 'sold' | 'pending_review' | 'paused'

const LISTING_COLUMNS = `
  id,
  seller_id,
  seller_name,
  seller_verified,
  seller_rating,
  seller_total_sales,
  title,
  category,
  brand,
  model,
  price,
  original_price,
  currency_code,
  condition,
  storage,
  battery_health,
  color,
  image,
  image_url,
  verified,
  description,
  imei_status,
  seller_notes,
  device_specs,
  shipping_mode,
  shipping_profile,
  status,
  views,
  watchers,
  created_at
`

function isConfigured(): boolean {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ?? false
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function normalizeCategory(value: unknown): Category {
  return MARKETPLACE_CATEGORIES.includes(value as Category) ? (value as Category) : 'Other'
}

function normalizeCondition(value: unknown): Condition {
  return LISTING_CONDITIONS.includes(value as Condition) ? (value as Condition) : 'Good'
}

function normalizeCurrencyCode(value: unknown): CurrencyCode {
  if (typeof value === 'string' && value.trim().toUpperCase() === 'USD') return 'USD'
  return DEFAULT_CURRENCY
}

function normalizeShippingMode(value: unknown): ShippingMode {
  const modes: ShippingMode[] = ['none', 'basic', 'advanced']
  return modes.includes(value as ShippingMode) ? (value as ShippingMode) : 'none'
}

function normalizeListingStatus(value: unknown): ListingStatus {
  const statuses: ListingStatus[] = ['active', 'draft', 'sold', 'pending_review', 'paused']
  return statuses.includes(value as ListingStatus) ? (value as ListingStatus) : 'active'
}

function normalizeImeiStatus(value: unknown): Listing['imeiStatus'] {
  const statuses: NonNullable<Listing['imeiStatus']>[] = ['Clean', 'Reported', 'Unknown']
  return statuses.includes(value as NonNullable<Listing['imeiStatus']>)
    ? (value as NonNullable<Listing['imeiStatus']>)
    : undefined
}

function normalizeSpecs(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined

  const pairs = Object.entries(value).reduce<Record<string, string>>((acc, [key, raw]) => {
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      if (trimmed) acc[key] = trimmed
      return acc
    }
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      acc[key] = String(raw)
    }
    return acc
  }, {})

  return Object.keys(pairs).length ? pairs : undefined
}

function mapRowToListing(row: Record<string, unknown>): Listing {
  const fallbackId = crypto.randomUUID()
  const sellerName = asString(row.seller_name, 'TekSwapp Seller')
  const sellerVerified = Boolean(row.seller_verified ?? row.verified)
  const specs = normalizeSpecs(row.device_specs)
  const image = normalizeImageSrc(row.image, normalizeImageSrc(row.image_url))

  return {
    id: asString(row.id, fallbackId),
    title: asString(row.title, 'Untitled listing'),
    category: normalizeCategory(row.category),
    brand: asString(row.brand, 'Unknown'),
    model: asString(row.model, 'Unknown'),
    price: asNumber(row.price, 0),
    originalPrice: asNumber(row.original_price, 0) || undefined,
    condition: normalizeCondition(row.condition),
    storage: asString(row.storage, '') || specs?.storage,
    batteryHealth: asNumber(row.battery_health, 0) || undefined,
    color: asString(row.color, '') || specs?.color,
    image,
    seller: {
      id: asString(row.seller_id, 'unknown-seller'),
      name: sellerName,
      rating: asNumber(row.seller_rating, 0),
      totalSales: asNumber(row.seller_total_sales, 0),
      verified: sellerVerified,
      joinedDate: asString(row.created_at, new Date().toISOString()),
    },
    verified: Boolean(row.verified ?? sellerVerified),
    description: asString(row.description, ''),
    imeiStatus: normalizeImeiStatus(row.imei_status) ?? normalizeImeiStatus(specs?.imei_status),
    sellerNotes: asString(row.seller_notes, '') || undefined,
    createdAt: asString(row.created_at, new Date().toISOString()),
    views: asNumber(row.views, 0),
    watchers: asNumber(row.watchers, 0),
    status: normalizeListingStatus(row.status),
    deviceSpecs: specs,
    currencyCode: normalizeCurrencyCode(row.currency_code),
    shippingMode: normalizeShippingMode(row.shipping_mode),
    shippingProfile: normalizeShippingProfile(row.shipping_profile),
  }
}

function isMissingListingsTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const knownCodes = new Set(['PGRST116', 'PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) return true

  const message = (error.message ?? '').toLowerCase()
  return message.includes("could not find the table 'public.listings'") || message.includes('relation "listings" does not exist')
}

export async function getMarketplaceListings(filters: MarketplaceFilters = {}): Promise<Listing[]> {
  if (!isConfigured()) return []

  const supabase = await createClient()
  const queryText = filters.q?.trim()
  const category = normalizeCategoryFilter(filters.category)
  const condition = normalizeConditionFilter(filters.condition)
  const verifiedOnly = normalizeVerifiedFilter(filters.verified)
  const sort = normalizeSortFilter(filters.sort)

  let query = supabase.from('listings').select(LISTING_COLUMNS).eq('status', 'active')

  if (category) query = query.eq('category', category)
  if (condition) query = query.eq('condition', condition)
  if (verifiedOnly) query = query.eq('seller_verified', true)

  if (queryText) {
    const term = queryText.replace(/[%(),]/g, '').trim()
    if (term) {
      query = query.or(`title.ilike.%${term}%,brand.ilike.%${term}%,model.ilike.%${term}%`)
    }
  }

  if (sort === 'price_asc') query = query.order('price', { ascending: true }).order('created_at', { ascending: false })
  if (sort === 'price_desc') query = query.order('price', { ascending: false }).order('created_at', { ascending: false })
  if (sort === 'most_watched') query = query.order('watchers', { ascending: false }).order('created_at', { ascending: false })
  if (sort === 'newest') query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (isMissingListingsTableError(error)) return []
  if (error || !data) return []

  return (data as Record<string, unknown>[]).map(mapRowToListing)
}

export async function getMarketplaceListingById(id: string): Promise<Listing | null> {
  if (!isConfigured()) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (isMissingListingsTableError(error)) return null
  if (error || !data) return null
  return mapRowToListing(data as Record<string, unknown>)
}

export async function getFeaturedMarketplaceListings(count = 6): Promise<Listing[]> {
  if (!isConfigured()) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_COLUMNS)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(count)

  if (isMissingListingsTableError(error)) return []
  if (error || !data) return []

  return (data as Record<string, unknown>[]).map(mapRowToListing)
}
