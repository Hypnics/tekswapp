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

export const LISTING_CONDITIONS: Condition[] = [
  'New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'For Parts / Not Working',
]

export const CONDITION_HELP: { value: Condition; description: string }[] = [
  { value: 'New', description: 'Unused, sealed, or never activated.' },
  { value: 'Like New', description: 'Very little to no visible wear, fully functional.' },
  { value: 'Excellent', description: 'Minor signs of use, fully functional.' },
  { value: 'Good', description: 'Noticeable wear but works properly.' },
  { value: 'Fair', description: 'Heavy wear and/or minor issues, still usable.' },
  { value: 'For Parts / Not Working', description: 'Not fully functional and repair is needed.' },
]

export type ListingSort = 'newest' | 'price_asc' | 'price_desc' | 'most_watched'

export const LISTING_SORT_OPTIONS: { value: ListingSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'most_watched', label: 'Most watched' },
]

export type SpecFieldType = 'text' | 'number' | 'select' | 'date' | 'multiselect' | 'textarea'
export type ListingFormSection = 'device_specs' | 'condition' | 'extras'
export type ListingWizardStepId = 'basic' | 'specs' | 'condition' | 'photos' | 'shipping_review'

export interface SpecFieldVisibility {
  brandIncludes?: string[]
  modelIncludes?: string[]
  specEquals?: Record<string, string[]>
}

export interface SpecFieldConfig {
  key: string
  label: string
  placeholder?: string
  helperText?: string
  type?: SpecFieldType
  required?: boolean
  recommended?: boolean
  options?: string[]
  min?: number
  max?: number
  step?: number
  rows?: number
  section: ListingFormSection
  showWhen?: SpecFieldVisibility
}

export interface ListingSpecContext {
  brand?: string
  model?: string
  specs?: Record<string, string>
}

export interface ListingWizardStepConfig {
  id: ListingWizardStepId
  label: string
}

export interface ListingSectionCopy {
  eyebrow: string
  title: string
  copy: string
}

export interface ListingBasicInfoConfig extends ListingSectionCopy {
  titlePlaceholder: string
  brandPlaceholder: string
  modelLabel: string
  modelPlaceholder: string
  priceHelper: string
  originalPricePlaceholder: string
}

export interface ListingPrivateInfoConfig extends ListingSectionCopy {
  showImei: boolean
  imeiLabel: string
  imeiPlaceholder: string
  serialLabel: string
  serialPlaceholder: string
}

export interface ListingPhotoSectionConfig extends ListingSectionCopy {
  uploadHint: string
  emptyState: string
}

export interface ListingDescriptionSectionConfig extends ListingSectionCopy {
  descriptionPlaceholder: string
  sellerNotesPlaceholder: string
}

export interface CategoryWizardConfig {
  heroDescription: string
  categoryCardDescription: string
  steps: ListingWizardStepConfig[]
  basicInfo: ListingBasicInfoConfig
  specsSection: ListingSectionCopy
  conditionSection: ListingSectionCopy
  privateSection: ListingPrivateInfoConfig
  photosSection: ListingPhotoSectionConfig
  descriptionSection: ListingDescriptionSectionConfig
  shippingSection: ListingSectionCopy
  reviewSection: ListingSectionCopy
}

const PHONE_STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB']
const TABLET_STORAGE_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB']
const LAPTOP_STORAGE_OPTIONS = ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', 'Other']
const PHONE_TYPE_OPTIONS = ['iPhone', 'Android Phone', 'Foldable', 'Flip Phone', 'Gaming Phone', 'Other']
const CARRIER_STATUS_OPTIONS = [
  'Unlocked',
  'Bell',
  'Rogers',
  'Telus',
  'Fido',
  'Koodo',
  'Virgin Plus',
  'Freedom Mobile',
  'Videotron',
  'SaskTel',
  'Other',
]
const SIM_SUPPORT_OPTIONS = [
  'Nano-SIM',
  'Dual Nano-SIM',
  'Nano-SIM + eSIM',
  'Dual eSIM',
  'eSIM only',
  'Unknown',
]
const WARRANTY_STATUS_OPTIONS = [
  'No warranty',
  'Manufacturer warranty',
  'Store warranty',
  'AppleCare+',
  'Extended warranty',
  'Unknown',
]
const YES_NO_OPTIONS = ['Yes', 'No']
const YES_NO_UNKNOWN_OPTIONS = ['Yes', 'No', 'Unknown']
const BATTERY_CONDITION_OPTIONS = ['Excellent', 'Good', 'Fair', 'Needs service', 'Unknown']
const TABLET_CONNECTIVITY_OPTIONS = ['Wi-Fi', 'Wi-Fi + Cellular']
const WEARABLE_CONNECTIVITY_OPTIONS = ['GPS', 'GPS + Cellular', 'Bluetooth only']
const AUDIO_CONNECTIVITY_OPTIONS = ['Wireless', 'Wired', 'Wireless + wired']
const PHONE_ACCESSORY_OPTIONS = [
  'Charger',
  'Charging cable',
  'Original box',
  'Case',
  'Screen protector',
  'Earbuds',
  'None',
]
const TABLET_ACCESSORY_OPTIONS = [
  'Charger',
  'Charging cable',
  'Original box',
  'Keyboard cover',
  'Case',
  'Screen protector',
  'None',
]
const CONSOLE_ACCESSORY_OPTIONS = [
  'Dock',
  'Charging stand',
  'Vertical stand',
  'Original box',
  'Carrying case',
  'None',
]
const AUDIO_ACCESSORY_OPTIONS = [
  'Charging cable',
  'Original box',
  'Extra ear tips',
  'Case',
  '3.5mm cable',
  'USB dongle',
  'None',
]
const PHONE_BIOMETRICS_OPTIONS = ['Works as expected', 'Has issues', 'Not available on this model']
const OS_INSTALLED_OPTIONS = ['macOS', 'Windows 11', 'Windows 10', 'ChromeOS', 'Linux', 'No OS / wiped', 'Other']
const LAPTOP_TYPE_OPTIONS = ['MacBook', 'Ultrabook', 'Gaming laptop', '2-in-1', 'Workstation', 'Chromebook', 'Other']
const MACBOOK_CHIP_OPTIONS = ['M1', 'M1 Pro', 'M1 Max', 'M2', 'M2 Pro', 'M2 Max', 'M3', 'M3 Pro', 'M3 Max', 'M4', 'M4 Pro', 'M4 Max', 'Intel']
const TABLET_STYLUS_SUPPORT_OPTIONS = ['Supports Apple Pencil', 'Supports stylus', 'No stylus support', 'Unknown']
const CONSOLE_FAMILY_OPTIONS = ['PlayStation', 'Xbox', 'Nintendo', 'Other']
const PLAYSTATION_MODEL_OPTIONS = ['PS5', 'PS5 Slim', 'PS5 Pro', 'PS4 Pro', 'PS4', 'PS3']
const XBOX_MODEL_OPTIONS = ['Xbox Series X', 'Xbox Series S', 'Xbox One X', 'Xbox One S', 'Xbox One', 'Xbox 360']
const NINTENDO_MODEL_OPTIONS = ['Switch OLED', 'Switch', 'Switch Lite', 'Wii U', 'Wii']
const ONLINE_BAN_STATUS_OPTIONS = ['No issues', 'Restricted / banned', 'Unknown']
const WEARABLE_TYPE_OPTIONS = ['Smartwatch', 'Fitness tracker', 'Smart ring', 'Other']
const AUDIO_TYPE_OPTIONS = ['Earbuds', 'Headphones', 'Speaker', 'Microphone', 'Other']

function normalizeText(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? ''
}

function prettifySpecKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function matchesVisibilityRules(
  visibility: SpecFieldVisibility | undefined,
  context: ListingSpecContext
): boolean {
  if (!visibility) return true

  const brand = normalizeText(context.brand)
  const model = normalizeText(context.model)
  const specs = context.specs ?? {}

  if (visibility.brandIncludes?.length) {
    const matchesBrand = visibility.brandIncludes.some((entry) => brand.includes(entry.toLowerCase()))
    if (!matchesBrand) return false
  }

  if (visibility.modelIncludes?.length) {
    const matchesModel = visibility.modelIncludes.some((entry) => model.includes(entry.toLowerCase()))
    if (!matchesModel) return false
  }

  if (visibility.specEquals) {
    for (const [key, allowedValues] of Object.entries(visibility.specEquals)) {
      const value = normalizeText(specs[key])
      if (!allowedValues.some((allowedValue) => value === allowedValue.toLowerCase())) {
        return false
      }
    }
  }

  return true
}

export function isAppleIphoneListing(context: ListingSpecContext): boolean {
  const brand = normalizeText(context.brand)
  const model = normalizeText(context.model)
  const phoneType = normalizeText(context.specs?.phone_type)

  return brand.includes('apple') && (phoneType === 'iphone' || model.includes('iphone'))
}

const CATEGORY_SPEC_FIELD_MAP: Record<Category, SpecFieldConfig[]> = {
  Phones: [
    {
      key: 'phone_type',
      label: 'Phone type',
      type: 'select',
      options: PHONE_TYPE_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'storage',
      label: 'Storage capacity',
      type: 'select',
      options: PHONE_STORAGE_OPTIONS,
      helperText: 'Storage is one of the first details phone buyers compare.',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'color',
      label: 'Color',
      placeholder: 'e.g. Natural Titanium',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'carrier_status',
      label: 'Carrier / network status',
      type: 'select',
      options: CARRIER_STATUS_OPTIONS,
      helperText: 'Unlocked phones usually convert better.',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'sim_support',
      label: 'SIM / eSIM support',
      type: 'select',
      options: SIM_SUPPORT_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'ram',
      label: 'RAM',
      placeholder: 'e.g. 8GB',
      helperText: 'Helpful for Android buyers comparing multitasking and gaming performance.',
      required: true,
      section: 'device_specs',
      showWhen: {
        specEquals: {
          phone_type: ['Android Phone', 'Foldable', 'Flip Phone', 'Gaming Phone', 'Other'],
        },
      },
    },
    {
      key: 'battery_health',
      label: 'Battery health (%)',
      type: 'number',
      helperText: 'Highly recommended for iPhones.',
      recommended: true,
      min: 0,
      max: 100,
      step: 1,
      section: 'condition',
      showWhen: {
        brandIncludes: ['apple'],
      },
    },
    {
      key: 'face_id_touch_id',
      label: 'Face ID / Touch ID',
      type: 'select',
      options: PHONE_BIOMETRICS_OPTIONS,
      section: 'condition',
      showWhen: {
        brandIncludes: ['apple'],
      },
    },
    {
      key: 'included_accessories',
      label: 'Included accessories',
      type: 'multiselect',
      options: PHONE_ACCESSORY_OPTIONS,
      helperText: 'Show buyers exactly what arrives in the box.',
      section: 'extras',
    },
    {
      key: 'purchase_date',
      label: 'Original purchase date',
      type: 'date',
      section: 'condition',
    },
    {
      key: 'warranty_status',
      label: 'Warranty status',
      type: 'select',
      options: WARRANTY_STATUS_OPTIONS,
      section: 'condition',
    },
  ],
  Tablets: [
    {
      key: 'screen_size',
      label: 'Screen size',
      placeholder: 'e.g. 11 in',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'storage',
      label: 'Storage',
      type: 'select',
      options: TABLET_STORAGE_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'connectivity',
      label: 'Cellular or Wi-Fi',
      type: 'select',
      options: TABLET_CONNECTIVITY_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'color',
      label: 'Color',
      placeholder: 'e.g. Space Gray',
      section: 'device_specs',
    },
    {
      key: 'stylus_support',
      label: 'Apple Pencil / stylus support',
      type: 'select',
      options: TABLET_STYLUS_SUPPORT_OPTIONS,
      section: 'device_specs',
    },
    {
      key: 'stylus_included',
      label: 'Apple Pencil / stylus included',
      type: 'select',
      options: YES_NO_UNKNOWN_OPTIONS,
      section: 'extras',
    },
    {
      key: 'battery_condition',
      label: 'Battery condition',
      type: 'select',
      options: BATTERY_CONDITION_OPTIONS,
      section: 'condition',
    },
    {
      key: 'included_accessories',
      label: 'Included accessories',
      type: 'multiselect',
      options: TABLET_ACCESSORY_OPTIONS,
      section: 'extras',
    },
  ],
  Laptops: [
    {
      key: 'laptop_type',
      label: 'Laptop type',
      type: 'select',
      options: LAPTOP_TYPE_OPTIONS,
      section: 'device_specs',
    },
    {
      key: 'cpu',
      label: 'CPU / processor',
      placeholder: 'e.g. Intel Core i7-1360P',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'apple_chip',
      label: 'Apple chip type',
      type: 'select',
      options: MACBOOK_CHIP_OPTIONS,
      helperText: 'MacBook shoppers often filter by Apple silicon generation.',
      section: 'device_specs',
      showWhen: {
        brandIncludes: ['apple'],
      },
    },
    {
      key: 'ram',
      label: 'RAM',
      placeholder: 'e.g. 16GB',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'storage',
      label: 'Storage',
      type: 'select',
      options: LAPTOP_STORAGE_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'screen_size',
      label: 'Screen size',
      placeholder: 'e.g. 15.6 in',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'gpu',
      label: 'GPU',
      placeholder: 'e.g. RTX 4060 / Integrated',
      section: 'device_specs',
    },
    {
      key: 'os_installed',
      label: 'OS installed',
      type: 'select',
      options: OS_INSTALLED_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'battery_condition',
      label: 'Battery condition',
      type: 'select',
      options: BATTERY_CONDITION_OPTIONS,
      required: true,
      section: 'condition',
    },
    {
      key: 'charger_included',
      label: 'Charger included',
      type: 'select',
      options: YES_NO_OPTIONS,
      required: true,
      section: 'condition',
    },
    {
      key: 'keyboard_layout',
      label: 'Keyboard layout',
      placeholder: 'e.g. US / UK',
      section: 'extras',
    },
    {
      key: 'color',
      label: 'Color',
      placeholder: 'e.g. Midnight',
      section: 'device_specs',
    },
  ],
  Consoles: [
    {
      key: 'console_family',
      label: 'Console family',
      type: 'select',
      options: CONSOLE_FAMILY_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'playstation_model',
      label: 'PlayStation model',
      type: 'select',
      options: PLAYSTATION_MODEL_OPTIONS,
      required: true,
      section: 'device_specs',
      showWhen: {
        specEquals: {
          console_family: ['PlayStation'],
        },
      },
    },
    {
      key: 'xbox_model',
      label: 'Xbox model',
      type: 'select',
      options: XBOX_MODEL_OPTIONS,
      required: true,
      section: 'device_specs',
      showWhen: {
        specEquals: {
          console_family: ['Xbox'],
        },
      },
    },
    {
      key: 'nintendo_model',
      label: 'Nintendo model',
      type: 'select',
      options: NINTENDO_MODEL_OPTIONS,
      required: true,
      section: 'device_specs',
      showWhen: {
        specEquals: {
          console_family: ['Nintendo'],
        },
      },
    },
    {
      key: 'console_model',
      label: 'Console model',
      placeholder: 'Describe the exact console model',
      required: true,
      section: 'device_specs',
      showWhen: {
        specEquals: {
          console_family: ['Other'],
        },
      },
    },
    {
      key: 'storage',
      label: 'Storage',
      placeholder: 'e.g. 1TB',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'controller_included',
      label: 'Controller included',
      type: 'select',
      options: YES_NO_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'controller_count',
      label: 'Number of controllers',
      type: 'number',
      required: true,
      min: 1,
      step: 1,
      section: 'device_specs',
      showWhen: {
        specEquals: {
          controller_included: ['Yes'],
        },
      },
    },
    {
      key: 'games_included',
      label: 'Games included',
      type: 'textarea',
      rows: 3,
      placeholder: 'List bundled games or leave blank if none are included.',
      section: 'extras',
    },
    {
      key: 'hdmi_cable_included',
      label: 'HDMI cable included',
      type: 'select',
      options: YES_NO_UNKNOWN_OPTIONS,
      section: 'condition',
    },
    {
      key: 'power_cable_included',
      label: 'Power cable included',
      type: 'select',
      options: YES_NO_UNKNOWN_OPTIONS,
      section: 'condition',
    },
    {
      key: 'online_ban_status',
      label: 'Online ban / account issues',
      type: 'select',
      options: ONLINE_BAN_STATUS_OPTIONS,
      section: 'condition',
      showWhen: {
        specEquals: {
          console_family: ['PlayStation', 'Xbox', 'Nintendo'],
        },
      },
    },
    {
      key: 'included_accessories',
      label: 'Included accessories',
      type: 'multiselect',
      options: CONSOLE_ACCESSORY_OPTIONS,
      section: 'extras',
    },
  ],
  Wearables: [
    {
      key: 'wearable_type',
      label: 'Wearable type',
      type: 'select',
      options: WEARABLE_TYPE_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'case_size',
      label: 'Case size',
      placeholder: 'e.g. 45mm',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'band_size',
      label: 'Band size',
      placeholder: 'e.g. S/M',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'included_bands',
      label: 'Included bands',
      placeholder: 'e.g. Sport band and Milanese loop',
      section: 'extras',
    },
    {
      key: 'connectivity',
      label: 'GPS or Cellular',
      type: 'select',
      options: WEARABLE_CONNECTIVITY_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'battery_condition',
      label: 'Battery condition',
      type: 'select',
      options: BATTERY_CONDITION_OPTIONS,
      section: 'condition',
    },
    {
      key: 'charger_included',
      label: 'Charger included',
      type: 'select',
      options: YES_NO_OPTIONS,
      required: true,
      section: 'condition',
    },
    {
      key: 'color',
      label: 'Case color',
      placeholder: 'e.g. Silver',
      section: 'device_specs',
    },
  ],
  Audio: [
    {
      key: 'audio_type',
      label: 'Type',
      type: 'select',
      options: AUDIO_TYPE_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'connectivity',
      label: 'Wireless or wired',
      type: 'select',
      options: AUDIO_CONNECTIVITY_OPTIONS,
      required: true,
      section: 'device_specs',
    },
    {
      key: 'noise_cancelling',
      label: 'Noise cancellation',
      type: 'select',
      options: YES_NO_UNKNOWN_OPTIONS,
      section: 'device_specs',
    },
    {
      key: 'charging_case_included',
      label: 'Charging case included',
      type: 'select',
      options: YES_NO_UNKNOWN_OPTIONS,
      section: 'condition',
      showWhen: {
        specEquals: {
          audio_type: ['Earbuds'],
        },
      },
    },
    {
      key: 'battery_condition',
      label: 'Battery condition',
      type: 'select',
      options: BATTERY_CONDITION_OPTIONS,
      section: 'condition',
      showWhen: {
        specEquals: {
          connectivity: ['Wireless', 'Wireless + wired'],
        },
      },
    },
    {
      key: 'included_accessories',
      label: 'Included accessories',
      type: 'multiselect',
      options: AUDIO_ACCESSORY_OPTIONS,
      section: 'extras',
    },
    {
      key: 'color',
      label: 'Color',
      placeholder: 'e.g. Black',
      section: 'device_specs',
    },
  ],
  Other: [
    {
      key: 'device_type',
      label: 'Device type',
      placeholder: 'Describe the device type',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'primary_specs',
      label: 'Primary specs',
      type: 'textarea',
      rows: 3,
      placeholder: 'List the core specs buyers should know right away.',
      required: true,
      section: 'device_specs',
    },
    {
      key: 'included_accessories',
      label: 'Included accessories',
      placeholder: 'e.g. Charger, dock, case',
      section: 'extras',
    },
  ],
}

export const CATEGORY_SPEC_FIELDS = CATEGORY_SPEC_FIELD_MAP

const GENERIC_STEPS: ListingWizardStepConfig[] = [
  { id: 'basic', label: 'Basic info' },
  { id: 'specs', label: 'Key specs' },
  { id: 'condition', label: 'Condition & extras' },
  { id: 'photos', label: 'Photos & description' },
  { id: 'shipping_review', label: 'Shipping & review' },
]

const GENERIC_SHIPPING_SECTION: ListingSectionCopy = {
  eyebrow: 'Shipping',
  title: 'Choose how checkout should work',
  copy: 'Basic keeps setup fast. Advanced lets you list country-specific shipping prices for the destinations you support.',
}

const GENERIC_REVIEW_SECTION: ListingSectionCopy = {
  eyebrow: 'Review',
  title: 'Review what buyers will see',
  copy: 'Your cover photo is always the first image. Existing listings stay compatible because category details still save into a flexible specs object.',
}

const DEFAULT_WIZARD_CONFIG: CategoryWizardConfig = {
  heroDescription:
    'Choose a category first and TekSwapp will switch the steps, labels, guidance, and specs to match the device you are selling.',
  categoryCardDescription: 'Tailored listing flow',
  steps: GENERIC_STEPS,
  basicInfo: {
    eyebrow: 'Basic info',
    title: 'Start with the device basics',
    copy: 'Pick the category first so the rest of the wizard becomes category-specific.',
    titlePlaceholder: 'e.g. iPhone 15 Pro Max 256GB Unlocked',
    brandPlaceholder: 'e.g. Apple',
    modelLabel: 'Model *',
    modelPlaceholder: 'e.g. iPhone 15 Pro Max',
    priceHelper: 'Set a clear asking price based on condition, completeness, and current market demand.',
    originalPricePlaceholder: 'e.g. 1199',
  },
  specsSection: {
    eyebrow: 'Specs',
    title: 'Add the details buyers compare first',
    copy: 'Once a category is selected, only relevant device fields appear here.',
  },
  conditionSection: {
    eyebrow: 'Condition & functionality',
    title: 'Set buyer expectations clearly',
    copy: 'Condition details reduce disputes and make the listing feel more professional.',
  },
  privateSection: {
    eyebrow: 'Private safety details',
    title: 'Store identifying details privately',
    copy: 'These details are never shown on the public listing. They are only intended for trust, safety, seller support, or admin review.',
    showImei: true,
    imeiLabel: 'IMEI (private)',
    imeiPlaceholder: 'Optional',
    serialLabel: 'Serial number (private)',
    serialPlaceholder: 'Optional',
  },
  photosSection: {
    eyebrow: 'Photos',
    title: 'Show the device clearly',
    copy: 'The first photo becomes the cover image automatically. Reorder the gallery to put the strongest image first.',
    uploadHint: 'Upload clear front, back, side, and wear close-ups.',
    emptyState: 'No photos yet. Add clear photos from multiple angles so buyers know exactly what they are getting.',
  },
  descriptionSection: {
    eyebrow: 'Description',
    title: 'Describe what buyers should know before checkout',
    copy: 'Call out wear, repairs, included extras, and anything a buyer should know before paying.',
    descriptionPlaceholder: 'Describe the device condition, functionality, included items, and anything a buyer should know.',
    sellerNotesPlaceholder: 'Add any extra context a buyer should know before purchasing.',
  },
  shippingSection: GENERIC_SHIPPING_SECTION,
  reviewSection: GENERIC_REVIEW_SECTION,
}

const CATEGORY_WIZARD_CONFIG: Record<Category, CategoryWizardConfig> = {
  Phones: {
    heroDescription:
      'This phone flow guides sellers through the model, storage, network status, trust signals, and buyer-facing details phone shoppers look for first.',
    categoryCardDescription: 'Phone-focused specs, condition checks, and battery trust signals.',
    steps: [
      { id: 'basic', label: 'Basic info' },
      { id: 'specs', label: 'Device specs' },
      { id: 'condition', label: 'Condition & functionality' },
      { id: 'photos', label: 'Photos & description' },
      { id: 'shipping_review', label: 'Shipping & review' },
    ],
    basicInfo: {
      eyebrow: 'Basic info',
      title: 'Start with the phone basics',
      copy: 'Phone listings perform best when the title, brand, and model are precise immediately.',
      titlePlaceholder: 'e.g. iPhone 15 Pro Max 256GB Unlocked',
      brandPlaceholder: 'e.g. Apple',
      modelLabel: 'Model *',
      modelPlaceholder: 'e.g. iPhone 15 Pro Max',
      priceHelper: 'Price phones based on storage, condition, network status, and battery transparency.',
      originalPricePlaceholder: 'e.g. 1199',
    },
    specsSection: {
      eyebrow: 'Device specs',
      title: 'Add storage, color, carrier, and network details buyers expect',
      copy: 'Phone shoppers compare storage, unlock status, SIM support, and exact model details right away.',
    },
    conditionSection: {
      eyebrow: 'Condition & functionality',
      title: 'Confirm battery, biometrics, and what is included',
      copy: 'Use this step to set expectations clearly and reduce support issues after the sale.',
    },
    privateSection: {
      eyebrow: 'Private safety details',
      title: 'Store IMEI or serial numbers privately',
      copy: 'Private identifiers help with trust and support workflows and never appear on the public listing.',
      showImei: true,
      imeiLabel: 'IMEI (private)',
      imeiPlaceholder: 'Optional but recommended for seller records',
      serialLabel: 'Serial number (private)',
      serialPlaceholder: 'Optional',
    },
    photosSection: {
      eyebrow: 'Photos',
      title: 'Show the phone from every important angle',
      copy: 'Add front, back, sides, screen-on, camera ring, and any wear close-ups. The first image becomes the cover photo.',
      uploadHint: 'Front glass, frame edges, back glass, camera array, screen-on, and any defects.',
      emptyState: 'No phone photos yet. Add clean front, back, and edge shots so buyers can inspect the device confidently.',
    },
    descriptionSection: {
      eyebrow: 'Description',
      title: 'Describe the phone honestly',
      copy: 'Call out activation status, battery details, repair history, screen wear, and everything included in the box.',
      descriptionPlaceholder:
        'Example: Unlocked iPhone 15 Pro Max with 256GB storage. Face ID, cameras, and speakers all work normally. Minor frame wear on the bottom edge. Includes USB-C cable and original box.',
      sellerNotesPlaceholder: 'Mention anything extra like recent repairs, proof of purchase, or why you are selling.',
    },
    shippingSection: GENERIC_SHIPPING_SECTION,
    reviewSection: GENERIC_REVIEW_SECTION,
  },
  Tablets: {
    heroDescription:
      'This tablet flow focuses on screen size, storage, connectivity, stylus support, and accessories so buyers can compare quickly.',
    categoryCardDescription: 'Screen, connectivity, stylus, and accessory details for tablets.',
    steps: [
      { id: 'basic', label: 'Basic info' },
      { id: 'specs', label: 'Tablet specs' },
      { id: 'condition', label: 'Condition & accessories' },
      { id: 'photos', label: 'Photos & description' },
      { id: 'shipping_review', label: 'Shipping & review' },
    ],
    basicInfo: {
      eyebrow: 'Basic info',
      title: 'Start with the tablet basics',
      copy: 'Tablet buyers want the exact model, size, and connectivity from the start.',
      titlePlaceholder: 'e.g. iPad Air 11-inch 256GB Wi-Fi',
      brandPlaceholder: 'e.g. Apple',
      modelLabel: 'Model *',
      modelPlaceholder: 'e.g. iPad Air 11-inch',
      priceHelper: 'Price tablets around storage, connectivity, condition, and any stylus or keyboard extras.',
      originalPricePlaceholder: 'e.g. 749',
    },
    specsSection: {
      eyebrow: 'Tablet specs',
      title: 'Add screen size, storage, and connectivity details buyers compare',
      copy: 'Call out whether the tablet is Wi-Fi only or cellular and whether it supports or includes a stylus.',
    },
    conditionSection: {
      eyebrow: 'Condition & accessories',
      title: 'Explain battery condition and what ships with the tablet',
      copy: 'This is the right place for stylus, keyboard cover, and charger expectations.',
    },
    privateSection: {
      eyebrow: 'Private safety details',
      title: 'Store IMEI or serial numbers privately',
      copy: 'For cellular tablets, private identifiers are useful for safety and support. They never appear on the public listing.',
      showImei: true,
      imeiLabel: 'IMEI (private)',
      imeiPlaceholder: 'Use for cellular-capable tablets',
      serialLabel: 'Serial number (private)',
      serialPlaceholder: 'Optional',
    },
    photosSection: {
      eyebrow: 'Photos',
      title: 'Show the screen, frame, and included accessories clearly',
      copy: 'Lead with a clean front shot, then show the back, edges, keyboard or stylus accessories, and any wear.',
      uploadHint: 'Front display, back panel, corners, screen-on, charger, keyboard cover, and stylus.',
      emptyState: 'No tablet photos yet. Add clear front, back, and accessory shots so buyers can assess the full bundle.',
    },
    descriptionSection: {
      eyebrow: 'Description',
      title: 'Describe the tablet setup clearly',
      copy: 'Mention battery behavior, screen condition, stylus support, bundled accessories, and any repairs or issues.',
      descriptionPlaceholder:
        'Example: iPad Air 11-inch Wi-Fi model with 256GB storage. Display is bright with no dead pixels. Includes Apple Pencil and folio cover. One small scuff on the corner.',
      sellerNotesPlaceholder: 'Add optional context such as purchase history, light usage, or bundled accessories not obvious from photos.',
    },
    shippingSection: GENERIC_SHIPPING_SECTION,
    reviewSection: GENERIC_REVIEW_SECTION,
  },
  Laptops: {
    heroDescription:
      'This laptop flow focuses on processor, RAM, storage, screen size, battery, charger status, and operating system details buyers compare closely.',
    categoryCardDescription: 'Processor, RAM, screen, battery, and charger details for laptops.',
    steps: [
      { id: 'basic', label: 'Basic info' },
      { id: 'specs', label: 'Laptop specs' },
      { id: 'condition', label: 'Condition & battery' },
      { id: 'photos', label: 'Photos & description' },
      { id: 'shipping_review', label: 'Shipping & review' },
    ],
    basicInfo: {
      eyebrow: 'Basic info',
      title: 'Start with the laptop basics',
      copy: 'Laptop buyers compare model year, processor class, and form factor immediately.',
      titlePlaceholder: 'e.g. MacBook Air 13-inch M2 16GB 512GB',
      brandPlaceholder: 'e.g. Apple',
      modelLabel: 'Model *',
      modelPlaceholder: 'e.g. MacBook Air 13-inch',
      priceHelper: 'Price laptops based on processor tier, RAM, storage, battery condition, and included charger.',
      originalPricePlaceholder: 'e.g. 1499',
    },
    specsSection: {
      eyebrow: 'Laptop specs',
      title: 'Add processor, RAM, storage, screen, and OS details buyers compare',
      copy: 'Clear specs help buyers quickly understand whether the laptop fits work, school, or gaming use.',
    },
    conditionSection: {
      eyebrow: 'Condition & battery',
      title: 'Explain battery condition, charger status, and wear clearly',
      copy: 'This is where buyers look for charger details, keyboard layout, and any screen or body issues.',
    },
    privateSection: {
      eyebrow: 'Private safety details',
      title: 'Store serial numbers privately',
      copy: 'Serial numbers stay private and can help with proof of ownership, safety checks, or support follow-up.',
      showImei: false,
      imeiLabel: 'IMEI (private)',
      imeiPlaceholder: 'Optional',
      serialLabel: 'Serial number (private)',
      serialPlaceholder: 'Optional but useful for records',
    },
    photosSection: {
      eyebrow: 'Photos',
      title: 'Show the keyboard, screen, ports, and charger',
      copy: 'Lead with the laptop open, then show the closed lid, ports, underside, charger, and any wear or blemishes.',
      uploadHint: 'Open laptop, display on, keyboard, ports, lid, underside, charger, and defects.',
      emptyState: 'No laptop photos yet. Add clear shots of the screen, keyboard, ports, and charger so buyers can judge condition quickly.',
    },
    descriptionSection: {
      eyebrow: 'Description',
      title: 'Describe the laptop setup honestly',
      copy: 'Mention battery behavior, charger status, keyboard layout, cosmetic wear, and whether the OS is ready for the next owner.',
      descriptionPlaceholder:
        'Example: MacBook Air 13-inch with M2 chip, 16GB RAM, and 512GB SSD. Battery condition is good and charger is included. Minor wear near the USB-C ports. Fresh macOS install and ready for setup.',
      sellerNotesPlaceholder: 'Add context such as light office use, recent battery service, or bundled accessories.',
    },
    shippingSection: GENERIC_SHIPPING_SECTION,
    reviewSection: GENERIC_REVIEW_SECTION,
  },
  Consoles: {
    heroDescription:
      'This console flow focuses on the exact family and model, controller count, included cables, game bundle details, and any online account restrictions.',
    categoryCardDescription: 'Console family, model, bundle, and account-status details.',
    steps: [
      { id: 'basic', label: 'Basic info' },
      { id: 'specs', label: 'Console setup' },
      { id: 'condition', label: 'Bundle & condition' },
      { id: 'photos', label: 'Photos & description' },
      { id: 'shipping_review', label: 'Shipping & review' },
    ],
    basicInfo: {
      eyebrow: 'Basic info',
      title: 'Start with the console basics',
      copy: 'Console buyers want the family, model, storage, and bundle summary right away.',
      titlePlaceholder: 'e.g. PlayStation 5 Slim 1TB with 2 Controllers',
      brandPlaceholder: 'e.g. Sony',
      modelLabel: 'Model *',
      modelPlaceholder: 'e.g. PlayStation 5 Slim',
      priceHelper: 'Price consoles around the model, controller count, storage, and any bundled games or accessories.',
      originalPricePlaceholder: 'e.g. 599',
    },
    specsSection: {
      eyebrow: 'Console setup',
      title: 'Choose the console family, model, storage, and controller setup',
      copy: 'Use exact console naming so buyers know whether this is a current-gen, previous-gen, or handheld bundle.',
    },
    conditionSection: {
      eyebrow: 'Bundle & condition',
      title: 'Call out included cables, games, and any online account issues',
      copy: 'Being explicit about HDMI, power cables, controllers, and ban status reduces buyer hesitation.',
    },
    privateSection: {
      eyebrow: 'Private safety details',
      title: 'Store serial numbers privately',
      copy: 'Keep the console serial private for seller records, safety workflows, and support if needed.',
      showImei: false,
      imeiLabel: 'IMEI (private)',
      imeiPlaceholder: 'Optional',
      serialLabel: 'Console serial number (private)',
      serialPlaceholder: 'Optional',
    },
    photosSection: {
      eyebrow: 'Photos',
      title: 'Show the console, controllers, and every included item',
      copy: 'Photograph the console front and back, included controllers, bundled games, dock or stand, and any visible wear.',
      uploadHint: 'Console front/back, controller(s), bundled games, cables, dock, and wear close-ups.',
      emptyState: 'No console photos yet. Add the console, controllers, cables, and any bundled games so buyers can see the full setup.',
    },
    descriptionSection: {
      eyebrow: 'Description',
      title: 'Describe the bundle clearly',
      copy: 'Mention the exact console model, controller condition, included games, cable completeness, and any account or online limitations.',
      descriptionPlaceholder:
        'Example: PS5 Slim 1TB in good working condition. Includes one controller, HDMI cable, power cable, and the original box. No online account restrictions. Light wear on the glossy panel.',
      sellerNotesPlaceholder: 'Add any extra bundle or maintenance details such as fan cleaning, repasting, or packaged games.',
    },
    shippingSection: GENERIC_SHIPPING_SECTION,
    reviewSection: GENERIC_REVIEW_SECTION,
  },
  Wearables: {
    heroDescription:
      'This wearable flow focuses on size, band fit, connectivity, charger status, and battery details that matter to smartwatch and tracker buyers.',
    categoryCardDescription: 'Case size, band fit, connectivity, and charger details for wearables.',
    steps: [
      { id: 'basic', label: 'Basic info' },
      { id: 'specs', label: 'Wearable details' },
      { id: 'condition', label: 'Bands & battery' },
      { id: 'photos', label: 'Photos & description' },
      { id: 'shipping_review', label: 'Shipping & review' },
    ],
    basicInfo: {
      eyebrow: 'Basic info',
      title: 'Start with the wearable basics',
      copy: 'Wearable buyers usually filter by exact series, case size, and GPS or cellular support.',
      titlePlaceholder: 'e.g. Apple Watch Series 9 45mm GPS',
      brandPlaceholder: 'e.g. Apple',
      modelLabel: 'Model *',
      modelPlaceholder: 'e.g. Apple Watch Series 9',
      priceHelper: 'Price wearables around size, connectivity, included bands, and battery condition.',
      originalPricePlaceholder: 'e.g. 499',
    },
    specsSection: {
      eyebrow: 'Wearable details',
      title: 'Add case size, band fit, and connectivity details buyers ask about',
      copy: 'This is where you clarify GPS or cellular support, included bands, and the exact case size.',
    },
    conditionSection: {
      eyebrow: 'Bands & battery',
      title: 'Explain battery condition and charger status clearly',
      copy: 'Wearable buyers want to know whether the charger is included and how the battery is holding up.',
    },
    privateSection: {
      eyebrow: 'Private safety details',
      title: 'Store IMEI or serial numbers privately',
      copy: 'For cellular wearables, private identifiers can help with safety and support and never appear publicly.',
      showImei: true,
      imeiLabel: 'IMEI (private)',
      imeiPlaceholder: 'Use for cellular wearables when available',
      serialLabel: 'Serial number (private)',
      serialPlaceholder: 'Optional',
    },
    photosSection: {
      eyebrow: 'Photos',
      title: 'Show the wearable, band, and charger clearly',
      copy: 'Lead with the watch or wearable face, then show the back sensors, band(s), charger, and any cosmetic wear.',
      uploadHint: 'Front display, back sensors, band(s), charger puck, and any scratches or casing wear.',
      emptyState: 'No wearable photos yet. Add the face, case, bands, and charger so buyers can judge size and condition quickly.',
    },
    descriptionSection: {
      eyebrow: 'Description',
      title: 'Describe the wearable fit and setup',
      copy: 'Mention case size, band sizing, battery behavior, charger inclusion, and any screen or casing wear.',
      descriptionPlaceholder:
        'Example: Apple Watch Series 9 GPS 45mm in good condition. Includes two bands and the original charger. Battery lasts a full day with normal use. Light marks on the stainless case.',
      sellerNotesPlaceholder: 'Add context like band sizes, extra bands, or whether the wearable was lightly used.',
    },
    shippingSection: GENERIC_SHIPPING_SECTION,
    reviewSection: GENERIC_REVIEW_SECTION,
  },
  Audio: {
    heroDescription:
      'This audio flow focuses on audio type, wired or wireless setup, noise cancellation, charging case details, and included accessories.',
    categoryCardDescription: 'Type, connectivity, battery, case, and accessory details for audio gear.',
    steps: [
      { id: 'basic', label: 'Basic info' },
      { id: 'specs', label: 'Audio specs' },
      { id: 'condition', label: 'Battery & accessories' },
      { id: 'photos', label: 'Photos & description' },
      { id: 'shipping_review', label: 'Shipping & review' },
    ],
    basicInfo: {
      eyebrow: 'Basic info',
      title: 'Start with the audio basics',
      copy: 'Audio buyers look for the exact model, connection type, and whether the set is wired or wireless.',
      titlePlaceholder: 'e.g. Sony WH-1000XM5 Wireless Headphones',
      brandPlaceholder: 'e.g. Sony',
      modelLabel: 'Model *',
      modelPlaceholder: 'e.g. WH-1000XM5',
      priceHelper: 'Price audio gear around condition, wireless setup, included case, and accessory completeness.',
      originalPricePlaceholder: 'e.g. 399',
    },
    specsSection: {
      eyebrow: 'Audio specs',
      title: 'Add type, connection setup, and noise-cancelling details buyers care about',
      copy: 'Make it obvious whether the item is wired, wireless, or hybrid and whether a charging case is part of the setup.',
    },
    conditionSection: {
      eyebrow: 'Battery & accessories',
      title: 'Explain battery condition and what is included',
      copy: 'Use this step to clarify charging case status, extra tips, cables, or missing accessories.',
    },
    privateSection: {
      eyebrow: 'Private safety details',
      title: 'Store serial numbers privately',
      copy: 'Serial numbers remain private and can help if seller support or safety review is ever needed.',
      showImei: false,
      imeiLabel: 'IMEI (private)',
      imeiPlaceholder: 'Optional',
      serialLabel: 'Serial number (private)',
      serialPlaceholder: 'Optional',
    },
    photosSection: {
      eyebrow: 'Photos',
      title: 'Show the audio gear, case, and accessories clearly',
      copy: 'Lead with the main product, then show earcups or earbuds up close, the charging case, cables, and any cosmetic wear.',
      uploadHint: 'Main product, charging case, ear tips, cable, carrying case, and wear close-ups.',
      emptyState: 'No audio photos yet. Add clear product and accessory shots so buyers know exactly what is included.',
    },
    descriptionSection: {
      eyebrow: 'Description',
      title: 'Describe the listening setup honestly',
      copy: 'Mention battery behavior, case condition, included tips or cables, and whether noise cancellation works as expected.',
      descriptionPlaceholder:
        'Example: Sony WH-1000XM5 headphones in excellent condition. Noise cancellation works properly and battery life is still strong. Includes carrying case, charging cable, and 3.5mm cable.',
      sellerNotesPlaceholder: 'Add any extra context like light usage, replacement ear pads, or bundled accessories.',
    },
    shippingSection: GENERIC_SHIPPING_SECTION,
    reviewSection: GENERIC_REVIEW_SECTION,
  },
  Other: {
    heroDescription:
      'This simpler flow keeps the form generic while still collecting the main specs, condition notes, photos, and shipping setup for tech items outside the main categories.',
    categoryCardDescription: 'Simpler generic tech listing flow for everything else.',
    steps: GENERIC_STEPS,
    basicInfo: {
      eyebrow: 'Basic info',
      title: 'Start with the product basics',
      copy: 'Use a clear title and model name so buyers instantly understand what you are selling.',
      titlePlaceholder: 'e.g. Steam Deck OLED 512GB',
      brandPlaceholder: 'e.g. Valve',
      modelLabel: 'Model *',
      modelPlaceholder: 'e.g. Steam Deck OLED',
      priceHelper: 'For other tech, keep the pricing logic simple and reflect condition, included extras, and demand.',
      originalPricePlaceholder: 'e.g. 649',
    },
    specsSection: {
      eyebrow: 'Key specs',
      title: 'Add the main specs buyers need first',
      copy: 'Keep this step focused on the most important technical details instead of forcing a rigid category shape.',
    },
    conditionSection: {
      eyebrow: 'Condition & extras',
      title: 'Explain condition and included extras clearly',
      copy: 'A simple, honest condition summary works best for edge-case tech listings.',
    },
    privateSection: {
      eyebrow: 'Private safety details',
      title: 'Store serial numbers privately',
      copy: 'Private identifiers stay off the public listing and can help with support or safety review if needed.',
      showImei: false,
      imeiLabel: 'IMEI (private)',
      imeiPlaceholder: 'Optional',
      serialLabel: 'Serial number (private)',
      serialPlaceholder: 'Optional',
    },
    photosSection: {
      eyebrow: 'Photos',
      title: 'Show the product and every included extra clearly',
      copy: 'Lead with the full product, then show ports, accessories, packaging, and any cosmetic wear or defects.',
      uploadHint: 'Main device, ports, accessories, packaging, and defect close-ups.',
      emptyState: 'No photos yet. Add clear product and accessory shots so buyers can understand the full listing.',
    },
    descriptionSection: {
      eyebrow: 'Description',
      title: 'Describe the product clearly',
      copy: 'Summarize what it is, how it works, what is included, and any issues or limitations the next owner should know.',
      descriptionPlaceholder:
        'Example: Steam Deck OLED with 512GB storage in good condition. Works normally and includes charger and carry case. One light scuff on the back shell.',
      sellerNotesPlaceholder: 'Add any extra context that helps buyers trust the listing.',
    },
    shippingSection: GENERIC_SHIPPING_SECTION,
    reviewSection: GENERIC_REVIEW_SECTION,
  },
}

export function getListingWizardConfig(category?: Category | null): CategoryWizardConfig {
  if (!category) return DEFAULT_WIZARD_CONFIG
  return CATEGORY_WIZARD_CONFIG[category]
}

export function getListingSpecFields(category: Category, context: ListingSpecContext = {}): SpecFieldConfig[] {
  const fields = CATEGORY_SPEC_FIELD_MAP[category] ?? []
  return fields
    .filter((field) => matchesVisibilityRules(field.showWhen, context))
    .map((field) => {
      if (field.key !== 'battery_health' || !isAppleIphoneListing(context)) {
        return field
      }

      return {
        ...field,
        helperText: 'Highly recommended for iPhones. Buyers trust listings more when battery health is disclosed.',
      }
    })
}

export function getListingSpecLabel(category: Category, key: string): string {
  const fields = CATEGORY_SPEC_FIELD_MAP[category] ?? []
  const match = fields.find((field) => field.key === key)
  return match?.label ?? prettifySpecKey(key)
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
