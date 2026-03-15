import type { SupabaseClient, User } from '@supabase/supabase-js'

export type PrivilegedRole = 'owner' | 'staff'

export interface PrivilegedAccess {
  role: PrivilegedRole | null
  isOwner: boolean
  isStaff: boolean
  canReviewListings: boolean
  moderationPath: '/admin' | '/staff' | null
}

export const EMPTY_PRIVILEGED_ACCESS: PrivilegedAccess = {
  role: null,
  isOwner: false,
  isStaff: false,
  canReviewListings: false,
  moderationPath: null,
}

function parseEmailAllowlist(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

function isMissingAccountsTableError(
  error: { code?: string; message?: string } | null,
  tableName: 'owner_accounts' | 'staff_accounts'
): boolean {
  if (!error) return false

  const knownCodes = new Set(['PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) return true

  const message = (error.message ?? '').toLowerCase()
  return (
    message.includes(`could not find the table 'public.${tableName}'`) ||
    message.includes(`relation "${tableName}" does not exist`)
  )
}

async function hasAccountRecord(
  supabase: SupabaseClient,
  tableName: 'owner_accounts' | 'staff_accounts',
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(tableName)
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (isMissingAccountsTableError(error, tableName)) {
    return false
  }

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(data)
}

export async function getPrivilegedAccess(
  supabase: SupabaseClient,
  user: User
): Promise<PrivilegedAccess> {
  const ownerEmailAllowlist = parseEmailAllowlist(process.env.TEKSWAPP_OWNER_EMAILS)
  const staffEmailAllowlist = parseEmailAllowlist(process.env.TEKSWAPP_STAFF_EMAILS)
  const normalizedEmail = user.email?.toLowerCase() ?? ''

  const [ownerFromTable, staffFromTable] = await Promise.all([
    hasAccountRecord(supabase, 'owner_accounts', user.id),
    hasAccountRecord(supabase, 'staff_accounts', user.id),
  ])

  const isOwner = ownerFromTable || ownerEmailAllowlist.has(normalizedEmail)
  const isStaff = staffFromTable || staffEmailAllowlist.has(normalizedEmail)

  if (isOwner) {
    return {
      role: 'owner',
      isOwner: true,
      isStaff,
      canReviewListings: true,
      moderationPath: '/admin',
    }
  }

  if (isStaff) {
    return {
      role: 'staff',
      isOwner: false,
      isStaff: true,
      canReviewListings: true,
      moderationPath: '/staff',
    }
  }

  return EMPTY_PRIVILEGED_ACCESS
}
