import type { Metadata } from 'next'
import InfoPageShell, { InfoPageSection } from '@/components/info-page-shell'

export const metadata: Metadata = {
  title: 'Terms of Service | TekSwapp',
  description: 'Read the terms that govern use of TekSwapp accounts, listings, and marketplace transactions.',
}

const sections: InfoPageSection[] = [
  {
    title: 'Acceptance of Terms',
    paragraphs: [
      'By accessing or using TekSwapp, you agree to follow these terms and all applicable laws.',
      'If you do not agree, you should not use marketplace services.',
    ],
  },
  {
    title: 'Account Responsibilities',
    paragraphs: [
      'You are responsible for keeping account credentials secure and for all activity under your account.',
      'Information submitted during registration, listing, and transaction workflows must be accurate and up to date.',
    ],
  },
  {
    title: 'Marketplace Transaction Rules',
    paragraphs: [
      'Buyers and sellers must complete transactions through TekSwapp payment and communication channels where required.',
      'TekSwapp may review, remove, or restrict listings that violate policy or create trust and safety risk.',
    ],
  },
  {
    title: 'Fees, Payouts, and Enforcement',
    paragraphs: [
      'Platform fees, payout timing, and hold conditions may vary based on account status, risk signals, and transaction events.',
      'Violations of policy can result in listing removal, payout holds, account suspension, or permanent access loss.',
    ],
  },
  {
    title: 'Liability and Service Availability',
    paragraphs: [
      'TekSwapp provides services on an as-available basis and does not guarantee uninterrupted or error-free operation.',
      'To the extent permitted by law, TekSwapp is not liable for indirect or consequential damages arising from platform use.',
    ],
  },
]

export default function TermsOfServicePage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Terms of Service"
      description="These terms govern account use, listings, and marketplace transactions on TekSwapp."
      updatedAt="March 11, 2026"
      sections={sections}
      cta={{ label: 'View Seller Standards', href: '/seller-standards' }}
    />
  )
}
