import Link from 'next/link'

const categories = [
  {
    name: 'Phones',
    href: '/listings?category=Phones',
    description: 'iPhones, Galaxies, Pixels, and unlocked everyday devices',
    code: 'PH',
  },
  {
    name: 'Tablets',
    href: '/listings?category=Tablets',
    description: 'iPads and tablets for school, work, drawing, and streaming',
    code: 'TB',
  },
  {
    name: 'Laptops',
    href: '/listings?category=Laptops',
    description: 'MacBooks, Windows laptops, gaming rigs, and creator machines',
    code: 'LP',
  },
  {
    name: 'Consoles',
    href: '/listings?category=Consoles',
    description: 'PlayStation, Xbox, Nintendo, bundles, and extra controllers',
    code: 'CN',
  },
  {
    name: 'Wearables',
    href: '/listings?category=Wearables',
    description: 'Apple Watch, Galaxy Watch, fitness trackers, and accessories',
    code: 'WR',
  },
  {
    name: 'Audio',
    href: '/listings?category=Audio',
    description: 'Headphones, earbuds, speakers, microphones, and studio gear',
    code: 'AU',
  },
]

export default function CategoryGrid() {
  return (
    <section className="px-4 pb-20" id="categories">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Shop by device</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Jump straight to the tech you want
            </h2>
            <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
              Start with the device type you already know, then narrow by condition, seller
              verification, and price.
            </p>
          </div>
          <Link href="/listings" className="text-sm text-white/68 transition-colors hover:text-white">
            See every listing
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
                  Browse
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-semibold text-white">{category.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/66">{category.description}</p>

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-[#67F2FF]">
                Shop {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
