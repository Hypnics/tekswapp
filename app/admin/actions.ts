'use server'

import { revalidatePath } from 'next/cache'
import { requireOwnerContext } from '@/lib/owner-auth'
import { createAdminClient } from '@/lib/supabase/admin'

function cleanString(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeEmail(value: FormDataEntryValue | null): string {
  return cleanString(value).toLowerCase()
}

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) return 'Password must be at least 12 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one symbol.'
  return null
}

function readListingId(formData: FormData): string {
  const id = cleanString(formData.get('listing_id'))
  if (!id) {
    throw new Error('Missing listing id.')
  }
  return id
}

export async function approvePendingListing(formData: FormData) {
  await requireOwnerContext()
  const adminClient = createAdminClient()
  const listingId = readListingId(formData)

  const { data, error } = await adminClient
    .from('listings')
    .update({ status: 'active' })
    .eq('id', listingId)
    .eq('status', 'pending_review')
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(`Could not approve listing: ${error.message}`)
  }
  if (!data) {
    throw new Error('Listing was not approved. It may no longer be pending review.')
  }

  revalidatePath('/')
  revalidatePath('/listings')
  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath(`/product/${listingId}`)
  revalidatePath('/admin')
}

export async function rejectPendingListing(formData: FormData) {
  await requireOwnerContext()
  const adminClient = createAdminClient()
  const listingId = readListingId(formData)

  const { data, error } = await adminClient
    .from('listings')
    .update({ status: 'draft' })
    .eq('id', listingId)
    .eq('status', 'pending_review')
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(`Could not reject listing: ${error.message}`)
  }
  if (!data) {
    throw new Error('Listing was not rejected. It may no longer be pending review.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath('/admin')
}

const LISTING_STATUSES = new Set(['active', 'draft', 'sold', 'pending_review', 'paused'])
type ListingStatus = 'active' | 'draft' | 'sold' | 'pending_review' | 'paused'

function parseListingStatus(value: FormDataEntryValue | null): ListingStatus {
  const status = cleanString(value)
  if (!LISTING_STATUSES.has(status)) {
    throw new Error('Invalid listing status.')
  }
  return status as ListingStatus
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  return cleanString(value).toLowerCase() === 'true'
}

const VERIFICATION_STATUSES = new Set(['unverified', 'in_review', 'verified', 'rejected'])
type ProfileVerificationStatus = 'unverified' | 'in_review' | 'verified' | 'rejected'

const PRIVILEGED_ROLES = new Set(['owner', 'staff'])
type PrivilegedRole = 'owner' | 'staff'

function parseVerificationStatus(value: FormDataEntryValue | null): ProfileVerificationStatus {
  const status = cleanString(value)
  if (!VERIFICATION_STATUSES.has(status)) {
    throw new Error('Invalid verification status.')
  }
  return status as ProfileVerificationStatus
}

function parsePrivilegedRole(value: FormDataEntryValue | null): PrivilegedRole {
  const role = cleanString(value)
  if (!PRIVILEGED_ROLES.has(role)) {
    throw new Error('Invalid role.')
  }
  return role as PrivilegedRole
}

async function findAuthUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const adminClient = createAdminClient()
  let page = 1
  const perPage = 200

  while (page <= 20) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
    if (error) {
      throw new Error(`Could not query auth users: ${error.message}`)
    }

    const users = data?.users ?? []
    const found = users.find((user) => user.email?.toLowerCase() === email)
    if (found?.id && found.email) {
      return { id: found.id, email: found.email }
    }

    if (users.length < perPage) break
    page += 1
  }

  return null
}

async function assignPrivilegedRole(userId: string, email: string, role: PrivilegedRole) {
  const adminClient = createAdminClient()

  if (role === 'owner') {
    const { error: ownerUpsertError } = await adminClient
      .from('owner_accounts')
      .upsert({ user_id: userId, email }, { onConflict: 'user_id' })
    if (ownerUpsertError) {
      throw new Error(`Could not assign owner role: ${ownerUpsertError.message}`)
    }

    const { error: removeStaffError } = await adminClient.from('staff_accounts').delete().eq('user_id', userId)
    if (removeStaffError) {
      throw new Error(`Could not remove existing staff role: ${removeStaffError.message}`)
    }
    return
  }

  const { error: staffUpsertError } = await adminClient
    .from('staff_accounts')
    .upsert({ user_id: userId, email }, { onConflict: 'user_id' })
  if (staffUpsertError) {
    throw new Error(`Could not assign staff role: ${staffUpsertError.message}`)
  }

  const { error: removeOwnerError } = await adminClient.from('owner_accounts').delete().eq('user_id', userId)
  if (removeOwnerError) {
    throw new Error(`Could not remove existing owner role: ${removeOwnerError.message}`)
  }
}

export async function setListingStatus(formData: FormData) {
  await requireOwnerContext()
  const adminClient = createAdminClient()
  const listingId = readListingId(formData)
  const status = parseListingStatus(formData.get('status'))

  const { data, error } = await adminClient
    .from('listings')
    .update({ status })
    .eq('id', listingId)
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(`Could not update listing status: ${error.message}`)
  }
  if (!data) {
    throw new Error('Listing not found for status update.')
  }

  revalidatePath('/')
  revalidatePath('/listings')
  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath(`/product/${listingId}`)
  revalidatePath('/admin')
}

export async function deleteListingAsOwner(formData: FormData) {
  await requireOwnerContext()
  const adminClient = createAdminClient()
  const listingId = readListingId(formData)

  const { data, error } = await adminClient
    .from('listings')
    .delete()
    .eq('id', listingId)
    .select('id')
    .maybeSingle()
  if (error) {
    throw new Error(`Could not delete listing: ${error.message}`)
  }
  if (!data) {
    throw new Error('Listing not found for deletion.')
  }

  revalidatePath('/')
  revalidatePath('/listings')
  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath(`/product/${listingId}`)
  revalidatePath('/admin')
}

export async function setSellerVerificationState(formData: FormData) {
  await requireOwnerContext()
  const adminClient = createAdminClient()
  const userId = cleanString(formData.get('user_id'))
  if (!userId) {
    throw new Error('Missing user id.')
  }

  const verificationStatus = parseVerificationStatus(formData.get('verification_status'))
  const sellerEnabled = parseBoolean(formData.get('seller_enabled'))

  const { data, error } = await adminClient
    .from('profiles')
    .update({
      verification_status: verificationStatus,
      seller_enabled: sellerEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id')
    .maybeSingle()

  if (error) {
    throw new Error(`Could not update seller verification: ${error.message}`)
  }
  if (!data) {
    throw new Error('Seller profile not found for verification update.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath('/admin')
}

export async function createPrivilegedUser(formData: FormData) {
  await requireOwnerContext()

  const adminClient = createAdminClient()
  const email = normalizeEmail(formData.get('email'))
  const password = cleanString(formData.get('password'))
  const fullName = cleanString(formData.get('full_name'))
  const role = parsePrivilegedRole(formData.get('role'))

  if (!validateEmail(email)) {
    throw new Error('Enter a valid email address.')
  }

  const passwordValidationError = validatePasswordStrength(password)
  if (passwordValidationError) {
    throw new Error(passwordValidationError)
  }

  const createPayload: {
    email: string
    password: string
    email_confirm: boolean
    user_metadata?: { name: string }
  } = {
    email,
    password,
    email_confirm: true,
  }

  if (fullName) {
    createPayload.user_metadata = { name: fullName }
  }

  const { data, error } = await adminClient.auth.admin.createUser(createPayload)
  if (error) {
    throw new Error(`Could not create user: ${error.message}`)
  }

  const userId = data.user?.id
  const userEmail = data.user?.email
  if (!userId || !userEmail) {
    throw new Error('Supabase did not return the created user.')
  }

  await assignPrivilegedRole(userId, userEmail.toLowerCase(), role)

  revalidatePath('/admin')
  revalidatePath('/staff')
}

export async function updatePrivilegedUserAccess(formData: FormData) {
  await requireOwnerContext()

  const adminClient = createAdminClient()
  const email = normalizeEmail(formData.get('email'))
  const role = parsePrivilegedRole(formData.get('role'))
  const newPassword = cleanString(formData.get('new_password'))

  if (!validateEmail(email)) {
    throw new Error('Enter a valid email address.')
  }

  const authUser = await findAuthUserByEmail(email)
  if (!authUser) {
    throw new Error('User not found in auth.users. Create the account first.')
  }

  if (newPassword) {
    const passwordValidationError = validatePasswordStrength(newPassword)
    if (passwordValidationError) {
      throw new Error(passwordValidationError)
    }

    const { error } = await adminClient.auth.admin.updateUserById(authUser.id, {
      password: newPassword,
    })
    if (error) {
      throw new Error(`Could not update password: ${error.message}`)
    }
  }

  await assignPrivilegedRole(authUser.id, authUser.email.toLowerCase(), role)

  revalidatePath('/admin')
  revalidatePath('/staff')
}
