'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
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

  return (
    <div className="space-y-5">
      {!canPublish && (
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: 'rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.08)' }}
        >
          <p className="text-sm font-semibold text-[#fcd34d]">Seller onboarding required before publishing</p>
          <p className="mt-1 text-sm text-white/75">
            Complete verification basics in the Verification Center to publish new listings.
          </p>
          <button
            onClick={onRequireVerification}
            className="mt-3 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Verification Center
          </button>
        </div>
      )}

      <section
        className="rounded-2xl border p-4 sm:p-5"
        style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">My Listings</h2>
            <p className="text-sm text-white/65">Manage lifecycle, pricing, and listing visibility.</p>
          </div>
          {canPublish ? (
            <Link
              href="/sell"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(145deg, #2563EB 0%, #1d4ed8 100%)',
              }}
            >
              Create listing
            </Link>
          ) : (
            <button
              onClick={onRequireVerification}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{
                background: 'rgba(255,255,255,0.14)',
                cursor: 'not-allowed',
              }}
            >
              Create listing (locked)
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="rounded-lg px-3 py-1.5 text-sm font-medium"
              style={{
                background: activeTab === tab.id ? 'rgba(37,99,235,0.24)' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? '#ffffff' : 'rgba(255,255,255,0.72)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredListings.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title={`No ${tabs.find((tab) => tab.id === activeTab)?.label.toLowerCase()} listings`}
              description="This bucket is currently empty. Move drafts live or relist sold inventory when ready."
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
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
                  <tr key={listing.id} className="rounded-xl bg-white/[0.03]">
                    <td className="rounded-l-xl px-3 py-3">
                      <p className="text-sm font-semibold text-white">{listing.title}</p>
                      <p className="text-xs text-white/55">{listing.category}</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-white/72">{listing.condition}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-white">
                      {formatPrice(listing.price, 'USD')}
                    </td>
                    <td className="px-3 py-3 text-sm text-white/65">
                      {listing.views} views · {listing.watchers} watchers
                    </td>
                    <td className="px-3 py-3 text-sm text-white/65">{formatDate(listing.updatedAt)}</td>
                    <td className="rounded-r-xl px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {mapActions(activeTab).map((action) => (
                          <button
                            key={`${listing.id}-${action}`}
                            onClick={
                              action === 'Publish' && !canPublish ? onRequireVerification : undefined
                            }
                            className="rounded-md border px-2 py-1 text-xs text-white/80"
                            style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                          >
                            {action}
                          </button>
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
