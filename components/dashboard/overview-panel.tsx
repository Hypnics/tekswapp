import { getListingCountByStatus } from '@/lib/dashboard-data'
import { formatPrice } from '@/lib/utils'
import { DashboardSection, DashboardSnapshot } from '@/types/dashboard'

interface OverviewPanelProps {
  snapshot: DashboardSnapshot
  verificationProgress: number
  pendingActions: number
  onNavigate: (section: DashboardSection) => void
}

export default function OverviewPanel({
  snapshot,
  verificationProgress,
  pendingActions,
  onNavigate,
}: OverviewPanelProps) {
  const activeCount = getListingCountByStatus(snapshot.listings, 'active')
  const soldCount = getListingCountByStatus(snapshot.listings, 'sold')

  const cards = [
    { label: 'Active listings', value: activeCount.toString() },
    { label: 'Sold items', value: soldCount.toString() },
    { label: 'Purchases', value: snapshot.purchases.length.toString() },
    { label: 'Pending actions', value: pendingActions.toString() },
    { label: 'Verification status', value: `${verificationProgress}%` },
  ]

  return (
    <div className="space-y-6">
      <section
        className="rounded-3xl border p-6"
        style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-xs uppercase tracking-[0.12em] text-[#22D3EE]">Dashboard overview</p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Welcome back, {snapshot.displayName.split(' ')[0]}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
          Your TekSwapp account is unified for buying and selling. Manage listings, track orders,
          and complete seller verification from one place.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('listings')}
            className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white"
          >
            Manage listings
          </button>
          <button
            onClick={() => onNavigate('verification')}
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-white/90"
            style={{ borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Open verification center
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border p-4"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              background: 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            }}
          >
            <p className="text-xs uppercase tracking-[0.1em] text-white/55">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article
          className="rounded-2xl border p-5"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
        >
          <h2 className="text-lg font-semibold text-white">Recent sales</h2>
          <div className="mt-4 space-y-3">
            {snapshot.sales.slice(0, 3).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-white">{sale.listingTitle}</p>
                  <p className="text-xs text-white/60">
                    {sale.orderNumber} · {sale.buyerName}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">{formatPrice(sale.amount, 'USD')}</p>
              </div>
            ))}
          </div>
        </article>

        <article
          className="rounded-2xl border p-5"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
        >
          <h2 className="text-lg font-semibold text-white">Seller readiness</h2>
          <p className="mt-2 text-sm text-white/65">
            Publishing is enabled when your email, phone, and profile details are complete.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
              style={{ width: `${verificationProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/65">
            {verificationProgress}% complete · {pendingActions} pending action
            {pendingActions === 1 ? '' : 's'}
          </p>
        </article>
      </section>
    </div>
  )
}
