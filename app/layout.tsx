import type { Metadata } from 'next'
import { Manrope, Sora } from 'next/font/google'
import { getSiteUrl } from '@/lib/site-url'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'TekSwapp | Verified Tech Marketplace',
  description:
    'TekSwapp is the verified tech marketplace for premium resale. Buy and sell phones, laptops, tablets, and consoles with protected payments.',
  keywords: ['electronics marketplace', 'buy phone', 'sell laptop', 'verified tech', 'IMEI check'],
  applicationName: 'TekSwapp',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'TekSwapp | Verified Tech Marketplace',
    description:
      'Buy and sell premium electronics with verified sellers, protected checkout, and cleaner listings.',
    siteName: 'TekSwapp',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TekSwapp | Verified Tech Marketplace',
    description:
      'Buy and sell premium electronics with verified sellers, protected checkout, and cleaner listings.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable} bg-[var(--background)] text-[var(--text)]`}>
        {children}
      </body>
    </html>
  )
}
