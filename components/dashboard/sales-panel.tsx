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
  const grossSales = sales.reduce((total, sale) => total + sale.amount, 0)
  const pendingShipment = sales.filter((sale) => sale.shippingStatus !== 'delivered').length
  const heldPayouts = sales.filter((sale) => sale.payoutStatus !== 'released').length
  const deliveredOrders = sales.filter((sale) => sale.shippingStatus === 'delivered').length
  const currencies = new Set(sales.map((sale) => sale.currencyCode))
  const grossSalesLabel =
    currencies.size === 1 ? formatPrice(grossSales, sales[0].currencyCode) : 'Multi-currency'

  if (sales.length === 0) {
    return (
      <EmptyState
        title="No sales yet"
        description="When items sell, this section will show buyer info, shipping progress, and payout updates."
      />
    )
  }

  return (
    <section className="dashboard-panel rounded-[1.75rem] p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-kicker">Sales tracker</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Sales</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Track buyer orders, shipment stages, and payout release milestones from one queue.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Gross sales</p>
          <p className="mt-2 text-2xl font-semibold text-white">{grossSalesLabel}</p>
        </div>
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Need shipping</p>
          <p className="mt-2 text-2xl font-semibold text-white">{pendingShipment}</p>
        </div>
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Payouts pending</p>
          <p className="mt-2 text-2xl font-semibold text-white">{heldPayouts}</p>
        </div>
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Delivered</p>
          <p className="mt-2 text-2xl font-semibold text-white">{deliveredOrders}</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[780px] border-separate border-spacing-y-2">
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
              <tr key={sale.id} className="dashboard-table-row">
                <td className="rounded-l-2xl px-3 py-3">
                  <p className="text-sm font-semibold text-white">{sale.listingTitle}</p>
                  <p className="mt-1 text-xs text-white/55">{sale.orderNumber}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="text-sm text-white">{sale.buyerName}</p>
                  <p className="mt-1 text-xs text-white/55">{sale.buyerHandle}</p>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
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
                    className="rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      color: payoutStyles[sale.payoutStatus].color,
                      background: payoutStyles[sale.payoutStatus].bg,
                    }}
                  >
                    {payoutStyles[sale.payoutStatus].label}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm font-semibold text-white">{formatPrice(sale.amount, sale.currencyCode)}</td>
                <td className="rounded-r-2xl px-3 py-3 text-sm text-white/65">{formatDate(sale.soldAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
