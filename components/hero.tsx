import Link from 'next/link'
import BrandMark from '@/components/brand-mark'
import SearchBar from '@/components/search-bar'

const heroHighlights = [
  {
    label: 'Clear listing details',
    value: 'Shop listings with the condition, storage, color, and seller notes easy to scan.',
  },
  {
    label: 'Honest seller signals',
    value: 'Verified badges and seller history only appear when that information actually exists.',
  },
  {
    label: 'Help before checkout',
    value: 'Buyer protection, support, and marketplace policies are linked right from the storefront.',
  },
]

const quickShopLinks = [
  { label: 'Phones', href: '/listings?category=Phones' },
  { label: 'Laptops', href: '/listings?category=Laptops' },
  { label: 'Tablets', href: '/listings?category=Tablets' },
  { label: 'Consoles', href: '/listings?category=Consoles' },
]

const buyingChecklist = [
  'Compare condition, storage, and included details before you commit.',
  'Look for seller verification and real seller history where it exists.',
  'Use buyer protection and support pages if you need help before or after checkout.',
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:pb-22 sm:pt-40">
      <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/68">
            <span className="h-2 w-2 rounded-full bg-[#67F2FF] shadow-[0_0_12px_rgba(103,242,255,0.8)]" />
            New marketplace for used tech
          </div>

          <div className="max-w-4xl">
            <h1 className="text-balance text-[2.35rem] font-semibold leading-[0.95] text-white sm:text-[4.2rem] lg:text-[5.3rem]">
              Buy used tech without the usual guesswork.
            </h1>
            <p className="section-copy mt-5 max-w-2xl text-base leading-relaxed sm:mt-6 sm:text-lg">
              TekSwapp is built to make phones, laptops, tablets, and consoles easier to shop. We
              focus on honest listing details, clear seller info, and a smoother path from search
              to checkout.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/listings"
              className="brand-button inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 sm:min-w-[180px] sm:w-auto"
            >
              Shop devices
            </Link>
            <Link
              href="/buyer-protection"
              className="ghost-button inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white/86 transition-colors hover:text-white sm:min-w-[180px] sm:w-auto"
            >
              How buying works
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {quickShopLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/72 transition-colors hover:border-[#67F2FF]/28 hover:text-white"
              >
                Shop {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <SearchBar className="max-w-5xl" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3">
            {heroHighlights.map((item) => (
              <article key={item.label} className="surface-card-soft rounded-[1.75rem] p-4 sm:p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/82">{item.value}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="float-panel relative lg:pt-10">
          <div className="surface-card rounded-[1.85rem] p-5 sm:rounded-[2rem] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <BrandMark size="lg" subtitle="Built for careful shoppers" />
              <div className="rounded-full border border-amber-300/18 bg-amber-300/8 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-amber-100/88">
                Start here
              </div>
            </div>

            <div className="ambient-divider mt-6" />

            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(79,140,255,0.18),rgba(255,255,255,0.06))] p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Before you buy</p>
              <div className="mt-5 space-y-3">
                {buyingChecklist.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/8 bg-white/[0.08] px-4 py-3"
                  >
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#67F2FF]">
                      0{index + 1}
                    </span>
                    <p className="mt-2 text-sm leading-relaxed text-white/72">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">Quick shop</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {quickShopLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm font-medium text-white/82 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1.45rem] border border-white/8 bg-white/[0.05] p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">Need help?</p>
              <p className="mt-3 text-sm leading-relaxed text-white/68">
                Buyer protection, seller standards, and support are one click away if you want
                more context before placing an order.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/buyer-protection"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/76 transition-colors hover:text-white"
                >
                  Buyer protection
                </Link>
                <Link
                  href="/contact-support"
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/76 transition-colors hover:text-white"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
