import { Condition } from '@/types/listing'

export type DashboardSection =
  | 'overview'
  | 'listings'
  | 'sales'
  | 'purchases'
  | 'verification'
  | 'settings'

export type ListingWorkflowStatus = 'active' | 'draft' | 'sold' | 'pending_review' | 'paused'
export type ShippingStatus = 'label_created' | 'in_transit' | 'delivered'
export type PayoutStatus = 'on_hold' | 'processing' | 'released'
export type PurchaseStatus = 'processing' | 'shipped' | 'delivered'

export type ProfileVerificationStatus = 'unverified' | 'in_review' | 'verified' | 'rejected'
export type VerificationStepStatus = 'complete' | 'pending' | 'incomplete'

export interface ProfileRecord {
  id: string
  full_name: string | null
  phone: string | null
  phone_verified: boolean
  country: string | null
  city: string | null
  address_line_1: string | null
  postal_code: string | null
  avatar_url: string | null
  document_url: string | null
  verification_status: ProfileVerificationStatus
  seller_enabled: boolean
  created_at: string
  updated_at: string
}

export interface DashboardListing {
  id: string
  title: string
  category: string
  price: number
  condition: Condition
  status: ListingWorkflowStatus
  image: string
  views: number
  watchers: number
  updatedAt: string
}

export interface SaleOrder {
  id: string
  orderNumber: string
  listingTitle: string
  buyerName: string
  buyerHandle: string
  shippingStatus: ShippingStatus
  payoutStatus: PayoutStatus
  amount: number
  soldAt: string
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  itemTitle: string
  sellerName: string
  status: PurchaseStatus
  trackingCode?: string
  amount: number
  purchasedAt: string
}

export interface VerificationStep {
  id: 'email' | 'phone' | 'profile' | 'documents' | 'approval'
  label: string
  description: string
  status: VerificationStepStatus
  optional?: boolean
}

export interface DashboardSnapshot {
  userId: string
  email: string
  emailVerified: boolean
  displayName: string
  profile: ProfileRecord
  listings: DashboardListing[]
  sales: SaleOrder[]
  purchases: PurchaseOrder[]
}
