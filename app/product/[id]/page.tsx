import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import { normalizeImageSrc } from '@/lib/image-src'
import { getMarketplaceListingById } from '@/lib/marketplace'
import { formatDate, formatPrice } from '@/lib/utils'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

const conditionColor: Record<string, string> = {
  New: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-400',
  'Like New': 'border-[#22D3EE]/20 bg-[#22D3EE]/10 text-[#22D3EE]',
  Good: 'border-yellow-400/20 bg-yellow-400/10 text-yellow-400',
  Fair: 'border-orange-400/20 bg-orange-400/10 text-orange-400',
  Poor: 'border-red-400/20 bg-red-400/10 text-red-400',
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const listing = await getMarketplaceListingById(id)

  if (!listing) {
    return (
      <div className="min-h-screen" style={{ background: '#0B0F1A' }}>
        <Navbar />
        <main className="px-4 pb-20 pt-24">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
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

  const imageSrc = normalizeImageSrc(listing.image)

  const baseSpecs: { label: string; value: string }[] = [
    { label: 'Brand', value: listing.brand },
    { label: 'Model', value: listing.model },
    { label: 'Category', value: listing.category },
    { label: 'Condition', value: listing.condition },
    ...(listing.storage ? [{ label: 'Storage', value: listing.storage }] : []),
    ...(listing.batteryHealth ? [{ label: 'Battery Health', value: `${listing.batteryHealth}%` }] : []),
    ...(listing.color ? [{ label: 'Color', value: listing.color }] : []),
    { label: 'Listed', value: formatDate(listing.createdAt) },
    { label: 'Views', value: `${listing.views ?? 0}` },
  ]

  const dynamicSpecs = Object.entries(listing.deviceSpecs ?? {})
    .filter(([key]) => !['storage', 'battery_health', 'color'].includes(key))
    .map(([key, value]) => ({
      label: key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      value,
    }))

  return (
    <div className="min-h-screen" style={{ background: '#0B0F1A' }}>
      <Navbar />
      <main className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-6 flex items-center gap-2 text-sm text-white/30">
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
            <span className="max-w-[200px] truncate text-white/50">{listing.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/6 bg-white/3">
              <Image
                src={imageSrc}
                alt={listing.title}
                fill
                unoptimized
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {listing.verified && (
                <div className="absolute left-4 top-4 rounded-full bg-[#2563EB]/90 px-3 py-1.5 text-xs font-semibold text-white">
                  TekSwapp Verified
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${conditionColor[listing.condition] ?? ''}`}
                  >
                    {listing.condition}
                  </span>
                  {listing.imeiStatus && (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
                      IMEI: {listing.imeiStatus}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{listing.title}</h1>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">{formatPrice(listing.price)}</span>
                {listing.originalPrice && (
                  <span className="text-lg text-white/30 line-through">
                    {formatPrice(listing.originalPrice)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[...baseSpecs, ...dynamicSpecs].map((spec) => (
                  <div key={spec.label} className="rounded-xl border border-white/6 bg-white/3 px-4 py-3">
                    <div className="mb-0.5 text-xs text-white/30">{spec.label}</div>
                    <div className="text-sm font-medium text-white">{spec.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth"
                  className="flex-1 rounded-xl bg-[#2563EB] px-6 py-4 text-center text-sm font-bold text-white transition-all hover:bg-blue-500"
                >
                  Buy Now - {formatPrice(listing.price)}
                </Link>
                <button className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10">
                  Save to Watchlist
                </button>
              </div>

              <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white/70">Seller</h3>
                  {listing.seller.verified && <span className="text-xs text-[#22D3EE]">Verified Seller</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/30">
                    <span className="text-sm font-bold text-[#22D3EE]">{listing.seller.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{listing.seller.name}</div>
                    <div className="mt-0.5 text-xs text-white/40">
                      {listing.seller.rating.toFixed(1)} rating · {listing.seller.totalSales} sales
                    </div>
                  </div>
                </div>
                {listing.sellerNotes && (
                  <div className="mt-4 rounded-xl bg-white/3 px-4 py-3">
                    <p className="text-xs italic text-white/40">&quot;{listing.sellerNotes}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-white/6 bg-white/3 p-8">
            <h2 className="mb-4 text-lg font-semibold text-white">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/50">{listing.description}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
