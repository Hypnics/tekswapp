'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChangeEvent, useActionState, useMemo, useState } from 'react'
import {
  CATEGORY_SPEC_FIELDS,
  LISTING_CONDITIONS,
  MARKETPLACE_CATEGORIES,
} from '@/lib/marketplace-config'
import { isValidImageSrcInput } from '@/lib/image-src'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Category } from '@/types/listing'
import { publishListing } from '@/app/sell/actions'
import { initialPublishListingState } from '@/app/sell/state'

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

const IMAGE_FILE_SIZE_LIMIT = 8 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

function toStorageSafeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function stepLabel(step: number): string {
  if (step === 1) return 'Device type'
  if (step === 2) return 'Listing details'
  if (step === 3) return 'Device specs'
  return 'Review and submit'
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

  const activeSpecFields = useMemo(() => {
    if (!category) return []
    return CATEGORY_SPEC_FIELDS[category]
  }, [category])

  function updateBaseField<K extends keyof BaseListingForm>(key: K, value: BaseListingForm[K]) {
    setBase((prev) => ({ ...prev, [key]: value }))
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
        if (lower.includes('bucket')) {
          setLocalError('Supabase setup required: create the "listing-images" storage bucket first.')
        } else {
          setLocalError(`Image upload failed: ${uploadError.message}`)
        }
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

  function validateStep3(): boolean {
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

    if (step === 2) {
      if (!validateStep2()) return
      setStep(3)
      return
    }

    if (step === 3) {
      if (!validateStep3()) return
      setStep(4)
    }
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
          <p className="mt-1 text-sm text-white/65">Step {step} of 4: {stepLabel(step)}</p>
        </div>
        <Link
          href="/listings"
          className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 hover:text-white"
        >
          View marketplace
        </Link>
      </div>

      <div className="mt-5 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-[#2563EB] transition-all"
          style={{ width: `${(step / 4) * 100}%` }}
        />
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
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Select device type</h3>
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
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="text-sm text-white/75">
              Listing title *
              <input
                value={base.title}
                onChange={(event) => updateBaseField('title', event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
                placeholder="e.g. iPhone 15 Pro Max 256GB"
              />
            </label>
            <label className="text-sm text-white/75">
              Brand *
              <input
                value={base.brand}
                onChange={(event) => updateBaseField('brand', event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
                placeholder="e.g. Apple"
              />
            </label>
            <label className="text-sm text-white/75">
              Model *
              <input
                value={base.model}
                onChange={(event) => updateBaseField('model', event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
                placeholder="e.g. iPhone 15 Pro Max"
              />
            </label>
            <label className="text-sm text-white/75">
              Condition *
              <select
                value={base.condition}
                onChange={(event) => updateBaseField('condition', event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
              >
                {LISTING_CONDITIONS.map((value) => (
                  <option key={value} value={value} className="bg-[#0B0F1A] text-white">
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-white/75">
              Price (USD) *
              <input
                type="number"
                min="1"
                value={base.price}
                onChange={(event) => updateBaseField('price', event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
                placeholder="e.g. 899"
              />
            </label>
            <label className="text-sm text-white/75">
              Original price (optional)
              <input
                type="number"
                min="1"
                value={base.originalPrice}
                onChange={(event) => updateBaseField('originalPrice', event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
                placeholder="e.g. 1199"
              />
            </label>
            <div className="md:col-span-2">
              <p className="text-sm text-white/75">Cover photo *</p>
              <label className="mt-1 flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/25 bg-white/[0.03] px-4 py-5 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectImage}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <span className="text-sm text-white/75">
                  {uploadingImage ? 'Uploading image...' : 'Tap to add photo from your device'}
                </span>
              </label>

              {base.image && (
                <div className="mt-3 rounded-lg border border-white/12 bg-white/[0.02] p-3">
                  <Image
                    src={base.image}
                    alt="Listing preview"
                    width={1200}
                    height={800}
                    unoptimized
                    className="h-32 w-full rounded-md object-cover sm:h-40"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-white/60">
                      {uploadedImageName ?? 'Uploaded cover image'}
                    </p>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="rounded-md border border-white/20 px-2 py-1 text-xs text-white/80 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
            <label className="md:col-span-2 text-sm text-white/75">
              Description *
              <textarea
                value={base.description}
                onChange={(event) => updateBaseField('description', event.target.value)}
                className="mt-1 h-28 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
                placeholder="Describe condition, included items, and any defects."
              />
            </label>
            <label className="md:col-span-2 text-sm text-white/75">
              Seller notes (optional)
              <textarea
                value={base.sellerNotes}
                onChange={(event) => updateBaseField('sellerNotes', event.target.value)}
                className="mt-1 h-24 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
                placeholder="Shipping note, extras, pickup details, etc."
              />
            </label>
          </div>
        )}

        {step === 3 && category && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
              Required specs for {category}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeSpecFields.map((field) => (
                <label key={field.key} className="text-sm text-white/75">
                  {field.label}
                  {field.required ? ' *' : ' (optional)'}
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={specs[field.key] ?? ''}
                    onChange={(event) => updateSpecField(field.key, event.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none"
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Listing summary</h3>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/75 sm:grid-cols-2">
                <p><span className="text-white/45">Category:</span> {category}</p>
                <p><span className="text-white/45">Condition:</span> {base.condition}</p>
                <p><span className="text-white/45">Title:</span> {base.title}</p>
                <p><span className="text-white/45">Price:</span> ${base.price}</p>
                <p><span className="text-white/45">Brand:</span> {base.brand}</p>
                <p><span className="text-white/45">Model:</span> {base.model}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/12 bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Device specs</h3>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/75 sm:grid-cols-2">
                {Object.entries(specs).map(([key, value]) => (
                  <p key={key}>
                    <span className="text-white/45">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}:
                    </span>{' '}
                    {value}
                  </p>
                ))}
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
              {Object.entries(specs).map(([key, value]) => (
                <input key={key} type="hidden" name={`spec_${key}`} value={value} />
              ))}

              <button
                type="submit"
                disabled={pending || uploadingImage}
                className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? 'Submitting listing...' : uploadingImage ? 'Uploading image...' : 'Submit for review'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step < 4 && (
          <button
            type="button"
            onClick={goNext}
            disabled={uploadingImage}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white"
          >
            {uploadingImage ? 'Uploading image...' : 'Continue'}
          </button>
        )}
      </div>
    </section>
  )
}
