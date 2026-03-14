import Link from 'next/link'

const trustItems = [
  {
    title: 'Visible condition details',
    text: 'Listings are expected to show the device basics up front so buyers are not guessing what is actually being sold.',
  },
  {
    title: 'Seller status on the page',
    text: 'Verified badges and seller history are shown on listings instead of being buried in another screen.',
  },
  {
    title: 'Buyer protection links',
    text: 'Customers can reach marketplace policies and support pages without leaving the shopping flow confused.',
  },
  {
    title: 'Support when needed',
    text: 'Order issues, delivery concerns, and policy questions already have a clear path instead of a hidden inbox.',
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
              Trust signals shoppers can actually use
            </h2>
            <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
              Because TekSwapp is new, the site should be clear about what buyers can rely on
              right now: cleaner listings, visible seller status, and easy-to-find support.
            </p>
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
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Buying basics</p>
          <div className="mt-6 space-y-4">
            {[
              { value: 'Visible', label: 'Seller and listing details' },
              { value: 'Linked', label: 'Buyer protection and support pages' },
              { value: 'Tracked', label: 'Order flow built around shipping updates' },
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
              Order issue, delivery mismatch, or a question before buying? The storefront keeps
              the next step easy to find.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
