'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { SupabaseClient, User } from '@supabase/supabase-js'
import {
  getDerivedVerificationStatus,
  hasRequiredSellerFields,
} from '@/lib/dashboard-data'
import { getOrCreateProfile } from '@/lib/dashboard-server'
import { createClient } from '@/lib/supabase/server'
import { ProfileRecord } from '@/types/dashboard'

function assertConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || !url.startsWith('https://')) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local'
    )
  }
}

function cleanString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function buildVerificationErrorRedirect(message: string): string {
  return `/dashboard?tab=verification&verification_error=${encodeURIComponent(message)}&t=${Date.now().toString()}`
}

function toStorageSafeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function readMetadataProfile(user: User): Record<string, unknown> {
  const metadata =
    user.user_metadata && typeof user.user_metadata === 'object' && !Array.isArray(user.user_metadata)
      ? (user.user_metadata as Record<string, unknown>)
      : {}

  const sellerProfile =
    metadata.seller_profile && typeof metadata.seller_profile === 'object' && !Array.isArray(metadata.seller_profile)
      ? (metadata.seller_profile as Record<string, unknown>)
      : {}

  return sellerProfile
}

async function persistProfileToMetadata(
  supabase: SupabaseClient,
  user: User,
  patch: Partial<ProfileRecord>
) {
  const metadata =
    user.user_metadata && typeof user.user_metadata === 'object' && !Array.isArray(user.user_metadata)
      ? (user.user_metadata as Record<string, unknown>)
      : {}

  const nextSellerProfile = {
    ...readMetadataProfile(user),
    ...patch,
    id: user.id,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      ...metadata,
      seller_profile: nextSellerProfile,
    },
  })

  if (error) {
    throw new Error(error.message)
  }
}

async function getAuthedContext() {
  assertConfigured()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return { supabase, user }
}

function getMissingVerificationRequirements(profile: ProfileRecord): string[] {
  const missing: string[] = []
  if (!profile.full_name) missing.push('Full name')
  if (!profile.phone) missing.push('Phone number')
  if (!profile.country) missing.push('Country')
  if (!profile.city) missing.push('City / Province')
  if (!profile.address_line_1) missing.push('Address line 1')
  if (!profile.postal_code) missing.push('Postal code')
  return missing
}

async function persistProfilePatch(
  patch: Partial<ProfileRecord>,
  options: { resetPhoneVerified?: boolean; redirectTab: 'verification' | 'settings' }
) {
  const { supabase, user } = await getAuthedContext()
  const existing = await getOrCreateProfile(supabase, user)

  const merged: ProfileRecord = {
    ...existing,
    ...patch,
    phone_verified:
      options.resetPhoneVerified && patch.phone !== undefined && patch.phone !== existing.phone
        ? false
        : existing.phone_verified,
    updated_at: new Date().toISOString(),
  }

  const requiredReady = hasRequiredSellerFields(merged) && Boolean(user.email_confirmed_at)
  const derived = getDerivedVerificationStatus(existing.verification_status, requiredReady)

  const payload = {
    id: user.id,
    full_name: merged.full_name,
    phone: merged.phone,
    phone_verified: merged.phone_verified,
    country: merged.country,
    city: merged.city,
    address_line_1: merged.address_line_1,
    postal_code: merged.postal_code,
    avatar_url: merged.avatar_url,
    document_url: merged.document_url,
    verification_status: derived.verification_status,
    seller_enabled: derived.seller_enabled,
    updated_at: merged.updated_at,
  }

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
  if (error) {
    await persistProfileToMetadata(supabase, user, {
      ...merged,
      verification_status: derived.verification_status,
      seller_enabled: derived.seller_enabled,
    })

    revalidatePath('/dashboard')
    const token = Date.now().toString()
    if (options.redirectTab === 'settings') {
      redirect(`/dashboard?tab=settings&saved=settings&t=${token}`)
    }
    redirect(`/dashboard?tab=verification&saved=profile&t=${token}`)
  }

  revalidatePath('/dashboard')
  const token = Date.now().toString()
  if (options.redirectTab === 'settings') {
    redirect(`/dashboard?tab=settings&saved=settings&t=${token}`)
  }
  redirect(`/dashboard?tab=verification&saved=profile&t=${token}`)
}

export async function updateContactInfo(formData: FormData) {
  await persistProfilePatch(
    {
      full_name: cleanString(formData.get('full_name')),
      phone: cleanString(formData.get('phone')),
    },
    { resetPhoneVerified: true, redirectTab: 'verification' }
  )
}

export async function updateAddressInfo(formData: FormData) {
  await persistProfilePatch(
    {
      country: cleanString(formData.get('country')),
      city: cleanString(formData.get('city')),
      address_line_1: cleanString(formData.get('address_line_1')),
      postal_code: cleanString(formData.get('postal_code')),
    },
    { redirectTab: 'verification' }
  )
}

export async function updateProfileCompletion(formData: FormData) {
  await persistProfilePatch(
    {
      full_name: cleanString(formData.get('full_name')),
      avatar_url: cleanString(formData.get('avatar_url')),
    },
    { redirectTab: 'verification' }
  )
}

export async function uploadSellerDocument(formData: FormData) {
  const file = formData.get('document')
  if (!(file instanceof File) || file.size === 0) {
    redirect('/dashboard?tab=verification')
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF, JPG, or PNG documents are allowed.')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Document must be 10MB or smaller.')
  }

  const { supabase, user } = await getAuthedContext()
  const existing = await getOrCreateProfile(supabase, user)

  const filePath = `${user.id}/${Date.now()}-${toStorageSafeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage
    .from('seller-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const merged: ProfileRecord = {
    ...existing,
    document_url: filePath,
    updated_at: new Date().toISOString(),
  }
  const requiredReady = hasRequiredSellerFields(merged) && Boolean(user.email_confirmed_at)
  const derived = getDerivedVerificationStatus(existing.verification_status, requiredReady)

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name: merged.full_name,
      phone: merged.phone,
      phone_verified: merged.phone_verified,
      country: merged.country,
      city: merged.city,
      address_line_1: merged.address_line_1,
      postal_code: merged.postal_code,
      avatar_url: merged.avatar_url,
      document_url: merged.document_url,
      verification_status: derived.verification_status,
      seller_enabled: derived.seller_enabled,
      updated_at: merged.updated_at,
    },
    { onConflict: 'id' }
  )

  if (error) {
    await persistProfileToMetadata(supabase, user, {
      ...merged,
      verification_status: derived.verification_status,
      seller_enabled: derived.seller_enabled,
    })

    revalidatePath('/dashboard')
    redirect(`/dashboard?tab=verification&saved=document&t=${Date.now().toString()}`)
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard?tab=verification&saved=document&t=${Date.now().toString()}`)
}

export async function updateAccountSettings(formData: FormData) {
  await persistProfilePatch(
    {
      full_name: cleanString(formData.get('full_name')),
      phone: cleanString(formData.get('phone')),
      country: cleanString(formData.get('country')),
      city: cleanString(formData.get('city')),
      address_line_1: cleanString(formData.get('address_line_1')),
      postal_code: cleanString(formData.get('postal_code')),
      avatar_url: cleanString(formData.get('avatar_url')),
    },
    { resetPhoneVerified: true, redirectTab: 'settings' }
  )
}

export async function completeSellerVerification() {
  const { supabase, user } = await getAuthedContext()
  const profile = await getOrCreateProfile(supabase, user)

  if (profile.verification_status === 'rejected') {
    redirect(buildVerificationErrorRedirect('Your seller verification is currently rejected. Update your profile details and retry.'))
  }

  const missing = getMissingVerificationRequirements(profile)
  if (missing.length > 0) {
    redirect(buildVerificationErrorRedirect(`Complete these required items first: ${missing.join(', ')}`))
  }

  const derived = getDerivedVerificationStatus(profile.verification_status, true)
  const updated: ProfileRecord = {
    ...profile,
    verification_status: derived.verification_status,
    seller_enabled: derived.seller_enabled,
    updated_at: new Date().toISOString(),
  }

  const payload = {
    id: user.id,
    full_name: updated.full_name,
    phone: updated.phone,
    phone_verified: updated.phone_verified,
    country: updated.country,
    city: updated.city,
    address_line_1: updated.address_line_1,
    postal_code: updated.postal_code,
    avatar_url: updated.avatar_url,
    document_url: updated.document_url,
    verification_status: updated.verification_status,
    seller_enabled: updated.seller_enabled,
    updated_at: updated.updated_at,
  }

  const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
  if (error) {
    await persistProfileToMetadata(supabase, user, updated)
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard?tab=verification&saved=verification_complete&t=${Date.now().toString()}`)
}

export async function resendVerificationEmail() {
  const { supabase, user } = await getAuthedContext()
  if (!user.email) {
    redirect(buildVerificationErrorRedirect('No email address is attached to this account.'))
  }

  if (user.email_confirmed_at) {
    redirect(`/dashboard?tab=verification&saved=email_already_verified&t=${Date.now().toString()}`)
  }

  const siteUrlRaw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL
  const emailRedirectTo = siteUrlRaw ? `${siteUrlRaw.replace(/\/$/, '')}/auth` : undefined

  const resendPayload: {
    type: 'signup'
    email: string
    options?: { emailRedirectTo: string }
  } = {
    type: 'signup',
    email: user.email,
  }

  if (emailRedirectTo) {
    resendPayload.options = { emailRedirectTo }
  }

  const { error } = await supabase.auth.resend(resendPayload)
  if (error) {
    redirect(buildVerificationErrorRedirect(`Could not send verification email: ${error.message}`))
  }

  redirect(`/dashboard?tab=verification&saved=email_sent&t=${Date.now().toString()}`)
}
