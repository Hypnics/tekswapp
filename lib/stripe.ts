// ─────────────────────────────────────────────────────────────
// lib/stripe.ts — Stripe Connect placeholder
// ─────────────────────────────────────────────────────────────
// To activate:
//   1. npm install stripe @stripe/stripe-js
//   2. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local
//   3. Uncomment the code below

// import Stripe from 'stripe'

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-09-30.acacia',
// })

// ─── Stripe Connect (seller payouts) ────────────────────────
// export async function createConnectedAccount(email: string) {
//   return stripe.accounts.create({
//     type: 'express',
//     email,
//     capabilities: { transfers: { requested: true } },
//   })
// }

// export async function createAccountLink(accountId: string, returnUrl: string) {
//   return stripe.accountLinks.create({
//     account: accountId,
//     refresh_url: returnUrl,
//     return_url: returnUrl,
//     type: 'account_onboarding',
//   })
// }

// ─── Escrow / Payment Intents ────────────────────────────────
// export async function createPaymentIntent(amount: number, sellerId: string) {
//   return stripe.paymentIntents.create({
//     amount: amount * 100, // in pence/cents
//     currency: 'gbp',
//     transfer_data: { destination: sellerId },
//     application_fee_amount: Math.round(amount * 100 * 0.05), // 5% TekSwapp fee
//   })
// }

// export async function transferToSeller(amount: number, sellerId: string) {
//   return stripe.transfers.create({
//     amount: amount * 100,
//     currency: 'gbp',
//     destination: sellerId,
//   })
// }

// Placeholder export to avoid import errors
export const stripePlaceholder = null
