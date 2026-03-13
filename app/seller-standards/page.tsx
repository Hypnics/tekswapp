import type { Metadata } from 'next'
import InfoPageShell, { InfoPageSection } from '@/components/info-page-shell'

export const metadata: Metadata = {
  title: 'Seller Standards | TekSwapp',
  description: 'Review TekSwapp seller requirements for listing quality, fulfillment performance, and account conduct.',
}

const sections: InfoPageSection[] = [
  {
    title: 'Account Integrity',
    paragraphs: [
      'Sellers must provide accurate profile information and complete required verification fields before publishing listings.',
      'Each seller account is responsible for activity performed under that account, including listing changes and order actions.',
    ],
  },
  {
    title: 'Listing Quality Requirements',
    paragraphs: [
      'Listings must include clear photos, truthful condition details, and complete device specifications.',
      'Misrepresentation of defects, accessories, carrier status, or battery health can result in listing removal or account restrictions.',
    ],
    bullets: [
      'Use recent photos of the actual device being sold.',
      'Disclose cosmetic damage and functional issues in the description.',
      'Set pricing and category details that match the product.',
    ],
  },
  {
    title: 'Fulfillment and Communication',
    paragraphs: [
      'Sellers are expected to ship on time, upload tracking when available, and respond promptly to buyer questions.',
      'Consistently late shipping, unresponsive behavior, or cancellation abuse can reduce marketplace visibility.',
    ],
  },
  {
    title: 'Prohibited Seller Behavior',
    paragraphs: [
      'TekSwapp prohibits counterfeit goods, stolen devices, payment diversion, off-platform transactions, and abusive communication.',
      'Violations can result in listing takedowns, payout holds, suspension, or permanent account termination.',
    ],
  },
]

export default function SellerStandardsPage() {
  return (
    <InfoPageShell
      eyebrow="Support"
      title="Seller Standards"
      description="These standards define how sellers maintain trust, deliver accurate listings, and complete transactions responsibly on TekSwapp."
      updatedAt="March 11, 2026"
      sections={sections}
      cta={{ label: 'Start Selling', href: '/sell' }}
    />
  )
}
