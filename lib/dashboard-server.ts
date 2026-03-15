import type { SupabaseClient, User } from '@supabase/supabase-js'
import { normalizeCurrencyCode } from '@/lib/currency/config'
import { LISTING_CONDITIONS } from '@/lib/marketplace-config'
import { EMPTY_PRIVILEGED_ACCESS, getPrivilegedAccess } from '@/lib/privileged-access'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  DashboardListing,
  DashboardPrivilegedAccess,
  DashboardSnapshot,
  ModerationQueueListing,
  ModerationSummary,
  PurchaseOrder,
  SaleOrder,
  ShippingStatus,
  PayoutStatus,
  PurchaseStatus,
} from '@/types/dashboard'
import { PROFILE_COLUMNS, buildEmptyProfile, normalizeProfileRow } from '@/lib/dashboard-data'
import { normalizeImageList } from '@/lib/image-src'

function normalizeListingStatus(value: unknown): DashboardListing['status'] {
  const statuses: DashboardListing['status'][] = ['active', 'draft', 'sold', 'pending_review', 'paused']
  return statuses.includes(value as DashboardListing['status']) ? (value as DashboardListing['status']) : 'draft'
}

function normalizeCondition(value: unknown): DashboardListing['condition'] {
  if (value === 'Poor') return 'Fair'
  const conditions: DashboardListing['condition'][] = LISTING_CONDITIONS
  return conditions.includes(value as DashboardListing['condition'])
    ? (value as DashboardListing['condition'])
    : 'Good'
}

function normalizeShippingStatus(value: unknown): ShippingStatus {
  const statuses: ShippingStatus[] = ['label_created', 'in_transit', 'delivered']
  return statuses.includes(value as ShippingStatus) ? (value as ShippingStatus) : 'label_created'
}

function normalizePayoutStatus(value: unknown): PayoutStatus {
  const statuses: PayoutStatus[] = ['on_hold', 'processing', 'released']
  return statuses.includes(value as PayoutStatus) ? (value as PayoutStatus) : 'on_hold'
}

function normalizePurchaseStatus(value: unknown): PurchaseStatus {
  const statuses: PurchaseStatus[] = ['processing', 'shipped', 'delivered']
  return statuses.includes(value as PurchaseStatus) ? (value as PurchaseStatus) : 'processing'
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

function isMissingProfilesTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false

  const knownCodes = new Set(['PGRST116', 'PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) {
    return true
  }

  const message = (error.message ?? '').toLowerCase()
  return message.includes("could not find the table 'public.profiles'") || message.includes('relation "profiles" does not exist')
}

function isMissingListingsTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false

  const knownCodes = new Set(['PGRST116', 'PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) {
    return true
  }

  const message = (error.message ?? '').toLowerCase()
  return message.includes("could not find the table 'public.listings'") || message.includes('relation "listings" does not exist')
}

function hasAdminClientConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function toDashboardPrivilegedAccess(
  access: Awaited<ReturnType<typeof getPrivilegedAccess>>
): DashboardPrivilegedAccess {
  return {
    role: access.role,
    canReviewListings: access.canReviewListings,
    moderationPath: access.moderationPath,
  }
}

function createEmptyModerationSummary(): ModerationSummary {
  return {
    pendingReview: 0,
    activeListings: 0,
    draftListings: 0,
  }
}

async function loadModerationState(
  supabase: SupabaseClient,
  authUser: User
): Promise<{
  privilegedAccess: DashboardPrivilegedAccess
  moderationQueue: ModerationQueueListing[]
  moderationSummary: ModerationSummary
}> {
  const access = await getPrivilegedAccess(supabase, authUser)

  if (!access.canReviewListings) {
    return {
      privilegedAccess: toDashboardPrivilegedAccess(EMPTY_PRIVILEGED_ACCESS),
      moderationQueue: [],
      moderationSummary: createEmptyModerationSummary(),
    }
  }

  const moderationClient = hasAdminClientConfig() ? createAdminClient() : supabase
  const [
    moderationQueueResult,
    pendingCountResult,
    activeCountResult,
    draftCountResult,
  ] = await Promise.all([
    moderationClient
      .from('listings')
      .select('id,title,category,condition,price,currency_code,image,image_url,images,seller_id,seller_name,created_at')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true })
      .limit(24),
    moderationClient.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    moderationClient.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    moderationClient.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ])

  if (moderationQueueResult.error && !isMissingListingsTableError(moderationQueueResult.error)) {
    console.error('[loadDashboardSnapshot] Could not load moderation queue.', moderationQueueResult.error.message)
  }

  const countErrors = [pendingCountResult.error, activeCountResult.error, draftCountResult.error].filter(Boolean)
  if (countErrors.length > 0) {
    const unexpectedCountErrors = countErrors.filter((error) => !isMissingListingsTableError(error))
    if (unexpectedCountErrors.length > 0) {
      console.error(
        '[loadDashboardSnapshot] Could not load moderation counts.',
        unexpectedCountErrors.map((error) => error?.message ?? 'Unknown error')
      )
    }
  }

  const moderationQueue =
    moderationQueueResult.error && !isMissingListingsTableError(moderationQueueResult.error)
      ? []
      : ((moderationQueueResult.data ?? []) as Record<string, unknown>[]).map((row) => ({
          id: asString(row.id, crypto.randomUUID()),
          title: asString(row.title, 'Untitled Listing'),
          category: asString(row.category, 'Other'),
          condition: normalizeCondition(row.condition),
          price: asNumber(row.price, 0),
          currencyCode: normalizeCurrencyCode(row.currency_code),
          image: normalizeImageList(row.images, row.image, row.image_url)[0] ?? '/next.svg',
          sellerId: asString(row.seller_id, 'unknown-seller'),
          sellerName: asString(row.seller_name, 'Seller'),
          createdAt: asString(row.created_at, new Date().toISOString()),
        }))

  return {
    privilegedAccess: toDashboardPrivilegedAccess(access),
    moderationQueue,
    moderationSummary: {
      pendingReview: pendingCountResult.count ?? 0,
      activeListings: activeCountResult.count ?? 0,
      draftListings: draftCountResult.count ?? 0,
    },
  }
}

function readMetadataProfile(authUser: User): Record<string, unknown> | null {
  if (!authUser.user_metadata || typeof authUser.user_metadata !== 'object' || Array.isArray(authUser.user_metadata)) {
    return null
  }

  const metadata = authUser.user_metadata as Record<string, unknown>
  const sellerProfile = metadata.seller_profile
  if (!sellerProfile || typeof sellerProfile !== 'object' || Array.isArray(sellerProfile)) {
    return null
  }

  return sellerProfile as Record<string, unknown>
}

export async function getOrCreateProfile(supabase: SupabaseClient, authUser: User) {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', authUser.id)
    .maybeSingle()

  if (data) {
    return normalizeProfileRow(data as Record<string, unknown>, authUser.id)
  }

  if (error && !isMissingProfilesTableError(error)) {
    throw new Error(error.message)
  }

  const fallback = buildEmptyProfile(authUser.id)
  const fullNameFromAuth =
    typeof authUser.user_metadata?.name === 'string' ? authUser.user_metadata.name : null
  const metadataProfile = readMetadataProfile(authUser)

  const insertPayload = {
    ...fallback,
    full_name: fullNameFromAuth,
  }

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .upsert(insertPayload, { onConflict: 'id' })
    .select(PROFILE_COLUMNS)
    .single()

  if (isMissingProfilesTableError(insertError)) {
    return normalizeProfileRow(
      {
        ...fallback,
        ...metadataProfile,
        full_name: metadataProfile?.full_name ?? fullNameFromAuth,
      },
      authUser.id
    )
  }

  if (insertError) {
    throw new Error(insertError.message)
  }

  if (!inserted) {
    return normalizeProfileRow(
      {
        ...fallback,
        ...metadataProfile,
        full_name: metadataProfile?.full_name ?? fullNameFromAuth,
      },
      authUser.id
    )
  }

  return normalizeProfileRow(inserted as Record<string, unknown>, authUser.id)
}

async function loadListings(supabase: SupabaseClient, userId: string): Promise<DashboardListing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', userId)
    .order('updated_at', { ascending: false })

  if (error || !data) return []

  return (data as Record<string, unknown>[]).map((row) => ({
    id: asString(row.id, crypto.randomUUID()),
    title: asString(row.title, 'Untitled Listing'),
    category: asString(row.category, 'Other'),
    price: asNumber(row.price, 0),
    currencyCode: normalizeCurrencyCode(row.currency_code),
    condition: normalizeCondition(row.condition),
    status: normalizeListingStatus(row.status),
    image: normalizeImageList(row.images, row.image, row.image_url)[0] ?? '/next.svg',
    views: asNumber(row.views, 0),
    watchers: asNumber(row.watchers, 0),
    updatedAt: asString(row.updated_at, new Date().toISOString()),
  }))
}

async function loadSales(supabase: SupabaseClient, userId: string): Promise<SaleOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id,order_number,listing_title,buyer_name,buyer_handle,shipping_status,payout_status,total_amount,currency_code,created_at')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return (data as Record<string, unknown>[]).map((row) => ({
    id: asString(row.id, crypto.randomUUID()),
    orderNumber: asString(row.order_number, 'Pending'),
    listingTitle: asString(row.listing_title, 'Sold item'),
    buyerName: asString(row.buyer_name, 'Buyer'),
    buyerHandle: asString(row.buyer_handle, '@buyer'),
    shippingStatus: normalizeShippingStatus(row.shipping_status),
    payoutStatus: normalizePayoutStatus(row.payout_status),
    amount: asNumber(row.total_amount, 0),
    currencyCode: asString(row.currency_code, 'USD'),
    soldAt: asString(row.created_at, new Date().toISOString()),
  }))
}

async function loadPurchases(supabase: SupabaseClient, userId: string): Promise<PurchaseOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id,order_number,item_title,seller_name,status,tracking_code,total_amount,currency_code,created_at')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return (data as Record<string, unknown>[]).map((row) => ({
    id: asString(row.id, crypto.randomUUID()),
    orderNumber: asString(row.order_number, 'Pending'),
    itemTitle: asString(row.item_title, 'Purchased item'),
    sellerName: asString(row.seller_name, 'Seller'),
    status: normalizePurchaseStatus(row.status),
    trackingCode: asString(row.tracking_code, ''),
    amount: asNumber(row.total_amount, 0),
    currencyCode: asString(row.currency_code, 'USD'),
    purchasedAt: asString(row.created_at, new Date().toISOString()),
  }))
}

export async function loadDashboardSnapshot(
  supabase: SupabaseClient,
  authUser: User
): Promise<DashboardSnapshot> {
  const profile = await getOrCreateProfile(supabase, authUser)
  const [listings, moderationState, sales, purchases] = await Promise.all([
    loadListings(supabase, authUser.id),
    loadModerationState(supabase, authUser),
    loadSales(supabase, authUser.id),
    loadPurchases(supabase, authUser.id),
  ])

  return {
    userId: authUser.id,
    email: authUser.email ?? '',
    emailVerified: Boolean(authUser.email_confirmed_at),
    displayName:
      (typeof authUser.user_metadata?.name === 'string' && authUser.user_metadata.name) ||
      profile.full_name ||
      authUser.email ||
      'User',
    generatedAt: new Date().toISOString(),
    profile,
    listings,
    privilegedAccess: moderationState.privilegedAccess,
    moderationQueue: moderationState.moderationQueue,
    moderationSummary: moderationState.moderationSummary,
    sales,
    purchases,
  }
}
