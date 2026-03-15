import {
  normalizeCurrencyCode,
  type SupportedCurrencyCode,
} from '@/lib/currency/config'
import { getExchangeRateTable, convertCurrencyAmount, type ExchangeRateTable } from '@/lib/currency/rates'
import { getCurrencyPreference, type CurrencyPreference } from '@/lib/currency/server'
import { formatPrice } from '@/lib/utils'

export interface MoneyDisplay {
  baseAmount: number
  baseCurrency: SupportedCurrencyCode
  baseFormatted: string
  displayAmount: number
  displayCurrency: SupportedCurrencyCode
  formatted: string
  locale: string
  isConverted: boolean
  isApproximate: boolean
  rateSource: 'live' | 'fallback' | 'not_needed'
}

export interface CurrencyPresenter {
  preference: CurrencyPreference
  exchangeRates: ExchangeRateTable
  money: (amount: number, baseCurrency?: string | null) => MoneyDisplay
}

interface PricedRecord {
  price: number
  currencyCode?: string | null
  originalPrice?: number | null
}

function toSupportedCurrency(value?: string | null): SupportedCurrencyCode {
  return normalizeCurrencyCode(value)
}

export function buildMoneyDisplay(params: {
  amount: number
  baseCurrency?: string | null
  preference: CurrencyPreference
  exchangeRates: ExchangeRateTable
}): MoneyDisplay {
  const baseCurrency = toSupportedCurrency(params.baseCurrency)
  const targetCurrency = params.preference.currency
  const isConverted = baseCurrency !== targetCurrency
  const displayAmount = isConverted
    ? convertCurrencyAmount(params.amount, baseCurrency, targetCurrency, params.exchangeRates)
    : params.amount

  return {
    baseAmount: params.amount,
    baseCurrency,
    baseFormatted: formatPrice(params.amount, baseCurrency, params.preference.locale),
    displayAmount,
    displayCurrency: targetCurrency,
    formatted: formatPrice(displayAmount, targetCurrency, params.preference.locale),
    locale: params.preference.locale,
    isConverted,
    isApproximate: isConverted,
    rateSource: isConverted ? params.exchangeRates.source : 'not_needed',
  }
}

export function createCurrencyPresenter(
  preference: CurrencyPreference,
  exchangeRates: ExchangeRateTable
): CurrencyPresenter {
  return {
    preference,
    exchangeRates,
    money: (amount: number, baseCurrency?: string | null) =>
      buildMoneyDisplay({
        amount,
        baseCurrency,
        preference,
        exchangeRates,
      }),
  }
}

export async function getCurrencyPresenter(): Promise<CurrencyPresenter> {
  const [preference, exchangeRates] = await Promise.all([
    getCurrencyPreference(),
    getExchangeRateTable(),
  ])

  return createCurrencyPresenter(preference, exchangeRates)
}

export function formatDisplayMoneyLabel(money: MoneyDisplay): string {
  return money.isApproximate ? `Approx. ${money.formatted}` : money.formatted
}

export function attachPriceDisplays<T extends PricedRecord>(record: T, presenter: CurrencyPresenter) {
  return {
    ...record,
    priceDisplay: presenter.money(record.price, record.currencyCode),
    originalPriceDisplay:
      typeof record.originalPrice === 'number'
        ? presenter.money(record.originalPrice, record.currencyCode)
        : undefined,
  }
}
