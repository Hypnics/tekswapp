import Link from 'next/link'
import BrandMark from '@/components/brand-mark'
import CurrencySwitcher from '@/components/currency/currency-switcher'

const links = {
  Marketplace: [
    { label: 'Browse listings', href: '/listings' },
    { label: 'Sell a device', href: '/sell' },
    { label: 'How it works', href: '/how-it-works' },
  ],
  Support: [
    { label: 'Buyer protection', href: '/buyer-protection' },
    { label: 'Seller standards', href: '/seller-standards' },
    { label: 'Contact support', href: '/contact-support' },
  ],
  Legal: [
    { label: 'Privacy policy', href: '/privacy-policy' },
    { label: 'Terms of service', href: '/terms-of-service' },
    { label: 'Cookie policy', href: '/cookie-policy' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/8 px-4 pb-8 pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_520px]">
          <div className="surface-card rounded-[2rem] p-6 sm:p-7">
            <BrandMark href="/" size="lg" subtitle="New tech marketplace" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/68">
              A simpler place to buy and sell used tech with clearer listings, visible seller
              info, and support pages that are easy to find.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.entries(links).map(([title, items]) => (
              <div key={title} className="surface-card-soft rounded-[1.65rem] p-5">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/42">{title}</h3>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/8 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2 text-xs text-white/46">
              <p>Copyright {new Date().getFullYear()} TekSwapp. All rights reserved.</p>
              <p>Phones, laptops, tablets, consoles, wearables, and audio gear.</p>
            </div>

            <div className="w-full max-w-xl">
              <CurrencySwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
