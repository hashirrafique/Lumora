import type { MetadataRoute } from 'next'

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'
const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

interface ProductSlug {
  slug: string
  updatedAt?: string
}

async function fetchSlugs(): Promise<ProductSlug[]> {
  try {
    const res = await fetch(`${API_BASE}/products?limit=500&fields=slug,updatedAt`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const json = await res.json() as { success: boolean; data?: ProductSlug[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchSlugs()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
