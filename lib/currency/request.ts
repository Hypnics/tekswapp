import { normalizeCountryCode } from '@/lib/currency/config'

export const REQUEST_COUNTRY_HEADER_NAME = 'x-tekswapp-country'

interface HeaderReader {
  get(name: string): string | null
}

export interface CountryDetectionResult {
  countryCode?: string
  source:
    | 'override'
    | 'normalized_header'
    | 'vercel'
    | 'cloudflare'
    | 'cloudfront'
    | 'fastly'
    | 'appengine'
    | 'custom_header'
    | 'none'
}

const GEOLOCATION_HEADER_CANDIDATES: Array<{
  header: string
  source: Exclude<CountryDetectionResult['source'], 'override' | 'none'>
}> = [
  { header: REQUEST_COUNTRY_HEADER_NAME, source: 'normalized_header' },
  { header: 'x-vercel-ip-country', source: 'vercel' },
  { header: 'cf-ipcountry', source: 'cloudflare' },
  { header: 'cloudfront-viewer-country', source: 'cloudfront' },
  { header: 'fastly-geoip-country-code', source: 'fastly' },
  { header: 'x-appengine-country', source: 'appengine' },
  { header: 'x-country-code', source: 'custom_header' },
  { header: 'x-geo-country', source: 'custom_header' },
]

function getDevelopmentCountryOverride(): string | undefined {
  if (process.env.NODE_ENV === 'production') return undefined
  return normalizeCountryCode(process.env.TEKSWAPP_GEO_COUNTRY_OVERRIDE)
}

export function detectCountryCodeFromHeaders(headers: HeaderReader): CountryDetectionResult {
  const overrideCountry = getDevelopmentCountryOverride()
  if (overrideCountry) {
    return {
      countryCode: overrideCountry,
      source: 'override',
    }
  }

  for (const candidate of GEOLOCATION_HEADER_CANDIDATES) {
    const countryCode = normalizeCountryCode(headers.get(candidate.header))
    if (!countryCode) continue

    return {
      countryCode,
      source: candidate.source,
    }
  }

  return { source: 'none' }
}

export function applyDetectedCountryHeader(
  headers: Headers,
  detection: CountryDetectionResult
): Headers {
  if (detection.countryCode) {
    headers.set(REQUEST_COUNTRY_HEADER_NAME, detection.countryCode)
  } else {
    headers.delete(REQUEST_COUNTRY_HEADER_NAME)
  }

  return headers
}
