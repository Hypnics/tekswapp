import { createClient } from '@supabase/supabase-js'

function assertAdminConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !url.startsWith('https://') || !serviceRoleKey) {
    throw new Error(
      'Supabase admin is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.'
    )
  }

  return { url, serviceRoleKey }
}

export function createAdminClient() {
  const { url, serviceRoleKey } = assertAdminConfigured()

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
