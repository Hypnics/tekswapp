'use client'

import { DashboardSection } from '@/types/dashboard'

interface DashboardSidebarProps {
  activeSection: DashboardSection
  onNavigate: (section: DashboardSection) => void
  showModeration: boolean
  displayName: string
  displayEmail: string
  verificationProgress: number
  sellerReady: boolean
  pendingActions: number
  autoRefreshEnabled: boolean
  lastSyncedLabel: string
  sectionBadges: Partial<Record<DashboardSection, string>>
}

const baseNavItems: { id: DashboardSection; label: string; description: string }[] = [
  { id: 'overview', label: 'Overview', description: 'Pulse and priorities' },
  { id: 'listings', label: 'My Listings', description: 'Inventory and drafts' },
  { id: 'sales', label: 'Sales', description: 'Orders and payouts' },
  { id: 'purchases', label: 'Purchases', description: 'Orders you placed' },
  { id: 'verification', label: 'Verification', description: 'Seller access setup' },
  { id: 'settings', label: 'Settings', description: 'Profile and account' },
]

function buildNavItems(showModeration: boolean): { id: DashboardSection; label: string; description: string }[] {
  if (!showModeration) return baseNavItems

  return [
    baseNavItems[0],
    baseNavItems[1],
    { id: 'moderation', label: 'Review Queue', description: 'Owner and staff approvals' },
    ...baseNavItems.slice(2),
  ]
}

export default function DashboardSidebar({
  activeSection,
  onNavigate,
  showModeration,
  displayName,
  displayEmail,
  verificationProgress,
  sellerReady,
  pendingActions,
  autoRefreshEnabled,
  lastSyncedLabel,
  sectionBadges,
}: DashboardSidebarProps) {
  const initial = displayName.trim().charAt(0).toUpperCase() || 'T'
  const navItems = buildNavItems(showModeration)

  return (
    <>
      <aside className="hidden w-[19rem] border-r border-white/10 bg-[#08101b]/85 backdrop-blur-xl lg:block">
        <div className="sticky top-0 flex h-screen flex-col px-5 py-6">
          <div className="mb-6">
            <span className="brand-wordmark" data-size="sm">
              <span className="brand-wordmark-core">Tek</span>
              <span className="brand-wordmark-accent">Swapp</span>
            </span>
            <p className="mt-2 text-[0.68rem] uppercase tracking-[0.24em] text-white/42">
              Seller and buyer cockpit
            </p>
          </div>

          <section className="dashboard-panel rounded-[1.75rem] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-lg font-semibold text-cyan-200">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="truncate text-xs text-white/58">{displayEmail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="dashboard-chip" data-tone={sellerReady ? 'success' : 'warning'}>
                    {sellerReady ? 'Seller ready' : 'Setup active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/52">
                <span>Verification</span>
                <span>{verificationProgress}%</span>
              </div>
              <div className="dashboard-progress-track mt-2 h-2">
                <div className="dashboard-progress-fill h-full" style={{ width: `${verificationProgress}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/55">
                {pendingActions > 0
                  ? `${pendingActions} action${pendingActions === 1 ? '' : 's'} still open`
                  : 'No blocked seller actions'}
              </p>
            </div>
          </section>

          <nav className="mt-5 space-y-2">
            {navItems.map((item) => {
              const active = activeSection === item.id
              const badge = sectionBadges[item.id]

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className="w-full rounded-2xl border px-3 py-3 text-left transition-all"
                  style={{
                    borderColor: active ? 'rgba(103,242,255,0.24)' : 'rgba(255,255,255,0.06)',
                    background: active
                      ? 'linear-gradient(135deg, rgba(37,99,235,0.22), rgba(34,211,238,0.08))'
                      : 'rgba(255,255,255,0.02)',
                    boxShadow: active ? '0 14px 32px rgba(3, 8, 18, 0.22)' : 'none',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-white/52">{item.description}</p>
                    </div>
                    {badge && (
                      <span
                        className="rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
                        style={{
                          background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                          color: badge === 'Ready' ? '#6ee7b7' : 'rgba(255,255,255,0.78)',
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <section className="dashboard-panel-soft rounded-2xl p-4">
              <p className="text-sm font-semibold text-white">Sell readiness check</p>
              <p className="mt-1 text-xs leading-relaxed text-white/58">
                Email, phone, and address details must be complete before new listings can go live.
              </p>
            </section>

            <section className="dashboard-panel-soft rounded-2xl p-4">
              <p className="text-sm font-semibold text-white">Live sync</p>
              <p className="mt-1 text-xs leading-relaxed text-white/58">
                Last synced at {lastSyncedLabel}. {autoRefreshEnabled ? 'Auto-refresh is running.' : 'Auto-refresh is paused while you edit forms.'}
              </p>
            </section>
          </div>
        </div>
      </aside>

      <div className="px-4 pt-3 lg:hidden">
        <div className="dashboard-panel rounded-[1.75rem] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="brand-wordmark" data-size="sm">
                <span className="brand-wordmark-core">Tek</span>
                <span className="brand-wordmark-accent">Swapp</span>
              </span>
              <p className="mt-2 text-sm font-semibold text-white">{displayName}</p>
              <p className="text-xs text-white/55">{displayEmail}</p>
            </div>
            <span className="dashboard-chip" data-tone={sellerReady ? 'success' : 'warning'}>
              {verificationProgress}% ready
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/58">
            <span>Synced {lastSyncedLabel}</span>
            <span>{autoRefreshEnabled ? 'Auto-refresh on' : 'Auto-refresh paused'}</span>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active = activeSection === item.id
              const badge = sectionBadges[item.id]

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold"
                  style={{
                    background: active ? 'rgba(37,99,235,0.26)' : 'rgba(255,255,255,0.06)',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.72)',
                  }}
                >
                  {item.label}
                  {badge ? ` ${badge}` : ''}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
