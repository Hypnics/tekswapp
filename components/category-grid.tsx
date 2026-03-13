import Link from 'next/link'

const categories = [
  {
    name: 'Phones',
    href: '/listings?category=Phones',
    description: 'Flagships, trade-ins, and unlocked everyday devices',
    code: 'PH',
  },
  {
    name: 'Tablets',
    href: '/listings?category=Tablets',
    description: 'Portable setups for sketching, work, and entertainment',
    code: 'TB',
  },
  {
    name: 'Laptops',
    href: '/listings?category=Laptops',
    description: 'Ultrabooks, gaming rigs, and creator machines',
    code: 'LP',
  },
  {
    name: 'Consoles',
    href: '/listings?category=Consoles',
    description: 'Current-gen hardware, bundles, and collector drops',
    code: 'CN',
  },
  {
    name: 'Wearables',
    href: '/listings?category=Wearables',
    description: 'Smartwatches, trackers, and performance-focused gear',
    code: 'WR',
  },
  {
    name: 'Audio',
    href: '/listings?category=Audio',
    description: 'Headphones, monitors, speakers, and mobile sound',
    code: 'AU',
  },
]

export default function CategoryGrid() {
  return (
    <section className="px-4 pb-20" id="categories">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Device lanes</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Shop by category, not chaos
            </h2>
            <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
              Every category is tuned for tech resale with cleaner specs, clearer condition tags,
              and faster filtering.
            </p>
          </div>
          <Link href="/listings" className="text-sm text-white/68 transition-colors hover:text-white">
            Explore the full catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="surface-card group rounded-[1.85rem] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#67F2FF]/28"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.04] text-sm font-semibold uppercase tracking-[0.2em] text-[#67F2FF]">
                  {category.code}
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/46 transition-colors group-hover:text-white/78">
                  Explore
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-semibold text-white">{category.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/66">{category.description}</p>

              <div className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/42">
                <span className="h-px flex-1 bg-white/10" />
                <span>verified flow</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
