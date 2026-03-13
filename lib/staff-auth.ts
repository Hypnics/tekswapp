import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface StaffRecord {
  user_id: string
  email: string
}

type StaffAuthCode = 'unauthenticated' | 'forbidden'

export class StaffAuthError extends Error {
  code: StaffAuthCode

  constructor(code: StaffAuthCode) {
    super(code === 'unauthenticated' ? 'Staff authentication required.' : 'Staff access denied.')
    this.code = code
  }
}

function parseStaffEmailAllowlist(): Set<string> {
  const raw = process.env.TEKSWAPP_STAFF_EMAILS ?? ''
  const emails = raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return new Set(emails)
}

function isMissingStaffAccountsTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const knownCodes = new Set(['PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) return true

  const message = (error.message ?? '').toLowerCase()
  return (
    message.includes("could not find the table 'public.staff_accounts'") ||
    message.includes('relation "staff_accounts" does not exist')
  )
}

export async function requireStaffContext(options?: { redirectToAuth?: boolean; nextPath?: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (options?.redirectToAuth) {
      const nextPath = options.nextPath && options.nextPath.startsWith('/') ? options.nextPath : '/admin'
      redirect(`/auth?redirected=1&next=${encodeURIComponent(nextPath)}`)
    }
    throw new StaffAuthError('unauthenticated')
  }

  const allowlist = parseStaffEmailAllowlist()
  const emailAllowed = Boolean(user.email && allowlist.has(user.email.toLowerCase()))

  const { data: staffRecord, error } = await supabase
    .from('staff_accounts')
    .select('user_id,email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error && !isMissingStaffAccountsTableError(error)) {
    throw new Error(error.message)
  }

  const tableAllowed = Boolean(staffRecord)

  if (!emailAllowed && !tableAllowed) {
    throw new StaffAuthError('forbidden')
  }

  return {
    supabase,
    user,
    staffRecord: (staffRecord as StaffRecord | null) ?? null,
  }
}
