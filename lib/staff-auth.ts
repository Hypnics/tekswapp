import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPrivilegedAccess } from '@/lib/privileged-access'

type StaffAuthCode = 'unauthenticated' | 'forbidden'

export class StaffAuthError extends Error {
  code: StaffAuthCode

  constructor(code: StaffAuthCode) {
    super(code === 'unauthenticated' ? 'Staff authentication required.' : 'Staff access denied.')
    this.code = code
  }
}

export async function requireStaffContext(options?: { redirectToAuth?: boolean; nextPath?: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (options?.redirectToAuth) {
      const nextPath = options.nextPath && options.nextPath.startsWith('/') ? options.nextPath : '/staff'
      redirect(`/auth?redirected=1&next=${encodeURIComponent(nextPath)}`)
    }
    throw new StaffAuthError('unauthenticated')
  }

  const access = await getPrivilegedAccess(supabase, user)

  if (!access.isStaff) {
    throw new StaffAuthError('forbidden')
  }

  return {
    supabase,
    user,
  }
}
