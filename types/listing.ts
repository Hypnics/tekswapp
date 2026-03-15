import type { SupportedCurrencyCode } from '@/lib/currency/config'

export type Condition =
  | 'New'
  | 'Like New'
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'For Parts / Not Working'
export type CurrencyCode = SupportedCurrencyCode
export type ShippingMode = 'none' | 'basic' | 'advanced'

export type Category =
  | 'Phones'
  | 'Tablets'
  | 'Laptops'
  | 'Consoles'
  | 'Wearables'
  | 'Audio'
  | 'Other'

export interface Seller {
  id: string
  name: string
  rating: number
  totalSales: number
  verified: boolean
  joinedDate: string
  avatarUrl?: string
}

export interface ShippingRate {
  countryCode: string
  countryName: string
  amount: number
  minDays?: number
  maxDays?: number
}

export interface ShippingProfile {
  sellerCountryCode: string
  sellerCountryName: string
  domesticAmount?: number
  domesticMinDays?: number
  domesticMaxDays?: number
  internationalAmount?: number
  internationalMinDays?: number
  internationalMaxDays?: number
  advancedRates?: ShippingRate[]
}

export interface ListingPrivateIdentifiers {
  imei?: string
  serialNumber?: string
}

export interface Listing {
  id: string
  title: string
  category: Category
  brand: string
  model: string
  price: number
  originalPrice?: number
  condition: Condition
  storage?: string
  batteryHealth?: number
  color?: string
  image: string
  images: string[]
  seller: Seller
  verified: boolean
  description: string
  imeiStatus?: 'Clean' | 'Reported' | 'Unknown'
  sellerNotes?: string
  createdAt: string
  views?: number
  watchers?: number
  status?: 'active' | 'draft' | 'sold' | 'pending_review' | 'paused'
  deviceSpecs?: Record<string, string>
  currencyCode: CurrencyCode
  shippingMode: ShippingMode
  shippingProfile?: ShippingProfile
}

export interface SellerEditableListing {
  id: string
  title: string
  category: Category
  brand: string
  model: string
  price: number
  originalPrice?: number
  condition: Condition
  images: string[]
  description: string
  sellerNotes?: string
  deviceSpecs?: Record<string, string>
  currencyCode: CurrencyCode
  shippingMode: ShippingMode
  shippingProfile?: ShippingProfile
  status?: Listing['status']
  privateIdentifiers?: ListingPrivateIdentifiers
}
