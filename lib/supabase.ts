// ─────────────────────────────────────────────────────────────
// lib/supabase.ts — convenience re-exports
// Use lib/supabase/client.ts in Client Components
// Use lib/supabase/server.ts in Server Components and Server Actions
// ─────────────────────────────────────────────────────────────
// To activate:
//   1. npm install @supabase/supabase-js
//   2. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
//   3. Uncomment the code below

// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Auth helpers (to be implemented) ───────────────────────
// export async function signUp(email: string, password: string) {
//   return supabase.auth.signUp({ email, password })
// }

// export async function signIn(email: string, password: string) {
//   return supabase.auth.signInWithPassword({ email, password })
// }

// export async function signOut() {
//   return supabase.auth.signOut()
// }

// export async function getSession() {
//   return supabase.auth.getSession()
// }

// ─── Database helpers (to be implemented) ───────────────────
// export async function getListings() {
//   return supabase.from('listings').select('*').order('created_at', { ascending: false })
// }

// export async function getListingById(id: string) {
//   return supabase.from('listings').select('*').eq('id', id).single()
// }

// export async function createListing(data: Record<string, unknown>) {
//   return supabase.from('listings').insert(data)
// }

// Placeholder export to avoid import errors
export const supabasePlaceholder = null
