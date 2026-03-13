'use client'

import {
  completeSellerVerification,
  resendVerificationEmail,
  updateAddressInfo,
  updateContactInfo,
  updateProfileCompletion,
  uploadSellerDocument,
} from '@/app/dashboard/actions'
import {
  canUserPublishListings,
  getVerificationSteps,
} from '@/lib/dashboard-data'
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
      <section
        className="rounded-2xl border p-5 sm:p-6"
        style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-xs uppercase tracking-[0.12em] text-[#22D3EE]">Verification Center</p>
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Seller verification flow</h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70 sm:text-base">
          Verification uses your real Supabase profile fields. Complete the required forms below
          to unlock seller publishing.
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/65">
          Verification progress: {progress}% · {sellerReady ? 'Seller ready to publish' : 'Seller setup incomplete'}
        </p>
      </section>

      <section
        className="rounded-2xl border p-5"
        style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
      >
        <h3 className="text-lg font-semibold text-white">Status checklist</h3>
        <div className="mt-4 space-y-3">
          {steps.map((step) => {
            const theme = statusTheme(step.status)
            return (
              <article
                key={step.id}
                className="flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {step.label} {step.optional ? '(Optional)' : ''}
                  </p>
                  <p className="text-xs text-white/60">{step.description}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ color: theme.color, background: theme.background }}
                >
                  {theme.label}
                </span>
              </article>
            )
          })}
        </div>
      </section>

      <section
        className="rounded-2xl border p-5"
        style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
      >
        <h3 className="text-lg font-semibold text-white">Finalize verification</h3>
        <p className="mt-1 text-sm text-white/65">
          After filling the required forms, click complete verification to unlock publishing.
        </p>

        {missingRequirements.length > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3">
            <p className="text-sm font-semibold text-amber-200">Required items still missing:</p>
            <p className="mt-1 text-xs text-amber-100/90">{missingRequirements.join(' · ')}</p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-200">All required items are complete.</p>
            <p className="mt-1 text-xs text-emerald-100/90">Click complete verification to enable seller publishing.</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <form action={completeSellerVerification}>
            <button
              disabled={sellerReady}
              className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sellerReady ? 'Verification complete' : 'Complete verification'}
            </button>
          </form>

          {!emailVerified && (
            <form action={resendVerificationEmail}>
              <button className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90">
                Resend verification email
              </button>
            </form>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section
          className="rounded-2xl border p-5"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
        >
          <h3 className="text-lg font-semibold text-white">1) Contact info</h3>
          <p className="mt-1 text-sm text-white/65">
            Phone verification is pending/manual for MVP. Save your number now.
          </p>
          <form action={updateContactInfo} className="mt-4 space-y-3">
            <Input label="Email" name="email_readonly" defaultValue={email} disabled />
            <Input label="Full name" name="full_name" defaultValue={profile.full_name ?? ''} />
            <Input label="Phone number" name="phone" defaultValue={profile.phone ?? ''} />
            <button className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">
              Save contact info
            </button>
          </form>
        </section>

        <section
          className="rounded-2xl border p-5"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
        >
          <h3 className="text-lg font-semibold text-white">2) Address</h3>
          <p className="mt-1 text-sm text-white/65">Required before listing publishing is enabled.</p>
          <form action={updateAddressInfo} className="mt-4 space-y-3">
            <Input label="Country" name="country" defaultValue={profile.country ?? ''} />
            <Input label="City / Province" name="city" defaultValue={profile.city ?? ''} />
            <Input label="Address line 1" name="address_line_1" defaultValue={profile.address_line_1 ?? ''} />
            <Input label="Postal code" name="postal_code" defaultValue={profile.postal_code ?? ''} />
            <button className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">
              Save address
            </button>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section
          className="rounded-2xl border p-5"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
        >
          <h3 className="text-lg font-semibold text-white">3) Profile completion</h3>
          <p className="mt-1 text-sm text-white/65">Optional profile photo URL for added buyer trust.</p>
          <form action={updateProfileCompletion} className="mt-4 space-y-3">
            <Input label="Full name" name="full_name" defaultValue={profile.full_name ?? ''} />
            <Input
              label="Profile photo URL (optional)"
              name="avatar_url"
              defaultValue={profile.avatar_url ?? ''}
              placeholder="https://..."
            />
            <button className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">
              Save profile details
            </button>
          </form>
        </section>

        <section
          className="rounded-2xl border p-5"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
        >
          <h3 className="text-lg font-semibold text-white">4) Optional document upload</h3>
          <p className="mt-1 text-sm text-white/65">
            Upload a PDF/JPG/PNG to the `seller-documents` storage bucket.
          </p>
          <form action={uploadSellerDocument} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.1em] text-white/55">Document</span>
              <input
                type="file"
                name="document"
                accept=".pdf,.png,.jpg,.jpeg"
                className="mt-1 block w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </label>
            {profile.document_url && (
              <p className="text-xs text-white/60">Current stored path: {profile.document_url}</p>
            )}
            <button className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white">
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
        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-70"
      />
    </label>
  )
}
