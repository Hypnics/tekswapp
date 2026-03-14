import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import CheckoutExperience from '@/components/checkout/checkout-experience'
import { getAllowedShippingCountries, getListingCheckoutAvailability, resolveShippingRate } from '@/lib/checkout'
import { getCountryName } from '@/lib/countries'
import { getMarketplaceListingById } from '@/lib/marketplace'
import { createClient } from '@/lib/supabase/server'

interface CheckoutPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cancelled?: string }>
}

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await getMarketplaceListingById(id)

  return {
    title: listing ? `Checkout ${listing.title} | TekSwapp` : 'Checkout | TekSwapp',
    description: listing
      ? `Review shipping and continue to secure checkout for ${listing.title} on TekSwapp.`
      : 'Review your TekSwapp order before payment.',
  }
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { id } = await params
  const { cancelled } = await searchParams

  const listing = await getMarketplaceListingById(id)
  if (!listing || listing.status !== 'active') {
    redirect('/listings')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const availability = await getListingCheckoutAvailability(listing.id, user.id)

  const shippingChoices = getAllowedShippingCountries(listing)
    .map((code) => {
      const rate = resolveShippingRate(listing, code)
      if (!rate) return null

      return {
        code,
        name: getCountryName(code),
        amount: rate.amount,
        label: rate.label,
      }
    })
    .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice))

  if (shippingChoices.length === 0) {
    redirect(`/product/${listing.id}`)
  }

  return (
    <div className="page-shell min-h-screen text-white">
      <Navbar />
      <main className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-6xl">
          {!availability.available && !availability.reservedByViewer ? (
            <section className="surface-card rounded-[2rem] p-8 text-center">
              <p className="section-kicker">Temporarily reserved</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Another buyer is already in checkout</h1>
              <p className="mt-3 text-sm leading-relaxed text-white/68">
                This item is currently locked while another payment session is active. If payment is not completed, it will reopen automatically after the reservation expires.
              </p>
              {availability.reservation?.reservedUntil && (
                <p className="mt-3 text-xs text-white/48">
                  Reservation expires around {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(availability.reservation.reservedUntil))}
                </p>
              )}
              <div className="mt-6 flex justify-center">
                <Link href={`/product/${listing.id}`} className="brand-button rounded-full px-5 py-3 text-sm font-semibold text-white">
                  Back to listing
                </Link>
              </div>
            </section>
          ) : (
            <CheckoutExperience
              listing={{
                id: listing.id,
                title: listing.title,
                image: listing.image,
                price: listing.price,
                condition: listing.condition,
                category: listing.category,
                brand: listing.brand,
                model: listing.model,
                sellerName: listing.seller.name,
                currencyCode: listing.currencyCode,
              }}
              buyerEmail={user.email ?? 'Buyer'}
              shippingChoices={shippingChoices}
              cancelled={cancelled === '1'}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
