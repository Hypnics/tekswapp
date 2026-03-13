import EmptyState from '@/components/dashboard/empty-state'
import { formatDate, formatPrice } from '@/lib/utils'
import { SaleOrder } from '@/types/dashboard'

interface SalesPanelProps {
  sales: SaleOrder[]
}

const shippingStyles: Record<SaleOrder['shippingStatus'], { label: string; color: string; bg: string }> = {
  label_created: { label: 'Label created', color: '#93c5fd', bg: 'rgba(147,197,253,0.15)' },
  in_transit: { label: 'In transit', color: '#22D3EE', bg: 'rgba(34,211,238,0.15)' },
  delivered: { label: 'Delivered', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
}

const payoutStyles: Record<SaleOrder['payoutStatus'], { label: string; color: string; bg: string }> = {
  on_hold: { label: 'On hold', color: '#fbbf24', bg: 'rgba(251,191,36,0.16)' },
  processing: { label: 'Processing', color: '#93c5fd', bg: 'rgba(147,197,253,0.15)' },
  released: { label: 'Released', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
}

export default function SalesPanel({ sales }: SalesPanelProps) {
  if (sales.length === 0) {
    return (
      <EmptyState
        title="No sales yet"
        description="When items sell, this section will show buyer info, shipping progress, and payout updates."
      />
    )
  }

  return (
    <section
      className="rounded-2xl border p-4 sm:p-5"
      style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
    >
      <h2 className="text-xl font-semibold text-white">Sales</h2>
      <p className="mt-1 text-sm text-white/65">
        Track recent orders, shipping stages, and payout progress.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.08em] text-white/45">
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Buyer</th>
              <th className="px-3 py-2">Shipping</th>
              <th className="px-3 py-2">Payout</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Sold</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="bg-white/[0.03]">
                <td className="rounded-l-xl px-3 py-3">
                  <p className="text-sm font-semibold text-white">{sale.listingTitle}</p>
                  <p className="text-xs text-white/55">{sale.orderNumber}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="text-sm text-white">{sale.buyerName}</p>
                  <p className="text-xs text-white/55">{sale.buyerHandle}</p>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      color: shippingStyles[sale.shippingStatus].color,
                      background: shippingStyles[sale.shippingStatus].bg,
                    }}
                  >
                    {shippingStyles[sale.shippingStatus].label}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      color: payoutStyles[sale.payoutStatus].color,
                      background: payoutStyles[sale.payoutStatus].bg,
                    }}
                  >
                    {payoutStyles[sale.payoutStatus].label}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-white">
                  {formatPrice(sale.amount, 'USD')}
                </td>
                <td className="rounded-r-xl px-3 py-3 text-sm text-white/65">{formatDate(sale.soldAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
