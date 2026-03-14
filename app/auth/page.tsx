'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import BrandMark from '@/components/brand-mark'
import { createClient } from '@/lib/supabase/client'
import { login, signup } from './actions'

type Mode = 'login' | 'signup'
type OAuthProvider = 'google' | 'apple'

function sanitizeNextPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return '/dashboard'
  }
  return candidate
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageContent />
    </Suspense>
  )
}

function AuthPageContent() {
  const [mode, setMode] = useState<Mode>('login')
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const supabase = useMemo(
    () => (supabaseConfigured ? createClient() : null),
    [supabaseConfigured]
  )
  const nextPath = useMemo(
    () => sanitizeNextPath(searchParams.get('next')),
    [searchParams]
  )
  const displayError = error ?? searchParams.get('error')

  useEffect(() => {
    if (!supabase) return
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active || !data.session) return
      router.replace(nextPath)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || !session) return
      router.replace(nextPath)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [nextPath, router, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const action = mode === 'login' ? login : signup
    const result = await action(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if ('success' in result && result.success) {
      formRef.current?.reset()
      setSignupSuccess(true)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setSignupSuccess(false)
  }

  async function handleOAuth(provider: OAuthProvider) {
    if (!supabase) {
      setError('Supabase is not configured for OAuth yet.')
      return
    }

    setError(null)
    setSignupSuccess(false)
    setOauthLoading(provider)

    const redirectUrl = new URL('/auth/callback', window.location.origin)
    if (nextPath !== '/dashboard') {
      redirectUrl.searchParams.set('next', nextPath)
    }

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl.toString() },
    })

    if (oauthError) {
      setError(oauthError.message)
      setOauthLoading(null)
      return
    }

    if (!data.url) {
      setError(`Could not start ${provider} sign in. Please try again.`)
      setOauthLoading(null)
      return
    }

    window.location.assign(data.url)
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-8 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,140,255,0.14)_0%,transparent_65%)]" />
        <div className="absolute right-[8%] top-[18%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(103,242,255,0.1)_0%,transparent_70%)]" />
      </div>

      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_430px]">
        <div className="hidden min-h-[640px] flex-col justify-between rounded-[2.4rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 lg:flex">
          <div>
            <BrandMark href="/" size="xl" subtitle="Verified tech marketplace" />
            <h1 className="mt-10 max-w-xl text-5xl font-semibold leading-[0.94] text-white">
              Account access for safer tech resale.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/68">
              Sign in to manage listings, monitor purchases, and move through the TekSwapp
              workflow without leaving the marketplace context.
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Protected checkout and payout routing',
              'Seller verification and listing review layers',
              'Shared dashboard for buying and selling',
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-white/8 bg-white/[0.08] px-5 py-4 text-sm text-white/76 backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card relative w-full rounded-[2.2rem] p-6 sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <BrandMark href="/" size="md" subtitle="Signal-grade access" />
              <h2 className="mt-6 text-2xl font-semibold text-white">
                {mode === 'login' ? 'Welcome back' : 'Join TekSwapp'}
              </h2>
              <p className="mt-2 text-sm text-white/58">
                {mode === 'login'
                  ? 'Sign in to manage your marketplace activity.'
                  : 'Create your account to buy and sell premium devices.'}
              </p>
            </div>
            <Link href="/" className="text-sm text-white/42 transition-colors hover:text-white">
              Back
            </Link>
          </div>

          <div className="mb-7 flex rounded-full border border-white/8 bg-white/[0.03] p-1">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'brand-button text-white'
                    : 'text-white/40 hover:text-white/74'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {signupSuccess ? (
            <div className="rounded-[1.5rem] border border-emerald-400/24 bg-emerald-400/10 px-5 py-5 text-sm text-emerald-100">
              <div className="font-semibold">Account created successfully.</div>
              <div className="mt-1 text-emerald-100/74">
                Check your email to confirm your account before signing in.
              </div>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 underline underline-offset-4"
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'login' ? <input type="hidden" name="next" value={nextPath} /> : null}
              {mode === 'signup' ? (
                <AuthInput
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Alex Morgan"
                  required
                  autoComplete="name"
                />
              ) : null}
              <AuthInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              <AuthInput
                label="Password"
                name="password"
                type="password"
                placeholder="********"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />

              {mode === 'login' ? (
                <div className="-mt-1 text-right">
                  <a href="#" className="text-xs text-white/40 transition-colors hover:text-white/72">
                    Forgot password?
                  </a>
                </div>
              ) : null}

              {displayError ? (
                <div className="rounded-[1.35rem] border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                  {displayError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="brand-button mt-2 w-full rounded-full py-3.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          )}

          {!signupSuccess ? (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/30">
                  or continue with
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([
                  { id: 'google', label: 'Google' },
                  { id: 'apple', label: 'Apple' },
                ] as const).map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleOAuth(provider.id)}
                    disabled={Boolean(oauthLoading) || !supabaseConfigured}
                    className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/68 transition-colors hover:text-white disabled:opacity-60"
                  >
                    {oauthLoading === provider.id
                      ? `Connecting ${provider.label}...`
                      : !supabaseConfigured
                        ? `${provider.label} unavailable`
                        : provider.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {mode === 'signup' && !signupSuccess ? (
            <p className="mt-6 text-center text-xs leading-relaxed text-white/34">
              By creating an account you agree to our{' '}
              <Link href="/terms-of-service" className="text-white/56 underline underline-offset-4">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-white/56 underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function AuthPageFallback() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-24">
      <div className="surface-card w-full max-w-md rounded-[2.2rem] p-8 text-center">
        <BrandMark href="/" size="md" subtitle="Signal-grade access" />
        <p className="mt-6 text-sm text-white/58">Loading account access...</p>
      </div>
    </div>
  )
}

function AuthInput({
  label,
  name,
  type,
  placeholder,
  required,
  autoComplete,
}: {
  label: string
  name: string
  type: string
  placeholder: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-white/42">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="input-shell w-full rounded-[1.15rem] px-4 py-3 text-sm"
      />
    </div>
  )
}
