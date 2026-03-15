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

function collectImageCandidates(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectImageCandidates(entry))
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []

    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      try {
        return collectImageCandidates(JSON.parse(trimmed))
      } catch {}
    }

    return [trimmed]
  }

  return []
}

export function normalizeImageList(value: unknown, ...fallbacks: unknown[]): string[] {
  const primaryImages = collectImageCandidates(value)
    .map((entry) => normalizeImageSrc(entry, ''))
    .filter(Boolean)

  const fallbackImages = fallbacks
    .flatMap((entry) => collectImageCandidates(entry))
    .map((entry) => normalizeImageSrc(entry, ''))
    .filter(Boolean)

  const merged = [...primaryImages]

  for (const fallback of fallbackImages.reverse()) {
    const existingIndex = merged.indexOf(fallback)
    if (existingIndex >= 0) {
      merged.splice(existingIndex, 1)
    }
    merged.unshift(fallback)
  }

  return merged.filter((entry, index) => merged.indexOf(entry) === index).slice(0, 20)
}
