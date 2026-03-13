import { Listing } from '@/types/listing'
import { ActiveListing, RecentSale, User } from '@/types/user'

// Demo listings removed. Marketplace inventory is now loaded from Supabase.
export const listings: Listing[] = []

export function getListingById(id: string): Listing | undefined {
  void id
  return undefined
}

export function getListingsByCategory(category: string): Listing[] {
  void category
  return []
}

export function getFeaturedListings(count = 4): Listing[] {
  void count
  return []
}

export const dummyUser: User = {
  id: 'u1',
  email: 'seller@example.com',
  name: 'Seller',
  accountType: 'unified',
  verificationStatus: 'pending',
  joinedDate: new Date().toISOString(),
  country: 'United States',
  totalListings: 0,
  totalSales: 0,
  rating: 0,
}

export const dummyActiveListings: ActiveListing[] = []
export const dummyRecentSales: RecentSale[] = []
