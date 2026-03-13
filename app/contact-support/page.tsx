import type { Metadata } from 'next'
import InfoPageShell, { InfoPageSection } from '@/components/info-page-shell'

export const metadata: Metadata = {
  title: 'Contact Support | TekSwapp',
  description: 'Get help with account, listings, orders, disputes, and seller verification on TekSwapp.',
}

const sections: InfoPageSection[] = [
  {
    title: 'Support Channels',
    paragraphs: [
      'For general support, contact the team at support@tekswapp.com.',
      'For account-specific issues, include the email address used on TekSwapp and any relevant order or listing IDs.',
    ],
  },
  {
    title: 'What to Include in Your Request',
    paragraphs: [
      'Providing complete details helps support resolve issues faster and reduces back-and-forth.',
    ],
    bullets: [
      'A short summary of the issue.',
      'Relevant order ID, listing ID, or profile name.',
      'Screenshots or error messages if available.',
      'Steps already attempted.',
    ],
  },
  {
    title: 'Response Expectations',
    paragraphs: [
      'Most requests receive an initial response within 24 to 48 hours, excluding holidays.',
      'Complex disputes or verification reviews may require additional time if third-party evidence is needed.',
    ],
  },
  {
    title: 'Urgent Transaction Issues',
    paragraphs: [
      'If a transaction has active delivery or payment concerns, mention URGENT in the subject line and include full order details.',
      'Support prioritizes active order-risk events to protect both buyers and sellers.',
    ],
  },
]

export default function ContactSupportPage() {
  return (
    <InfoPageShell
      eyebrow="Support"
      title="Contact Support"
      description="Need help with a listing, payment, dispute, or account setup? The TekSwapp support team can help."
      updatedAt="March 11, 2026"
      sections={sections}
      cta={{ label: 'Email support@tekswapp.com', href: 'mailto:support@tekswapp.com' }}
    />
  )
}
