import Link from 'next/link'
import { redirect } from 'next/navigation'
import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import SellerListingWizard from '@/components/seller-listing-wizard'
import { canUserPublishListings } from '@/lib/dashboard-data'
import { getOrCreateProfile } from '@/lib/dashboard-server'
import { getSellerEditableListingById } from '@/lib/marketplace'
import { createClient } from '@/lib/supabase/server'

const supabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ?? false

export default async function SellPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string | string[] }>
}) {
  if (!supabaseConfigured) {
    return (
      <div className="page-shell text-white">
        <Navbar />
        <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4">
          <div className="surface-card rounded-[2rem] p-8">
            <h1 className="text-2xl font-semibold">Supabase configuration required</h1>
            <p className="mt-3 text-sm text-white/70">
              Add your Supabase project keys and database schema to publish real seller listings.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const profile = await getOrCreateProfile(supabase, user)
  const sellerReady = canUserPublishListings(profile, Boolean(user.email_confirmed_at))
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const editParam = Array.isArray(resolvedSearchParams?.edit)
    ? resolvedSearchParams?.edit[0]
    : resolvedSearchParams?.edit
  const initialListing = editParam
    ? await getSellerEditableListingById(supabase, user.id, editParam)
    : null

  if (editParam && !initialListing) {
    redirect('/dashboard?tab=listings')
  }

  if (!sellerReady) {
    return (
      <div className="page-shell text-white">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="surface-card w-full max-w-xl rounded-[2rem] p-8 text-center">
            <p className="section-kicker">Seller onboarding required</p>
            <h1 className="mt-2 text-2xl font-semibold">Complete verification before publishing</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Publishing is blocked until required profile fields are complete in your Verification Center.
            </p>
            <Link
              href="/dashboard?tab=verification"
              className="brand-button mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white"
            >
              Go to Verification Center
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page-shell text-white">
      <Navbar />
      <main className="relative mx-auto max-w-5xl px-4 pb-20 pt-28">
        <SellerListingWizard initialListing={initialListing ?? undefined} />
      </main>
      <Footer />
    </div>
  )
}
