export type AccountType = 'unified' | 'admin'

export type VerificationStatus = 'unverified' | 'pending' | 'verified'

export interface PayoutInfo {
  stripeAccountId?: string
  connected: boolean
  pendingAmount: number
  availableAmount: number
  currency: string
}

export interface User {
  id: string
  email: string
  name: string
  accountType: AccountType
  avatarUrl?: string
  verificationStatus: VerificationStatus
  joinedDate: string
  country: string
  totalListings: number
  totalSales: number
  rating: number
  payoutInfo?: PayoutInfo
}

export interface ActiveListing {
  id: string
  title: string
  price: number
  image: string
  views: number
  watchers: number
  createdAt: string
  status: 'active' | 'sold' | 'paused'
}

export interface RecentSale {
  id: string
  title: string
  price: number
  image: string
  soldDate: string
  buyerName: string
  payoutStatus: 'pending' | 'processing' | 'paid'
}
