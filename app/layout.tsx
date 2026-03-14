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
  title: 'TekSwapp | Buy & Sell Used Tech',
  description:
    'Buy and sell used phones, laptops, tablets, consoles, and more on TekSwapp. Shop clearer listings, visible seller info, and a simpler checkout flow.',
  keywords: ['electronics marketplace', 'buy used phone', 'sell laptop', 'used tech', 'verified sellers'],
  applicationName: 'TekSwapp',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'TekSwapp | Buy & Sell Used Tech',
    description:
      'Shop used tech with clearer listings, visible seller info, and a simpler path to checkout.',
    siteName: 'TekSwapp',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TekSwapp | Buy & Sell Used Tech',
    description:
      'Shop used tech with clearer listings, visible seller info, and a simpler path to checkout.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon.png?v=2', type: 'image/png', sizes: '256x256' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico?v=2'],
    apple: [{ url: '/apple-icon.png?v=2', sizes: '180x180', type: 'image/png' }],
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
