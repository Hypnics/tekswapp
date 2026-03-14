import Link from 'next/link'

const faqs = [
  {
    question: 'Is TekSwapp a new marketplace?',
    answer:
      'Yes. TekSwapp is early, so the experience is focused on making listings honest, easy to compare, and backed by clear support pages instead of inflated marketplace claims.',
    tag: 'Getting started',
  },
  {
    question: 'What should I check before buying a device?',
    answer:
      'Start with the condition, storage, battery health when available, seller notes, and whether the seller is verified. Those details are meant to be visible before checkout.',
    tag: 'Buying',
  },
  {
    question: 'What does a verified seller mean on TekSwapp?',
    answer:
      'It means the seller has completed the marketplace checks currently required for a verified profile. It is meant to give buyers more context, not replace reading the listing itself.',
    tag: 'Trust',
  },
  {
    question: 'Why do some sellers have little or no rating history yet?',
    answer:
      'Because the marketplace is new and some sellers are new too. TekSwapp should only show seller history that actually exists, which is why some profiles will appear as new instead of carrying made-up scores.',
    tag: 'Honesty',
  },
  {
    question: 'What should buyers do if something goes wrong with an order?',
    answer:
      'Buyer protection, seller standards, and contact support pages are linked directly from the storefront so users can understand the next step without hunting for help.',
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
            <p className="section-kicker">Questions shoppers ask first</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Clear answers build trust
            </h2>
            <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
              A better shopping experience is not just design. It also means answering the basic
              questions that usually stop a buyer from moving forward.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="rounded-[1.65rem] border border-white/8 bg-white/[0.07] p-5 backdrop-blur-sm"
              >
                <summary className="flex cursor-pointer list-none flex-col items-start gap-3 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
            If you want more detail before buying, the important pages are linked here without
            sending you on a hunt through the site.
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
