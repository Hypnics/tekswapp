import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()
  const routes = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/listings', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/sell', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/how-it-works', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/buyer-protection', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/seller-standards', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/contact-support', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms-of-service', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/cookie-policy', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
