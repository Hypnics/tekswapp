import Stripe from 'stripe'

function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local.')
  }

  return secretKey
}

export const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2026-02-25.clover',
  typescript: true,
})
