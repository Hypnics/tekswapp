import Link from 'next/link'
import BrandMark from '@/components/brand-mark'

export default function FinalCta() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-7xl rounded-[2.25rem] border border-[#67F2FF]/18 bg-[linear-gradient(135deg,rgba(79,140,255,0.16),rgba(103,242,255,0.08),rgba(255,190,114,0.08))] p-7 shadow-[0_35px_90px_rgba(2,8,21,0.5)] sm:p-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <BrandMark size="lg" subtitle="New tech marketplace" />
            <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
              Ready to see what is live on TekSwapp?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-base">
              Browse the latest listings, or start selling when you are ready. The goal is a
              cleaner marketplace experience on both sides.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#08111f]"
            >
              Browse listings
            </Link>
            <Link
              href="/sell"
              className="ghost-button inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white"
            >
              Start selling
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
