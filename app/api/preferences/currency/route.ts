import { NextRequest, NextResponse } from 'next/server'
import {
  AUTO_CURRENCY_OPTION,
  CURRENCY_COOKIE_NAME,
  isSupportedCurrencyCode,
} from '@/lib/currency/config'
import { detectCountryCodeFromHeaders } from '@/lib/currency/request'
import { resolveCurrencyPreference } from '@/lib/currency/server'

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as { currency?: string } | null
  const rawCurrency = payload?.currency?.trim().toUpperCase()
  const countryDetection = detectCountryCodeFromHeaders(request.headers)

  if (!rawCurrency) {
    return NextResponse.json({ error: 'Currency is required.' }, { status: 400 })
  }

  if (rawCurrency !== AUTO_CURRENCY_OPTION && !isSupportedCurrencyCode(rawCurrency)) {
    return NextResponse.json({ error: 'Unsupported currency.' }, { status: 400 })
  }

  const response = NextResponse.json({
    preference: resolveCurrencyPreference({
      manualCurrency: rawCurrency === AUTO_CURRENCY_OPTION ? undefined : rawCurrency,
      countryCode: countryDetection.countryCode,
    }),
  })

  if (rawCurrency === AUTO_CURRENCY_OPTION) {
    response.cookies.delete(CURRENCY_COOKIE_NAME)
    return response
  }

  response.cookies.set(CURRENCY_COOKIE_NAME, rawCurrency, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}
