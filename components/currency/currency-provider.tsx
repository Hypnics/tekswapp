'use client'

import {
  createContext,
  startTransition,
  useContext,
  useOptimistic,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import type { CurrencyPreference } from '@/lib/currency/server'
import type { SupportedCurrencyCode } from '@/lib/currency/config'

interface CurrencyContextValue {
  preference: CurrencyPreference
  isSaving: boolean
  setCurrencyPreference: (currency: SupportedCurrencyCode | 'AUTO') => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  initialPreference,
  children,
}: {
  initialPreference: CurrencyPreference
  children: React.ReactNode
}) {
  const router = useRouter()
  const [preference, setPreference] = useState(initialPreference)
  const [optimisticPreference, setOptimisticPreference] = useOptimistic(
    preference,
    (_current, next: CurrencyPreference) => next
  )
  const [isSaving, setIsSaving] = useState(false)

  async function setCurrencyPreference(currency: SupportedCurrencyCode | 'AUTO') {
    setIsSaving(true)

    const optimisticNext: CurrencyPreference =
      currency === 'AUTO'
        ? {
            ...preference,
            currency: preference.detectedCurrency,
            manualCurrency: undefined,
            source: preference.countryCode ? 'geolocation' : 'default',
          }
        : {
            ...preference,
            currency,
            manualCurrency: currency,
            source: 'manual' as const,
          }

    setOptimisticPreference(optimisticNext)

    try {
      const response = await fetch('/api/preferences/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      })

      if (!response.ok) {
        throw new Error(`Could not save currency preference (${response.status}).`)
      }

      const payload = (await response.json()) as { preference?: CurrencyPreference }
      if (payload.preference) {
        setPreference(payload.preference)
      }
    } finally {
      setIsSaving(false)
      startTransition(() => {
        router.refresh()
      })
    }
  }

  const value: CurrencyContextValue = {
    preference: optimisticPreference,
    isSaving,
    setCurrencyPreference,
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrencyPreference() {
  const context = useContext(CurrencyContext)

  if (!context) {
    throw new Error('useCurrencyPreference must be used inside CurrencyProvider.')
  }

  return context
}
