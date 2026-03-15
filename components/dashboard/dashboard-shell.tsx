'use client'

import Link from 'next/link'
import { useEffect, useEffectEvent, useMemo, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  canUserPublishListings,
  getPendingActionCount,
  getVerificationProgress,
  getListingCountByStatus,
} from '@/lib/dashboard-data'
import DashboardSidebar from '@/components/dashboard/dashboard-sidebar'
import ListingsPanel from '@/components/dashboard/listings-panel'
import ModerationPanel from '@/components/dashboard/moderation-panel'
import OverviewPanel from '@/components/dashboard/overview-panel'
import PurchasesPanel from '@/components/dashboard/purchases-panel'
import SalesPanel from '@/components/dashboard/sales-panel'
import SettingsPanel from '@/components/dashboard/settings-panel'
import VerificationPanel from '@/components/dashboard/verification-panel'
import { formatPrice } from '@/lib/utils'
import { DashboardSection, DashboardSnapshot } from '@/types/dashboard'

interface DashboardShellProps {
  snapshot: DashboardSnapshot
  initialSection: DashboardSection
  notice?: {
    tone: 'warning' | 'success'
    message: string
  }
}

const AUTO_REFRESH_MS = 60_000

const sectionMeta: Record<DashboardSection, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'Track account activity, readiness, and current marketplace status.',
  },
  listings: {
    title: 'My Listings',
    subtitle: 'Manage active, draft, sold, and review-pending inventory.',
  },
  moderation: {
    title: 'Review Queue',
    subtitle: 'Owner and staff accounts can review submissions before they hit the marketplace.',
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

function formatSyncTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default function DashboardShell({
  snapshot,
  initialSection,
  notice,
}: DashboardShellProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<DashboardSection>(initialSection)
  const [lastSyncedAt, setLastSyncedAt] = useState(snapshot.generatedAt)
  const [isRefreshing, startRefreshTransition] = useTransition()

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])

  useEffect(() => {
    setLastSyncedAt(snapshot.generatedAt)
  }, [snapshot.generatedAt])

  const verificationProgress = useMemo(
    () => getVerificationProgress(snapshot.profile, snapshot.emailVerified),
    [snapshot.profile, snapshot.emailVerified]
  )
  const pendingActions = useMemo(() => getPendingActionCount(snapshot), [snapshot])
  const sellerReady = useMemo(
    () => canUserPublishListings(snapshot.profile, snapshot.emailVerified),
    [snapshot.profile, snapshot.emailVerified]
  )
  const activeListings = useMemo(
    () => getListingCountByStatus(snapshot.listings, 'active'),
    [snapshot.listings]
  )
  const draftListings = useMemo(
    () => getListingCountByStatus(snapshot.listings, 'draft'),
    [snapshot.listings]
  )
  const saleCurrencies = useMemo(
    () => new Set(snapshot.sales.map((sale) => sale.currencyCode)),
    [snapshot.sales]
  )
  const salesVolumeLabel = useMemo(
    () =>
      snapshot.sales.length === 0
        ? '$0'
        : saleCurrencies.size === 1
          ? formatPrice(snapshot.sales.reduce((total, sale) => total + sale.amount, 0), snapshot.sales[0].currencyCode)
          : 'Multi-currency',
    [saleCurrencies, snapshot.sales]
  )
  const liveOrders = useMemo(
    () => snapshot.sales.filter((sale) => sale.shippingStatus !== 'delivered').length,
    [snapshot.sales]
  )
  const currentSection = sectionMeta[activeSection]
  const autoRefreshEnabled = activeSection !== 'verification' && activeSection !== 'settings'
  const syncTimeLabel = useMemo(() => formatSyncTime(lastSyncedAt), [lastSyncedAt])

  const sectionBadges = useMemo<Partial<Record<DashboardSection, string>>>(
    () => ({
      listings: snapshot.listings.length.toString(),
      moderation: snapshot.privilegedAccess.canReviewListings
        ? snapshot.moderationSummary.pendingReview.toString()
        : undefined,
      sales: snapshot.sales.length.toString(),
      purchases: snapshot.purchases.length.toString(),
      verification: sellerReady ? 'Ready' : pendingActions.toString(),
    }),
    [
      pendingActions,
      sellerReady,
      snapshot.listings.length,
      snapshot.moderationSummary.pendingReview,
      snapshot.privilegedAccess.canReviewListings,
      snapshot.purchases.length,
      snapshot.sales.length,
    ]
  )

  const summaryCards = useMemo(
    () => [
      {
        label: 'Active listings',
        value: activeListings.toString(),
        hint: draftListings > 0 ? `${draftListings} drafts waiting` : 'No drafts lagging behind',
      },
      {
        label: 'Sales volume',
        value: salesVolumeLabel,
        hint: snapshot.sales.length > 0 ? `${snapshot.sales.length} orders captured` : 'No orders yet',
      },
      {
        label: 'Pending actions',
        value: pendingActions.toString(),
        hint: sellerReady ? 'Publishing unlocked' : 'Verification still in progress',
      },
      {
        label: 'Activity sync',
        value: isRefreshing ? 'Refreshing' : 'Live',
        hint: autoRefreshEnabled ? 'Auto-refresh each minute' : 'Paused while editing forms',
      },
    ],
    [
      activeListings,
      autoRefreshEnabled,
      draftListings,
      isRefreshing,
      pendingActions,
      salesVolumeLabel,
      sellerReady,
      snapshot.sales.length,
    ]
  )

  function writeSectionToUrl(section: DashboardSection) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', section)
    params.delete('saved')
    params.delete('verification_error')
    params.delete('t')
    const nextUrl = `/dashboard?${params.toString()}`
    window.history.replaceState(window.history.state, '', nextUrl)
  }

  function refreshDashboard() {
    if (isRefreshing) return

    startRefreshTransition(() => {
      router.refresh()
    })
  }

  const handleAutoRefresh = useEffectEvent(() => {
    if (isRefreshing || !autoRefreshEnabled || document.visibilityState !== 'visible') return

    startRefreshTransition(() => {
      router.refresh()
    })
  })

  useEffect(() => {
    if (!autoRefreshEnabled) return

    const intervalId = window.setInterval(() => handleAutoRefresh(), AUTO_REFRESH_MS)
    const handleFocus = () => handleAutoRefresh()

    window.addEventListener('focus', handleFocus)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [autoRefreshEnabled])

  function openSection(section: DashboardSection) {
    setActiveSection(section)
    writeSectionToUrl(section)
  }

  return (
    <div className="dashboard-shell min-h-screen text-white">
      <div className="relative z-[1] lg:flex">
        <DashboardSidebar
          activeSection={activeSection}
          onNavigate={openSection}
          showModeration={snapshot.privilegedAccess.canReviewListings}
          displayName={snapshot.displayName}
          displayEmail={snapshot.email}
          verificationProgress={verificationProgress}
          sellerReady={sellerReady}
          pendingActions={pendingActions}
          autoRefreshEnabled={autoRefreshEnabled}
          lastSyncedLabel={syncTimeLabel}
          sectionBadges={sectionBadges}
        />

        <main className="flex-1 px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {notice && (
              <div
                className="dashboard-panel rounded-2xl px-4 py-3 text-sm"
                style={
                  notice.tone === 'warning'
                    ? {
                        borderColor: 'rgba(251,191,36,0.45)',
                        color: '#fde68a',
                      }
                    : {
                        borderColor: 'rgba(52,211,153,0.4)',
                        color: '#86efac',
                      }
                }
              >
                {notice.message}
              </div>
            )}

            <header className="dashboard-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-7">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_56%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_46%)]" />
              <div className="relative">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="dashboard-reading-box max-w-3xl rounded-[1.6rem] p-5 sm:p-6">
                    <p className="section-kicker">{currentSection.title}</p>
                    <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                      {currentSection.title} control center
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/84 sm:text-base">
                      {currentSection.subtitle} Seller readiness is {sellerReady ? 'live' : 'still in progress'} and
                      your latest dashboard snapshot synced at {syncTimeLabel}.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="dashboard-chip" data-tone={sellerReady ? 'success' : 'warning'}>
                        {sellerReady ? 'Seller ready' : 'Verification needed'}
                      </span>
                      <span className="dashboard-chip" data-tone={pendingActions > 0 ? 'warning' : 'success'}>
                        {pendingActions} open action{pendingActions === 1 ? '' : 's'}
                      </span>
                      <span className="dashboard-chip" data-tone={autoRefreshEnabled ? 'accent' : 'neutral'}>
                        {autoRefreshEnabled ? 'Auto-refresh on' : 'Auto-refresh paused'}
                      </span>
                      <span className="dashboard-chip" data-tone="neutral">
                        Synced {syncTimeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="dashboard-reading-box flex flex-wrap gap-2 rounded-[1.6rem] p-4 xl:max-w-sm xl:justify-end">
                    <Link href="/listings" className="ghost-button rounded-xl px-4 py-2 text-sm font-semibold text-white/94">
                      Browse marketplace
                    </Link>
                    {snapshot.privilegedAccess.canReviewListings && (
                      <button
                        type="button"
                        onClick={() => openSection('moderation')}
                        className="ghost-button rounded-xl px-4 py-2 text-sm font-semibold text-white/94"
                      >
                        Open review queue
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={refreshDashboard}
                      disabled={isRefreshing}
                      className="ghost-button rounded-xl px-4 py-2 text-sm font-semibold text-white/94 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRefreshing ? 'Refreshing...' : 'Refresh dashboard'}
                    </button>
                    <button
                      type="button"
                      onClick={() => (sellerReady ? router.push('/sell') : openSection('verification'))}
                      className="brand-button rounded-xl px-4 py-2 text-sm font-semibold text-white"
                    >
                      {sellerReady ? 'Create listing' : 'Complete verification'}
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                  {summaryCards.map((card) => (
                    <article
                      key={card.label}
                      className="dashboard-panel-soft dashboard-stat-card rounded-2xl px-4 py-4"
                    >
                      <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/58">{card.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
                      <p className="mt-1 text-sm text-white/76">{card.hint}</p>
                    </article>
                  ))}
                </div>

                <div className="dashboard-summary-strip mt-5 sm:grid-cols-3">
                  <div className="dashboard-summary-pill">
                    <strong>{activeListings}</strong> active listing{activeListings === 1 ? '' : 's'} live now
                  </div>
                  <div className="dashboard-summary-pill">
                    <strong>{liveOrders}</strong> sale{liveOrders === 1 ? '' : 's'} still moving through shipping
                  </div>
                  <div className="dashboard-summary-pill">
                    <strong>{snapshot.purchases.length}</strong> purchase{snapshot.purchases.length === 1 ? '' : 's'} tied to this account
                  </div>
                </div>
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

            {activeSection === 'moderation' && snapshot.privilegedAccess.role && (
              <ModerationPanel
                role={snapshot.privilegedAccess.role}
                workspacePath={snapshot.privilegedAccess.moderationPath}
                listings={snapshot.moderationQueue}
                summary={snapshot.moderationSummary}
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
          </div>
        </main>
      </div>
    </div>
  )
}
