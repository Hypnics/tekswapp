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
  if (purchases.length === 0) {
    return (
      <EmptyState
        title="No purchases yet"
        description="Your order history, delivery progress, and tracking placeholders will appear here."
      />
    )
  }

  return (
    <section
      className="rounded-2xl border p-4 sm:p-5"
      style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
    >
      <h2 className="text-xl font-semibold text-white">Purchases</h2>
      <p className="mt-1 text-sm text-white/65">Review order history, status, and tracking placeholders.</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
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
              <tr key={purchase.id} className="bg-white/[0.03]">
                <td className="rounded-l-xl px-3 py-3">
                  <p className="text-sm font-semibold text-white">{purchase.itemTitle}</p>
                  <p className="text-xs text-white/55">{purchase.orderNumber}</p>
                </td>
                <td className="px-3 py-3 text-sm text-white">{purchase.sellerName}</td>
                <td className="px-3 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      color: statusStyles[purchase.status].color,
                      background: statusStyles[purchase.status].bg,
                    }}
                  >
                    {statusStyles[purchase.status].label}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-white/70">
                  {purchase.trackingCode ?? 'Tracking pending'}
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-white">
                  {formatPrice(purchase.amount, 'USD')}
                </td>
                <td className="rounded-r-xl px-3 py-3 text-sm text-white/65">
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
