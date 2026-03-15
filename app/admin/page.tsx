import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  approvePendingListing,
  createPrivilegedUser,
  deleteListingAsOwner,
  rejectPendingListing,
  setListingStatus,
  setSellerVerificationState,
  updatePrivilegedUserAccess,
} from '@/app/admin/actions'
import { normalizeImageSrc } from '@/lib/image-src'
import { OwnerAuthError, requireOwnerContext } from '@/lib/owner-auth'
import { formatDate, formatPrice } from '@/lib/utils'

type ListingStatus = 'active' | 'draft' | 'sold' | 'pending_review' | 'paused'
type ProfileVerificationStatus = 'unverified' | 'in_review' | 'verified' | 'rejected'

type OwnerListingRow = {
  id: string
  title: string
  category: string
  condition: string
  status: ListingStatus
  price: number
  currency_code: string | null
  image: string | null
  image_url: string | null
  seller_name: string
  seller_id: string
  created_at: string
  updated_at: string
}

type OwnerProfileRow = {
  id: string
  full_name: string | null
  verification_status: ProfileVerificationStatus
  seller_enabled: boolean
  updated_at: string
}

type AccessAccountRow = {
  user_id: string
  email: string
  created_at: string
}

const LISTING_COLUMNS =
  'id,title,category,condition,status,price,currency_code,image,image_url,seller_name,seller_id,created_at,updated_at'
const PROFILE_COLUMNS = 'id,full_name,verification_status,seller_enabled,updated_at'

export const metadata: Metadata = {
  title: 'TekSwapp Owner Control Center',
  robots: {
    index: false,
    follow: false,
  },
}

function statusTone(status: ListingStatus): string {
  if (status === 'active') return 'text-emerald-300'
  if (status === 'pending_review') return 'text-amber-300'
  if (status === 'paused') return 'text-orange-300'
  if (status === 'sold') return 'text-cyan-300'
  return 'text-white/70'
}

function verificationTone(status: ProfileVerificationStatus): string {
  if (status === 'verified') return 'text-emerald-300'
  if (status === 'in_review') return 'text-amber-300'
  if (status === 'rejected') return 'text-red-300'
  return 'text-white/70'
}

export default async function AdminPage() {
  let supabase: Awaited<ReturnType<typeof requireOwnerContext>>['supabase']
  let user: Awaited<ReturnType<typeof requireOwnerContext>>['user']

  try {
    const context = await requireOwnerContext({ redirectToAuth: true, nextPath: '/admin' })
    supabase = context.supabase
    user = context.user
  } catch (error) {
    if (error instanceof OwnerAuthError && error.code === 'forbidden') {
      return (
        <div className="min-h-screen bg-[#0B0F1A] text-white">
          <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4">
            <section className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <h1 className="text-2xl font-semibold">404</h1>
              <p className="mt-2 text-sm text-white/60">This page could not be found.</p>
            </section>
          </main>
        </div>
      )
    }

    throw error
  }

  const [
    pendingListingsResult,
    recentListingsResult,
    sellersResult,
    ownerAccountsResult,
    staffAccountsResult,
    pendingCountResult,
    activeCountResult,
    pausedCountResult,
    sellerCountResult,
  ] = await Promise.all([
    supabase
      .from('listings')
      .select(LISTING_COLUMNS)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true })
      .limit(20),
    supabase
      .from('listings')
      .select(LISTING_COLUMNS)
      .order('updated_at', { ascending: false })
      .limit(40),
    supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .order('updated_at', { ascending: false })
      .limit(40),
    supabase.from('owner_accounts').select('user_id,email,created_at').order('created_at', { ascending: true }),
    supabase.from('staff_accounts').select('user_id,email,created_at').order('created_at', { ascending: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'paused'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const pendingListings = (pendingListingsResult.data ?? []) as OwnerListingRow[]
  const recentListings = (recentListingsResult.data ?? []) as OwnerListingRow[]
  const sellers = (sellersResult.data ?? []) as OwnerProfileRow[]
  const ownerAccounts = (ownerAccountsResult.data ?? []) as AccessAccountRow[]
  const staffAccounts = (staffAccountsResult.data ?? []) as AccessAccountRow[]
  const accessDataError = ownerAccountsResult.error || staffAccountsResult.error
  const pendingCount = pendingCountResult.count ?? 0
  const activeCount = activeCountResult.count ?? 0
  const pausedCount = pausedCountResult.count ?? 0
  const sellerCount = sellerCountResult.count ?? 0

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <main className="px-4 pb-16 pt-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-red-300">Private Owner Workspace</p>
                <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Owner Control Center</h1>
                <p className="mt-1 text-sm text-white/60">
                  Signed in as {user.email ?? 'owner'}.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/75 hover:text-white"
              >
                Open seller dashboard
              </Link>
            </div>
          </header>

          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Pending review</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">{pendingCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Live listings</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{activeCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Paused listings</p>
              <p className="mt-2 text-2xl font-semibold text-orange-300">{pausedCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Seller profiles</p>
              <p className="mt-2 text-2xl font-semibold text-blue-300">{sellerCount}</p>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-lg font-semibold">Access Management</h2>
            <p className="mt-1 text-sm text-white/60">
              Create accounts with custom passwords and assign Owner/Staff role.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <form action={createPrivilegedUser} className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                <h3 className="text-sm font-semibold text-white">Create New Account</h3>
                <div className="mt-3 space-y-3">
                  <label className="block text-xs text-white/70">
                    Full name (optional)
                    <input
                      name="full_name"
                      className="mt-1 w-full rounded-md border border-white/15 bg-white/[0.02] px-3 py-2 text-sm text-white outline-none"
                      placeholder="Team member name"
                    />
                  </label>
                  <label className="block text-xs text-white/70">
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      className="mt-1 w-full rounded-md border border-white/15 bg-white/[0.02] px-3 py-2 text-sm text-white outline-none"
                      placeholder="new.user@tekswapp.com"
                    />
                  </label>
                  <label className="block text-xs text-white/70">
                    Custom password
                    <input
                      name="password"
                      type="password"
                      required
                      className="mt-1 w-full rounded-md border border-white/15 bg-white/[0.02] px-3 py-2 text-sm text-white outline-none"
                      placeholder="At least 12 chars with upper/lower/number/symbol"
                    />
                  </label>
                  <label className="block text-xs text-white/70">
                    Role
                    <select
                      name="role"
                      className="mt-1 w-full rounded-md border border-white/15 bg-[#0B0F1A] px-3 py-2 text-sm text-white outline-none"
                      defaultValue="staff"
                    >
                      <option value="staff">Staff</option>
                      <option value="owner">Owner</option>
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  Create account
                </button>
              </form>

              <form action={updatePrivilegedUserAccess} className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                <h3 className="text-sm font-semibold text-white">Update Existing Account</h3>
                <div className="mt-3 space-y-3">
                  <label className="block text-xs text-white/70">
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      className="mt-1 w-full rounded-md border border-white/15 bg-white/[0.02] px-3 py-2 text-sm text-white outline-none"
                      placeholder="existing.user@tekswapp.com"
                    />
                  </label>
                  <label className="block text-xs text-white/70">
                    Role
                    <select
                      name="role"
                      className="mt-1 w-full rounded-md border border-white/15 bg-[#0B0F1A] px-3 py-2 text-sm text-white outline-none"
                      defaultValue="staff"
                    >
                      <option value="staff">Staff</option>
                      <option value="owner">Owner</option>
                    </select>
                  </label>
                  <label className="block text-xs text-white/70">
                    New password (optional)
                    <input
                      name="new_password"
                      type="password"
                      className="mt-1 w-full rounded-md border border-white/15 bg-white/[0.02] px-3 py-2 text-sm text-white outline-none"
                      placeholder="Leave blank to keep current password"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                >
                  Update access
                </button>
              </form>
            </div>

            {accessDataError && (
              <p className="mt-4 text-xs text-amber-300">
                Access table query warning: {accessDataError.message}
              </p>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                <h3 className="text-sm font-semibold text-white">Owner Accounts</h3>
                <div className="mt-3 space-y-2 text-xs text-white/70">
                  {ownerAccounts.length === 0 ? (
                    <p>No owner accounts returned.</p>
                  ) : (
                    ownerAccounts.map((account) => (
                      <p key={account.user_id} className="break-all">
                        {account.email}
                      </p>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.01] p-4">
                <h3 className="text-sm font-semibold text-white">Staff Accounts</h3>
                <div className="mt-3 space-y-2 text-xs text-white/70">
                  {staffAccounts.length === 0 ? (
                    <p>No staff accounts found.</p>
                  ) : (
                    staffAccounts.map((account) => (
                      <p key={account.user_id} className="break-all">
                        {account.email}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-lg font-semibold">Pending Listing Approvals</h2>
            <p className="mt-1 text-sm text-white/60">Approve submissions to push them live, or return to draft.</p>

            {pendingListings.length === 0 ? (
              <p className="mt-4 text-sm text-white/55">No pending listings right now.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {pendingListings.map((listing) => {
                  const image = normalizeImageSrc(listing.image ?? listing.image_url)
                  return (
                    <article
                      key={listing.id}
                      className="rounded-xl border border-white/10 bg-white/[0.01] p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-white/10 sm:w-44">
                          <Image
                            src={image}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            unoptimized
                            sizes="(max-width: 640px) 100vw, 176px"
                          />
                        </div>

                        <div className="flex flex-1 flex-col gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-white">{listing.title}</h3>
                            <p className="mt-1 text-sm text-white/65">
                              {listing.category} · {listing.condition} · {formatPrice(listing.price, listing.currency_code ?? 'USD')}
                            </p>
                          </div>
                          <p className="text-xs text-white/55">
                            Seller: {listing.seller_name} · Submitted {formatDate(listing.created_at)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Link
                              href={`/product/${listing.id}`}
                              className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white"
                            >
                              Preview
                            </Link>
                            <form action={approvePendingListing}>
                              <input type="hidden" name="listing_id" value={listing.id} />
                              <button
                                type="submit"
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                              >
                                Approve
                              </button>
                            </form>
                            <form action={rejectPendingListing}>
                              <input type="hidden" name="listing_id" value={listing.id} />
                              <button
                                type="submit"
                                className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                              >
                                Reject to draft
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-lg font-semibold">Global Listing Controls</h2>
            <p className="mt-1 text-sm text-white/60">
              Change status or delete any listing in the marketplace.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.08em] text-white/45">
                    <th className="pb-3 pr-4">Listing</th>
                    <th className="pb-3 pr-4">Seller</th>
                    <th className="pb-3 pr-4">Price</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Updated</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="border-b border-white/6">
                      <td className="py-3 pr-4">
                        <p className="max-w-[280px] truncate font-medium text-white">{listing.title}</p>
                        <p className="text-xs text-white/55">{listing.category}</p>
                      </td>
                      <td className="py-3 pr-4 text-white/70">{listing.seller_name}</td>
                      <td className="py-3 pr-4 text-white/80">{formatPrice(listing.price, listing.currency_code ?? 'USD')}</td>
                      <td className={`py-3 pr-4 font-semibold ${statusTone(listing.status)}`}>{listing.status}</td>
                      <td className="py-3 pr-4 text-white/65">{formatDate(listing.updated_at)}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          {(['active', 'pending_review', 'paused', 'draft', 'sold'] as ListingStatus[]).map((status) => (
                            <form key={`${listing.id}-${status}`} action={setListingStatus}>
                              <input type="hidden" name="listing_id" value={listing.id} />
                              <input type="hidden" name="status" value={status} />
                              <button
                                type="submit"
                                className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/80 hover:text-white"
                              >
                                {status}
                              </button>
                            </form>
                          ))}
                          <form action={deleteListingAsOwner}>
                            <input type="hidden" name="listing_id" value={listing.id} />
                            <button
                              type="submit"
                              className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:text-red-200"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-lg font-semibold">Seller Verification Controls</h2>
            <p className="mt-1 text-sm text-white/60">
              Override seller verification and publishing access.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[960px] w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.08em] text-white/45">
                    <th className="pb-3 pr-4">Seller</th>
                    <th className="pb-3 pr-4">Verification</th>
                    <th className="pb-3 pr-4">Publishing</th>
                    <th className="pb-3 pr-4">Updated</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="border-b border-white/6">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-white">{seller.full_name ?? 'Unnamed seller'}</p>
                        <p className="max-w-[280px] truncate text-xs text-white/50">{seller.id}</p>
                      </td>
                      <td className={`py-3 pr-4 font-semibold ${verificationTone(seller.verification_status)}`}>
                        {seller.verification_status}
                      </td>
                      <td className="py-3 pr-4 text-white/75">
                        {seller.seller_enabled ? 'Enabled' : 'Disabled'}
                      </td>
                      <td className="py-3 pr-4 text-white/65">{formatDate(seller.updated_at)}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={setSellerVerificationState}>
                            <input type="hidden" name="user_id" value={seller.id} />
                            <input type="hidden" name="verification_status" value="verified" />
                            <input type="hidden" name="seller_enabled" value="true" />
                            <button
                              type="submit"
                              className="rounded-md border border-emerald-500/45 px-2 py-1 text-xs text-emerald-300"
                            >
                              Verify
                            </button>
                          </form>
                          <form action={setSellerVerificationState}>
                            <input type="hidden" name="user_id" value={seller.id} />
                            <input type="hidden" name="verification_status" value="in_review" />
                            <input type="hidden" name="seller_enabled" value="false" />
                            <button
                              type="submit"
                              className="rounded-md border border-amber-500/45 px-2 py-1 text-xs text-amber-300"
                            >
                              In review
                            </button>
                          </form>
                          <form action={setSellerVerificationState}>
                            <input type="hidden" name="user_id" value={seller.id} />
                            <input type="hidden" name="verification_status" value="rejected" />
                            <input type="hidden" name="seller_enabled" value="false" />
                            <button
                              type="submit"
                              className="rounded-md border border-red-500/45 px-2 py-1 text-xs text-red-300"
                            >
                              Reject
                            </button>
                          </form>
                          <form action={setSellerVerificationState}>
                            <input type="hidden" name="user_id" value={seller.id} />
                            <input type="hidden" name="verification_status" value="unverified" />
                            <input type="hidden" name="seller_enabled" value="false" />
                            <button
                              type="submit"
                              className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/80"
                            >
                              Disable
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
