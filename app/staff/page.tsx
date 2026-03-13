import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { approvePendingListingAsStaff, rejectPendingListingAsStaff } from '@/app/staff/actions'
import { normalizeImageSrc } from '@/lib/image-src'
import { requireStaffContext, StaffAuthError } from '@/lib/staff-auth'
import { formatDate, formatPrice } from '@/lib/utils'

type StaffListingRow = {
  id: string
  title: string
  category: string
  condition: string
  price: number
  image: string | null
  image_url: string | null
  seller_name: string
  seller_id: string
  created_at: string
}

const LISTING_COLUMNS = 'id,title,category,condition,price,image,image_url,seller_name,seller_id,created_at'

export const metadata: Metadata = {
  title: 'TekSwapp Staff Review',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function StaffPage() {
  let supabase: Awaited<ReturnType<typeof requireStaffContext>>['supabase']
  let user: Awaited<ReturnType<typeof requireStaffContext>>['user']

  try {
    const context = await requireStaffContext({ redirectToAuth: true, nextPath: '/staff' })
    supabase = context.supabase
    user = context.user
  } catch (error) {
    if (error instanceof StaffAuthError && error.code === 'forbidden') {
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

  const [pendingListingsResult, pendingCountResult, activeCountResult, draftCountResult] = await Promise.all([
    supabase
      .from('listings')
      .select(LISTING_COLUMNS)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true })
      .limit(50),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ])

  const pendingListings = (pendingListingsResult.data ?? []) as StaffListingRow[]
  const pendingCount = pendingCountResult.count ?? 0
  const activeCount = activeCountResult.count ?? 0
  const draftCount = draftCountResult.count ?? 0

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <main className="px-4 pb-16 pt-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-red-300">Private Staff Workspace</p>
                <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Staff Listing Review Queue</h1>
                <p className="mt-1 text-sm text-white/60">
                  Signed in as {user.email ?? 'staff'}.
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

          <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Pending review</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">{pendingCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Live listings</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{activeCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/45">Returned to draft</p>
              <p className="mt-2 text-2xl font-semibold text-blue-300">{draftCount}</p>
            </div>
          </section>

          {pendingListings.length === 0 ? (
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
              <h2 className="text-lg font-semibold">No pending listings</h2>
              <p className="mt-2 text-sm text-white/60">
                New seller submissions will appear here for moderation.
              </p>
            </section>
          ) : (
            <section className="space-y-4">
              {pendingListings.map((listing) => {
                const image = normalizeImageSrc(listing.image ?? listing.image_url)
                return (
                  <article
                    key={listing.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/10 sm:w-56">
                        <Image
                          src={image}
                          alt={listing.title}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 640px) 100vw, 224px"
                        />
                      </div>

                      <div className="flex flex-1 flex-col gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                          <p className="mt-1 text-sm text-white/65">
                            {listing.category} · {listing.condition}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-1 text-sm text-white/70 sm:grid-cols-2">
                          <p>Price: {formatPrice(listing.price, 'USD')}</p>
                          <p>Seller: {listing.seller_name}</p>
                          <p>Submitted: {formatDate(listing.created_at)}</p>
                          <p className="truncate">Seller ID: {listing.seller_id}</p>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-2">
                          <Link
                            href={`/product/${listing.id}`}
                            className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white"
                          >
                            Preview
                          </Link>
                          <form action={approvePendingListingAsStaff}>
                            <input type="hidden" name="listing_id" value={listing.id} />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                            >
                              Approve and publish
                            </button>
                          </form>
                          <form action={rejectPendingListingAsStaff}>
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
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
