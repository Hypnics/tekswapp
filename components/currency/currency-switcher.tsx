'use client'

import {
  AUTO_CURRENCY_OPTION,
  CURRENCY_META,
  SUPPORTED_CURRENCIES,
  type SupportedCurrencyCode,
} from '@/lib/currency/config'
import { useCurrencyPreference } from '@/components/currency/currency-provider'

function buildDetectionLabel(
  source: 'manual' | 'geolocation' | 'default',
  detectedCurrency: string,
  countryCode?: string
): string {
  if (source === 'manual') {
    return countryCode
      ? `Manual override saved. Auto-detected pricing is ${detectedCurrency} for ${countryCode}.`
      : `Manual override saved. Auto-detected pricing will resume when location is available.`
  }

  if (countryCode) {
    return `Auto-detected from ${countryCode}. Buyers should not need to change this.`
  }

  return 'Automatic geolocation is unavailable right now, so prices fall back to USD.'
}

export default function CurrencySwitcher() {
  const { preference, isSaving, setCurrencyPreference } = useCurrencyPreference()

  const value = preference.manualCurrency ?? AUTO_CURRENCY_OPTION
  const autoLabel = preference.countryCode
    ? `Auto (${preference.detectedCurrency} / ${preference.countryCode})`
    : `Auto (${preference.detectedCurrency})`
  const detectionLabel = buildDetectionLabel(
    preference.source,
    preference.detectedCurrency,
    preference.countryCode
  )

  return (
    <div className="flex w-full flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Display currency</p>
        <p className="mt-1 text-sm text-white/76">Automatic by location. Change only if needed.</p>
        <p className="mt-1 text-xs leading-relaxed text-white/48">{detectionLabel}</p>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <span className="rounded-full border border-[#67F2FF]/18 bg-[#67F2FF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#67F2FF]">
          {preference.currency}
        </span>

        <select
          value={value}
          onChange={(event) =>
            setCurrencyPreference(
              event.target.value === AUTO_CURRENCY_OPTION
                ? 'AUTO'
                : (event.target.value as SupportedCurrencyCode)
            )
          }
          disabled={isSaving}
          className="min-w-[170px] rounded-full border border-white/12 bg-[#091427] px-3 py-2 text-xs text-white outline-none sm:text-sm"
          aria-label="Select display currency"
        >
          <option value={AUTO_CURRENCY_OPTION} className="bg-[#091427] text-white">
            {autoLabel}
          </option>
          {SUPPORTED_CURRENCIES.map((currency) => (
            <option key={currency} value={currency} className="bg-[#091427] text-white">
              {currency} - {CURRENCY_META[currency].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
