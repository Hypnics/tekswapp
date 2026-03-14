import Link from 'next/link'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import { finalizeStripeCheckoutSession, formatCheckoutCurrency } from '@/lib/checkout'

interface CheckoutSuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { session_id: sessionId } = await searchParams
  const order = sessionId ? await finalizeStripeCheckoutSession(sessionId) : null

  return (
    <div className="page-shell min-h-screen text-white">
      <Navbar />
      <main className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-3xl">
          <section className="surface-card rounded-[2rem] p-8 sm:p-10">
            <p className="section-kicker">Order confirmed</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              {order ? 'Payment received and order opened' : 'Payment received'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/68">
              {order
                ? 'The listing has been marked sold and the order is now visible in the TekSwapp buyer and seller dashboards.'
                : 'We could not finalize the order details from this page. If your card was charged, contact support and include your Stripe receipt email.'}
            </p>

            {order && (
              <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/42">Order number</p>
                    <p className="mt-2 text-lg font-semibold text-white">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/42">Total paid</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatCheckoutCurrency(order.totalAmount, order.currencyCode)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/42">Item</p>
                    <p className="mt-2 text-sm font-semibold text-white">{order.listingTitle}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/42">Shipping</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatCheckoutCurrency(order.shippingAmount, order.currencyCode)}
                    </p>
                    {order.shippingCountry && (
                      <p className="mt-1 text-xs text-white/50">{order.shippingCountry}</p>
                    )}
                  </div>
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/42">Tax</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {formatCheckoutCurrency(order.taxAmount, order.currencyCode)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard?tab=purchases" className="brand-button rounded-full px-5 py-3 text-sm font-semibold text-white">
                View purchases
              </Link>
              <Link href="/listings" className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/82 hover:text-white">
                Keep browsing
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
