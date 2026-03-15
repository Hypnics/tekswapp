import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPrivilegedAccess } from '@/lib/privileged-access'

type OwnerAuthCode = 'unauthenticated' | 'forbidden'

export class OwnerAuthError extends Error {
  code: OwnerAuthCode

  constructor(code: OwnerAuthCode) {
    super(code === 'unauthenticated' ? 'Owner authentication required.' : 'Owner access denied.')
    this.code = code
  }
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

  const access = await getPrivilegedAccess(supabase, user)

  if (!access.isOwner) {
    throw new OwnerAuthError('forbidden')
  }

  return {
    supabase,
    user,
  }
}
