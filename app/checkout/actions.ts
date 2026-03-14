'use server'

import { redirect } from 'next/navigation'
import type Stripe from 'stripe'
import {
  CHECKOUT_RESERVATION_MINUTES,
  DEFAULT_CURRENCY,
  MARKETPLACE_FEE_RATE,
  TECH_PRODUCT_TAX_CODE,
  attachStripeSessionToReservation,
  getAuthenticatedCheckoutContext,
  releaseListingReservation,
  reserveListingForCheckout,
  resolveShippingRate,
} from '@/lib/checkout'
import { getMarketplaceListingById } from '@/lib/marketplace'
import { getSiteUrl } from '@/lib/site-url'
import { stripe } from '@/lib/stripe'

export interface CheckoutActionState {
  status: 'idle' | 'error'
  message?: string
}

export const initialCheckoutActionState: CheckoutActionState = {
  status: 'idle',
}

function cleanString(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export async function startCheckout(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const listingId = cleanString(formData.get('listing_id'))
  const shipToCountry = cleanString(formData.get('ship_to_country')).toUpperCase()
  let createdSessionId: string | null = null

  if (!listingId || !shipToCountry) {
    return {
      status: 'error',
      message: 'Choose a shipping destination before continuing to payment.',
    }
  }

  try {
    const { user } = await getAuthenticatedCheckoutContext()

    if (!user) {
      redirect('/auth')
    }

    const listing = await getMarketplaceListingById(listingId)
    if (!listing || listing.status !== 'active') {
      return {
        status: 'error',
        message: 'This listing is unavailable for checkout right now.',
      }
    }

    if (listing.seller.id === user.id) {
      return {
        status: 'error',
        message: 'You cannot purchase your own listing.',
      }
    }

    const shippingRate = resolveShippingRate(listing, shipToCountry)
    if (!shippingRate) {
      return {
        status: 'error',
        message: 'That destination is not supported by the seller shipping setup.',
      }
    }

    const reservationAttempt = await reserveListingForCheckout({
      listingId: listing.id,
      buyerId: user.id,
      shippingCountryCode: shipToCountry,
    })

    if (reservationAttempt.status === 'conflict') {
      return {
        status: 'error',
        message: 'Another buyer already has this item in checkout. Try again in a few minutes.',
      }
    }

    if (reservationAttempt.status === 'existing' && reservationAttempt.reservation.checkoutUrl) {
      redirect(reservationAttempt.reservation.checkoutUrl)
    }

    const currency = (listing.currencyCode ?? DEFAULT_CURRENCY).toLowerCase()
    const siteUrl = getSiteUrl()
    const images = listing.image.startsWith('http://') || listing.image.startsWith('https://')
      ? [listing.image]
      : undefined
    const expiresAtDate = new Date(Date.now() + CHECKOUT_RESERVATION_MINUTES * 60 * 1000)
    const expiresAt = Math.floor(expiresAtDate.getTime() / 1000)

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
      {
        shipping_rate_data: {
          display_name: shippingRate.label,
          fixed_amount: {
            amount: Math.round(shippingRate.amount * 100),
            currency,
          },
          type: 'fixed_amount',
          tax_behavior: 'exclusive',
          delivery_estimate:
            shippingRate.minDays || shippingRate.maxDays
              ? {
                  minimum: shippingRate.minDays
                    ? { unit: 'business_day', value: shippingRate.minDays }
                    : undefined,
                  maximum: shippingRate.maxDays
                    ? { unit: 'business_day', value: shippingRate.maxDays }
                    : undefined,
                }
              : undefined,
        },
      },
    ]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'pay',
      locale: 'auto',
      expires_at: expiresAt,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/${listing.id}?cancelled=1`,
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: true },
      adaptive_pricing: { enabled: true },
      shipping_address_collection: {
        allowed_countries: [shipToCountry as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry],
      },
      shipping_options: shippingOptions,
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Math.round(listing.price * 100),
            tax_behavior: 'exclusive',
            product_data: {
              name: listing.title,
              description: `${listing.condition} ${listing.brand} ${listing.model}`,
              images,
              tax_code: TECH_PRODUCT_TAX_CODE,
            },
          },
        },
      ],
      metadata: {
        listingId: listing.id,
        listingTitle: listing.title,
        sellerId: listing.seller.id,
        sellerName: listing.seller.name,
        buyerId: user.id,
        shipToCountry,
        shippingLabel: shippingRate.label,
        listingCurrency: listing.currencyCode,
        marketplaceFeeRate: MARKETPLACE_FEE_RATE.toString(),
      },
    })
    createdSessionId = session.id

    if (!session.url) {
      await releaseListingReservation({ listingId: listing.id })
      return {
        status: 'error',
        message: 'Stripe did not return a checkout URL.',
      }
    }

    await attachStripeSessionToReservation({
      reservationId: reservationAttempt.reservation.id,
      sessionId: session.id,
      checkoutUrl: session.url,
      reservedUntil: expiresAtDate.toISOString(),
    })

    redirect(session.url)
  } catch (error) {
    if (createdSessionId) {
      try {
        await stripe.checkout.sessions.expire(createdSessionId)
      } catch {}
    }
    if (listingId) {
      await releaseListingReservation({ listingId })
    }
    const message = error instanceof Error ? error.message : 'Unable to start checkout.'
    return {
      status: 'error',
      message,
    }
  }
}
