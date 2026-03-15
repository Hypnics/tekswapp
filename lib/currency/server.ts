import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import {
  CURRENCY_COOKIE_NAME,
  DEFAULT_CURRENCY,
  getCurrencyForCountry,
  getLocaleForCurrency,
  isSupportedCurrencyCode,
  normalizeCountryCode,
  type SupportedCurrencyCode,
} from '@/lib/currency/config'
import { detectCountryCodeFromHeaders } from '@/lib/currency/request'

export interface CurrencyPreference {
  currency: SupportedCurrencyCode
  detectedCurrency: SupportedCurrencyCode
  manualCurrency?: SupportedCurrencyCode
  countryCode?: string
  locale: string
  source: 'manual' | 'geolocation' | 'default'
}

export function resolveCurrencyPreference(options: {
  manualCurrency?: string | null
  countryCode?: string | null
}): CurrencyPreference {
  const normalizedCountry = normalizeCountryCode(options.countryCode)
  const detectedCurrency = getCurrencyForCountry(normalizedCountry)
  const normalizedManualCurrency =
    typeof options.manualCurrency === 'string' ? options.manualCurrency.trim().toUpperCase() : undefined
  const manualCurrency =
    normalizedManualCurrency && isSupportedCurrencyCode(normalizedManualCurrency)
      ? normalizedManualCurrency
      : undefined

  if (manualCurrency) {
    return {
      currency: manualCurrency,
      detectedCurrency,
      manualCurrency,
      countryCode: normalizedCountry,
      locale: getLocaleForCurrency(manualCurrency, normalizedCountry),
      source: 'manual',
    }
  }

  if (normalizedCountry) {
    return {
      currency: detectedCurrency,
      detectedCurrency,
      countryCode: normalizedCountry,
      locale: getLocaleForCurrency(detectedCurrency, normalizedCountry),
      source: 'geolocation',
    }
  }

  return {
    currency: DEFAULT_CURRENCY,
    detectedCurrency: DEFAULT_CURRENCY,
    locale: getLocaleForCurrency(DEFAULT_CURRENCY),
    source: 'default',
  }
}

export const getCurrencyPreference = cache(async (): Promise<CurrencyPreference> => {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const countryDetection = detectCountryCodeFromHeaders(headerStore)

  return resolveCurrencyPreference({
    manualCurrency: cookieStore.get(CURRENCY_COOKIE_NAME)?.value,
    countryCode: countryDetection.countryCode,
  })
})
