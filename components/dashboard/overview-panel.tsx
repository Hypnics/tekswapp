import {
  canUserPublishListings,
  getListingCountByStatus,
  hasRequiredSellerFields,
} from '@/lib/dashboard-data'
import { formatDate, formatPrice } from '@/lib/utils'
import { DashboardSection, DashboardSnapshot } from '@/types/dashboard'

interface OverviewPanelProps {
  snapshot: DashboardSnapshot
  verificationProgress: number
  pendingActions: number
  onNavigate: (section: DashboardSection) => void
}

interface FocusItem {
  title: string
  detail: string
  action: string
  section: DashboardSection
}

const listingStatusLabel = {
  active: 'Active',
  draft: 'Draft',
  sold: 'Sold',
  pending_review: 'In review',
  paused: 'Paused',
} as const

export default function OverviewPanel({
  snapshot,
  verificationProgress,
  pendingActions,
  onNavigate,
}: OverviewPanelProps) {
  const sellerReady = canUserPublishListings(snapshot.profile, snapshot.emailVerified)
  const activeCount = getListingCountByStatus(snapshot.listings, 'active')
  const draftCount = getListingCountByStatus(snapshot.listings, 'draft')
  const soldCount = getListingCountByStatus(snapshot.listings, 'sold')
  const reviewCount = getListingCountByStatus(snapshot.listings, 'pending_review')
  const totalViews = snapshot.listings.reduce((total, listing) => total + listing.views, 0)
  const totalWatchers = snapshot.listings.reduce((total, listing) => total + listing.watchers, 0)
  const grossSales = snapshot.sales.reduce((total, sale) => total + sale.amount, 0)
  const openSales = snapshot.sales.filter((sale) => sale.shippingStatus !== 'delivered').length
  const incomingPurchases = snapshot.purchases.filter((purchase) => purchase.status !== 'delivered').length
  const averageOrderValue = snapshot.sales.length > 0 ? Math.round(grossSales / snapshot.sales.length) : 0
  const profileComplete = hasRequiredSellerFields(snapshot.profile)

  const stats = [
    {
      label: 'Gross sales',
      value: formatPrice(grossSales, 'USD'),
      note: snapshot.sales.length > 0 ? `${snapshot.sales.length} completed orders` : 'Waiting for first sale',
    },
    {
      label: 'Listing views',
      value: totalViews.toLocaleString('en-US'),
      note: totalWatchers > 0 ? `${totalWatchers} buyers watching` : 'No watchers yet',
    },
    {
      label: 'Average order',
      value: snapshot.sales.length > 0 ? formatPrice(averageOrderValue, 'USD') : '$0',
      note: openSales > 0 ? `${openSales} orders still moving` : 'No shipping backlog',
    },
    {
      label: 'Buyer activity',
      value: snapshot.purchases.length.toString(),
      note: incomingPurchases > 0 ? `${incomingPurchases} deliveries on the way` : 'No incoming deliveries',
    },
  ]

  const focusItems: FocusItem[] = []

  if (!snapshot.emailVerified) {
    focusItems.push({
      title: 'Verify your email',
      detail: 'Email confirmation is still the fastest unlock for seller access.',
      action: 'Finish verification',
      section: 'verification',
    })
  }

  if (!profileComplete) {
    focusItems.push({
      title: 'Complete your profile details',
      detail: 'Address and phone details are still missing from your seller setup.',
      action: 'Update profile',
      section: 'verification',
    })
  }

  if (draftCount > 0) {
    focusItems.push({
      title: 'Publish your drafts',
      detail: `${draftCount} draft listing${draftCount === 1 ? '' : 's'} can be polished and pushed live.`,
      action: 'Review listings',
      section: 'listings',
    })
  }

  if (reviewCount > 0) {
    focusItems.push({
      title: 'Watch pending reviews',
      detail: `${reviewCount} listing${reviewCount === 1 ? '' : 's'} are waiting on review.`,
      action: 'Open listings',
      section: 'listings',
    })
  }

  if (openSales > 0) {
    focusItems.push({
      title: 'Keep orders moving',
      detail: `${openSales} sale${openSales === 1 ? '' : 's'} still need shipping attention or payout follow-up.`,
      action: 'Open sales',
      section: 'sales',
    })
  }

  if (incomingPurchases > 0) {
    focusItems.push({
      title: 'Track incoming purchases',
      detail: `${incomingPurchases} order${incomingPurchases === 1 ? '' : 's'} are still on the way to you.`,
      action: 'View purchases',
      section: 'purchases',
    })
  }

  const topListings = [...snapshot.listings]
    .sort((left, right) => right.views + right.watchers - (left.views + left.watchers))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <article className="dashboard-panel rounded-[1.75rem] p-6 sm:p-7">
          <div className="dashboard-reading-box rounded-[1.5rem] p-5 sm:p-6">
            <p className="section-kicker">Marketplace pulse</p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Welcome back, {snapshot.displayName.split(' ')[0]}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/84 sm:text-base">
              Your account is carrying {activeCount} active listing{activeCount === 1 ? '' : 's'}, {snapshot.sales.length}{' '}
              sale{snapshot.sales.length === 1 ? '' : 's'}, and {snapshot.purchases.length} purchase
              {snapshot.purchases.length === 1 ? '' : 's'}. Use this space to keep both selling and buying activity moving.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/58">Verification</p>
              <p className="mt-2 text-2xl font-semibold text-white">{verificationProgress}%</p>
              <div className="dashboard-progress-track mt-3 h-2">
                <div className="dashboard-progress-fill h-full" style={{ width: `${verificationProgress}%` }} />
              </div>
            </div>
            <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/58">Listing pipeline</p>
              <p className="mt-2 text-2xl font-semibold text-white">{activeCount + draftCount + reviewCount}</p>
              <p className="mt-2 text-sm text-white/76">
                {activeCount} live / {draftCount} draft / {reviewCount} in review
              </p>
            </div>
            <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/58">Readiness</p>
              <p className="mt-2 text-2xl font-semibold text-white">{sellerReady ? 'Live' : 'Blocked'}</p>
              <p className="mt-2 text-sm text-white/76">
                {pendingActions > 0 ? `${pendingActions} action${pendingActions === 1 ? '' : 's'} still open` : 'Everything required is complete'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="dashboard-panel-soft rounded-2xl px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/58">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-white/76">{stat.note}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel rounded-[1.75rem] p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="dashboard-reading-box flex-1 rounded-[1.4rem] p-4">
              <p className="section-kicker">Focus for today</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Highest impact next moves</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Clear next steps to improve seller readiness and keep activity moving.
              </p>
            </div>
            <span className="dashboard-chip" data-tone={pendingActions > 0 ? 'warning' : 'success'}>
              {pendingActions} open
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {focusItems.length > 0 ? (
              focusItems.slice(0, 4).map((item) => (
                <div key={item.title} className="dashboard-panel-soft rounded-2xl p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/62">{item.detail}</p>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.section)}
                    className="mt-3 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                  >
                    {item.action}
                  </button>
                </div>
              ))
            ) : (
              <div className="dashboard-panel-soft rounded-2xl p-4">
                <p className="text-sm font-semibold text-white">Everything looks healthy</p>
                <p className="mt-1 text-sm leading-relaxed text-white/62">
                  Seller requirements are complete and there are no urgent workflow blockers right now. This is a good time to create a fresh listing.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('listings')}
                  className="mt-3 rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  Review listings
                </button>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="dashboard-panel rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="dashboard-reading-box flex-1 rounded-[1.35rem] p-4">
              <h3 className="text-lg font-semibold text-white">Recent sales</h3>
              <p className="mt-1 text-sm text-white/80">Latest order activity and revenue snapshots.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="rounded-xl border border-white/12 px-3 py-2 text-sm font-semibold text-white/86"
            >
              Open sales
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {snapshot.sales.length > 0 ? (
              snapshot.sales.slice(0, 4).map((sale) => (
                <div key={sale.id} className="dashboard-panel-soft rounded-2xl px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{sale.listingTitle}</p>
                      <p className="mt-1 text-xs text-white/55">
                        {sale.orderNumber} / {sale.buyerName} / {formatDate(sale.soldAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">{formatPrice(sale.amount, 'USD')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-panel-soft rounded-2xl px-4 py-6">
                <p className="text-sm font-semibold text-white">No sales yet</p>
                <p className="mt-1 text-sm text-white/62">
                  Once something sells, your shipping and payout milestones will show up here.
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="dashboard-panel rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="dashboard-reading-box flex-1 rounded-[1.35rem] p-4">
              <h3 className="text-lg font-semibold text-white">Listing performance</h3>
              <p className="mt-1 text-sm text-white/80">Your strongest current inventory and pipeline status.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('listings')}
              className="rounded-xl border border-white/12 px-3 py-2 text-sm font-semibold text-white/86"
            >
              Open listings
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {topListings.length > 0 ? (
              topListings.map((listing) => (
                <div key={listing.id} className="dashboard-panel-soft rounded-2xl px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{listing.title}</p>
                      <p className="mt-1 text-xs text-white/55">
                        {listingStatusLabel[listing.status]} / Updated {formatDate(listing.updatedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {listing.views} views / {listing.watchers} watchers
                      </p>
                      <p className="mt-1 text-xs text-white/55">{formatPrice(listing.price, 'USD')}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard-panel-soft rounded-2xl px-4 py-6">
                <p className="text-sm font-semibold text-white">No listing activity yet</p>
                <p className="mt-1 text-sm text-white/62">
                  Add your first listing and this panel will start surfacing performance highlights.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="dashboard-panel-soft rounded-2xl px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Live</p>
              <p className="mt-2 text-xl font-semibold text-white">{activeCount}</p>
            </div>
            <div className="dashboard-panel-soft rounded-2xl px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Drafts</p>
              <p className="mt-2 text-xl font-semibold text-white">{draftCount}</p>
            </div>
            <div className="dashboard-panel-soft rounded-2xl px-4 py-3">
              <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Sold</p>
              <p className="mt-2 text-xl font-semibold text-white">{soldCount}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
