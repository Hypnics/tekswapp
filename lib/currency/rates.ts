import { cache } from 'react'
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  type SupportedCurrencyCode,
} from '@/lib/currency/config'

export interface ExchangeRateTable {
  baseCurrency: SupportedCurrencyCode
  rates: Record<SupportedCurrencyCode, number>
  updatedAt: string
  source: 'live' | 'fallback'
}

const FALLBACK_EXCHANGE_RATES: Record<SupportedCurrencyCode, number> = {
  USD: 1,
  CAD: 1.36,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.53,
  NZD: 1.64,
  JPY: 148.2,
  SGD: 1.33,
  HKD: 7.82,
  CHF: 0.88,
  SEK: 10.34,
  NOK: 10.6,
  DKK: 6.87,
  MXN: 16.9,
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

function getFxEndpoint(): string {
  return process.env.FX_RATES_API_URL ?? 'https://api.frankfurter.dev/v1/latest'
}

function getFxTtlSeconds(): number {
  const parsed = Number(process.env.FX_RATES_TTL_SECONDS ?? '21600')
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 21600
}

function parseExchangeRates(payload: unknown): Record<SupportedCurrencyCode, number> | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const row = payload as Record<string, unknown>
  const ratesInput = row.rates
  if (!ratesInput || typeof ratesInput !== 'object' || Array.isArray(ratesInput)) return null

  const rates = { [DEFAULT_CURRENCY]: 1 } as Record<SupportedCurrencyCode, number>

  for (const currency of SUPPORTED_CURRENCIES) {
    if (currency === DEFAULT_CURRENCY) continue
    const value = (ratesInput as Record<string, unknown>)[currency]
    const parsed = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return null
    }
    rates[currency] = parsed
  }

  return rates
}

export const getExchangeRateTable = cache(async (): Promise<ExchangeRateTable> => {
  const symbols = SUPPORTED_CURRENCIES.filter((currency) => currency !== DEFAULT_CURRENCY).join(',')

  try {
    const response = await fetch(
      `${getFxEndpoint()}?base=${DEFAULT_CURRENCY}&symbols=${symbols}`,
      {
        next: { revalidate: getFxTtlSeconds() },
      }
    )

    if (!response.ok) {
      throw new Error(`FX endpoint responded with ${response.status}.`)
    }

    const payload = (await response.json()) as Record<string, unknown>
    const rates = parseExchangeRates(payload)

    if (!rates) {
      throw new Error('FX payload could not be normalized.')
    }

    return {
      baseCurrency: DEFAULT_CURRENCY,
      rates,
      updatedAt:
        typeof payload.date === 'string' && payload.date.trim()
          ? payload.date
          : new Date().toISOString(),
      source: 'live',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown FX error.'
    console.error('[currency] Falling back to bundled exchange rates.', message)

    return {
      baseCurrency: DEFAULT_CURRENCY,
      rates: FALLBACK_EXCHANGE_RATES,
      updatedAt: new Date().toISOString(),
      source: 'fallback',
    }
  }
})

export function convertCurrencyAmount(
  amount: number,
  fromCurrency: SupportedCurrencyCode,
  toCurrency: SupportedCurrencyCode,
  table: ExchangeRateTable
): number {
  if (!Number.isFinite(amount)) return 0
  if (fromCurrency === toCurrency) return roundCurrency(amount)

  const fromRate = table.rates[fromCurrency]
  const toRate = table.rates[toCurrency]

  if (!fromRate || !toRate) {
    return roundCurrency(amount)
  }

  const amountInUsd = amount / fromRate
  return roundCurrency(amountInUsd * toRate)
}
