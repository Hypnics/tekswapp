import type { Metadata } from 'next'
import InfoPageShell, { InfoPageSection } from '@/components/info-page-shell'

export const metadata: Metadata = {
  title: 'Buyer Protection | TekSwapp',
  description: 'Learn how TekSwapp protects buyers through verification, secure payment handling, and dispute workflows.',
}

const sections: InfoPageSection[] = [
  {
    title: 'Verified Listings and Seller Screening',
    paragraphs: [
      'TekSwapp uses profile verification, device checks, and listing review controls to reduce fraud risk before a listing is published.',
      'Listings marked as verified are associated with validated seller information and additional marketplace checks.',
    ],
  },
  {
    title: 'Protected Payment Flow',
    paragraphs: [
      'Buyer funds are processed through protected checkout and are not released to the seller until delivery requirements are satisfied.',
      'If a transaction fails shipping or item-condition checks, payment release can be paused while support investigates.',
    ],
  },
  {
    title: 'Dispute Resolution Process',
    paragraphs: [
      'If an item arrives damaged, missing, or materially different from the listing, open a dispute through your account or by contacting support.',
      'The dispute team reviews listing details, shipment evidence, and communication history to determine next steps.',
    ],
    bullets: [
      'Submit a dispute as soon as the issue is discovered.',
      'Provide photos, shipment proof, and order details for faster review.',
      'Keep communication inside TekSwapp channels when possible.',
    ],
  },
  {
    title: 'What Buyer Protection Does Not Cover',
    paragraphs: [
      'Buyer protection may be limited when platform rules are bypassed, including direct off-platform payments, unauthorized modifications after delivery, or fraudulent claims.',
    ],
  },
]

export default function BuyerProtectionPage() {
  return (
    <InfoPageShell
      eyebrow="Support"
      title="Buyer Protection"
      description="TekSwapp is designed to make electronics transactions safer for buyers through verification layers, payment safeguards, and structured dispute handling."
      updatedAt="March 11, 2026"
      sections={sections}
      cta={{ label: 'Contact Support', href: '/contact-support' }}
    />
  )
}
