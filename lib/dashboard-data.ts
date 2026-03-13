import {
  DashboardListing,
  DashboardSnapshot,
  ListingWorkflowStatus,
  ProfileRecord,
  ProfileVerificationStatus,
  VerificationStep,
  VerificationStepStatus,
} from '@/types/dashboard'

export const PROFILE_COLUMNS = `
  id,
  full_name,
  phone,
  phone_verified,
  country,
  city,
  address_line_1,
  postal_code,
  avatar_url,
  document_url,
  verification_status,
  seller_enabled,
  created_at,
  updated_at
`

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export function buildEmptyProfile(userId: string): ProfileRecord {
  const now = new Date().toISOString()
  return {
    id: userId,
    full_name: null,
    phone: null,
    phone_verified: false,
    country: null,
    city: null,
    address_line_1: null,
    postal_code: null,
    avatar_url: null,
    document_url: null,
    verification_status: 'unverified',
    seller_enabled: false,
    created_at: now,
    updated_at: now,
  }
}

export function normalizeProfileRow(row: Record<string, unknown> | null | undefined, userId: string): ProfileRecord {
  const fallback = buildEmptyProfile(userId)
  if (!row) return fallback

  const verificationStatusSet: ProfileVerificationStatus[] = ['unverified', 'in_review', 'verified', 'rejected']
  const status = verificationStatusSet.includes(row.verification_status as ProfileVerificationStatus)
    ? (row.verification_status as ProfileVerificationStatus)
    : fallback.verification_status

  return {
    id: typeof row.id === 'string' ? row.id : userId,
    full_name: asNonEmptyString(row.full_name),
    phone: asNonEmptyString(row.phone),
    phone_verified: Boolean(row.phone_verified),
    country: asNonEmptyString(row.country),
    city: asNonEmptyString(row.city),
    address_line_1: asNonEmptyString(row.address_line_1),
    postal_code: asNonEmptyString(row.postal_code),
    avatar_url: asNonEmptyString(row.avatar_url),
    document_url: asNonEmptyString(row.document_url),
    verification_status: status,
    seller_enabled: Boolean(row.seller_enabled),
    created_at: typeof row.created_at === 'string' ? row.created_at : fallback.created_at,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : fallback.updated_at,
  }
}

export function getListingCountByStatus(listings: DashboardListing[], status: ListingWorkflowStatus): number {
  return listings.filter((listing) => listing.status === status).length
}

export function hasRequiredSellerFields(profile: ProfileRecord): boolean {
  return Boolean(
    profile.full_name &&
      profile.phone &&
      profile.country &&
      profile.city &&
      profile.address_line_1 &&
      profile.postal_code
  )
}

function getPhoneStepStatus(profile: ProfileRecord): VerificationStepStatus {
  if (!profile.phone) return 'incomplete'
  return profile.phone_verified ? 'complete' : 'pending'
}

export function getVerificationSteps(profile: ProfileRecord, emailVerified: boolean): VerificationStep[] {
  const profileComplete = hasRequiredSellerFields(profile)
  const sellerReviewReady = emailVerified && profileComplete

  return [
    {
      id: 'email',
      label: 'Email Verified',
      description: 'Confirmed from your authenticated TekSwapp login.',
      status: emailVerified ? 'complete' : 'incomplete',
    },
    {
      id: 'phone',
      label: 'Phone Verified',
      description: 'MVP flow stores your phone and marks verification as pending/manual.',
      status: getPhoneStepStatus(profile),
    },
    {
      id: 'profile',
      label: 'Profile Completed',
      description: 'Full name and address details required before publishing.',
      status: profileComplete ? 'complete' : 'incomplete',
    },
    {
      id: 'documents',
      label: 'Documents Submitted',
      description: 'Optional upload for seller trust review.',
      status: profile.document_url ? 'complete' : 'incomplete',
      optional: true,
    },
    {
      id: 'approval',
      label: 'Seller Approved',
      description: 'Enabled when required profile data is complete for MVP.',
      status: profile.seller_enabled || profile.verification_status === 'verified'
        ? 'complete'
        : sellerReviewReady
          ? 'pending'
          : 'incomplete',
    },
  ]
}

export function getVerificationProgress(profile: ProfileRecord, emailVerified: boolean): number {
  const steps = getVerificationSteps(profile, emailVerified)
  const points = steps.reduce((total, step) => {
    if (step.status === 'complete') return total + 1
    if (step.status === 'pending') return total + 0.5
    return total
  }, 0)

  return Math.round((points / steps.length) * 100)
}

export function getDerivedVerificationStatus(
  existingStatus: ProfileVerificationStatus,
  requiredReady: boolean
): { verification_status: ProfileVerificationStatus; seller_enabled: boolean } {
  if (existingStatus === 'rejected') {
    return { verification_status: 'rejected', seller_enabled: false }
  }

  if (existingStatus === 'verified') {
    return { verification_status: 'verified', seller_enabled: true }
  }

  if (requiredReady) {
    return { verification_status: 'in_review', seller_enabled: true }
  }

  return { verification_status: 'unverified', seller_enabled: false }
}

export function canUserPublishListings(profile: ProfileRecord, emailVerified: boolean): boolean {
  if (profile.verification_status === 'rejected') return false
  return profile.seller_enabled || (emailVerified && hasRequiredSellerFields(profile))
}

export function getPendingActionCount(snapshot: DashboardSnapshot): number {
  const steps = getVerificationSteps(snapshot.profile, snapshot.emailVerified)
  const requiredPending = steps.filter((step) => !step.optional && step.status !== 'complete').length

  return (
    requiredPending +
    getListingCountByStatus(snapshot.listings, 'draft') +
    getListingCountByStatus(snapshot.listings, 'pending_review')
  )
}
