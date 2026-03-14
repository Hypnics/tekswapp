import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import CategoryGrid from '@/components/category-grid'
import FeaturedListings from '@/components/featured-listings'
import WhyTekSwapp from '@/components/why-tekswapp'
import HowItWorks from '@/components/how-it-works'
import TrustSection from '@/components/trust-section'
import SellerAdvantage from '@/components/seller-advantage'
import MarketplaceFaq from '@/components/marketplace-faq'
import FinalCta from '@/components/final-cta'
import Footer from '@/components/footer'
import { getSiteUrl } from '@/lib/site-url'

export default function HomePage() {
  const siteUrl = getSiteUrl()
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'TekSwapp',
        url: siteUrl,
        description: 'Verified marketplace for premium second-hand electronics.',
      },
      {
        '@type': 'WebSite',
        name: 'TekSwapp',
        url: siteUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/listings?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <div className="page-shell overflow-x-hidden">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main>
        <Hero />
        <CategoryGrid />
        <FeaturedListings />
        <WhyTekSwapp />
        <HowItWorks />
        <TrustSection />
        <SellerAdvantage />
        <MarketplaceFaq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
