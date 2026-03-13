import type { Metadata } from 'next'
import InfoPageShell, { InfoPageSection } from '@/components/info-page-shell'

export const metadata: Metadata = {
  title: 'Privacy Policy | TekSwapp',
  description: 'Understand how TekSwapp collects, uses, and protects personal information.',
}

const sections: InfoPageSection[] = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'TekSwapp collects information you provide directly, such as account profile details, listing content, support messages, and transaction metadata.',
      'We also collect technical information like device type, browser information, and usage activity to operate and secure the platform.',
    ],
  },
  {
    title: 'How We Use Information',
    paragraphs: [
      'Information is used to provide marketplace functionality, process transactions, prevent fraud, and improve product performance.',
      'We may also use data for customer support, service notices, and compliance obligations.',
    ],
  },
  {
    title: 'Information Sharing',
    paragraphs: [
      'TekSwapp shares data only as needed to run marketplace operations, including payment processors, hosting providers, and security services.',
      'We may disclose information if required by law, legal process, or to protect users and platform integrity.',
    ],
  },
  {
    title: 'Data Retention and Security',
    paragraphs: [
      'We retain data for as long as necessary to provide services, meet legal obligations, and resolve disputes.',
      'TekSwapp applies technical and organizational safeguards, but no internet transmission or storage method is fully risk-free.',
    ],
  },
  {
    title: 'Your Choices',
    paragraphs: [
      'You may request account updates or deletion by contacting support, subject to legal and operational retention requirements.',
      'You can control some browser-level privacy settings, including cookie preferences and tracking controls.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      description="This policy explains what personal information TekSwapp collects, why it is used, and how users can manage their data."
      updatedAt="March 11, 2026"
      sections={sections}
      cta={{ label: 'Contact Support', href: '/contact-support' }}
    />
  )
}
