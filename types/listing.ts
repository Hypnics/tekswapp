export type Condition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'
export type CurrencyCode = 'USD'
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
