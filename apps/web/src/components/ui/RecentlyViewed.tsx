'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Clock } from 'lucide-react'
import { getRecentlyViewed, removeRecentlyViewed } from '@/lib/recentlyViewed'
import { Price } from './Price'
import type { ProductDTO } from '@/lib/api'

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

interface RecentlyViewedProps {
  excludeId?: string
}

export function RecentlyViewed({ excludeId }: RecentlyViewedProps) {
  const [items, setItems] = useState<ProductDTO[]>([])

  useEffect(() => {
    const all = getRecentlyViewed()
    setItems(excludeId ? all.filter((p) => p._id !== excludeId) : all)
  }, [excludeId])

  const handleRemove = (id: string) => {
    removeRecentlyViewed(id)
    setItems((prev) => prev.filter((p) => p._id !== id))
  }

  if (items.length === 0) return null

  return (
    <section aria-label="Recently viewed products" className="py-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-[var(--muted)]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-[var(--text)]">Recently viewed</h3>
      </div>
      <div className="snap-scroll-x pb-2">
        {items.map((product) => {
          const img = product.images[0]
          return (
            <div key={product._id} className="snap-center shrink-0 w-36 relative group">
              <Link
                href={`/product/${product.slug}`}
                className="glass rounded-2xl overflow-hidden flex flex-col border border-[var(--border)] hover:border-violet/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                aria-label={product.title}
              >
                <div className="relative aspect-square bg-white/5">
                  {img ? (
                    <Image
                      src={img.url}
                      alt={img.alt || product.title}
                      fill
                      sizes="144px"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                  ) : null}
                </div>
                <div className="p-2">
                  <p className="text-xs text-[var(--text)] line-clamp-2 leading-snug mb-1">
                    {product.title}
                  </p>
                  <Price price={product.price} size="sm" />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(product._id)}
                aria-label={`Remove ${product.title} from recently viewed`}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--bg)]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--border)] focus-visible:opacity-100 focus-visible:outline-none"
              >
                <X size={10} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
