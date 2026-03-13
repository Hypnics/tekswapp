import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface OwnerRecord {
  user_id: string
  email: string
}

type OwnerAuthCode = 'unauthenticated' | 'forbidden'

export class OwnerAuthError extends Error {
  code: OwnerAuthCode

  constructor(code: OwnerAuthCode) {
    super(code === 'unauthenticated' ? 'Owner authentication required.' : 'Owner access denied.')
    this.code = code
  }
}

function parseOwnerEmailAllowlist(): Set<string> {
  const raw = process.env.TEKSWAPP_OWNER_EMAILS ?? ''
  const emails = raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  return new Set(emails)
}

function isMissingOwnerAccountsTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const knownCodes = new Set(['PGRST205', '42P01'])
  if (error.code && knownCodes.has(error.code)) return true

  const message = (error.message ?? '').toLowerCase()
  return (
    message.includes("could not find the table 'public.owner_accounts'") ||
    message.includes('relation "owner_accounts" does not exist')
  )
}

export async function requireOwnerContext(options?: { redirectToAuth?: boolean; nextPath?: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (options?.redirectToAuth) {
      const nextPath = options.nextPath && options.nextPath.startsWith('/') ? options.nextPath : '/admin'
      redirect(`/auth?redirected=1&next=${encodeURIComponent(nextPath)}`)
    }
    throw new OwnerAuthError('unauthenticated')
  }

  const allowlist = parseOwnerEmailAllowlist()
  const emailAllowed = Boolean(user.email && allowlist.has(user.email.toLowerCase()))

  const { data: ownerRecord, error } = await supabase
    .from('owner_accounts')
    .select('user_id,email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error && !isMissingOwnerAccountsTableError(error)) {
    throw new Error(error.message)
  }

  const tableAllowed = Boolean(ownerRecord)

  if (!emailAllowed && !tableAllowed) {
    throw new OwnerAuthError('forbidden')
  }

  return {
    supabase,
    user,
    ownerRecord: (ownerRecord as OwnerRecord | null) ?? null,
  }
}
