import Link from 'next/link'

const faqs = [
  {
    question: 'How does TekSwapp decide who can publish listings?',
    answer:
      'Seller publishing is tied to profile completion and verification readiness, which helps keep incomplete or low-trust accounts from going live too early.',
    tag: 'Seller access',
  },
  {
    question: 'When does seller payout get released?',
    answer:
      'The marketplace flow is designed around protected checkout, tracked delivery, and review checkpoints before payout moves forward.',
    tag: 'Payouts',
  },
  {
    question: 'What does a verified seller actually mean here?',
    answer:
      'Verification combines identity, profile, and marketplace readiness signals so buyers can separate stronger sellers from anonymous inventory noise.',
    tag: 'Trust',
  },
  {
    question: 'Can buyers filter by device condition and seller confidence?',
    answer:
      'Yes. The listings experience now supports condition filters, verified-only browsing, category filters, and sort modes so discovery feels less random.',
    tag: 'Browsing',
  },
  {
    question: 'What should buyers do if something goes wrong with an order?',
    answer:
      'Support, buyer protection, and seller standards pages are linked directly from the storefront so users can understand the next step without hunting for policy pages.',
    tag: 'Support',
  },
]

const quickLinks = [
  { label: 'Buyer protection', href: '/buyer-protection' },
  { label: 'Seller standards', href: '/seller-standards' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Contact support', href: '/contact-support' },
]

export default function MarketplaceFaq() {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="section-kicker">Questions buyers and sellers ask first</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Marketplace clarity matters
            </h2>
            <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
              A stronger marketplace is not just better visuals. It also answers the questions
              that usually stop a purchase or delay a listing.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="rounded-[1.65rem] border border-white/8 bg-white/[0.07] p-5 backdrop-blur-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="text-base font-semibold text-white">{item.question}</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/52">
                    {item.tag}
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/68">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <aside className="surface-card rounded-[2rem] p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Need a policy page?</p>
          <p className="mt-4 text-sm leading-relaxed text-white/68">
            The support and trust surface is more useful when users can jump straight to the right
            page instead of leaving the marketplace confused.
          </p>

          <div className="mt-6 space-y-3">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-[1.4rem] border border-white/8 bg-white/[0.08] px-4 py-3 text-sm text-white/78 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
