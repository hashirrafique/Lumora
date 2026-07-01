'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Sparkles, SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { useProducts } from '@/lib/hooks/useProducts'
import type { ProductFilters } from '@/lib/api'

const SORT_OPTIONS: Array<{ label: string; value: NonNullable<ProductFilters['sort']> }> = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Best Rated', value: 'rating' },
]

export default function NewArrivalsPage() {
  const [sort, setSort] = useState<NonNullable<ProductFilters['sort']>>('newest')

  const { data, isLoading } = useProducts({
    sort,
    limit: 24,
  })

  const products = data?.products ?? []

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center relative overflow-hidden">
          {/* BG blob */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, #7C5CFF 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet/10 border border-violet/20 text-violet text-xs font-medium mb-4">
              <Sparkles size={11} aria-hidden="true" />
              Updated weekly
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--text)] mb-3">
              Fresh{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(92deg, #7C5CFF, #22D3EE)' }}
              >
                Drops
              </span>
            </h1>
            <p className="text-[var(--muted)] text-base max-w-md mx-auto">
              The latest tech and lifestyle products, curated and added weekly.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Sort row */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <p className="text-sm text-[var(--muted)]">
            {isLoading ? '...' : `${products.length} products`}
          </p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-[var(--muted)]" aria-hidden="true" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as NonNullable<ProductFilters['sort']>)}
              className="glass border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text)] bg-transparent focus:outline-none focus:border-violet/50 focus-visible:ring-2 focus-visible:ring-violet"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, idx) => (
              <div key={product._id} className="relative">
                {idx < 6 && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet text-white uppercase tracking-wide">
                      New
                    </span>
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
