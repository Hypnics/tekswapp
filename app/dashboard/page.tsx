import { redirect } from 'next/navigation'
import Footer from '@/components/footer'
import DashboardShell from '@/components/dashboard/dashboard-shell'
import { attachPriceDisplays, getCurrencyPresenter } from '@/lib/currency/presenter'
import { buildEmptyProfile } from '@/lib/dashboard-data'
import { loadDashboardSnapshot } from '@/lib/dashboard-server'
import { createClient } from '@/lib/supabase/server'
import { DashboardSection, DashboardSnapshot } from '@/types/dashboard'

const supabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ?? false

const baseSections: DashboardSection[] = [
  'overview',
  'listings',
  'sales',
  'purchases',
  'verification',
  'settings',
]

function fallbackSnapshot(): DashboardSnapshot {
  const profile = buildEmptyProfile('local-dev-user')
  return {
    userId: profile.id,
    email: 'dev@tekswapp.com',
    emailVerified: false,
    displayName: 'Developer',
    generatedAt: new Date().toISOString(),
    profile,
    listings: [],
    privilegedAccess: {
      role: null,
      canReviewListings: false,
      moderationPath: null,
    },
    moderationQueue: [],
    moderationSummary: {
      pendingReview: 0,
      activeListings: 0,
      draftListings: 0,
    },
    sales: [],
    purchases: [],
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    tab?: string | string[]
    setup?: string | string[]
    saved?: string | string[]
    verification_error?: string | string[]
  }
}) {
  let snapshot = fallbackSnapshot()

  if (supabaseConfigured) {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) redirect('/auth')
    snapshot = await loadDashboardSnapshot(supabase, authUser)
  }

  const presenter = await getCurrencyPresenter()
  snapshot = {
    ...snapshot,
    listings: snapshot.listings.map((listing) => attachPriceDisplays(listing, presenter)),
    moderationQueue: snapshot.moderationQueue.map((listing) => attachPriceDisplays(listing, presenter)),
  }

  const allowedSections: DashboardSection[] = snapshot.privilegedAccess.canReviewListings
    ? [...baseSections, 'moderation']
    : baseSections
  const requestedTab = Array.isArray(searchParams.tab) ? searchParams.tab[0] : searchParams.tab
  const initialSection = allowedSections.includes(requestedTab as DashboardSection)
    ? (requestedTab as DashboardSection)
    : 'overview'

  const setupParam = Array.isArray(searchParams.setup) ? searchParams.setup[0] : searchParams.setup
  const savedParam = Array.isArray(searchParams.saved) ? searchParams.saved[0] : searchParams.saved
  const verificationErrorParam = Array.isArray(searchParams.verification_error)
    ? searchParams.verification_error[0]
    : searchParams.verification_error

  const notice =
    setupParam === 'profiles_table_missing'
      ? {
          tone: 'warning' as const,
          message: 'Supabase setup required: create public.profiles and policies before saving verification data.',
        }
      : verificationErrorParam
        ? {
            tone: 'warning' as const,
            message: verificationErrorParam,
          }
      : savedParam === 'profile'
        ? {
            tone: 'success' as const,
            message: 'Verification details saved.',
          }
        : savedParam === 'document'
          ? {
              tone: 'success' as const,
              message: 'Document uploaded successfully.',
            }
          : savedParam === 'settings'
            ? {
                tone: 'success' as const,
                message: 'Account settings saved.',
              }
            : savedParam === 'verification_complete'
              ? {
                  tone: 'success' as const,
                  message: 'Verification completed. You can now publish listings.',
                }
              : savedParam === 'email_sent'
                ? {
                    tone: 'success' as const,
                    message: 'Verification email sent. Confirm it, then click Complete verification.',
                  }
                : savedParam === 'email_already_verified'
                  ? {
                      tone: 'success' as const,
                      message: 'Your email is already verified.',
                    }
            : undefined

  return (
    <>
      <DashboardShell
        snapshot={snapshot}
        initialSection={initialSection}
        notice={notice}
      />
      <Footer />
    </>
  )
}
