import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function normalizeNextPath(candidate: string | null): string {
  if (!candidate || !candidate.startsWith('/')) return '/dashboard'
  return candidate
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextPath = normalizeNextPath(requestUrl.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(new URL('/auth', requestUrl.origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const authUrl = new URL('/auth', requestUrl.origin)
    authUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(authUrl)
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin))
}
