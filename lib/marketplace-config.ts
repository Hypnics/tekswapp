import { Category, Condition } from '@/types/listing'

export const MARKETPLACE_CATEGORIES: Category[] = [
  'Phones',
  'Tablets',
  'Laptops',
  'Consoles',
  'Wearables',
  'Audio',
  'Other',
]

export const LISTING_CONDITIONS: Condition[] = ['New', 'Like New', 'Good', 'Fair', 'Poor']

export type ListingSort = 'newest' | 'price_asc' | 'price_desc' | 'most_watched'

export const LISTING_SORT_OPTIONS: { value: ListingSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'most_watched', label: 'Most watched' },
]

export interface SpecFieldConfig {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'number'
  required?: boolean
}

export const CATEGORY_SPEC_FIELDS: Record<Category, SpecFieldConfig[]> = {
  Phones: [
    { key: 'storage', label: 'Storage', placeholder: 'e.g. 256GB', required: true },
    { key: 'ram', label: 'RAM', placeholder: 'e.g. 8GB', required: true },
    { key: 'screen_size', label: 'Screen Size', placeholder: 'e.g. 6.7 in', required: true },
    { key: 'chipset', label: 'Chipset', placeholder: 'e.g. A17 Pro', required: true },
    { key: 'network_lock', label: 'Network Lock', placeholder: 'Unlocked / Carrier', required: true },
    { key: 'battery_health', label: 'Battery Health (%)', type: 'number', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Natural Titanium', required: true },
    { key: 'imei_status', label: 'IMEI Status', placeholder: 'Clean / Unknown / Reported', required: true },
  ],
  Tablets: [
    { key: 'storage', label: 'Storage', placeholder: 'e.g. 256GB', required: true },
    { key: 'ram', label: 'RAM', placeholder: 'e.g. 8GB', required: true },
    { key: 'screen_size', label: 'Screen Size', placeholder: 'e.g. 12.9 in', required: true },
    { key: 'connectivity', label: 'Connectivity', placeholder: 'Wi-Fi / Wi-Fi + Cellular', required: true },
    { key: 'battery_health', label: 'Battery Health (%)', type: 'number', required: false },
    { key: 'color', label: 'Color', placeholder: 'e.g. Space Gray', required: false },
  ],
  Laptops: [
    { key: 'cpu', label: 'CPU', placeholder: 'e.g. Intel i7 / Apple M3', required: true },
    { key: 'ram', label: 'RAM', placeholder: 'e.g. 16GB', required: true },
    { key: 'storage', label: 'Storage', placeholder: 'e.g. 512GB SSD', required: true },
    { key: 'gpu', label: 'GPU', placeholder: 'e.g. RTX 4060 / Integrated', required: true },
    { key: 'screen_size', label: 'Screen Size', placeholder: 'e.g. 15.6 in', required: true },
    { key: 'battery_health', label: 'Battery Health (%)', type: 'number', required: false },
    { key: 'keyboard_layout', label: 'Keyboard Layout', placeholder: 'e.g. US / UK', required: false },
    { key: 'color', label: 'Color', placeholder: 'e.g. Midnight', required: false },
  ],
  Consoles: [
    { key: 'storage', label: 'Storage', placeholder: 'e.g. 825GB', required: true },
    { key: 'edition', label: 'Edition', placeholder: 'Disc / Digital / OLED', required: true },
    { key: 'region', label: 'Region', placeholder: 'e.g. NA / EU', required: true },
    { key: 'controller_count', label: 'Controller Count', type: 'number', required: true },
    { key: 'included_accessories', label: 'Included Accessories', placeholder: 'e.g. Dock, HDMI, case', required: false },
  ],
  Wearables: [
    { key: 'case_size', label: 'Case Size', placeholder: 'e.g. 45mm', required: true },
    { key: 'band_type', label: 'Band Type', placeholder: 'e.g. Sport Loop', required: true },
    { key: 'battery_health', label: 'Battery Health (%)', type: 'number', required: false },
    { key: 'connectivity', label: 'Connectivity', placeholder: 'Bluetooth / LTE', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Silver', required: false },
  ],
  Audio: [
    { key: 'audio_type', label: 'Type', placeholder: 'Headphones / Earbuds / Speaker', required: true },
    { key: 'connectivity', label: 'Connectivity', placeholder: 'Wired / Bluetooth', required: true },
    { key: 'battery_life_hours', label: 'Battery Life (Hours)', type: 'number', required: false },
    { key: 'noise_cancelling', label: 'Noise Cancelling', placeholder: 'Yes / No', required: false },
    { key: 'color', label: 'Color', placeholder: 'e.g. Black', required: false },
  ],
  Other: [
    { key: 'device_type', label: 'Device Type', placeholder: 'Describe the device type', required: true },
    { key: 'primary_specs', label: 'Primary Specs', placeholder: 'Main specs buyers should know', required: true },
  ],
}

export interface MarketplaceFilters {
  q?: string
  category?: string
  condition?: string
  verified?: string
  sort?: string
}

function normalizeSort(value: string | undefined): ListingSort {
  const validSorts: ListingSort[] = ['newest', 'price_asc', 'price_desc', 'most_watched']
  return validSorts.includes(value as ListingSort) ? (value as ListingSort) : 'newest'
}

export function normalizeCategoryFilter(value: string | undefined): Category | undefined {
  if (!value) return undefined
  const normalized = value.trim()
  if (normalized.toLowerCase() === 'all categories') return undefined
  return MARKETPLACE_CATEGORIES.includes(normalized as Category) ? (normalized as Category) : undefined
}

export function normalizeConditionFilter(value: string | undefined): Condition | undefined {
  if (!value) return undefined
  const normalized = value.trim()
  if (normalized.toLowerCase() === 'all conditions') return undefined
  return LISTING_CONDITIONS.includes(normalized as Condition) ? (normalized as Condition) : undefined
}

export function normalizeVerifiedFilter(value: string | undefined): boolean {
  return value === 'true'
}

export function normalizeSortFilter(value: string | undefined): ListingSort {
  return normalizeSort(value)
}
