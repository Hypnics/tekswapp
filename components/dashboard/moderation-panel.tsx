'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  approvePendingListingFromDashboard,
  rejectPendingListingFromDashboard,
} from '@/app/dashboard/actions'
import { formatDate, formatPrice } from '@/lib/utils'
import {
  ModerationQueueListing,
  ModerationSummary,
  PrivilegedDashboardRole,
} from '@/types/dashboard'

interface ModerationPanelProps {
  role: PrivilegedDashboardRole
  workspacePath: '/admin' | '/staff' | null
  listings: ModerationQueueListing[]
  summary: ModerationSummary
}

export default function ModerationPanel({
  role,
  workspacePath,
  listings,
  summary,
}: ModerationPanelProps) {
  const roleLabel = role === 'owner' ? 'Owner' : 'Staff'

  return (
    <div className="space-y-5">
      <section className="dashboard-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="section-kicker">Privileged review queue</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Marketplace submission review</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/68">
              Submitted listings land here before they go live. Only owner and staff accounts can
              review, approve, or return them to draft.
            </p>
          </div>

          {workspacePath ? (
            <Link
              href={workspacePath}
              className="ghost-button rounded-xl px-4 py-2 text-sm font-semibold text-white/90"
            >
              Open {roleLabel.toLowerCase()} workspace
            </Link>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Pending review</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">{summary.pendingReview}</p>
            <p className="mt-1 text-sm text-white/62">Listings waiting on moderation</p>
          </div>
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Live listings</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{summary.activeListings}</p>
            <p className="mt-1 text-sm text-white/62">Currently visible in the marketplace</p>
          </div>
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Draft listings</p>
            <p className="mt-2 text-2xl font-semibold text-sky-300">{summary.draftListings}</p>
            <p className="mt-1 text-sm text-white/62">Returned or unpublished submissions</p>
          </div>
        </div>
      </section>

      {listings.length === 0 ? (
        <section className="dashboard-panel rounded-[1.75rem] p-8 text-center">
          <h3 className="text-lg font-semibold text-white">No submitted listings are waiting</h3>
          <p className="mt-2 text-sm text-white/60">
            Fresh seller submissions will appear here as soon as they are sent for review.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="dashboard-panel rounded-[1.75rem] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-white/10 lg:w-64">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 256px"
                    unoptimized
                  />
                </div>

                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-amber-300">Awaiting review</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{listing.title}</h3>
                      <p className="mt-1 text-sm text-white/62">
                        {listing.category} / {listing.condition} /{' '}
                        {listing.priceDisplay
                          ? listing.priceDisplay.isApproximate
                            ? `Approx. ${listing.priceDisplay.formatted}`
                            : listing.priceDisplay.formatted
                          : formatPrice(listing.price, listing.currencyCode)}
                      </p>
                    </div>

                    <div className="dashboard-panel-soft rounded-2xl px-4 py-3 text-sm text-white/70">
                      <p>Seller: {listing.sellerName}</p>
                      <p className="mt-1">Submitted: {formatDate(listing.createdAt)}</p>
                      <p className="mt-1 truncate">Seller ID: {listing.sellerId}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/product/${listing.id}`}
                      className="rounded-xl border border-white/14 px-3 py-2 text-xs font-semibold text-white/84 transition hover:bg-white/6"
                    >
                      Preview listing
                    </Link>

                    <form action={approvePendingListingFromDashboard}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Approve to marketplace
                      </button>
                    </form>

                    <form action={rejectPendingListingFromDashboard}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-red-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                      >
                        Return to draft
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
