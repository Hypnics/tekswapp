import { NextRequest, NextResponse } from 'next/server'
import { finalizeStripeCheckoutSession, releaseListingReservation } from '@/lib/checkout'
import { stripe } from '@/lib/stripe'

function getWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null
}

export async function POST(request: NextRequest) {
  const webhookSecret = getWebhookSecret()
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook secret is not configured.' }, { status: 503 })
  }

  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      await finalizeStripeCheckoutSession(session.id)
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object
      await releaseListingReservation({
        sessionId: session.id,
        listingId: session.metadata?.listingId ?? undefined,
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook event.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
