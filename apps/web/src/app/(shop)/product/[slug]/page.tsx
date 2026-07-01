import type { Metadata } from 'next'
import Script from 'next/script'
import ProductDetailContent from './ProductDetailContent'

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

interface ProductData {
  title?: string
  description?: string
  price?: number
  images?: Array<{ url: string; alt: string }>
  ratingAvg?: number
  ratingCount?: number
  stock?: number
  slug?: string
  brand?: string
}

async function fetchProduct(slug: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = (await res.json()) as { success: boolean; data?: ProductData }
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await fetchProduct(params.slug)
  if (!product) {
    return { title: 'Product not found' }
  }

  const title = product.title ?? 'Product'
  const description =
    product.description?.slice(0, 160) ?? `${title} — ${product.brand ?? 'LUMORA'}`
  const image = product.images?.[0]?.url

  const ogParams = new URLSearchParams({ title })
  if (product.price != null) ogParams.set('price', product.price.toFixed(2))
  if (product.brand) ogParams.set('brand', product.brand)
  if (image) ogParams.set('image', image)
  const ogUrl = `/og?${ogParams.toString()}`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | LUMORA`,
      description,
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug)

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        brand: { '@type': 'Brand', name: product.brand },
        image: product.images?.map((i) => i.url) ?? [],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: product.price,
          availability:
            (product.stock ?? 0) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'}/product/${product.slug}`,
        },
        ...(product.ratingCount && product.ratingCount > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.ratingAvg,
                reviewCount: product.ratingCount,
                bestRating: 5,
              },
            }
          : {}),
      }
    : null

  return (
    <>
      {jsonLd && (
        <Script
          id="product-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailContent />
    </>
  )
}
