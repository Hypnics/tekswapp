'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import PriceDisplay from '@/components/currency/price-display'
import EmptyState from '@/components/dashboard/empty-state'
import { formatDate, formatPrice } from '@/lib/utils'
import { DashboardListing } from '@/types/dashboard'

interface ListingsPanelProps {
  listings: DashboardListing[]
  canPublish: boolean
  onRequireVerification: () => void
}

type ListingTab = 'active' | 'draft' | 'sold' | 'pending_review'

const tabs: { id: ListingTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'draft', label: 'Draft' },
  { id: 'sold', label: 'Sold' },
  { id: 'pending_review', label: 'Pending review' },
]

function mapActions(status: ListingTab): string[] {
  if (status === 'active') return ['Edit', 'Pause', 'Delete']
  if (status === 'draft') return ['Edit', 'Publish', 'Delete']
  if (status === 'sold') return ['Relist', 'Delete']
  return ['Edit', 'Delete']
}

export default function ListingsPanel({ listings, canPublish, onRequireVerification }: ListingsPanelProps) {
  const [activeTab, setActiveTab] = useState<ListingTab>('active')

  const filteredListings = useMemo(
    () => listings.filter((listing) => listing.status === activeTab),
    [activeTab, listings]
  )

  const tabCounts = useMemo(
    () =>
      tabs.reduce(
        (counts, tab) => ({
          ...counts,
          [tab.id]: listings.filter((listing) => listing.status === tab.id).length,
        }),
        {
          active: 0,
          draft: 0,
          sold: 0,
          pending_review: 0,
        } satisfies Record<ListingTab, number>
      ),
    [listings]
  )

  const totalViews = useMemo(
    () => filteredListings.reduce((total, listing) => total + listing.views, 0),
    [filteredListings]
  )
  const totalWatchers = useMemo(
    () => filteredListings.reduce((total, listing) => total + listing.watchers, 0),
    [filteredListings]
  )
  const inventoryValue = useMemo(
    () =>
      filteredListings.reduce(
        (total, listing) => total + (listing.priceDisplay?.displayAmount ?? listing.price),
        0
      ),
    [filteredListings]
  )
  const inventoryValueCurrency =
    filteredListings[0]?.priceDisplay?.displayCurrency ?? filteredListings[0]?.currencyCode ?? 'USD'
  const inventoryValueLocale = filteredListings[0]?.priceDisplay?.locale ?? 'en-US'

  return (
    <div className="space-y-5">
      {!canPublish && (
        <div
          className="dashboard-panel rounded-2xl p-4"
          style={{ borderColor: 'rgba(251,191,36,0.35)', color: '#fde68a' }}
        >
          <p className="text-sm font-semibold">Seller onboarding required before publishing</p>
          <p className="mt-1 text-sm text-white/75">
            Complete verification basics in the Verification Center to publish new listings.
          </p>
          <button
            type="button"
            onClick={onRequireVerification}
            className="brand-button mt-3 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Verification Center
          </button>
        </div>
      )}

      <section className="dashboard-panel rounded-[1.75rem] p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">Inventory hub</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">My Listings</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/65">
              Manage pricing, visibility, and listing momentum from one clean queue.
            </p>
          </div>

          {canPublish ? (
            <Link href="/sell" className="brand-button rounded-xl px-4 py-2 text-sm font-semibold text-white">
              Create listing
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRequireVerification}
              className="ghost-button rounded-xl px-4 py-2 text-sm font-semibold text-white/85"
            >
              Create listing (locked)
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Listings in view</p>
            <p className="mt-2 text-2xl font-semibold text-white">{filteredListings.length}</p>
            <p className="mt-1 text-sm text-white/62">{tabs.find((tab) => tab.id === activeTab)?.label} queue</p>
          </div>
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Audience</p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalViews.toLocaleString('en-US')}</p>
            <p className="mt-1 text-sm text-white/62">{totalWatchers} watcher{totalWatchers === 1 ? '' : 's'}</p>
          </div>
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Inventory value</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatPrice(inventoryValue, inventoryValueCurrency, inventoryValueLocale)}
            </p>
            <p className="mt-1 text-sm text-white/62">Based on visible items in this tab</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="rounded-xl px-3 py-2 text-sm font-semibold transition"
              style={{
                background: activeTab === tab.id ? 'rgba(37,99,235,0.26)' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? '#ffffff' : 'rgba(255,255,255,0.72)',
              }}
            >
              {tab.label} {tabCounts[tab.id]}
            </button>
          ))}
        </div>

        {filteredListings.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title={`No ${tabs.find((tab) => tab.id === activeTab)?.label.toLowerCase()} listings`}
              description="This queue is empty right now. Publish drafts or refresh inventory when you are ready to keep momentum up."
            />
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[780px] border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.08em] text-white/45">
                  <th className="px-3 py-2">Listing</th>
                  <th className="px-3 py-2">Condition</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Performance</th>
                  <th className="px-3 py-2">Updated</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="dashboard-table-row">
                    <td className="rounded-l-2xl px-3 py-3">
                      <p className="text-sm font-semibold text-white">{listing.title}</p>
                      <p className="mt-1 text-xs text-white/55">{listing.category}</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-white/72">{listing.condition}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-white">
                      {listing.priceDisplay ? (
                        <PriceDisplay
                          money={listing.priceDisplay}
                          amountClassName="text-sm font-semibold text-white"
                          metaClassName="mt-1 text-[11px] text-white/48"
                        />
                      ) : (
                        formatPrice(listing.price, listing.currencyCode)
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-white/65">
                      {listing.views} views / {listing.watchers} watchers
                    </td>
                    <td className="px-3 py-3 text-sm text-white/65">{formatDate(listing.updatedAt)}</td>
                    <td className="rounded-r-2xl px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {mapActions(activeTab).map((action) => (
                          action === 'Edit' ? (
                            <Link
                              key={`${listing.id}-${action}`}
                              href={`/sell?edit=${listing.id}`}
                              className="rounded-lg border border-white/16 px-2.5 py-1.5 text-xs font-semibold text-white/82 transition hover:bg-white/6"
                            >
                              Edit
                            </Link>
                          ) : (
                            <button
                              key={`${listing.id}-${action}`}
                              type="button"
                              onClick={action === 'Publish' && !canPublish ? onRequireVerification : undefined}
                              className="rounded-lg border border-white/16 px-2.5 py-1.5 text-xs font-semibold text-white/82 transition hover:bg-white/6"
                            >
                              {action}
                            </button>
                          )
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
