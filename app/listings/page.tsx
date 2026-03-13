import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ListingCard from '@/components/listing-card'
import {
  getMarketplaceListings,
} from '@/lib/marketplace'
import {
  LISTING_CONDITIONS,
  LISTING_SORT_OPTIONS,
  MARKETPLACE_CATEGORIES,
  normalizeCategoryFilter,
  normalizeConditionFilter,
  normalizeVerifiedFilter,
  normalizeSortFilter,
} from '@/lib/marketplace-config'

interface ListingsPageProps {
  searchParams: {
    q?: string | string[]
    category?: string | string[]
    condition?: string | string[]
    verified?: string | string[]
    sort?: string | string[]
  }
}

interface UrlParams {
  q?: string
  category?: string
  condition?: string
  verified?: string
  sort?: string
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function toListingsHref(params: UrlParams): string {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.category) search.set('category', params.category)
  if (params.condition) search.set('condition', params.condition)
  if (params.verified === 'true') search.set('verified', 'true')
  if (params.sort && params.sort !== 'newest') search.set('sort', params.sort)

  const queryString = search.toString()
  return queryString ? `/listings?${queryString}` : '/listings'
}

function withUpdates(current: UrlParams, updates: Partial<UrlParams>): string {
  return toListingsHref({
    ...current,
    ...updates,
  })
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const query = firstParam(searchParams.q)?.trim() ?? ''
  const category = normalizeCategoryFilter(firstParam(searchParams.category))
  const condition = normalizeConditionFilter(firstParam(searchParams.condition))
  const verifiedOnly = normalizeVerifiedFilter(firstParam(searchParams.verified))
  const sort = normalizeSortFilter(firstParam(searchParams.sort))

  const currentUrlState: UrlParams = {
    q: query || undefined,
    category,
    condition,
    verified: verifiedOnly ? 'true' : undefined,
    sort,
  }

  const filtered = await getMarketplaceListings({
    q: query,
    category,
    condition,
    verified: verifiedOnly ? 'true' : undefined,
    sort,
  })

  const activeCategoryLabel = category ?? 'All Categories'

  return (
    <div className="page-shell">
      <Navbar />
      <main className="relative px-4 pb-20 pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">
              {activeCategoryLabel === 'All Categories' ? 'All Listings' : activeCategoryLabel}
            </h1>
            <p className="text-sm text-white/50">
              {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
              {query ? ` for "${query}"` : ''}
            </p>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="shrink-0 lg:w-56">
              <div className="surface-card sticky top-24 rounded-[1.8rem] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">Filters</h3>
                  <Link href="/listings" className="text-xs text-[#67F2FF] hover:text-white">
                    Clear
                  </Link>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                    Category
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {['All Categories', ...MARKETPLACE_CATEGORIES].map((cat) => {
                      const value = cat === 'All Categories' ? undefined : cat
                      const isActive = (category ?? 'All Categories') === cat
                      return (
                        <li key={cat}>
                          <Link
                            href={withUpdates(currentUrlState, { category: value })}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              isActive
                                ? 'bg-[#2563EB]/16 font-medium text-[#8fb4ff]'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {cat}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                    Condition
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {['All Conditions', ...LISTING_CONDITIONS].map((value) => {
                      const normalizedValue = value === 'All Conditions' ? undefined : value
                      const isActive = (condition ?? 'All Conditions') === value
                      return (
                        <li key={value}>
                          <Link
                            href={withUpdates(currentUrlState, { condition: normalizedValue })}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              isActive
                                ? 'bg-[#2563EB]/16 font-medium text-[#8fb4ff]'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {value}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                    Seller
                  </h3>
                  <Link
                    href={withUpdates(currentUrlState, {
                      verified: verifiedOnly ? undefined : 'true',
                    })}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      verifiedOnly
                        ? 'bg-[#2563EB]/16 font-medium text-[#8fb4ff]'
                        : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    Verified only
                  </Link>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-white/30">Showing {filtered.length} results</span>
                <div className="flex flex-wrap gap-2">
                  {LISTING_SORT_OPTIONS.map((option) => {
                    const isActive = sort === option.value
                    return (
                      <Link
                        key={option.value}
                        href={withUpdates(currentUrlState, { sort: option.value })}
                        className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                          isActive
                            ? 'border-[#2563EB]/55 bg-[#2563EB]/16 text-white'
                            : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {option.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="surface-card flex flex-col items-center justify-center rounded-[1.85rem] py-24 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-white">No listings found</h3>
                  <p className="text-sm text-white/52">
                    Try adjusting your search or clearing filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
