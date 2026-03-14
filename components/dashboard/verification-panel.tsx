'use client'

import {
  completeSellerVerification,
  resendVerificationEmail,
  updateAddressInfo,
  updateContactInfo,
  updateProfileCompletion,
  uploadSellerDocument,
} from '@/app/dashboard/actions'
import { canUserPublishListings, getVerificationSteps } from '@/lib/dashboard-data'
import { ProfileRecord } from '@/types/dashboard'

interface VerificationPanelProps {
  profile: ProfileRecord
  email: string
  emailVerified: boolean
  progress: number
}

function statusTheme(status: 'complete' | 'pending' | 'incomplete') {
  if (status === 'complete') {
    return { label: 'Complete', color: '#34d399', background: 'rgba(52,211,153,0.16)' }
  }
  if (status === 'pending') {
    return { label: 'Pending', color: '#fbbf24', background: 'rgba(251,191,36,0.16)' }
  }
  return { label: 'Incomplete', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.1)' }
}

export default function VerificationPanel({
  profile,
  email,
  emailVerified,
  progress,
}: VerificationPanelProps) {
  const steps = getVerificationSteps(profile, emailVerified)
  const sellerReady = canUserPublishListings(profile, emailVerified)
  const missingRequirements = [
    ...(profile.full_name ? [] : ['Full name']),
    ...(profile.phone ? [] : ['Phone number']),
    ...(profile.country ? [] : ['Country']),
    ...(profile.city ? [] : ['City / Province']),
    ...(profile.address_line_1 ? [] : ['Address line 1']),
    ...(profile.postal_code ? [] : ['Postal code']),
  ]

  return (
    <div className="space-y-5">
      <section className="dashboard-panel rounded-[1.75rem] p-5 sm:p-6">
        <p className="section-kicker">Verification center</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Seller verification flow</h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70 sm:text-base">
          Verification uses your real Supabase profile fields. Complete the required steps below to unlock seller publishing.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Progress</p>
            <p className="mt-2 text-2xl font-semibold text-white">{progress}%</p>
            <div className="dashboard-progress-track mt-3 h-2">
              <div className="dashboard-progress-fill h-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Seller access</p>
            <p className="mt-2 text-2xl font-semibold text-white">{sellerReady ? 'Unlocked' : 'Blocked'}</p>
            <p className="mt-1 text-sm text-white/62">
              {sellerReady ? 'Publishing is available now.' : `${missingRequirements.length} required item${missingRequirements.length === 1 ? '' : 's'} remaining`}
            </p>
          </div>
          <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Documents</p>
            <p className="mt-2 text-2xl font-semibold text-white">{profile.document_url ? 'Uploaded' : 'Optional'}</p>
            <p className="mt-1 text-sm text-white/62">
              {profile.document_url ? 'Trust document already stored.' : 'Upload a file if you want extra buyer trust.'}
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-panel rounded-[1.75rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Status checklist</h3>
            <p className="mt-1 text-sm text-white/62">Every required step is tracked from your real profile state.</p>
          </div>
          <span className="dashboard-chip" data-tone={sellerReady ? 'success' : 'warning'}>
            {sellerReady ? 'Ready' : 'In progress'}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {steps.map((step) => {
            const theme = statusTheme(step.status)
            return (
              <article
                key={step.id}
                className="dashboard-panel-soft flex flex-col gap-2 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {step.label} {step.optional ? '(Optional)' : ''}
                  </p>
                  <p className="text-xs text-white/60">{step.description}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ color: theme.color, background: theme.background }}
                >
                  {theme.label}
                </span>
              </article>
            )
          })}
        </div>
      </section>

      <section className="dashboard-panel rounded-[1.75rem] p-5">
        <h3 className="text-lg font-semibold text-white">Finalize verification</h3>
        <p className="mt-1 text-sm text-white/65">
          Once the required fields are filled, complete verification to unlock seller publishing.
        </p>

        {missingRequirements.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3">
            <p className="text-sm font-semibold text-amber-200">Required items still missing</p>
            <p className="mt-1 text-xs text-amber-100/90">{missingRequirements.join(' / ')}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-200">All required items are complete</p>
            <p className="mt-1 text-xs text-emerald-100/90">
              Click complete verification to enable seller publishing.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <form action={completeSellerVerification}>
            <button
              disabled={sellerReady}
              className="brand-button rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sellerReady ? 'Verification complete' : 'Complete verification'}
            </button>
          </form>

          {!emailVerified && (
            <form action={resendVerificationEmail}>
              <button className="ghost-button rounded-xl px-4 py-2 text-sm font-semibold text-white/90">
                Resend verification email
              </button>
            </form>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="dashboard-panel rounded-[1.75rem] p-5">
          <h3 className="text-lg font-semibold text-white">1. Contact info</h3>
          <p className="mt-1 text-sm text-white/65">
            Save your real contact info here. Phone verification remains a manual MVP step.
          </p>
          <form action={updateContactInfo} className="mt-4 space-y-3">
            <Input label="Email" name="email_readonly" defaultValue={email} disabled />
            <Input label="Full name" name="full_name" defaultValue={profile.full_name ?? ''} />
            <Input label="Phone number" name="phone" defaultValue={profile.phone ?? ''} />
            <button className="brand-button rounded-xl px-4 py-2 text-sm font-semibold text-white">
              Save contact info
            </button>
          </form>
        </section>

        <section className="dashboard-panel rounded-[1.75rem] p-5">
          <h3 className="text-lg font-semibold text-white">2. Address</h3>
          <p className="mt-1 text-sm text-white/65">Country, city, and address are required before publishing.</p>
          <form action={updateAddressInfo} className="mt-4 space-y-3">
            <Input label="Country" name="country" defaultValue={profile.country ?? ''} />
            <Input label="City / Province" name="city" defaultValue={profile.city ?? ''} />
            <Input label="Address line 1" name="address_line_1" defaultValue={profile.address_line_1 ?? ''} />
            <Input label="Postal code" name="postal_code" defaultValue={profile.postal_code ?? ''} />
            <button className="brand-button rounded-xl px-4 py-2 text-sm font-semibold text-white">
              Save address
            </button>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="dashboard-panel rounded-[1.75rem] p-5">
          <h3 className="text-lg font-semibold text-white">3. Profile completion</h3>
          <p className="mt-1 text-sm text-white/65">Add a profile image URL if you want a stronger trust signal.</p>
          <form action={updateProfileCompletion} className="mt-4 space-y-3">
            <Input label="Full name" name="full_name" defaultValue={profile.full_name ?? ''} />
            <Input
              label="Profile photo URL (optional)"
              name="avatar_url"
              defaultValue={profile.avatar_url ?? ''}
              placeholder="https://..."
            />
            <button className="brand-button rounded-xl px-4 py-2 text-sm font-semibold text-white">
              Save profile details
            </button>
          </form>
        </section>

        <section className="dashboard-panel rounded-[1.75rem] p-5">
          <h3 className="text-lg font-semibold text-white">4. Optional document upload</h3>
          <p className="mt-1 text-sm text-white/65">
            Upload a PDF, JPG, or PNG to the seller-documents storage bucket.
          </p>
          <form action={uploadSellerDocument} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.1em] text-white/55">Document</span>
              <input
                type="file"
                name="document"
                accept=".pdf,.png,.jpg,.jpeg"
                className="input-shell mt-1 block w-full rounded-xl px-3 py-2 text-sm"
              />
            </label>
            {profile.document_url && (
              <p className="text-xs text-white/60">Current stored path: {profile.document_url}</p>
            )}
            <button className="brand-button rounded-xl px-4 py-2 text-sm font-semibold text-white">
              Upload document
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

function Input({
  label,
  name,
  defaultValue,
  placeholder,
  disabled,
}: {
  label: string
  name: string
  defaultValue: string
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.1em] text-white/55">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        placeholder={placeholder}
        className="input-shell mt-1 w-full rounded-xl px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  )
}
