import Link from 'next/link'

const trustItems = [
  {
    title: 'Fraud prevention',
    text: 'Automated and manual review layers help flag suspicious listings, accounts, and off-pattern behavior earlier.',
  },
  {
    title: 'Condition standards',
    text: "Sellers are pushed toward consistent grading and clearer descriptions, so buyers are not guessing what 'good' means.",
  },
  {
    title: 'Reputation visibility',
    text: 'Ratings, completion history, and response performance are visible before a buyer commits to a purchase.',
  },
  {
    title: 'Dispute operations',
    text: 'Support workflows are designed around delivery issues, item mismatch reports, and payout-related investigation.',
  },
]

export default function TrustSection() {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="mb-8 max-w-3xl">
            <p className="section-kicker">Trust and safety</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Operational safeguards behind each order
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {trustItems.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.65rem] border border-white/8 bg-white/[0.07] p-5 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/buyer-protection"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/74 transition-colors hover:text-white"
            >
              Buyer protection
            </Link>
            <Link
              href="/seller-standards"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/74 transition-colors hover:text-white"
            >
              Seller standards
            </Link>
            <Link
              href="/contact-support"
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/74 transition-colors hover:text-white"
            >
              Contact support
            </Link>
          </div>
        </div>

        <aside className="surface-card rounded-[2rem] p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Safety posture</p>
          <div className="mt-6 space-y-4">
            {[
              { value: '24/7', label: 'Fraud review signals' },
              { value: 'Escrow', label: 'Protected payment path' },
              { value: 'Tracked', label: 'Delivery-first workflow' },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.4rem] border border-white/8 bg-white/[0.08] p-4">
                <div className="text-2xl font-semibold text-white">{item.value}</div>
                <div className="mt-1 text-sm text-white/62">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-white/[0.08] p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">Support lane</p>
            <p className="mt-3 text-sm leading-relaxed text-white/68">
              Order issue, delivery mismatch, or payout question? The support flow is already
              linked into the marketplace lifecycle.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
