export const SUPPORTED_CURRENCIES = [
  'USD',
  'CAD',
  'GBP',
  'EUR',
  'AUD',
  'NZD',
  'JPY',
  'SGD',
  'HKD',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
  'MXN',
] as const

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]

export const DEFAULT_CURRENCY: SupportedCurrencyCode = 'USD'
export const CURRENCY_COOKIE_NAME = 'tekswapp_currency'
export const AUTO_CURRENCY_OPTION = 'AUTO'

export const CURRENCY_META: Record<
  SupportedCurrencyCode,
  { label: string; defaultLocale: string }
> = {
  USD: { label: 'US Dollar', defaultLocale: 'en-US' },
  CAD: { label: 'Canadian Dollar', defaultLocale: 'en-CA' },
  GBP: { label: 'British Pound', defaultLocale: 'en-GB' },
  EUR: { label: 'Euro', defaultLocale: 'en-IE' },
  AUD: { label: 'Australian Dollar', defaultLocale: 'en-AU' },
  NZD: { label: 'New Zealand Dollar', defaultLocale: 'en-NZ' },
  JPY: { label: 'Japanese Yen', defaultLocale: 'ja-JP' },
  SGD: { label: 'Singapore Dollar', defaultLocale: 'en-SG' },
  HKD: { label: 'Hong Kong Dollar', defaultLocale: 'zh-HK' },
  CHF: { label: 'Swiss Franc', defaultLocale: 'de-CH' },
  SEK: { label: 'Swedish Krona', defaultLocale: 'sv-SE' },
  NOK: { label: 'Norwegian Krone', defaultLocale: 'nb-NO' },
  DKK: { label: 'Danish Krone', defaultLocale: 'da-DK' },
  MXN: { label: 'Mexican Peso', defaultLocale: 'es-MX' },
}

const EURO_COUNTRY_CODES = new Set([
  'AD',
  'AT',
  'AX',
  'BE',
  'BL',
  'CY',
  'DE',
  'EA',
  'EE',
  'ES',
  'FI',
  'FR',
  'GF',
  'GP',
  'GR',
  'HR',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MC',
  'ME',
  'MF',
  'MQ',
  'MT',
  'NL',
  'PM',
  'PT',
  'RE',
  'SI',
  'SK',
  'SM',
  'VA',
  'XK',
  'YT',
])

const COUNTRY_TO_CURRENCY: Partial<Record<string, SupportedCurrencyCode>> = {
  AU: 'AUD',
  CA: 'CAD',
  CH: 'CHF',
  CX: 'AUD',
  DK: 'DKK',
  FO: 'DKK',
  GB: 'GBP',
  GG: 'GBP',
  GL: 'DKK',
  HK: 'HKD',
  IM: 'GBP',
  JE: 'GBP',
  JP: 'JPY',
  MX: 'MXN',
  NF: 'AUD',
  NO: 'NOK',
  NZ: 'NZD',
  SE: 'SEK',
  SG: 'SGD',
  SJ: 'NOK',
  US: 'USD',
}

const COUNTRY_TO_LOCALE: Partial<Record<string, string>> = {
  AU: 'en-AU',
  AT: 'de-AT',
  BE: 'nl-BE',
  CA: 'en-CA',
  CH: 'de-CH',
  DE: 'de-DE',
  DK: 'da-DK',
  ES: 'es-ES',
  FI: 'fi-FI',
  FR: 'fr-FR',
  GB: 'en-GB',
  GR: 'el-GR',
  HK: 'zh-HK',
  IE: 'en-IE',
  IT: 'it-IT',
  JP: 'ja-JP',
  MX: 'es-MX',
  NL: 'nl-NL',
  NO: 'nb-NO',
  NZ: 'en-NZ',
  PT: 'pt-PT',
  SE: 'sv-SE',
  SG: 'en-SG',
  US: 'en-US',
}

export function isSupportedCurrencyCode(value: string): value is SupportedCurrencyCode {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrencyCode)
}

export function normalizeCurrencyCode(
  value: unknown,
  fallback: SupportedCurrencyCode = DEFAULT_CURRENCY
): SupportedCurrencyCode {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toUpperCase()
  return isSupportedCurrencyCode(normalized) ? normalized : fallback
}

export function normalizeCountryCode(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toUpperCase()
  return normalized.length === 2 ? normalized : undefined
}

export function getCurrencyForCountry(countryCode?: string | null): SupportedCurrencyCode {
  const normalized = normalizeCountryCode(countryCode)
  if (!normalized) return DEFAULT_CURRENCY
  if (EURO_COUNTRY_CODES.has(normalized)) return 'EUR'
  return COUNTRY_TO_CURRENCY[normalized] ?? DEFAULT_CURRENCY
}

export function getLocaleForCurrency(
  currencyCode: SupportedCurrencyCode,
  countryCode?: string | null
): string {
  const normalizedCountry = normalizeCountryCode(countryCode)
  if (normalizedCountry && COUNTRY_TO_LOCALE[normalizedCountry]) {
    return COUNTRY_TO_LOCALE[normalizedCountry]
  }

  return CURRENCY_META[currencyCode].defaultLocale
}
