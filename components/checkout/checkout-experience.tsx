'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import { initialCheckoutActionState } from '@/app/checkout/action-state'
import { startCheckout } from '@/app/checkout/actions'
import PriceDisplay from '@/components/currency/price-display'
import type { MoneyDisplay } from '@/lib/currency/presenter'

interface ShippingChoice {
  code: string
  name: string
  amount: number
  label: string
  priceDisplay: MoneyDisplay
  estimatedTotalDisplay: MoneyDisplay
}

interface CheckoutExperienceProps {
  listing: {
    id: string
    title: string
    image: string
    condition: string
    category: string
    brand: string
    model: string
    sellerName: string
    priceDisplay: MoneyDisplay
  }
  buyerEmail: string
  shippingChoices: ShippingChoice[]
  cancelled: boolean
  defaultShippingCountry: string
  checkoutCurrencyNote: string
  activeCurrency: string
}

export default function CheckoutExperience({
  listing,
  buyerEmail,
  shippingChoices,
  cancelled,
  defaultShippingCountry,
  checkoutCurrencyNote,
  activeCurrency,
}: CheckoutExperienceProps) {
  const [state, formAction, pending] = useActionState(startCheckout, initialCheckoutActionState)
  const [selectedCountry, setSelectedCountry] = useState(defaultShippingCountry || shippingChoices[0]?.code || '')

  const selectedChoice = useMemo(
    () => shippingChoices.find((choice) => choice.code === selectedCountry) ?? shippingChoices[0],
    [selectedCountry, shippingChoices]
  )

  const estimatedBeforeTaxDisplay = selectedChoice?.estimatedTotalDisplay ?? listing.priceDisplay

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="surface-card rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Secure checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Review order details before Stripe payment</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68">
          Choose the destination country first. We lock that country for the payment session so the seller shipping price and Stripe tax calculation stay accurate.
        </p>

        {cancelled && (
          <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
            Checkout was cancelled. Nothing was charged.
          </div>
        )}

        {state.status === 'error' && (
          <div className="mt-5 rounded-2xl border border-red-400/35 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            {state.message}
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-5">
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="ship_to_country" value={selectedCountry} />

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Buyer</p>
            <p className="mt-2 text-sm font-semibold text-white">{buyerEmail}</p>
            <p className="mt-1 text-xs text-white/52">Stripe will collect the final shipping and tax address securely.</p>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
            <label className="block text-sm text-white/75">
              Ship to country
              <select
                value={selectedCountry}
                onChange={(event) => setSelectedCountry(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/12 bg-[#091427] px-4 py-3 text-white outline-none"
              >
                {shippingChoices.map((choice) => (
                  <option key={choice.code} value={choice.code} className="bg-[#091427] text-white">
                    {choice.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedChoice && (
              <div className="mt-4 rounded-[1.3rem] border border-[#67F2FF]/18 bg-[#67F2FF]/7 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#67F2FF]">Seller shipping for {selectedChoice.name}</p>
                <PriceDisplay
                  money={selectedChoice.priceDisplay}
                  amountClassName="mt-2 text-lg font-semibold text-white"
                  metaClassName="mt-1 text-xs text-white/48"
                />
                <p className="mt-1 text-sm text-white/62">{selectedChoice.label}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { title: 'Pricing', copy: 'Listing price stays transparent in the seller currency before Stripe localizes checkout when supported.' },
              { title: 'Marketplace fee', copy: 'TekSwapp keeps 5% from the seller settlement on paid orders.' },
              { title: 'Tax', copy: 'Stripe calculates tax live from the final address at payment time.' },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-white/55">{item.copy}</p>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={pending || !selectedChoice}
            className="brand-button inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Opening secure payment...' : 'Continue to Stripe Checkout'}
          </button>

          <p className="text-xs text-white/48">
            {checkoutCurrencyNote}
          </p>
        </form>
      </section>

      <aside className="surface-card-soft rounded-[2rem] p-6 sm:p-8">
        <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#091427]">
          <div className="relative aspect-[4/3]">
            <Image src={listing.image} alt={listing.title} fill unoptimized className="object-cover" />
          </div>
          <div className="absolute left-4 top-4 rounded-full bg-[#2563EB]/90 px-3 py-1.5 text-xs font-semibold text-white">
            {listing.condition}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/38">{listing.category}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{listing.title}</h2>
          <p className="mt-2 text-sm text-white/60">{listing.brand} · {listing.model} · Sold by {listing.sellerName}</p>
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between text-sm text-white/70">
            <span>Item</span>
            <span>{listing.priceDisplay.formatted}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-white/70">
            <span>Shipping</span>
            <span>{selectedChoice ? selectedChoice.priceDisplay.formatted : 'Select country'}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-white/50">
            <span>Tax</span>
            <span>Calculated in Stripe</span>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Estimated before tax</span>
              <span className="text-xl font-semibold text-white">{estimatedBeforeTaxDisplay.formatted}</span>
            </div>
            {estimatedBeforeTaxDisplay.isConverted ? (
              <p className="mt-2 text-xs text-white/48">
                Approximate browse total. Seller base amount before tax is {selectedChoice ? selectedChoice.estimatedTotalDisplay.baseFormatted : listing.priceDisplay.baseFormatted}.
              </p>
            ) : (
              <p className="mt-2 text-xs text-white/48">
                Stripe may present the final total in your local currency at payment if supported for your region.
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-white/48">
          <Link href={`/product/${listing.id}`} className="rounded-full border border-white/10 px-3 py-2 text-white/74 hover:text-white">
            Back to listing
          </Link>
          <span>Browsing in {activeCurrency} / Powered by Stripe</span>
        </div>
      </aside>
    </div>
  )
}
