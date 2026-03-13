import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import CategoryGrid from '@/components/category-grid'
import FeaturedListings from '@/components/featured-listings'
import WhyTekSwapp from '@/components/why-tekswapp'
import HowItWorks from '@/components/how-it-works'
import TrustSection from '@/components/trust-section'
import FinalCta from '@/components/final-cta'
import Footer from '@/components/footer'

export default function HomePage() {
  return (
    <div className="page-shell overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <CategoryGrid />
        <FeaturedListings />
        <WhyTekSwapp />
        <HowItWorks />
        <TrustSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
