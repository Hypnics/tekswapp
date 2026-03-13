const HTTP_PROTOCOLS = new Set(['http:', 'https:'])

export const DEFAULT_LISTING_IMAGE_SRC = '/next.svg'

export function normalizeImageSrc(value: unknown, fallback = DEFAULT_LISTING_IMAGE_SRC): string {
  if (typeof value !== 'string') return fallback

  const trimmed = value.trim()
  if (!trimmed) return fallback
  if (trimmed.startsWith('/')) return trimmed

  try {
    const parsed = new URL(trimmed)
    if (HTTP_PROTOCOLS.has(parsed.protocol)) {
      return parsed.toString()
    }
  } catch {}

  return fallback
}

export function isValidImageSrcInput(value: unknown): boolean {
  return normalizeImageSrc(value, '') !== ''
}
