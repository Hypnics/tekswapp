import Link from 'next/link'
import ListingCard from '@/components/listing-card'
import { getFeaturedMarketplaceListings } from '@/lib/marketplace'

export default async function FeaturedListings() {
  const listings = await getFeaturedMarketplaceListings(6)

  return (
    <section className="px-4 pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Featured listings</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Fresh inventory from the live marketplace
            </h2>
            <p className="section-copy mt-3 text-sm leading-relaxed sm:text-base">
              Curated devices from verified sellers with stronger pricing signals, condition
              detail, and protected checkout paths.
            </p>
          </div>
          <Link href="/listings" className="text-sm text-white/68 transition-colors hover:text-white">
            Browse all listings
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="surface-card rounded-[1.85rem] p-8 text-center">
            <p className="text-sm text-white/70">No seller listings have been published yet.</p>
            <Link href="/sell" className="mt-3 inline-flex text-sm font-semibold text-[#67F2FF] hover:text-white">
              Publish the first listing
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
