export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    'http://localhost:3000',
  ]

  const firstValid = candidates.find((candidate) => {
    if (!candidate) return false
    return !candidate.includes('yourdomain.com')
  })

  return (firstValid ?? 'http://localhost:3000').replace(/\/$/, '')
}
