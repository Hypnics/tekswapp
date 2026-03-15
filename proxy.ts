import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  applyDetectedCountryHeader,
  detectCountryCodeFromHeaders,
} from '@/lib/currency/request'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isConfigured(): boolean {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('https://') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 20
  )
}

export async function proxy(request: NextRequest) {
  const forwardedHeaders = applyDetectedCountryHeader(
    new Headers(request.headers),
    detectCountryCodeFromHeaders(request.headers)
  )
  const buildForwardResponse = () =>
    NextResponse.next({
      request: {
        headers: new Headers(forwardedHeaders),
      },
    })
  const isProtected =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/staff')

  // If Supabase is not configured yet, allow public routes through
  // and redirect protected routes to /auth.
  if (!isConfigured()) {
    if (isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }
    return buildForwardResponse()
  }

  let supabaseResponse = buildForwardResponse()

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = buildForwardResponse()
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh the session before checking protected routes.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirected', '1')
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Run on all routes except static files.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
