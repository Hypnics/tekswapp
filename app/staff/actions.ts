'use server'

import { revalidatePath } from 'next/cache'
import { requireStaffContext } from '@/lib/staff-auth'

function cleanString(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function readListingId(formData: FormData): string {
  const id = cleanString(formData.get('listing_id'))
  if (!id) {
    throw new Error('Missing listing id.')
  }
  return id
}

export async function approvePendingListingAsStaff(formData: FormData) {
  const { supabase } = await requireStaffContext()
  const listingId = readListingId(formData)

  const { error } = await supabase
    .from('listings')
    .update({ status: 'active' })
    .eq('id', listingId)
    .eq('status', 'pending_review')

  if (error) {
    throw new Error(`Could not approve listing: ${error.message}`)
  }

  revalidatePath('/')
  revalidatePath('/listings')
  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath(`/product/${listingId}`)
  revalidatePath('/staff')
}

export async function rejectPendingListingAsStaff(formData: FormData) {
  const { supabase } = await requireStaffContext()
  const listingId = readListingId(formData)

  const { error } = await supabase
    .from('listings')
    .update({ status: 'draft' })
    .eq('id', listingId)
    .eq('status', 'pending_review')

  if (error) {
    throw new Error(`Could not reject listing: ${error.message}`)
  }

  revalidatePath('/dashboard')
  revalidatePath('/sell')
  revalidatePath('/staff')
}
