'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChangeEvent, useActionState, useMemo, useState } from 'react'
import {
  CATEGORY_SPEC_FIELDS,
  LISTING_CONDITIONS,
  MARKETPLACE_CATEGORIES,
} from '@/lib/marketplace-config'
import { COUNTRY_OPTIONS, getCountryName } from '@/lib/countries'
import { formatPrice } from '@/lib/utils'
import { isValidImageSrcInput } from '@/lib/image-src'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { publishListing } from '@/app/sell/actions'
import { initialPublishListingState } from '@/app/sell/state'
import { Category, ShippingMode } from '@/types/listing'

interface BaseListingForm {
  title: string
  brand: string
  model: string
  price: string
  originalPrice: string
  condition: string
  image: string
  description: string
  sellerNotes: string
}

interface ShippingRateDraft {
  id: string
  countryCode: string
  amount: string
  minDays: string
  maxDays: string
}

interface ShippingForm {
  mode: ShippingMode
  sellerCountryCode: string
  domesticAmount: string
  domesticMinDays: string
  domesticMaxDays: string
  internationalAmount: string
  internationalMinDays: string
  internationalMaxDays: string
  advancedRates: ShippingRateDraft[]
}

const IMAGE_FILE_SIZE_LIMIT = 8 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

function toStorageSafeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function stepLabel(step: number): string {
  if (step === 1) return 'Device type'
  if (step === 2) return 'Listing details'
  if (step === 3) return 'Shipping setup'
  if (step === 4) return 'Device specs'
  return 'Review and submit'
}

function createShippingRow(): ShippingRateDraft {
  return {
    id: crypto.randomUUID(),
    countryCode: '',
    amount: '',
    minDays: '',
    maxDays: '',
  }
}

function parsePositiveNumber(value: string): number | null {
  if (!value) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function ShippingCard({
  title,
  copy,
  active,
  onClick,
}: {
  title: string
  copy: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
        active
          ? 'border-[#67F2FF]/45 bg-[#67F2FF]/10 text-white'
          : 'border-white/12 bg-white/[0.03] text-white/70 hover:border-white/28 hover:text-white'
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/55">{copy}</p>
    </button>
  )
}

export default function SellerListingWizard() {
  const [state, formAction, pending] = useActionState(publishListing, initialPublishListingState)
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<Category | null>(null)
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [localError, setLocalError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null)
  const [base, setBase] = useState<BaseListingForm>({
    title: '',
    brand: '',
    model: '',
    price: '',
    originalPrice: '',
    condition: 'Like New',
    image: '',
    description: '',
    sellerNotes: '',
  })
  const [shipping, setShipping] = useState<ShippingForm>({
    mode: 'basic',
    sellerCountryCode: '',
    domesticAmount: '',
    domesticMinDays: '',
    domesticMaxDays: '',
    internationalAmount: '',
    internationalMinDays: '',
    internationalMaxDays: '',
    advancedRates: [createShippingRow()],
  })

  const activeSpecFields = useMemo(() => {
    if (!category) return []
    return CATEGORY_SPEC_FIELDS[category]
  }, [category])

  const shippingSummary = useMemo(() => {
    if (shipping.mode === 'none') return ['Checkout stays off until shipping is enabled.']
    const rows: string[] = []

    if (shipping.sellerCountryCode) {
      rows.push(`Ships from ${getCountryName(shipping.sellerCountryCode)}`)
    }

    if (shipping.mode === 'basic') {
      if (shipping.domesticAmount) {
        rows.push(`Domestic: ${formatPrice(Number(shipping.domesticAmount), 'USD')}`)
      }
      if (shipping.internationalAmount) {
        rows.push(`International: ${formatPrice(Number(shipping.internationalAmount), 'USD')}`)
      }
      return rows
    }

    return [
      ...rows,
      ...shipping.advancedRates
        .filter((rate) => rate.countryCode && rate.amount)
        .map((rate) => `${getCountryName(rate.countryCode)}: ${formatPrice(Number(rate.amount), 'USD')}`),
    ]
  }, [shipping])

  function updateBaseField<K extends keyof BaseListingForm>(key: K, value: BaseListingForm[K]) {
    setBase((prev) => ({ ...prev, [key]: value }))
  }

  function updateShippingField<K extends keyof ShippingForm>(key: K, value: ShippingForm[K]) {
    setShipping((prev) => ({ ...prev, [key]: value }))
  }

  function updateShippingRate(id: string, patch: Partial<ShippingRateDraft>) {
    setShipping((prev) => ({
      ...prev,
      advancedRates: prev.advancedRates.map((rate) => (rate.id === id ? { ...rate, ...patch } : rate)),
    }))
  }

  function addShippingRate() {
    setShipping((prev) => ({ ...prev, advancedRates: [...prev.advancedRates, createShippingRow()] }))
  }

  function removeShippingRate(id: string) {
    setShipping((prev) => ({
      ...prev,
      advancedRates: prev.advancedRates.length === 1
        ? [createShippingRow()]
        : prev.advancedRates.filter((rate) => rate.id !== id),
    }))
  }

  function updateSpecField(key: string, value: string) {
    setSpecs((prev) => ({ ...prev, [key]: value }))
  }

  async function onSelectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setLocalError(null)

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setLocalError('Upload a JPG, PNG, or WEBP image.')
      event.target.value = ''
      return
    }

    if (file.size > IMAGE_FILE_SIZE_LIMIT) {
      setLocalError('Image must be 8MB or smaller.')
      event.target.value = ''
      return
    }

    setUploadingImage(true)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLocalError('Sign in again before uploading an image.')
        return
      }

      const filePath = `${user.id}/${Date.now()}-${toStorageSafeFileName(file.name)}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      })

      if (uploadError) {
        const lower = uploadError.message.toLowerCase()
        setLocalError(
          lower.includes('bucket')
            ? 'Supabase setup required: create the "listing-images" storage bucket first.'
            : `Image upload failed: ${uploadError.message}`
        )
        return
      }

      const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath)
      if (!data.publicUrl) {
        setLocalError('Image uploaded but no URL was returned.')
        return
      }

      setUploadedImageName(file.name)
      setBase((prev) => ({ ...prev, image: data.publicUrl }))
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  function clearImage() {
    setBase((prev) => ({ ...prev, image: '' }))
    setUploadedImageName(null)
    setLocalError(null)
  }

  function validateStep2(): boolean {
    if (uploadingImage) {
      setLocalError('Wait for the image upload to finish.')
      return false
    }

    if (!base.title || !base.brand || !base.model || !base.price || !base.image || !base.description) {
      setLocalError('Complete all required listing fields before continuing.')
      return false
    }

    if (!isValidImageSrcInput(base.image)) {
      setLocalError('Cover image must be a valid URL (http/https) or start with "/".')
      return false
    }

    const parsedPrice = Number(base.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setLocalError('Price must be a number greater than 0.')
      return false
    }

    if (base.originalPrice) {
      const parsedOriginal = Number(base.originalPrice)
      if (!Number.isFinite(parsedOriginal) || parsedOriginal < parsedPrice) {
        setLocalError('Original price must be blank or greater than/equal to your listing price.')
        return false
      }
    }

    return true
  }

  function validateWindow(minDays: string, maxDays: string): boolean {
    const min = parsePositiveNumber(minDays)
    const max = parsePositiveNumber(maxDays)

    if ((minDays && min === null) || (maxDays && max === null)) {
      setLocalError('Shipping delivery windows must be positive business-day values.')
      return false
    }

    if (min !== null && max !== null && min > max) {
      setLocalError('Shipping delivery minimum must be less than or equal to the maximum.')
      return false
    }

    return true
  }

  function validateStep3(): boolean {
    if (shipping.mode === 'none') return true

    if (!shipping.sellerCountryCode) {
      setLocalError('Choose the country the item ships from.')
      return false
    }

    if (!validateWindow(shipping.domesticMinDays, shipping.domesticMaxDays)) return false
    if (!validateWindow(shipping.internationalMinDays, shipping.internationalMaxDays)) return false

    if (shipping.mode === 'basic') {
      const domestic = parsePositiveNumber(shipping.domesticAmount)
      const international = parsePositiveNumber(shipping.internationalAmount)

      if (!shipping.domesticAmount && !shipping.internationalAmount) {
        setLocalError('Add at least one shipping price in basic mode.')
        return false
      }

      if ((shipping.domesticAmount && domestic === null) || (shipping.internationalAmount && international === null)) {
        setLocalError('Shipping prices must be 0 or higher.')
        return false
      }

      return true
    }

    const activeRates = shipping.advancedRates.filter((rate) => rate.countryCode || rate.amount)
    if (activeRates.length === 0) {
      setLocalError('Add at least one country-specific shipping rate in advanced mode.')
      return false
    }

    for (const rate of activeRates) {
      if (!rate.countryCode || !rate.amount) {
        setLocalError('Every advanced shipping row needs both a destination country and a price.')
        return false
      }
      if (parsePositiveNumber(rate.amount) === null) {
        setLocalError('Advanced shipping prices must be 0 or higher.')
        return false
      }
      if (!validateWindow(rate.minDays, rate.maxDays)) return false
    }

    return true
  }

  function validateStep4(): boolean {
    if (!category) {
      setLocalError('Choose a device category first.')
      return false
    }

    for (const field of CATEGORY_SPEC_FIELDS[category]) {
      const value = (specs[field.key] ?? '').trim()
      if (field.required && !value) {
        setLocalError(`${field.label} is required.`)
        return false
      }

      if (!value) continue

      if (field.type === 'number') {
        const parsed = Number(value)
        if (!Number.isFinite(parsed)) {
          setLocalError(`${field.label} must be numeric.`)
          return false
        }
        if (field.key === 'battery_health' && (parsed < 0 || parsed > 100)) {
          setLocalError('Battery health must be between 0 and 100.')
          return false
        }
      }
    }

    return true
  }

  function goNext() {
    setLocalError(null)

    if (step === 1) {
      if (!category) {
        setLocalError('Pick a category to continue.')
        return
      }
      setStep(2)
      return
    }

    if (step === 2 && validateStep2()) setStep(3)
    if (step === 3 && validateStep3()) setStep(4)
    if (step === 4 && validateStep4()) setStep(5)
  }

  function goBack() {
    setLocalError(null)
    setStep((prev) => Math.max(1, prev - 1))
  }

  const showError = localError ?? (state.status === 'error' ? state.message : null)

  return (
    <section className="rounded-3xl border border-white/10 bg-white/3 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[#22D3EE]">Seller publishing flow</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Create marketplace listing</h2>
          <p className="mt-1 text-sm text-white/65">Step {step} of 5: {stepLabel(step)}</p>
        </div>
        <Link
          href="/listings"
          className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 hover:text-white"
        >
          View marketplace
        </Link>
      </div>

      <div className="mt-5 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-[#2563EB] transition-all" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      {showError && (
        <div className="mt-5 rounded-xl border border-red-400/35 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {showError}
        </div>
      )}

      {state.status === 'success' && (
        <div className="mt-5 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {state.message}
        </div>
      )}

      <div className="mt-6">
        {step === 1 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MARKETPLACE_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item)
                  setLocalError(null)
                }}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  category === item
                    ? 'border-[#2563EB]/70 bg-[#2563EB]/20 text-white'
                    : 'border-white/12 bg-white/[0.02] text-white/70 hover:border-white/30 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm text-white/75">Listing title *
              <input value={base.title} onChange={(event) => updateBaseField('title', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="e.g. iPhone 15 Pro Max 256GB" />
            </label>
            <label className="text-sm text-white/75">Brand *
              <input value={base.brand} onChange={(event) => updateBaseField('brand', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="e.g. Apple" />
            </label>
            <label className="text-sm text-white/75">Model *
              <input value={base.model} onChange={(event) => updateBaseField('model', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="e.g. iPhone 15 Pro Max" />
            </label>
            <label className="text-sm text-white/75">Condition *
              <select value={base.condition} onChange={(event) => updateBaseField('condition', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none">
                {LISTING_CONDITIONS.map((value) => (
                  <option key={value} value={value} className="bg-[#0B0F1A] text-white">{value}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-white/75">Price (USD) *
              <input type="number" min="1" value={base.price} onChange={(event) => updateBaseField('price', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="e.g. 899" />
              <span className="mt-1 block text-xs text-white/45">Stripe can present a local payment currency to the buyer at checkout when supported.</span>
            </label>
            <label className="text-sm text-white/75">Original price (optional)
              <input type="number" min="1" value={base.originalPrice} onChange={(event) => updateBaseField('originalPrice', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="e.g. 1199" />
            </label>
            <div className="md:col-span-2">
              <p className="text-sm text-white/75">Cover photo *</p>
              <label className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/25 bg-white/[0.03] px-4 py-5 text-center">
                <input type="file" accept="image/*" onChange={onSelectImage} className="hidden" disabled={uploadingImage} />
                <span className="text-sm text-white/75">{uploadingImage ? 'Uploading image...' : 'Tap to add photo from your device'}</span>
              </label>
              {base.image && (
                <div className="mt-3 rounded-lg border border-white/12 bg-white/[0.02] p-3">
                  <Image src={base.image} alt="Listing preview" width={1200} height={800} unoptimized className="h-32 w-full rounded-md object-cover sm:h-40" />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-white/60">{uploadedImageName ?? 'Uploaded cover image'}</p>
                    <button type="button" onClick={clearImage} className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white">Remove</button>
                  </div>
                </div>
              )}
            </div>
            <label className="md:col-span-2 text-sm text-white/75">Description *
              <textarea value={base.description} onChange={(event) => updateBaseField('description', event.target.value)} className="mt-1 h-28 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="Describe condition, included items, and any defects." />
            </label>
            <label className="md:col-span-2 text-sm text-white/75">Seller notes (optional)
              <textarea value={base.sellerNotes} onChange={(event) => updateBaseField('sellerNotes', event.target.value)} className="mt-1 h-24 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="What the buyer should know before purchasing." />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#67F2FF]">Checkout-ready shipping</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Choose a shipping setup</h3>
              <p className="mt-2 text-sm text-white/65">Basic gives you domestic plus one international price. Advanced lets you list separate prices country by country.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <ShippingCard title="Basic" copy="A fast domestic and international setup." active={shipping.mode === 'basic'} onClick={() => updateShippingField('mode', 'basic')} />
              <ShippingCard title="Advanced" copy="Custom shipping prices for each country you support." active={shipping.mode === 'advanced'} onClick={() => updateShippingField('mode', 'advanced')} />
              <ShippingCard title="No shipping" copy="Checkout stays off until you add shipping later." active={shipping.mode === 'none'} onClick={() => updateShippingField('mode', 'none')} />
            </div>

            {shipping.mode !== 'none' && (
              <label className="block text-sm text-white/75">Ships from *
                <select value={shipping.sellerCountryCode} onChange={(event) => updateShippingField('sellerCountryCode', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none">
                  <option value="" className="bg-[#0B0F1A] text-white">Choose country</option>
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.code} value={country.code} className="bg-[#0B0F1A] text-white">{country.name}</option>
                  ))}
                </select>
              </label>
            )}

            {shipping.mode === 'basic' && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                  <p className="text-sm font-semibold text-white">Domestic shipping</p>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <label className="text-sm text-white/75">Price (USD)
                      <input type="number" min="0" value={shipping.domesticAmount} onChange={(event) => updateShippingField('domesticAmount', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="18" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm text-white/75">Min days
                        <input type="number" min="1" value={shipping.domesticMinDays} onChange={(event) => updateShippingField('domesticMinDays', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="2" />
                      </label>
                      <label className="text-sm text-white/75">Max days
                        <input type="number" min="1" value={shipping.domesticMaxDays} onChange={(event) => updateShippingField('domesticMaxDays', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="5" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                  <p className="text-sm font-semibold text-white">International shipping</p>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <label className="text-sm text-white/75">Price (USD)
                      <input type="number" min="0" value={shipping.internationalAmount} onChange={(event) => updateShippingField('internationalAmount', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="45" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm text-white/75">Min days
                        <input type="number" min="1" value={shipping.internationalMinDays} onChange={(event) => updateShippingField('internationalMinDays', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="5" />
                      </label>
                      <label className="text-sm text-white/75">Max days
                        <input type="number" min="1" value={shipping.internationalMaxDays} onChange={(event) => updateShippingField('internationalMaxDays', event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="12" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {shipping.mode === 'advanced' && (
              <div className="space-y-4">
                {shipping.advancedRates.map((rate, index) => (
                  <div key={rate.id} className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">Country rate {index + 1}</p>
                      <button type="button" onClick={() => removeShippingRate(rate.id)} className="rounded-full border border-white/16 px-3 py-1 text-xs text-white/70 hover:text-white">Remove</button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                      <label className="text-sm text-white/75 md:col-span-2">Destination country
                        <select value={rate.countryCode} onChange={(event) => updateShippingRate(rate.id, { countryCode: event.target.value })} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none">
                          <option value="" className="bg-[#0B0F1A] text-white">Choose country</option>
                          {COUNTRY_OPTIONS.map((country) => (
                            <option key={country.code} value={country.code} className="bg-[#0B0F1A] text-white">{country.name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm text-white/75">Price (USD)
                        <input type="number" min="0" value={rate.amount} onChange={(event) => updateShippingRate(rate.id, { amount: event.target.value })} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="30" />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm text-white/75">Min
                          <input type="number" min="1" value={rate.minDays} onChange={(event) => updateShippingRate(rate.id, { minDays: event.target.value })} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="4" />
                        </label>
                        <label className="text-sm text-white/75">Max
                          <input type="number" min="1" value={rate.maxDays} onChange={(event) => updateShippingRate(rate.id, { maxDays: event.target.value })} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder="9" />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addShippingRate} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/80 hover:text-white">Add another country price</button>
              </div>
            )}

            <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
              <p className="text-sm font-semibold text-white">Shipping preview</p>
              <div className="mt-3 space-y-2 text-sm text-white/68">
                {shippingSummary.length > 0 ? shippingSummary.map((item) => <p key={item}>{item}</p>) : <p>Complete the shipping fields to preview the checkout setup.</p>}
              </div>
            </div>
          </div>
        )}

        {step === 4 && category && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeSpecFields.map((field) => (
              <label key={field.key} className="text-sm text-white/75">
                {field.label}
                {field.required ? ' *' : ' (optional)'}
                <input type={field.type === 'number' ? 'number' : 'text'} value={specs[field.key] ?? ''} onChange={(event) => updateSpecField(field.key, event.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none" placeholder={field.placeholder} />
              </label>
            ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Listing summary</h3>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/75 sm:grid-cols-2">
                <p><span className="text-white/45">Category:</span> {category}</p>
                <p><span className="text-white/45">Condition:</span> {base.condition}</p>
                <p><span className="text-white/45">Title:</span> {base.title}</p>
                <p><span className="text-white/45">Price:</span> {formatPrice(Number(base.price || 0), 'USD')}</p>
                <p><span className="text-white/45">Brand:</span> {base.brand}</p>
                <p><span className="text-white/45">Model:</span> {base.model}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Shipping setup</h3>
              <div className="mt-3 space-y-2 text-sm text-white/75">
                {shippingSummary.map((item) => <p key={item}>{item}</p>)}
              </div>
            </div>

            <form action={formAction} className="space-y-3">
              <input type="hidden" name="category" value={category ?? ''} />
              <input type="hidden" name="title" value={base.title} />
              <input type="hidden" name="brand" value={base.brand} />
              <input type="hidden" name="model" value={base.model} />
              <input type="hidden" name="price" value={base.price} />
              <input type="hidden" name="original_price" value={base.originalPrice} />
              <input type="hidden" name="condition" value={base.condition} />
              <input type="hidden" name="image" value={base.image} />
              <input type="hidden" name="description" value={base.description} />
              <input type="hidden" name="seller_notes" value={base.sellerNotes} />
              <input type="hidden" name="shipping_mode" value={shipping.mode} />
              <input type="hidden" name="shipping_seller_country_code" value={shipping.sellerCountryCode} />
              <input type="hidden" name="shipping_domestic_amount" value={shipping.domesticAmount} />
              <input type="hidden" name="shipping_domestic_min_days" value={shipping.domesticMinDays} />
              <input type="hidden" name="shipping_domestic_max_days" value={shipping.domesticMaxDays} />
              <input type="hidden" name="shipping_international_amount" value={shipping.internationalAmount} />
              <input type="hidden" name="shipping_international_min_days" value={shipping.internationalMinDays} />
              <input type="hidden" name="shipping_international_max_days" value={shipping.internationalMaxDays} />
              <input type="hidden" name="shipping_advanced_rates" value={JSON.stringify(shipping.advancedRates.filter((rate) => rate.countryCode && rate.amount).map((rate) => ({ countryCode: rate.countryCode, countryName: getCountryName(rate.countryCode), amount: Number(rate.amount), minDays: rate.minDays ? Number(rate.minDays) : undefined, maxDays: rate.maxDays ? Number(rate.maxDays) : undefined })))} />
              {Object.entries(specs).map(([key, value]) => (
                <input key={key} type="hidden" name={`spec_${key}`} value={value} />
              ))}
              <button type="submit" disabled={pending || uploadingImage} className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {pending ? 'Submitting listing...' : uploadingImage ? 'Uploading image...' : 'Submit for review'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button type="button" onClick={goBack} disabled={step === 1} className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 disabled:cursor-not-allowed disabled:opacity-40">
          Back
        </button>
        {step < 5 && (
          <button type="button" onClick={goNext} disabled={uploadingImage} className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">
            {uploadingImage ? 'Uploading image...' : 'Continue'}
          </button>
        )}
      </div>
    </section>
  )
}
