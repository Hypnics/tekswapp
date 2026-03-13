'use client'

import { DashboardSection } from '@/types/dashboard'

interface DashboardSidebarProps {
  activeSection: DashboardSection
  onNavigate: (section: DashboardSection) => void
  displayName: string
  displayEmail: string
  verificationProgress: number
  sellerReady: boolean
  pendingActions: number
}

const navItems: { id: DashboardSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'listings', label: 'My Listings' },
  { id: 'sales', label: 'Sales' },
  { id: 'purchases', label: 'Purchases' },
  { id: 'verification', label: 'Verification' },
  { id: 'settings', label: 'Settings' },
]

export default function DashboardSidebar({
  activeSection,
  onNavigate,
  displayName,
  displayEmail,
  verificationProgress,
  sellerReady,
  pendingActions,
}: DashboardSidebarProps) {
  return (
    <>
      <aside
        className="hidden w-72 flex-col border-r px-5 py-6 lg:flex"
        style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(8,12,22,0.95)' }}
      >
        <div className="mb-8">
          <p className="text-lg font-semibold text-white">
            Tek<span className="text-[#22D3EE]">Swapp</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/45">Unified account dashboard</p>
        </div>

        <div
          className="mb-6 rounded-2xl border p-4"
          style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
        >
          <p className="text-sm font-semibold text-white">{displayName}</p>
          <p className="mt-1 text-xs text-white/60">{displayEmail}</p>
          <p className="mt-3 text-xs text-white/55">
            {sellerReady ? 'Seller ready' : 'Seller setup in progress'}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#22D3EE]"
              style={{ width: `${verificationProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-white/55">Verification {verificationProgress}% complete</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors"
                style={{
                  background: active ? 'rgba(37,99,235,0.2)' : 'transparent',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                  border: active ? '1px solid rgba(37,99,235,0.45)' : '1px solid transparent',
                }}
              >
                <span>{item.label}</span>
                {item.id === 'verification' && pendingActions > 0 && (
                  <span className="rounded-full bg-[#22D3EE]/20 px-2 py-0.5 text-xs text-[#22D3EE]">
                    {pendingActions}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-sm font-semibold text-white">Sell readiness check</p>
          <p className="mt-1 text-xs text-white/60">
            Complete email, phone, and profile details before publishing listings.
          </p>
        </div>
      </aside>

      <div className="border-b border-white/10 px-4 py-3 lg:hidden">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-semibold text-white">
            Tek<span className="text-[#22D3EE]">Swapp</span> Dashboard
          </p>
          <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/70">
            {verificationProgress}% verified
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{
                background: activeSection === item.id ? 'rgba(37,99,235,0.22)' : 'rgba(255,255,255,0.05)',
                color: activeSection === item.id ? '#ffffff' : 'rgba(255,255,255,0.75)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
