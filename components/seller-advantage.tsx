import Link from 'next/link'

const sellerPrograms = [
  {
    title: 'Guided listing setup',
    text: 'Category-aware fields, structured specs, and cleaner publishing prompts help sellers create stronger listings on the first pass.',
  },
  {
    title: 'Verification center',
    text: 'Profiles, identity details, and required onboarding fields can be completed before a device ever goes live.',
  },
  {
    title: 'Performance visibility',
    text: 'Views, watchlists, and recent sales data make it easier to understand what inventory is actually moving.',
  },
  {
    title: 'Policy-backed selling',
    text: 'Seller standards and buyer protection pages turn marketplace expectations into clear operating rails.',
  },
]

const operatorNotes = [
  { value: '4-step', label: 'Listing flow with review-minded prompts' },
  { value: 'Live', label: 'Dashboard visibility for seller activity' },
  { value: 'Policy', label: 'Support, standards, and buyer protection pages' },
]

export default function SellerAdvantage() {
  return (
    <section className="px-4 pb-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="surface-card rounded-[2rem] p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="section-kicker">Seller experience</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Better listings help buyers too
            </h2>
            <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
              Sellers get guided listing setup and clearer standards, which means buyers should
              see better photos, cleaner specs, and fewer vague descriptions.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sellerPrograms.map((item, index) => (
              <article
                key={item.title}
                className="rounded-[1.7rem] border border-white/8 bg-white/[0.07] p-5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-white/36">
                    0{index + 1}
                  </span>
                  <span className="h-px w-14 bg-gradient-to-r from-transparent via-[#67F2FF]/60 to-transparent" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/68">{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="surface-card rounded-[2rem] p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Seller tools</p>
          <div className="mt-6 space-y-4">
            {operatorNotes.map((item) => (
              <div key={item.label} className="rounded-[1.4rem] border border-white/8 bg-white/[0.08] p-4">
                <div className="text-2xl font-semibold text-white">{item.value}</div>
                <div className="mt-1 text-sm text-white/62">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="ambient-divider mt-6" />

          <div className="mt-6 space-y-3">
            <Link
              href="/sell"
              className="block rounded-[1.4rem] border border-white/8 bg-white/[0.08] px-4 py-3 text-sm text-white/78 transition-colors hover:text-white"
            >
              Start a new listing
            </Link>
            <Link
              href="/dashboard"
              className="block rounded-[1.4rem] border border-white/8 bg-white/[0.08] px-4 py-3 text-sm text-white/78 transition-colors hover:text-white"
            >
              Open seller dashboard
            </Link>
            <Link
              href="/seller-standards"
              className="block rounded-[1.4rem] border border-white/8 bg-white/[0.08] px-4 py-3 text-sm text-white/78 transition-colors hover:text-white"
            >
              Review marketplace standards
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
