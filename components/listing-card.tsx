import Image from 'next/image'
import Link from 'next/link'
import { normalizeImageSrc } from '@/lib/image-src'
import { formatPrice, getDiscount } from '@/lib/utils'
import { Listing } from '@/types/listing'

interface ListingCardProps {
  listing: Listing
}

const conditionStyles: Record<string, { text: string; color: string; background: string }> = {
  New: { text: 'New', color: '#22D3EE', background: 'rgba(34,211,238,0.14)' },
  'Like New': { text: 'Like New', color: '#22D3EE', background: 'rgba(34,211,238,0.14)' },
  Good: { text: 'Good', color: '#93c5fd', background: 'rgba(147,197,253,0.12)' },
  Fair: { text: 'Fair', color: '#fbbf24', background: 'rgba(251,191,36,0.12)' },
  Poor: { text: 'Poor', color: '#fca5a5', background: 'rgba(252,165,165,0.12)' },
}

export default function ListingCard({ listing }: ListingCardProps) {
  const discount = listing.originalPrice ? getDiscount(listing.originalPrice, listing.price) : null
  const imageSrc = normalizeImageSrc(listing.image)
  const condition = conditionStyles[listing.condition] ?? {
    text: listing.condition,
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.08)',
  }

  return (
    <Link
      href={`/product/${listing.id}`}
      className="surface-card group overflow-hidden rounded-[1.85rem] transition-all duration-200 hover:-translate-y-1 hover:border-[#67F2FF]/24"
    >
      <div className="relative h-56">
        <Image
          src={imageSrc}
          alt={listing.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ background: 'linear-gradient(to top, rgba(18,34,58,0.78), transparent)' }}
        />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ color: condition.color, background: condition.background }}
          >
            {condition.text}
          </span>
          {listing.seller.verified && (
            <span
              className="rounded-full border px-2.5 py-1 text-[11px] font-medium text-white/90"
              style={{ borderColor: 'rgba(37,99,235,0.55)', background: 'rgba(37,99,235,0.26)' }}
            >
              Verified seller
            </span>
          )}
        </div>

        {discount && discount > 0 && (
          <span
            className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
            style={{ background: 'rgba(37,99,235,0.92)' }}
          >
            Save {discount}%
          </span>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/38">
            {listing.category}
          </span>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/54">
            {listing.views} views
          </span>
        </div>

        <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug text-white">
          {listing.title}
        </h3>

        <div className="flex items-end gap-2">
          <p className="text-2xl font-semibold text-white">{formatPrice(listing.price)}</p>
          {listing.originalPrice && (
            <p className="pb-1 text-sm text-white/45 line-through">{formatPrice(listing.originalPrice)}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/8 pt-4 text-sm text-white/70">
          <span className="truncate pr-2">{listing.seller.name}</span>
          <span className="whitespace-nowrap">{listing.seller.rating.toFixed(1)} seller rating</span>
        </div>
      </div>
    </Link>
  )
}
