import EmptyState from '@/components/dashboard/empty-state'
import { formatDate, formatPrice } from '@/lib/utils'
import { PurchaseOrder } from '@/types/dashboard'

interface PurchasesPanelProps {
  purchases: PurchaseOrder[]
}

const statusStyles: Record<PurchaseOrder['status'], { label: string; color: string; bg: string }> = {
  processing: { label: 'Processing', color: '#93c5fd', bg: 'rgba(147,197,253,0.15)' },
  shipped: { label: 'Shipped', color: '#22D3EE', bg: 'rgba(34,211,238,0.15)' },
  delivered: { label: 'Delivered', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
}

export default function PurchasesPanel({ purchases }: PurchasesPanelProps) {
  const totalSpend = purchases.reduce((total, purchase) => total + purchase.amount, 0)
  const inTransit = purchases.filter((purchase) => purchase.status !== 'delivered').length
  const delivered = purchases.filter((purchase) => purchase.status === 'delivered').length
  const trackingPending = purchases.filter((purchase) => !purchase.trackingCode).length
  const currencies = new Set(purchases.map((purchase) => purchase.currencyCode))
  const totalSpendLabel =
    currencies.size === 1 ? formatPrice(totalSpend, purchases[0].currencyCode) : 'Multi-currency'

  if (purchases.length === 0) {
    return (
      <EmptyState
        title="No purchases yet"
        description="Your order history, delivery progress, and tracking placeholders will appear here."
      />
    )
  }

  return (
    <section className="dashboard-panel rounded-[1.75rem] p-4 sm:p-6">
      <div>
        <p className="section-kicker">Buyer history</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Purchases</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/65">
          Review your order history, shipping updates, and tracking placeholders from a single buyer view.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Total spend</p>
          <p className="mt-2 text-2xl font-semibold text-white">{totalSpendLabel}</p>
        </div>
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">On the way</p>
          <p className="mt-2 text-2xl font-semibold text-white">{inTransit}</p>
        </div>
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Delivered</p>
          <p className="mt-2 text-2xl font-semibold text-white">{delivered}</p>
        </div>
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Tracking pending</p>
          <p className="mt-2 text-2xl font-semibold text-white">{trackingPending}</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[780px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.08em] text-white/45">
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Seller</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Tracking</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="dashboard-table-row">
                <td className="rounded-l-2xl px-3 py-3">
                  <p className="text-sm font-semibold text-white">{purchase.itemTitle}</p>
                  <p className="mt-1 text-xs text-white/55">{purchase.orderNumber}</p>
                </td>
                <td className="px-3 py-3 text-sm text-white">{purchase.sellerName}</td>
                <td className="px-3 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      color: statusStyles[purchase.status].color,
                      background: statusStyles[purchase.status].bg,
                    }}
                  >
                    {statusStyles[purchase.status].label}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-white/70">
                  {purchase.trackingCode || 'Tracking pending'}
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-white">
                  {formatPrice(purchase.amount, purchase.currencyCode)}
                </td>
                <td className="rounded-r-2xl px-3 py-3 text-sm text-white/65">
                  {formatDate(purchase.purchasedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
