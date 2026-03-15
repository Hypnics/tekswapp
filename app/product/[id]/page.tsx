import type { Metadata } from 'next'
import Link from 'next/link'
import PriceDisplay from '@/components/currency/price-display'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import ProductGallery from '@/components/product/product-gallery'
import { formatDisplayMoneyLabel, getCurrencyPresenter } from '@/lib/currency/presenter'
import { getAllowedShippingCountries, resolveShippingRate } from '@/lib/checkout'
import { getListingSpecFields, getListingSpecLabel } from '@/lib/marketplace-config'
import { getMarketplaceListingById } from '@/lib/marketplace'
import { formatDate } from '@/lib/utils'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

const conditionColor: Record<string, string> = {
  New: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400',
  'Like New': 'border-[#22D3EE]/20 bg-[#22D3EE]/10 text-[#22D3EE]',
  Excellent: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  Good: 'border-yellow-400/20 bg-yellow-400/10 text-yellow-400',
  Fair: 'border-orange-400/20 bg-orange-400/10 text-orange-400',
  'For Parts / Not Working': 'border-red-400/20 bg-red-400/10 text-red-400',
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const [listing, presenter] = await Promise.all([
    getMarketplaceListingById(id),
    getCurrencyPresenter(),
  ])

  if (!listing) {
    return {
      title: 'Listing not found | TekSwapp',
      description: 'This TekSwapp listing is unavailable, sold, or no longer public.',
    }
  }

  const title = `${listing.title} | TekSwapp`
  const priceDisplay = presenter.money(listing.price, listing.currencyCode)
  const description = `Shop ${listing.condition.toLowerCase()} ${listing.title} on TekSwapp for ${priceDisplay.isApproximate ? `approximately ${priceDisplay.formatted}` : priceDisplay.formatted} with clear listing details and seller information.`

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${listing.id}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const listing = await getMarketplaceListingById(id)

  if (!listing) {
    return (
      <div className="page-shell min-h-screen text-white">
        <Navbar />
        <main className="px-4 pb-20 pt-24">
          <div className="surface-card mx-auto max-w-3xl rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-semibold text-white">Listing not found</h1>
            <p className="mt-3 text-sm text-white/65">
              This listing may be unavailable, sold, or private to the seller account.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/listings"
                className="rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white"
              >
                Back to listings
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const shippingChoices = getAllowedShippingCountries(listing)
    .map((code) => resolveShippingRate(listing, code))
    .filter((rate): rate is NonNullable<ReturnType<typeof resolveShippingRate>> => Boolean(rate))
  const presenter = await getCurrencyPresenter()
  const priceDisplay = presenter.money(listing.price, listing.currencyCode)
  const originalPriceDisplay = listing.originalPrice
    ? presenter.money(listing.originalPrice, listing.currencyCode)
    : undefined
  const cheapestShipping =
    shippingChoices.length > 0
      ? shippingChoices.reduce((lowest, rate) => Math.min(lowest, rate.amount), shippingChoices[0].amount)
      : null
  const cheapestShippingDisplay =
    cheapestShipping !== null ? presenter.money(cheapestShipping, listing.currencyCode) : null
  const checkoutReady = shippingChoices.length > 0
  const sellerSaleLabel = listing.seller.totalSales === 1 ? 'sale' : 'sales'
  const sellerSummary =
    listing.seller.rating > 0 && listing.seller.totalSales > 0
      ? `${listing.seller.rating.toFixed(1)} rating and ${listing.seller.totalSales} completed ${sellerSaleLabel}`
      : listing.seller.rating > 0
        ? `${listing.seller.rating.toFixed(1)} seller rating`
        : listing.seller.totalSales > 0
          ? `${listing.seller.totalSales} completed ${sellerSaleLabel}`
          : listing.seller.verified
            ? 'Verified seller with a new public history on TekSwapp'
            : 'New seller on TekSwapp'
  const buyerChecklist = [
    'Review the condition, specs, and seller notes before checkout.',
    'Check buyer protection if you want more detail on how order issues are handled.',
    'Use contact support if you need help before placing an order.',
  ]

  const baseSpecs: { label: string; value: string }[] = [
    { label: 'Brand', value: listing.brand },
    { label: 'Model', value: listing.model },
    { label: 'Category', value: listing.category },
    { label: 'Condition', value: listing.condition },
    ...(listing.storage ? [{ label: 'Storage', value: listing.storage }] : []),
    ...(listing.batteryHealth ? [{ label: 'Battery Health', value: `${listing.batteryHealth}%` }] : []),
    ...(listing.color ? [{ label: 'Color', value: listing.color }] : []),
    { label: 'Listed', value: formatDate(listing.createdAt) },
    ...(listing.views && listing.views > 0 ? [{ label: 'Views', value: `${listing.views}` }] : []),
    ...(listing.watchers && listing.watchers > 0
      ? [{ label: 'Watching', value: `${listing.watchers}` }]
      : []),
  ]

  const configuredSpecFields = getListingSpecFields(listing.category, {
    brand: listing.brand,
    model: listing.model,
    specs: listing.deviceSpecs,
  })
  const configuredDynamicSpecs = configuredSpecFields
    .filter((field) => !['storage', 'battery_health', 'color'].includes(field.key))
    .map((field) => ({
      key: field.key,
      label: field.label,
      value: listing.deviceSpecs?.[field.key]?.trim() ?? '',
    }))
    .filter((spec) => spec.value)
  const configuredDynamicKeys = new Set(configuredDynamicSpecs.map((spec) => spec.key))
  const unknownDynamicSpecs = Object.entries(listing.deviceSpecs ?? {})
    .filter(([key, value]) => !['storage', 'battery_health', 'color'].includes(key) && Boolean(value.trim()))
    .filter(([key]) => !configuredDynamicKeys.has(key))
    .map(([key, value]) => ({
      key,
      label: getListingSpecLabel(listing.category, key),
      value,
    }))
  const dynamicSpecs = [...configuredDynamicSpecs, ...unknownDynamicSpecs]

  return (
    <div className="page-shell min-h-screen text-white">
      <Navbar />
      <main className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 overflow-hidden text-xs text-white/30 sm:text-sm">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/listings" className="transition-colors hover:text-white">
              Listings
            </Link>
            <span>/</span>
            <Link
              href={`/listings?category=${listing.category}`}
              className="transition-colors hover:text-white"
            >
              {listing.category}
            </Link>
            <span>/</span>
            <span className="min-w-0 max-w-full truncate text-white/50">{listing.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2">
            <ProductGallery images={listing.images.length ? listing.images : [listing.image]} title={listing.title} verified={listing.verified} />

            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${conditionColor[listing.condition] ?? ''}`}
                  >
                    {listing.condition}
                  </span>
                  {listing.images.length > 1 ? <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs text-white/75">{listing.images.length} photos</span> : null}
                </div>
                <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {listing.title}
                </h1>
              </div>

              <PriceDisplay
                money={priceDisplay}
                originalMoney={originalPriceDisplay}
                amountClassName="text-3xl font-bold text-white sm:text-4xl"
                originalAmountClassName="text-lg text-white/30 line-through"
                metaClassName="mt-2 text-sm text-white/52"
              />

              <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(79,140,255,0.14),rgba(103,242,255,0.08))] p-5">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#67F2FF]">Checkout details</p>
                    <p className="mt-2 text-sm text-white/78">
                      {checkoutReady
                        ? cheapestShippingDisplay
                          ? `Shipping starts at ${formatDisplayMoneyLabel(cheapestShippingDisplay)} and tax is calculated by Stripe from the buyer address.`
                          : 'Shipping and tax are calculated during checkout.'
                        : 'Seller shipping is not configured yet, so secure checkout is currently unavailable.'}
                    </p>
                    <p className="mt-2 text-xs text-white/52">
                      Stripe will attempt to localize the final payment currency for the buyer region when Adaptive Pricing is eligible. If not, checkout falls back to the seller&apos;s base currency.
                    </p>
                  </div>
                  <p className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs text-white/70">
                    Viewing in {presenter.preference.currency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[...baseSpecs, ...dynamicSpecs].map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-white/8 bg-white/[0.08] px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="mb-0.5 text-xs text-white/30">{spec.label}</div>
                    <div className="break-words text-sm font-medium text-white">{spec.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {checkoutReady ? (
                  <Link
                    href={`/checkout/${listing.id}`}
                    className="flex-1 rounded-xl bg-[#2563EB] px-6 py-4 text-center text-sm font-bold text-white transition-all hover:bg-blue-500"
                  >
                    Buy with secure checkout - {priceDisplay.formatted}
                  </Link>
                ) : (
                  <span className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-bold text-white/55">
                    Shipping not configured yet
                  </span>
                )}
                <Link
                  href="/how-it-works"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-center text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10"
                >
                  Checkout details
                </Link>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.08] p-5 backdrop-blur-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white/70">Seller</h3>
                  {listing.seller.verified && (
                    <span className="text-xs text-[#22D3EE]">Verified Seller</span>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/30">
                    <span className="text-sm font-bold text-[#22D3EE]">
                      {listing.seller.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{listing.seller.name}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-white/40">
                      {sellerSummary}
                    </div>
                  </div>
                </div>
                {listing.sellerNotes && (
                  <div className="mt-4 rounded-xl bg-white/[0.08] px-4 py-3">
                    <p className="text-xs italic text-white/40">&quot;{listing.sellerNotes}&quot;</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.08] p-5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                  Before you buy
                </p>
                <div className="mt-4 space-y-3">
                  {buyerChecklist.map((item, index) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/8 bg-white/[0.05] px-4 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#67F2FF]">
                        0{index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-white/68">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/buyer-protection"
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/78 transition-colors hover:text-white"
                  >
                    Buyer protection
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/78 transition-colors hover:text-white"
                  >
                    How it works
                  </Link>
                  <Link
                    href="/contact-support"
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/78 transition-colors hover:text-white"
                  >
                    Contact support
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card mt-10 rounded-[1.85rem] p-5 sm:p-8">
            <h2 className="mb-4 text-lg font-semibold text-white">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/50">
              {listing.description}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
