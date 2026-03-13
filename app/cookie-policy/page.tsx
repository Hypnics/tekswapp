import type { Metadata } from 'next'
import InfoPageShell, { InfoPageSection } from '@/components/info-page-shell'

export const metadata: Metadata = {
  title: 'Cookie Policy | TekSwapp',
  description: 'Learn how TekSwapp uses cookies and similar technologies to support platform functionality and analytics.',
}

const sections: InfoPageSection[] = [
  {
    title: 'What Cookies Are',
    paragraphs: [
      'Cookies are small text files stored on your device to remember preferences, maintain sessions, and improve product performance.',
      'TekSwapp may also use similar technologies such as local storage and pixels for operational and analytics purposes.',
    ],
  },
  {
    title: 'How TekSwapp Uses Cookies',
    paragraphs: [
      'Essential cookies support sign-in, account security, and core marketplace features.',
      'Performance and analytics cookies help us understand usage patterns and improve reliability and user experience.',
    ],
  },
  {
    title: 'Managing Cookie Preferences',
    paragraphs: [
      'Most browsers allow you to manage, block, or delete cookies through settings controls.',
      'Blocking essential cookies may limit your ability to use account features and complete transactions.',
    ],
  },
  {
    title: 'Third-Party Services',
    paragraphs: [
      'Some embedded or integrated services may set their own cookies when you interact with TekSwapp pages.',
      'These third-party technologies are governed by their respective privacy policies.',
    ],
  },
]

export default function CookiePolicyPage() {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Cookie Policy"
      description="This policy describes the cookie technologies used on TekSwapp and how you can control them."
      updatedAt="March 11, 2026"
      sections={sections}
      cta={{ label: 'Read Privacy Policy', href: '/privacy-policy' }}
    />
  )
}
