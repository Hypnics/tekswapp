'use client'

import { updateAccountSettings } from '@/app/dashboard/actions'
import { ProfileRecord } from '@/types/dashboard'

interface SettingsPanelProps {
  profile: ProfileRecord
  email: string
}

export default function SettingsPanel({ profile, email }: SettingsPanelProps) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
    >
      <h2 className="text-2xl font-semibold text-white">Account Settings</h2>
      <p className="mt-1 text-sm text-white/65">
        Saved directly to your Supabase `profiles` row.
      </p>

      <form action={updateAccountSettings} className="mt-5 space-y-4">
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
          <button
            type="submit"
            className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save settings
          </button>
          <p className="text-sm text-white/60">Changes refresh the dashboard after submit.</p>
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
        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-65"
      />
    </label>
  )
}
