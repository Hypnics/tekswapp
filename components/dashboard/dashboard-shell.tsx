'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  canUserPublishListings,
  getPendingActionCount,
  getVerificationProgress,
} from '@/lib/dashboard-data'
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar'
import ListingsPanel from '@/components/dashboard/listings-panel'
import OverviewPanel from '@/components/dashboard/overview-panel'
import PurchasesPanel from '@/components/dashboard/purchases-panel'
import SalesPanel from '@/components/dashboard/sales-panel'
import SettingsPanel from '@/components/dashboard/settings-panel'
import VerificationPanel from '@/components/dashboard/verification-panel'
import { DashboardSection, DashboardSnapshot } from '@/types/dashboard'

interface DashboardShellProps {
  snapshot: DashboardSnapshot
  initialSection: DashboardSection
  notice?: {
    tone: 'warning' | 'success'
    message: string
  }
}

const sectionMeta: Record<DashboardSection, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'Track account activity, readiness, and current marketplace status.',
  },
  listings: {
    title: 'My Listings',
    subtitle: 'Manage active, draft, sold, and review-pending inventory.',
  },
  sales: {
    title: 'Sales',
    subtitle: 'Follow buyer orders, shipping, and payout milestones.',
  },
  purchases: {
    title: 'Purchases',
    subtitle: 'Review your order history and tracking placeholders.',
  },
  verification: {
    title: 'Verification',
    subtitle: 'Complete lightweight seller verification and unlock publishing.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Maintain your unified buyer and seller account profile.',
  },
}

export default function DashboardShell({
  snapshot,
  initialSection,
  notice,
}: DashboardShellProps) {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<DashboardSection>(initialSection)

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  const verificationProgress = useMemo(
    () => getVerificationProgress(snapshot.profile, snapshot.emailVerified),
    [snapshot.profile, snapshot.emailVerified]
  )
  const pendingActions = useMemo(() => getPendingActionCount(snapshot), [snapshot])
  const sellerReady = useMemo(
    () => canUserPublishListings(snapshot.profile, snapshot.emailVerified),
    [snapshot.profile, snapshot.emailVerified]
  )

  const currentSection = sectionMeta[activeSection]

  function openSection(section: DashboardSection) {
    setActiveSection(section)
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <div className="lg:flex">
        <DashboardSidebar
          activeSection={activeSection}
          onNavigate={openSection}
          displayName={snapshot.displayName}
          displayEmail={snapshot.email}
          verificationProgress={verificationProgress}
          sellerReady={sellerReady}
          pendingActions={pendingActions}
        />

        <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-8 lg:pt-8">
          {notice && (
            <div
              className="mb-4 rounded-xl border px-4 py-3 text-sm"
              style={
                notice.tone === 'warning'
                  ? {
                      borderColor: 'rgba(251,191,36,0.45)',
                      background: 'rgba(251,191,36,0.1)',
                      color: '#fde68a',
                    }
                  : {
                      borderColor: 'rgba(52,211,153,0.4)',
                      background: 'rgba(52,211,153,0.1)',
                      color: '#86efac',
                    }
              }
            >
              {notice.message}
            </div>
          )}
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#22D3EE]">{currentSection.title}</p>
              <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{currentSection.title}</h1>
              <p className="mt-1 text-sm text-white/68">{currentSection.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/listings"
                className="rounded-xl border px-4 py-2 text-sm font-semibold text-white/90"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Browse marketplace
              </Link>
              <button
                onClick={() => (sellerReady ? router.push('/sell') : openSection('verification'))}
                className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white"
              >
                {sellerReady ? 'Create listing' : 'Complete verification'}
              </button>
            </div>
          </header>

          {activeSection === 'overview' && (
            <OverviewPanel
              snapshot={snapshot}
              verificationProgress={verificationProgress}
              pendingActions={pendingActions}
              onNavigate={openSection}
            />
          )}

          {activeSection === 'listings' && (
            <ListingsPanel
              listings={snapshot.listings}
              canPublish={sellerReady}
              onRequireVerification={() => openSection('verification')}
            />
          )}

          {activeSection === 'sales' && <SalesPanel sales={snapshot.sales} />}
          {activeSection === 'purchases' && <PurchasesPanel purchases={snapshot.purchases} />}
          {activeSection === 'verification' && (
            <VerificationPanel
              profile={snapshot.profile}
              email={snapshot.email}
              emailVerified={snapshot.emailVerified}
              progress={verificationProgress}
            />
          )}
          {activeSection === 'settings' && (
            <SettingsPanel profile={snapshot.profile} email={snapshot.email} />
          )}
        </main>
      </div>
    </div>
  )
}
