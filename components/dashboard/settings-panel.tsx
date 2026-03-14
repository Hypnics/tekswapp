'use client'

import { updateAccountSettings } from '@/app/dashboard/actions'
import { ProfileRecord } from '@/types/dashboard'

interface SettingsPanelProps {
  profile: ProfileRecord
  email: string
}

export default function SettingsPanel({ profile, email }: SettingsPanelProps) {
  const completedFields = [
    profile.full_name,
    profile.phone,
    profile.country,
    profile.city,
    profile.address_line_1,
    profile.postal_code,
    profile.avatar_url,
  ].filter(Boolean).length

  return (
    <section className="dashboard-panel rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-kicker">Account settings</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Profile and account details</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/65">
            Saved directly to your Supabase profiles row so dashboard, verification, and seller flows stay in sync.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Email</p>
          <p className="mt-2 text-base font-semibold text-white">{email}</p>
        </div>
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Profile completion</p>
          <p className="mt-2 text-2xl font-semibold text-white">{completedFields}/7</p>
        </div>
        <div className="dashboard-panel-soft rounded-2xl px-4 py-4">
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/46">Seller status</p>
          <p className="mt-2 text-2xl font-semibold text-white">{profile.seller_enabled ? 'Enabled' : 'Pending'}</p>
        </div>
      </div>

      <form action={updateAccountSettings} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Full name" name="full_name" defaultValue={profile.full_name ?? ''} />
          <Input label="Email" name="email_display" defaultValue={email} disabled />
          <Input label="Phone" name="phone" defaultValue={profile.phone ?? ''} />
          <Input label="Country" name="country" defaultValue={profile.country ?? ''} />
          <Input label="City / Province" name="city" defaultValue={profile.city ?? ''} />
          <Input label="Address" name="address_line_1" defaultValue={profile.address_line_1 ?? ''} />
          <Input label="Postal code" name="postal_code" defaultValue={profile.postal_code ?? ''} />
          <Input
            label="Profile image URL"
            name="avatar_url"
            defaultValue={profile.avatar_url ?? ''}
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="brand-button rounded-xl px-4 py-2 text-sm font-semibold text-white">
            Save settings
          </button>
          <p className="text-sm text-white/60">Submitting refreshes the dashboard with your latest saved profile data.</p>
        </div>
      </form>
    </section>
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
        placeholder={placeholder}
        disabled={disabled}
        className="input-shell mt-1 w-full rounded-xl px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-65"
      />
    </label>
  )
}
