'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import BrandMark from '@/components/brand-mark'
import { createClient } from '@/lib/supabase/client'

const desktopLinks = [
  { label: 'Shop', href: '/listings' },
  { label: 'Sell', href: '/sell' },
  { label: 'Buyer Protection', href: '/buyer-protection' },
  { label: 'How It Works', href: '/how-it-works' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [authReady, setAuthReady] = useState(
    !(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  )
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const supabase = useMemo(
    () => (supabaseConfigured ? createClient() : null),
    [supabaseConfigured]
  )

  useEffect(() => {
    if (!supabase) return

    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setIsAuthed(Boolean(data.user))
      setAuthReady(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setIsAuthed(Boolean(session))
      setAuthReady(true)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  async function handleLogout() {
    if (!supabase) return
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    setIsAuthed(false)
    setMobileOpen(false)
    setIsLoggingOut(false)
    router.push('/auth')
    router.refresh()
  }

  const showAuthedActions = authReady && isAuthed

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-7xl rounded-[1.6rem] border border-white/10 bg-[rgba(15,35,62,0.68)] px-4 shadow-[0_16px_50px_rgba(6,14,31,0.18)] backdrop-blur-2xl sm:px-6">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <BrandMark href="/" size="md" subtitle="Buy & Sell Used Tech" className="shrink-0" />

          <div className="hidden min-w-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
            {desktopLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-white/62 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {showAuthedActions ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full px-4 py-2 text-sm text-white/72 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-full px-4 py-2 text-sm text-white/58 transition-all duration-200 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="rounded-full px-4 py-2 text-sm text-white/62 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/sell"
                  className="brand-button rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Start selling
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-white/10 bg-white/[0.03] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span
              className={`block h-px bg-white/70 transition-all duration-300 ${
                mobileOpen ? 'w-5 translate-y-[6px] rotate-45' : 'w-5'
              }`}
            />
            <span
              className={`block h-px bg-white/70 transition-all duration-300 ${
                mobileOpen ? 'w-0 opacity-0' : 'w-4'
              }`}
            />
            <span
              className={`block h-px bg-white/70 transition-all duration-300 ${
                mobileOpen ? 'w-5 -translate-y-[6px] -rotate-45' : 'w-5'
              }`}
            />
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/8 pb-5 pt-4 md:hidden">
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                Buying made simpler
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                Clearer listings, visible seller info, and support pages that are easy to reach.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {desktopLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72 transition-colors hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {showAuthedActions ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/78"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/68 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/sell"
                    className="brand-button rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Start selling
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  )
}
