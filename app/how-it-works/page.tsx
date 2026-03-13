import type { Metadata } from 'next'
import InfoPageShell, { InfoPageSection } from '@/components/info-page-shell'

export const metadata: Metadata = {
  title: 'How It Works | TekSwapp',
  description: 'Understand the TekSwapp flow for listing devices, secure checkout, shipping, and payout release.',
}

const sections: InfoPageSection[] = [
  {
    title: '1. List Your Device',
    paragraphs: [
      'Create a listing with accurate photos, condition details, and device specs so buyers understand exactly what is being sold.',
      'Complete listings improve buyer trust and increase conversion.',
    ],
  },
  {
    title: '2. Buyer Pays Securely',
    paragraphs: [
      'Buyers complete checkout through protected payment flows designed for marketplace transactions.',
      'Funds are held while delivery milestones are in progress.',
    ],
  },
  {
    title: '3. Ship and Confirm Delivery',
    paragraphs: [
      'Sellers ship the item with tracked delivery when possible and keep order updates current.',
      'Tracking and communication records support smooth transaction completion.',
    ],
  },
  {
    title: '4. Payout Is Released',
    paragraphs: [
      'After delivery conditions are met, payout is released according to TekSwapp policy.',
      'If issues occur, support and dispute workflows are available to protect both sides.',
    ],
  },
]

export default function HowItWorksPage() {
  return (
    <InfoPageShell
      eyebrow="Marketplace"
      title="How TekSwapp Works"
      description="TekSwapp is built around a structured transaction lifecycle that keeps buyers and sellers aligned from listing to payout."
      updatedAt="March 11, 2026"
      sections={sections}
      cta={{ label: 'Browse Listings', href: '/listings' }}
    />
  )
}
