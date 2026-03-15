'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ChangeEvent, ReactNode } from 'react'
import { useActionState, useMemo, useRef, useState } from 'react'
import { CURRENCY_META, SUPPORTED_CURRENCIES } from '@/lib/currency/config'
import {
  CATEGORY_SPEC_FIELDS,
  CONDITION_HELP,
  getListingSpecFields,
  getListingWizardConfig,
  isAppleIphoneListing,
  LISTING_CONDITIONS,
  MARKETPLACE_CATEGORIES,
  type SpecFieldConfig,
} from '@/lib/marketplace-config'
import { COUNTRY_OPTIONS, getCountryName } from '@/lib/countries'
import { formatPrice } from '@/lib/utils'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { publishListing } from '@/app/sell/actions'
import { initialPublishListingState } from '@/app/sell/state'
import type { Category, SellerEditableListing, ShippingMode } from '@/types/listing'

interface SellerListingWizardProps {
  initialListing?: SellerEditableListing
}

interface BaseListingForm {
  title: string
  brand: string
  model: string
  currencyCode: string
  price: string
  originalPrice: string
  condition: string
  description: string
  sellerNotes: string
}

interface ListingPhotoDraft {
  id: string
  url: string
  name: string
}

interface PrivateIdentifiersForm {
  imei: string
  serialNumber: string
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
const MAX_LISTING_PHOTOS = 20
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

function toStorageSafeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function createShippingRow(): ShippingRateDraft {
  return { id: crypto.randomUUID(), countryCode: '', amount: '', minDays: '', maxDays: '' }
}

function parsePositiveNumber(value: string): number | null {
  if (!value) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  return parsed
}

function splitMultiSelect(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function formatListingImageUploadError(message: string): string {
  console.error('[listing-image-upload]', message)
  const normalized = message.toLowerCase()

  if (normalized.includes('bucket') || normalized.includes('not found')) {
    return 'We could not upload your photos right now. Please try again in a moment.'
  }

  if (normalized.includes('row-level security') || normalized.includes('policy')) {
    return 'We could not upload your photos right now. Please try again in a moment.'
  }

  return 'We could not upload your photos right now. Please try again in a moment.'
}

function createInitialPhotos(initialListing?: SellerEditableListing): ListingPhotoDraft[] {
  return (initialListing?.images ?? []).map((url, index) => ({
    id: crypto.randomUUID(),
    url,
    name: `Photo ${index + 1}`,
  }))
}

function createInitialShipping(initialListing?: SellerEditableListing): ShippingForm {
  const shippingProfile = initialListing?.shippingProfile
  return {
    mode: initialListing?.shippingMode ?? 'basic',
    sellerCountryCode: shippingProfile?.sellerCountryCode ?? '',
    domesticAmount: shippingProfile?.domesticAmount ? String(shippingProfile.domesticAmount) : '',
    domesticMinDays: shippingProfile?.domesticMinDays ? String(shippingProfile.domesticMinDays) : '',
    domesticMaxDays: shippingProfile?.domesticMaxDays ? String(shippingProfile.domesticMaxDays) : '',
    internationalAmount: shippingProfile?.internationalAmount ? String(shippingProfile.internationalAmount) : '',
    internationalMinDays: shippingProfile?.internationalMinDays ? String(shippingProfile.internationalMinDays) : '',
    internationalMaxDays: shippingProfile?.internationalMaxDays ? String(shippingProfile.internationalMaxDays) : '',
    advancedRates:
      shippingProfile?.advancedRates?.map((rate) => ({
        id: crypto.randomUUID(),
        countryCode: rate.countryCode,
        amount: String(rate.amount),
        minDays: rate.minDays ? String(rate.minDays) : '',
        maxDays: rate.maxDays ? String(rate.maxDays) : '',
      })) ?? [createShippingRow()],
  }
}

function SectionCard({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow?: string
  title: string
  copy?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/12 bg-white/[0.04] p-5 sm:p-6">
      {eyebrow ? <p className="text-[11px] uppercase tracking-[0.18em] text-[#67F2FF]">{eyebrow}</p> : null}
      <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
      {copy ? <p className="mt-2 text-sm leading-relaxed text-white/65">{copy}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  )
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

function ConditionHelpPopover() {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Condition guide"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/18 bg-white/[0.05] text-xs font-semibold text-white/82"
      >
        ?
      </button>
      {open ? (
        <div className="absolute left-0 top-8 z-20 w-80 rounded-2xl border border-white/12 bg-[#091427]/98 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-sm font-semibold text-white">Condition guide</p>
          <div className="mt-3 space-y-3">
            {CONDITION_HELP.map((item) => (
              <div key={item.value} className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                <p className="text-sm font-semibold text-white">{item.value}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function SellerListingWizard({ initialListing }: SellerListingWizardProps) {
  const [state, formAction, pending] = useActionState(publishListing, initialPublishListingState)
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<Category | null>(initialListing?.category ?? null)
  const [specs, setSpecs] = useState<Record<string, string>>(initialListing?.deviceSpecs ?? {})
  const [photos, setPhotos] = useState<ListingPhotoDraft[]>(() => createInitialPhotos(initialListing))
  const [uploadState, setUploadState] = useState<{ current: number; total: number } | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null)
  const addPhotoInputRef = useRef<HTMLInputElement | null>(null)
  const replacePhotoInputRef = useRef<HTMLInputElement | null>(null)
  const replacePhotoIdRef = useRef<string | null>(null)
  const [privateIdentifiers, setPrivateIdentifiers] = useState<PrivateIdentifiersForm>({
    imei: initialListing?.privateIdentifiers?.imei ?? '',
    serialNumber: initialListing?.privateIdentifiers?.serialNumber ?? '',
  })
  const [base, setBase] = useState<BaseListingForm>({
    title: initialListing?.title ?? '',
    brand: initialListing?.brand ?? '',
    model: initialListing?.model ?? '',
    currencyCode: initialListing?.currencyCode ?? 'USD',
    price: initialListing?.price ? String(initialListing.price) : '',
    originalPrice: initialListing?.originalPrice ? String(initialListing.originalPrice) : '',
    condition: initialListing?.condition ?? 'Like New',
    description: initialListing?.description ?? '',
    sellerNotes: initialListing?.sellerNotes ?? '',
  })
  const [shipping, setShipping] = useState<ShippingForm>(() => createInitialShipping(initialListing))
  const isEditing = Boolean(initialListing)
  const wizardConfig = useMemo(() => getListingWizardConfig(category), [category])
  const steps = wizardConfig.steps
  const totalSteps = steps.length
  const currentStepLabel = steps[step - 1]?.label ?? 'Basic info'

  const activeSpecFields = useMemo(() => {
    if (!category) return []
    if (typeof getListingSpecFields === 'function') {
      return getListingSpecFields(category, {
        brand: base.brand,
        model: base.model,
        specs,
      })
    }
    return CATEGORY_SPEC_FIELDS[category] ?? []
  }, [base.brand, base.model, category, specs])

  const deviceSpecFields = useMemo(
    () => activeSpecFields.filter((field) => field.section === 'device_specs'),
    [activeSpecFields]
  )
  const conditionFields = useMemo(
    () => activeSpecFields.filter((field) => field.section === 'condition' || field.section === 'extras'),
    [activeSpecFields]
  )
  const submittedSpecs = useMemo(
    () =>
      activeSpecFields.reduce<Record<string, string>>((acc, field) => {
        const value = (specs[field.key] ?? '').trim()
        if (value) acc[field.key] = value
        return acc
      }, {}),
    [activeSpecFields, specs]
  )
  const reviewSpecs = useMemo(
    () =>
      activeSpecFields
        .filter((field) => Boolean((specs[field.key] ?? '').trim()))
        .slice(0, 8)
        .map((field) => ({
          key: field.key,
          label: field.label,
          value: specs[field.key]?.trim() ?? '',
        })),
    [activeSpecFields, specs]
  )
  const isAppleIphone = useMemo(
    () =>
      category === 'Phones' &&
      isAppleIphoneListing({
        brand: base.brand,
        model: base.model,
        specs,
      }),
    [base.brand, base.model, category, specs]
  )
  const shippingSummary = useMemo(() => {
    if (shipping.mode === 'none') return ['Checkout stays off until shipping is enabled.']
    const rows: string[] = []
    if (shipping.sellerCountryCode) rows.push(`Ships from ${getCountryName(shipping.sellerCountryCode)}`)
    if (shipping.mode === 'basic') {
      if (shipping.domesticAmount) {
        rows.push(`Domestic: ${formatPrice(Number(shipping.domesticAmount), base.currencyCode)}`)
      }
      if (shipping.internationalAmount) {
        rows.push(`International: ${formatPrice(Number(shipping.internationalAmount), base.currencyCode)}`)
      }
      return rows
    }
    return [
      ...rows,
      ...shipping.advancedRates
        .filter((rate) => rate.countryCode && rate.amount)
        .map(
          (rate) =>
            `${getCountryName(rate.countryCode)}: ${formatPrice(Number(rate.amount), base.currencyCode)}`
        ),
    ]
  }, [base.currencyCode, shipping])
  const listingTips = useMemo(() => {
    const tips: string[] = []
    if (photos.length < 6) tips.push('Listings with 6+ photos usually perform better.')
    if (category === 'Phones' && !submittedSpecs.storage) {
      tips.push('Add storage capacity so buyers can compare your phone faster.')
    }
    if (isAppleIphone && !submittedSpecs.battery_health) {
      tips.push('Add battery health to build trust for iPhone buyers.')
    }
    if (category === 'Laptops' && !submittedSpecs.charger_included) {
      tips.push('Call out whether the charger is included. Laptop buyers expect that detail.')
    }
    if (category === 'Tablets' && !submittedSpecs.stylus_support) {
      tips.push('Add stylus support details so tablet buyers understand the workflow fit.')
    }
    if (category === 'Consoles' && !submittedSpecs.controller_included) {
      tips.push('Clarify whether controllers are included so console bundles feel complete.')
    }
    if (category === 'Wearables' && !submittedSpecs.charger_included) {
      tips.push('Add charger details because wearable buyers often ask about that first.')
    }
    if (category === 'Audio' && submittedSpecs.audio_type === 'Earbuds' && !submittedSpecs.charging_case_included) {
      tips.push('Say whether the charging case is included. Earbud buyers usually look for that immediately.')
    }
    return tips
  }, [category, isAppleIphone, photos.length, submittedSpecs])

  function updateBaseField<K extends keyof BaseListingForm>(key: K, value: BaseListingForm[K]) {
    setBase((prev) => ({ ...prev, [key]: value }))
  }

  function handleCategoryChange(nextCategory: Category) {
    setCategory(nextCategory)
    setLocalError(null)

    const allowedKeys = new Set((CATEGORY_SPEC_FIELDS[nextCategory] ?? []).map((field) => field.key))
    setSpecs((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([key]) => allowedKeys.has(key)))
    )

    if (!getListingWizardConfig(nextCategory).privateSection.showImei) {
      setPrivateIdentifiers((prev) => ({ ...prev, imei: '' }))
    }
  }

  function updatePrivateField<K extends keyof PrivateIdentifiersForm>(
    key: K,
    value: PrivateIdentifiersForm[K]
  ) {
    setPrivateIdentifiers((prev) => ({ ...prev, [key]: value }))
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
      advancedRates:
        prev.advancedRates.length === 1
          ? [createShippingRow()]
          : prev.advancedRates.filter((rate) => rate.id !== id),
    }))
  }

  function updateSpecField(key: string, value: string) {
    setSpecs((prev) => ({ ...prev, [key]: value }))
  }

  function toggleMultiSelectField(key: string, option: string) {
    const current = splitMultiSelect(specs[key] ?? '')
    const next = current.includes(option) ? current.filter((value) => value !== option) : [...current, option]
    updateSpecField(key, next.join(', '))
  }

  async function uploadFiles(files: File[], replacePhotoId?: string) {
    if (!files.length) return

    const supabase = createBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLocalError('Sign in again before uploading photos.')
      return
    }

    const remainingSlots = MAX_LISTING_PHOTOS - photos.length
    const filesToUpload = replacePhotoId ? files.slice(0, 1) : files.slice(0, remainingSlots)

    if (!replacePhotoId && remainingSlots <= 0) {
      setLocalError('You have already reached the 20 photo limit.')
      return
    }

    for (const file of filesToUpload) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        setLocalError('Upload JPG, PNG, or WEBP photos only.')
        return
      }
      if (file.size > IMAGE_FILE_SIZE_LIMIT) {
        setLocalError('Each photo must be 8MB or smaller.')
        return
      }
    }

    try {
      for (const [index, file] of filesToUpload.entries()) {
        setUploadState({ current: index + 1, total: filesToUpload.length })
        const filePath = `${user.id}/${Date.now()}-${index}-${toStorageSafeFileName(file.name)}`
        const { error: uploadError } = await supabase.storage.from('listing-images').upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        })

        if (uploadError) {
          setLocalError(formatListingImageUploadError(uploadError.message))
          return
        }

        const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath)
        const nextPhoto = { id: crypto.randomUUID(), url: data.publicUrl, name: file.name }
        setPhotos((prev) => {
          if (!replacePhotoId) return [...prev, nextPhoto]
          return prev.map((photo) => (photo.id === replacePhotoId ? nextPhoto : photo))
        })
      }
      setLocalError(null)
    } finally {
      setUploadState(null)
      replacePhotoIdRef.current = null
      if (addPhotoInputRef.current) addPhotoInputRef.current.value = ''
      if (replacePhotoInputRef.current) replacePhotoInputRef.current.value = ''
    }
  }

  async function onSelectPhotos(event: ChangeEvent<HTMLInputElement>) {
    await uploadFiles(Array.from(event.target.files ?? []), replacePhotoIdRef.current ?? undefined)
  }

  function movePhoto(fromIndex: number, toIndex: number) {
    setPhotos((prev) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev
      }
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  function validateFields(fields: SpecFieldConfig[]): boolean {
    for (const field of fields) {
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
        if (field.min !== undefined && parsed < field.min) {
          setLocalError(`${field.label} must be at least ${field.min}.`)
          return false
        }
        if (field.max !== undefined && parsed > field.max) {
          setLocalError(`${field.label} must be ${field.max} or less.`)
          return false
        }
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

  function validateStep(stepToValidate: number): boolean {
    if (stepToValidate === 1) {
      if (!category || !base.title || !base.brand || !base.model || !base.price) {
        setLocalError('Complete the category, title, brand, model, and price before continuing.')
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

    if (stepToValidate === 2) return validateFields(deviceSpecFields)
    if (stepToValidate === 3) return validateFields(conditionFields)

    if (stepToValidate === 4) {
      if (uploadState) {
        setLocalError('Wait for the photo upload to finish.')
        return false
      }
      if (photos.length === 0) {
        setLocalError('Add at least one listing photo before continuing.')
        return false
      }
      if (!base.description) {
        setLocalError('Add a detailed description before continuing.')
        return false
      }
      return true
    }

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

  function goNext() {
    setLocalError(null)
    if (validateStep(step)) setStep((prev) => Math.min(totalSteps, prev + 1))
  }

  function renderSpecField(field: SpecFieldConfig) {
    const value = specs[field.key] ?? ''
    const label = `${field.label}${field.required ? ' *' : field.recommended ? ' (recommended)' : ' (optional)'}`

    if (field.type === 'multiselect' && field.options) {
      const selected = splitMultiSelect(value)
      return (
        <label key={field.key} className="text-sm text-white/75">
          {label}
          {field.helperText ? <span className="mt-1 block text-xs text-white/45">{field.helperText}</span> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {field.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleMultiSelectField(field.key, option)}
                className={`rounded-full border px-3 py-2 text-xs font-medium ${
                  selected.includes(option)
                    ? 'border-[#67F2FF]/45 bg-[#67F2FF]/12 text-white'
                    : 'border-white/12 bg-white/[0.03] text-white/68'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </label>
      )
    }

    if (field.type === 'select' && field.options) {
      return (
        <label key={field.key} className="text-sm text-white/75">
          {label}
          {field.helperText ? <span className="mt-1 block text-xs text-white/45">{field.helperText}</span> : null}
          <select
            value={value}
            onChange={(event) => updateSpecField(field.key, event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
          >
            <option value="" className="bg-[#091427] text-white">Choose an option</option>
            {field.options.map((option) => <option key={option} value={option} className="bg-[#091427] text-white">{option}</option>)}
          </select>
        </label>
      )
    }

    if (field.type === 'textarea') {
      return (
        <label key={field.key} className="text-sm text-white/75">
          {label}
          {field.helperText ? <span className="mt-1 block text-xs text-white/45">{field.helperText}</span> : null}
          <textarea
            value={value}
            rows={field.rows ?? 4}
            onChange={(event) => updateSpecField(field.key, event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
            placeholder={field.placeholder}
          />
        </label>
      )
    }

    return (
      <label key={field.key} className="text-sm text-white/75">
        {label}
        {field.helperText ? <span className="mt-1 block text-xs text-white/45">{field.helperText}</span> : null}
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value}
          onChange={(event) => updateSpecField(field.key, event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      </label>
    )
  }

  const showError = localError ?? (state.status === 'error' ? state.message : null)

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[#22D3EE]">
            {isEditing ? 'Seller listing editor' : 'Seller publishing flow'}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {isEditing ? 'Update marketplace listing' : 'Create marketplace listing'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
            {wizardConfig.heroDescription}
          </p>
          <p className="mt-2 text-sm text-white/55">
            Step {step} of {totalSteps}: {currentStepLabel}
          </p>
        </div>
        <Link
          href="/listings"
          className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 hover:text-white"
        >
          View marketplace
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {steps.map((stepConfig, index) => {
          const value = index + 1
          return (
            <div
              key={value}
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                value === step
                  ? 'border-[#67F2FF]/40 bg-[#67F2FF]/12 text-white'
                  : value < step
                    ? 'border-[#2563EB]/35 bg-[#2563EB]/12 text-white/90'
                    : 'border-white/10 bg-white/[0.03] text-white/45'
              }`}
            >
              {value}. {stepConfig.label}
            </div>
          )
        })}
      </div>

      <div className="mt-5 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-[#2563EB] transition-all"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {showError ? (
        <div className="mt-5 rounded-xl border border-red-400/35 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {showError}
        </div>
      ) : null}
      {state.status === 'success' ? (
        <div className="mt-5 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {state.message}
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
        {step === 1 ? (
          <SectionCard
            eyebrow={wizardConfig.basicInfo.eyebrow}
            title={wizardConfig.basicInfo.title}
            copy={wizardConfig.basicInfo.copy}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MARKETPLACE_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleCategoryChange(item)}
                  className={`rounded-2xl border px-4 py-4 text-left text-sm ${
                    category === item
                      ? 'border-[#2563EB]/70 bg-[#2563EB]/20 text-white'
                      : 'border-white/12 bg-white/[0.02] text-white/70 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <p className="font-semibold">{item}</p>
                  <p className="mt-2 text-xs text-white/55">
                    {getListingWizardConfig(item).categoryCardDescription}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm text-white/75">
                Listing title *
                <input
                  value={base.title}
                  onChange={(event) => updateBaseField('title', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                  placeholder={wizardConfig.basicInfo.titlePlaceholder}
                />
              </label>
              <label className="text-sm text-white/75">
                Brand *
                <input
                  value={base.brand}
                  onChange={(event) => updateBaseField('brand', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                  placeholder={wizardConfig.basicInfo.brandPlaceholder}
                />
              </label>
              <label className="text-sm text-white/75">
                {wizardConfig.basicInfo.modelLabel}
                <input
                  value={base.model}
                  onChange={(event) => updateBaseField('model', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                  placeholder={wizardConfig.basicInfo.modelPlaceholder}
                />
              </label>
              <label className="text-sm text-white/75">
                Listing base currency *
                <select
                  value={base.currencyCode}
                  onChange={(event) => updateBaseField('currencyCode', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency} className="bg-[#091427] text-white">
                      {currency} - {CURRENCY_META[currency].label}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-white/45">
                  This is the original currency stored on the listing. Browse prices can be converted later for buyers.
                </span>
              </label>
              <label className="text-sm text-white/75">
                Price ({base.currencyCode}) *
                <input
                  type="number"
                  min="1"
                  value={base.price}
                  onChange={(event) => updateBaseField('price', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                  placeholder="e.g. 899"
                />
                <span className="mt-1 block text-xs text-white/45">
                  {wizardConfig.basicInfo.priceHelper}
                </span>
              </label>
              <label className="text-sm text-white/75 md:col-span-2">
                Original price ({base.currencyCode}, optional)
                <input
                  type="number"
                  min="1"
                  value={base.originalPrice}
                  onChange={(event) => updateBaseField('originalPrice', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                  placeholder={wizardConfig.basicInfo.originalPricePlaceholder}
                />
              </label>
            </div>
          </SectionCard>
        ) : null}

        {step === 2 && category ? (
          <SectionCard
            eyebrow={wizardConfig.specsSection.eyebrow}
            title={wizardConfig.specsSection.title}
            copy={wizardConfig.specsSection.copy}
          >
            {isAppleIphone ? (
              <div className="mb-5 rounded-2xl border border-[#67F2FF]/22 bg-[#67F2FF]/8 p-4 text-sm text-white/75">
                Apple iPhone detected. Keep storage and battery health accurate because those details matter most for iPhone buyers.
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{deviceSpecFields.map(renderSpecField)}</div>
          </SectionCard>
        ) : null}

        {step === 3 ? (
          <>
            <SectionCard
              eyebrow={wizardConfig.conditionSection.eyebrow}
              title={wizardConfig.conditionSection.title}
              copy={wizardConfig.conditionSection.copy}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="text-sm text-white/75">
                  <div className="flex items-center gap-2">
                    <span>Condition *</span>
                    <ConditionHelpPopover />
                  </div>
                  <select
                    value={base.condition}
                    onChange={(event) => updateBaseField('condition', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                  >
                    {LISTING_CONDITIONS.map((value) => (
                      <option key={value} value={value} className="bg-[#091427] text-white">
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">{conditionFields.map(renderSpecField)}</div>
            </SectionCard>

            <SectionCard
              eyebrow={wizardConfig.privateSection.eyebrow}
              title={wizardConfig.privateSection.title}
              copy={wizardConfig.privateSection.copy}
            >
              <div className={`grid grid-cols-1 gap-4 ${wizardConfig.privateSection.showImei ? 'md:grid-cols-2' : ''}`}>
                {wizardConfig.privateSection.showImei ? (
                  <label className="text-sm text-white/75">
                    {wizardConfig.privateSection.imeiLabel}
                    <input
                      value={privateIdentifiers.imei}
                      onChange={(event) => updatePrivateField('imei', event.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                      placeholder={wizardConfig.privateSection.imeiPlaceholder}
                    />
                  </label>
                ) : null}
                <label className="text-sm text-white/75">
                  {wizardConfig.privateSection.serialLabel}
                  <input
                    value={privateIdentifiers.serialNumber}
                    onChange={(event) => updatePrivateField('serialNumber', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                    placeholder={wizardConfig.privateSection.serialPlaceholder}
                  />
                </label>
              </div>
            </SectionCard>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <SectionCard
              eyebrow={wizardConfig.photosSection.eyebrow}
              title={wizardConfig.photosSection.title}
              copy={wizardConfig.photosSection.copy}
            >
              <div className="rounded-[1.6rem] border border-dashed border-white/18 bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(255,255,255,0.02))] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Photos</p>
                    <p className="mt-1 text-sm text-white/62">
                      {photos.length} / {MAX_LISTING_PHOTOS} photos uploaded
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-white/45">
                      {wizardConfig.photosSection.uploadHint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addPhotoInputRef.current?.click()}
                    disabled={photos.length >= MAX_LISTING_PHOTOS || Boolean(uploadState)}
                    className="rounded-full bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {uploadState ? `Uploading ${uploadState.current}/${uploadState.total}...` : 'Upload photos'}
                  </button>
                </div>

                <input ref={addPhotoInputRef} type="file" accept="image/*" multiple onChange={onSelectPhotos} className="hidden" />
                <input ref={replacePhotoInputRef} type="file" accept="image/*" onChange={onSelectPhotos} className="hidden" />

                {photos.length > 0 ? (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        draggable
                        onDragStart={() => setDraggedPhotoId(photo.id)}
                        onDragEnd={() => setDraggedPhotoId(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          const fromIndex = photos.findIndex((item) => item.id === draggedPhotoId)
                          movePhoto(fromIndex, index)
                          setDraggedPhotoId(null)
                        }}
                        className={`overflow-hidden rounded-2xl border bg-white/[0.03] ${
                          draggedPhotoId === photo.id ? 'border-[#67F2FF]/35' : 'border-white/12'
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image src={photo.url} alt={photo.name} fill unoptimized className="object-cover" />
                          <div className="absolute left-2 top-2 rounded-full bg-[#091427]/82 px-2 py-1 text-[11px] font-semibold text-white">
                            {index === 0 ? 'Cover' : `Photo ${index + 1}`}
                          </div>
                        </div>
                        <div className="space-y-2 p-3">
                          <p className="truncate text-xs text-white/60">{photo.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {index > 0 ? (
                              <button type="button" onClick={() => movePhoto(index, 0)} className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-white/75">
                                Make cover
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                replacePhotoIdRef.current = photo.id
                                replacePhotoInputRef.current?.click()
                              }}
                              className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-white/75"
                            >
                              Replace
                            </button>
                            <button type="button" onClick={() => setPhotos((prev) => prev.filter((item) => item.id !== photo.id))} className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-white/75">
                              Remove
                            </button>
                            {index > 0 ? (
                              <button type="button" onClick={() => movePhoto(index, index - 1)} className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-white/75">
                                Move left
                              </button>
                            ) : null}
                            {index < photos.length - 1 ? (
                              <button type="button" onClick={() => movePhoto(index, index + 1)} className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] text-white/75">
                                Move right
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-8 text-center text-sm text-white/58">
                    {wizardConfig.photosSection.emptyState}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              eyebrow={wizardConfig.descriptionSection.eyebrow}
              title={wizardConfig.descriptionSection.title}
              copy={wizardConfig.descriptionSection.copy}
            >
              <div className="grid grid-cols-1 gap-4">
                <label className="text-sm text-white/75">
                  Description *
                  <textarea
                    value={base.description}
                    onChange={(event) => updateBaseField('description', event.target.value)}
                    className="mt-2 h-36 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                    placeholder={wizardConfig.descriptionSection.descriptionPlaceholder}
                  />
                </label>
                <label className="text-sm text-white/75">
                  Seller notes (optional)
                  <textarea
                    value={base.sellerNotes}
                    onChange={(event) => updateBaseField('sellerNotes', event.target.value)}
                    className="mt-2 h-24 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"
                    placeholder={wizardConfig.descriptionSection.sellerNotesPlaceholder}
                  />
                </label>
              </div>
            </SectionCard>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <SectionCard
              eyebrow={wizardConfig.shippingSection.eyebrow}
              title={wizardConfig.shippingSection.title}
              copy={wizardConfig.shippingSection.copy}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ShippingCard title="Basic" copy="A fast domestic and international setup." active={shipping.mode === 'basic'} onClick={() => updateShippingField('mode', 'basic')} />
                <ShippingCard title="Advanced" copy="Custom shipping prices for each country you support." active={shipping.mode === 'advanced'} onClick={() => updateShippingField('mode', 'advanced')} />
                <ShippingCard title="No shipping" copy="Keep the listing saved while checkout stays off." active={shipping.mode === 'none'} onClick={() => updateShippingField('mode', 'none')} />
              </div>

              {shipping.mode !== 'none' ? (
                <label className="mt-5 block text-sm text-white/75">
                  Ships from *
                  <select value={shipping.sellerCountryCode} onChange={(event) => updateShippingField('sellerCountryCode', event.target.value)} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none">
                    <option value="" className="bg-[#091427] text-white">Choose country</option>
                    {COUNTRY_OPTIONS.map((country) => <option key={country.code} value={country.code} className="bg-[#091427] text-white">{country.name}</option>)}
                  </select>
                </label>
              ) : null}

              {shipping.mode === 'basic' ? (
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-white">Domestic shipping</p>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <label className="text-sm text-white/75">Price ({base.currencyCode})<input type="number" min="0" value={shipping.domesticAmount} onChange={(event) => updateShippingField('domesticAmount', event.target.value)} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="18" /></label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm text-white/75">Min days<input type="number" min="1" value={shipping.domesticMinDays} onChange={(event) => updateShippingField('domesticMinDays', event.target.value)} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="2" /></label>
                        <label className="text-sm text-white/75">Max days<input type="number" min="1" value={shipping.domesticMaxDays} onChange={(event) => updateShippingField('domesticMaxDays', event.target.value)} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="5" /></label>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-white">International shipping</p>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <label className="text-sm text-white/75">Price ({base.currencyCode})<input type="number" min="0" value={shipping.internationalAmount} onChange={(event) => updateShippingField('internationalAmount', event.target.value)} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="45" /></label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="text-sm text-white/75">Min days<input type="number" min="1" value={shipping.internationalMinDays} onChange={(event) => updateShippingField('internationalMinDays', event.target.value)} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="5" /></label>
                        <label className="text-sm text-white/75">Max days<input type="number" min="1" value={shipping.internationalMaxDays} onChange={(event) => updateShippingField('internationalMaxDays', event.target.value)} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="12" /></label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {shipping.mode === 'advanced' ? (
                <div className="mt-5 space-y-4">
                  {shipping.advancedRates.map((rate, index) => (
                    <div key={rate.id} className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">Country rate {index + 1}</p>
                        <button type="button" onClick={() => removeShippingRate(rate.id)} className="rounded-full border border-white/16 px-3 py-1 text-xs text-white/70">Remove</button>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                        <label className="text-sm text-white/75 md:col-span-2">Destination country<select value={rate.countryCode} onChange={(event) => updateShippingRate(rate.id, { countryCode: event.target.value })} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none"><option value="" className="bg-[#091427] text-white">Choose country</option>{COUNTRY_OPTIONS.map((country) => <option key={country.code} value={country.code} className="bg-[#091427] text-white">{country.name}</option>)}</select></label>
                        <label className="text-sm text-white/75">Price ({base.currencyCode})<input type="number" min="0" value={rate.amount} onChange={(event) => updateShippingRate(rate.id, { amount: event.target.value })} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="30" /></label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-sm text-white/75">Min<input type="number" min="1" value={rate.minDays} onChange={(event) => updateShippingRate(rate.id, { minDays: event.target.value })} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="4" /></label>
                          <label className="text-sm text-white/75">Max<input type="number" min="1" value={rate.maxDays} onChange={(event) => updateShippingRate(rate.id, { maxDays: event.target.value })} className="mt-2 w-full rounded-xl border border-white/14 bg-[#091427] px-4 py-3 text-white outline-none" placeholder="9" /></label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addShippingRate} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/80">Add another country price</button>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              eyebrow={wizardConfig.reviewSection.eyebrow}
              title={wizardConfig.reviewSection.title}
              copy={wizardConfig.reviewSection.copy}
            >
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{category}</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{base.title}</h3>
                      </div>
                      <div className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs text-white/74">{base.condition}</div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-end gap-2">
                      <p className="text-2xl font-semibold text-white">{formatPrice(Number(base.price || 0), base.currencyCode)}</p>
                      {base.originalPrice ? <p className="pb-1 text-sm text-white/45 line-through">{formatPrice(Number(base.originalPrice), base.currencyCode)}</p> : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {reviewSpecs.map((item) => (
                        <span key={item.key} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/65">
                          {item.label}: {item.value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-white">Shipping preview</p>
                    <div className="mt-3 space-y-2 text-sm text-white/68">{shippingSummary.map((item) => <p key={item}>{item}</p>)}</div>
                  </div>
                  {listingTips.length > 0 ? (
                    <div className="rounded-2xl border border-[#67F2FF]/18 bg-[#67F2FF]/8 p-4 text-sm text-white/68">
                      {listingTips.map((tip) => <p key={tip}>{tip}</p>)}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-white">Cover photo</p>
                    {photos[0] ? (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                        <div className="relative aspect-[4/3]">
                          <Image src={photos[0].url} alt={photos[0].name} fill unoptimized className="object-cover" />
                        </div>
                      </div>
                    ) : <p className="mt-3 text-sm text-white/55">Add photos to preview the cover image.</p>}
                    <p className="mt-3 text-xs text-white/48">{photos.length} total photo{photos.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-white">Description preview</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/62">{base.description || 'Add a description in the previous step.'}</p>
                  </div>
                </div>
              </div>

              <form action={(formData) => { if (validateStep(totalSteps)) formAction(formData) }} className="mt-5 space-y-3">
                <input type="hidden" name="listing_id" value={initialListing?.id ?? ''} />
                <input type="hidden" name="category" value={category ?? ''} />
                <input type="hidden" name="title" value={base.title} />
                <input type="hidden" name="brand" value={base.brand} />
                <input type="hidden" name="model" value={base.model} />
                <input type="hidden" name="currency_code" value={base.currencyCode} />
                <input type="hidden" name="price" value={base.price} />
                <input type="hidden" name="original_price" value={base.originalPrice} />
                <input type="hidden" name="condition" value={base.condition} />
                <input type="hidden" name="listing_images" value={JSON.stringify(photos.map((photo) => photo.url))} />
                <input type="hidden" name="description" value={base.description} />
                <input type="hidden" name="seller_notes" value={base.sellerNotes} />
                {wizardConfig.privateSection.showImei ? (
                  <input type="hidden" name="private_imei" value={privateIdentifiers.imei} />
                ) : null}
                <input type="hidden" name="private_serial_number" value={privateIdentifiers.serialNumber} />
                <input type="hidden" name="shipping_mode" value={shipping.mode} />
                <input type="hidden" name="shipping_seller_country_code" value={shipping.sellerCountryCode} />
                <input type="hidden" name="shipping_domestic_amount" value={shipping.domesticAmount} />
                <input type="hidden" name="shipping_domestic_min_days" value={shipping.domesticMinDays} />
                <input type="hidden" name="shipping_domestic_max_days" value={shipping.domesticMaxDays} />
                <input type="hidden" name="shipping_international_amount" value={shipping.internationalAmount} />
                <input type="hidden" name="shipping_international_min_days" value={shipping.internationalMinDays} />
                <input type="hidden" name="shipping_international_max_days" value={shipping.internationalMaxDays} />
                <input type="hidden" name="shipping_advanced_rates" value={JSON.stringify(shipping.advancedRates.filter((rate) => rate.countryCode && rate.amount).map((rate) => ({ countryCode: rate.countryCode, countryName: getCountryName(rate.countryCode), amount: Number(rate.amount), minDays: rate.minDays ? Number(rate.minDays) : undefined, maxDays: rate.maxDays ? Number(rate.maxDays) : undefined })))} />
                {Object.entries(submittedSpecs).map(([key, value]) => <input key={key} type="hidden" name={`spec_${key}`} value={value} />)}
                <button type="submit" disabled={pending || Boolean(uploadState)} className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                  {pending ? (isEditing ? 'Saving listing...' : 'Submitting listing...') : isEditing ? 'Save listing changes' : 'Submit for review'}
                </button>
              </form>
            </SectionCard>
          </>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          disabled={step === 1}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 disabled:opacity-40"
        >
          Back
        </button>
        {step < totalSteps ? (
          <button
            type="button"
            onClick={goNext}
            disabled={Boolean(uploadState)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {uploadState ? 'Uploading photos...' : 'Continue'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
