import Link from 'next/link'
import BrandMark from '@/components/brand-mark'
import SearchBar from '@/components/search-bar'

const heroStats = [
  { label: 'Protected settlement', value: 'Escrow flow on every qualifying order' },
  { label: 'Seller verification', value: 'Identity, history, and listing review layers' },
  { label: 'Device checks', value: 'IMEI and serial confidence before payout release' },
]

const commandCenterItems = [
  { label: 'Live category velocity', value: 'Phones +34%' },
  { label: 'Buyer confidence score', value: '98 / 100' },
  { label: 'Average payout release', value: '1.9 days' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-18 pt-34 sm:pb-22 sm:pt-40">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/68">
            <span className="h-2 w-2 rounded-full bg-[#67F2FF] shadow-[0_0_12px_rgba(103,242,255,0.8)]" />
            Premium resale, built like infrastructure
          </div>

          <div className="max-w-4xl">
            <h1 className="text-balance text-[2.9rem] font-semibold leading-[0.95] text-white sm:text-[4.2rem] lg:text-[5.3rem]">
              The marketplace where second-hand tech feels first-party.
            </h1>
            <p className="section-copy mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">
              TekSwapp combines verification, pricing clarity, and protected settlement so buyers
              can move fast and sellers can publish inventory with less friction.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/listings"
              className="brand-button inline-flex min-w-[180px] items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Browse live inventory
            </Link>
            <Link
              href="/sell"
              className="ghost-button inline-flex min-w-[180px] items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white/86 transition-colors hover:text-white"
            >
              List your device
            </Link>
          </div>

          <div className="mt-10">
            <SearchBar className="max-w-5xl" />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {heroStats.map((item) => (
              <article key={item.label} className="surface-card-soft rounded-[1.75rem] p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/82">{item.value}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="float-panel relative lg:pt-10">
          <div className="surface-card rounded-[2rem] p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <BrandMark size="lg" subtitle="Signal-grade marketplace" />
              <div className="rounded-full border border-amber-300/18 bg-amber-300/8 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-amber-100/88">
                Live
              </div>
            </div>

            <div className="ambient-divider mt-6" />

            <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(79,140,255,0.14),rgba(255,255,255,0.03))] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Trade command center</p>
                <span className="text-xs text-[#67F2FF]">Updated 24/7</span>
              </div>
              <div className="mt-5 space-y-3">
                {commandCenterItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#050c17]/55 px-4 py-3"
                  >
                    <span className="text-sm text-white/62">{item.label}</span>
                    <span className="text-sm font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { value: '12k+', label: 'Active buyers' },
                { value: '4.9/5', label: 'Seller score' },
                { value: '<2d', label: 'Payout cycle' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-4 text-center"
                >
                  <div className="text-lg font-semibold text-white">{item.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/40">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-white/66">
              Built for premium phones, laptops, tablets, consoles, and the sellers who care about
              listing quality.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
