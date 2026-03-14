import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ListingCard from '@/components/listing-card'
import SearchBar from '@/components/search-bar'
import { getMarketplaceListings } from '@/lib/marketplace'
import {
  LISTING_CONDITIONS,
  LISTING_SORT_OPTIONS,
  MARKETPLACE_CATEGORIES,
  normalizeCategoryFilter,
  normalizeConditionFilter,
  normalizeVerifiedFilter,
  normalizeSortFilter,
} from '@/lib/marketplace-config'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Marketplace Listings | TekSwapp',
  description:
    'Browse verified phones, laptops, tablets, consoles, wearables, and audio gear on TekSwapp.',
  alternates: {
    canonical: '/listings',
  },
}

interface ListingsPageProps {
  searchParams: Promise<{
    q?: string | string[]
    category?: string | string[]
    condition?: string | string[]
    verified?: string | string[]
    sort?: string | string[]
  }>
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

function getSortLabel(value: string): string {
  return LISTING_SORT_OPTIONS.find((option) => option.value === value)?.label ?? 'Newest first'
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const resolvedSearchParams = await searchParams
  const query = firstParam(resolvedSearchParams.q)?.trim() ?? ''
  const category = normalizeCategoryFilter(firstParam(resolvedSearchParams.category))
  const condition = normalizeConditionFilter(firstParam(resolvedSearchParams.condition))
  const verifiedOnly = normalizeVerifiedFilter(firstParam(resolvedSearchParams.verified))
  const sort = normalizeSortFilter(firstParam(resolvedSearchParams.sort))

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
  const activeFilters = [
    ...(query
      ? [{ label: `Search: ${query}`, href: withUpdates(currentUrlState, { q: undefined }) }]
      : []),
    ...(category
      ? [{ label: category, href: withUpdates(currentUrlState, { category: undefined }) }]
      : []),
    ...(condition
      ? [{ label: condition, href: withUpdates(currentUrlState, { condition: undefined }) }]
      : []),
    ...(verifiedOnly
      ? [{ label: 'Verified sellers', href: withUpdates(currentUrlState, { verified: undefined }) }]
      : []),
    ...(sort !== 'newest'
      ? [{ label: getSortLabel(sort), href: withUpdates(currentUrlState, { sort: undefined }) }]
      : []),
  ]
  const verifiedCount = filtered.filter((listing) => listing.seller.verified).length
  const lowestPrice =
    filtered.length > 0 ? filtered.reduce((min, listing) => Math.min(min, listing.price), filtered[0].price) : 0
  const highestPrice =
    filtered.length > 0 ? filtered.reduce((max, listing) => Math.max(max, listing.price), filtered[0].price) : 0
  const priceRangeLabel =
    filtered.length === 0
      ? 'No data'
      : lowestPrice === highestPrice
        ? formatPrice(lowestPrice)
        : `${formatPrice(lowestPrice)} - ${formatPrice(highestPrice)}`
  const hasActiveFilters = activeFilters.length > 0
  const quickBrowseCategories = MARKETPLACE_CATEGORIES.filter((value) => value !== 'Other')

  return (
    <div className="page-shell">
      <Navbar />
      <main className="relative px-4 pb-20 pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(79,140,255,0.14),rgba(255,255,255,0.03),rgba(103,242,255,0.08))] p-6 shadow-[0_24px_70px_rgba(2,8,21,0.4)] sm:p-8">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_250px] xl:items-end">
              <div>
                <p className="section-kicker">Marketplace search</p>
                <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                  {activeCategoryLabel === 'All Categories'
                    ? 'Browse current marketplace inventory'
                    : `${activeCategoryLabel} listings`}
                </h1>
                <p className="section-copy mt-3 max-w-3xl text-sm leading-relaxed sm:text-base">
                  Search live inventory, narrow by condition, and compare the details that matter
                  before you buy.
                </p>

                <SearchBar
                  className="mt-6 max-w-5xl"
                  showSuggestions={false}
                  initialQuery={query}
                  initialCategory={category ?? 'All categories'}
                />

                {hasActiveFilters ? (
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/38">
                      Active filters
                    </span>
                    {activeFilters.map((filter) => (
                      <Link
                        key={filter.label}
                        href={filter.href}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/74 transition-colors hover:text-white"
                      >
                        {filter.label} x
                      </Link>
                    ))}
                    <Link
                      href="/listings"
                      className="rounded-full border border-[#67F2FF]/24 bg-[#67F2FF]/10 px-3.5 py-1.5 text-xs font-semibold text-[#67F2FF] transition-colors hover:text-white"
                    >
                      Clear all
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/38">
                      Quick browse
                    </span>
                    {quickBrowseCategories.map((value) => (
                      <Link
                        key={value}
                        href={`/listings?category=${encodeURIComponent(value)}`}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/70 transition-colors hover:border-[#67F2FF]/28 hover:text-white"
                      >
                        {value}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="surface-card-soft rounded-[1.5rem] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Results</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{filtered.length}</p>
                  <p className="mt-1 text-sm text-white/58">
                    Listing{filtered.length !== 1 ? 's' : ''} matching this view
                  </p>
                </div>
                <div className="surface-card-soft rounded-[1.5rem] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Verified</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{verifiedCount}</p>
                  <p className="mt-1 text-sm text-white/58">Seller-verified listings in scope</p>
                </div>
                <div className="surface-card-soft rounded-[1.5rem] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Price range</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{priceRangeLabel}</p>
                  <p className="mt-1 text-sm text-white/58">Across the listings in this view</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="shrink-0 lg:w-56">
              <div className="surface-card sticky top-24 rounded-[1.8rem] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">
                    Filters
                  </h3>
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

                <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">
                    Need help before you buy?
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    <Link
                      href="/buyer-protection"
                      className="text-sm text-white/68 transition-colors hover:text-white"
                    >
                      Read buyer protection
                    </Link>
                    <Link
                      href="/contact-support"
                      className="text-sm text-white/68 transition-colors hover:text-white"
                    >
                      Contact support
                    </Link>
                    <Link
                      href="/seller-standards"
                      className="text-sm text-white/68 transition-colors hover:text-white"
                    >
                      Review seller standards
                    </Link>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-white/30">
                  Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                  {query ? ` for "${query}"` : ''}
                </span>
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
                <div className="surface-card flex flex-col items-center justify-center rounded-[1.85rem] px-6 py-24 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-white">No listings found</h3>
                  <p className="text-sm text-white/52">
                    {hasActiveFilters
                      ? 'Try adjusting your search or clearing filters to widen the marketplace view.'
                      : 'There are no published listings yet. TekSwapp is new, so sellers can publish the first device now.'}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/listings"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/82 transition-colors hover:text-white"
                    >
                      Clear filters
                    </Link>
                    <Link
                      href="/sell"
                      className="brand-button rounded-full px-5 py-3 text-sm font-semibold text-white"
                    >
                      List a device
                    </Link>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {quickBrowseCategories.map((value) => (
                      <Link
                        key={value}
                        href={`/listings?category=${encodeURIComponent(value)}`}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/68 transition-colors hover:text-white"
                      >
                        Browse {value}
                      </Link>
                    ))}
                  </div>
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
