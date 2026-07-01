'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Flame, Tag } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { useProducts } from '@/lib/hooks/useProducts'
import { cn } from '@/lib/utils'
import type { ProductDTO } from '@/lib/api'

const TABS = ['All Deals', 'Electronics', 'Audio', 'Wearables', 'Gaming']
const CATEGORY_MAP: Record<string, string> = {
  Electronics: 'electronics',
  Audio: 'audio',
  Wearables: 'wearables',
  Gaming: 'gaming',
}

function getTimeUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function DealsPage() {
  const [activeTab, setActiveTab] = useState('All Deals')
  const [countdown, setCountdown] = useState(getTimeUntilMidnight())
  const category = CATEGORY_MAP[activeTab]

  const { data, isLoading } = useProducts({
    category,
    limit: 24,
    sort: 'popular',
  })

  useEffect(() => {
    const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 1_000)
    return () => clearInterval(id)
  }, [])

  const products = (data?.products ?? []).filter(
    (p: ProductDTO) => p.compareAtPrice && p.compareAtPrice > p.price
  )

  return (
    <div className="min-h-screen">
      {/* Hero strip */}
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-danger/10 via-warning/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-danger/15 flex items-center justify-center shrink-0">
              <Flame size={28} className="text-danger" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)]">
                Today&apos;s Deals
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Limited-time prices on top products
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <p className="text-sm text-[var(--muted)]">Resets in</p>
            <span
              className="font-mono font-bold text-xl text-danger glass px-4 py-2 rounded-2xl border border-danger/30"
              aria-live="polite"
              aria-label={`Deals reset in ${countdown}`}
            >
              {countdown}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filter tabs */}
        <div
          className="flex gap-2 mb-8 overflow-x-auto pb-2 snap-x"
          role="tablist"
          aria-label="Deal categories"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'snap-start shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                activeTab === tab
                  ? 'bg-gradient-to-r from-violet to-cyan text-white shadow-glow'
                  : 'glass border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-violet/40'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-warning/10 flex items-center justify-center">
              <Tag size={28} className="text-warning" aria-hidden="true" />
            </div>
            <p className="font-semibold text-[var(--text)]">No deals in this category yet</p>
            <p className="text-sm text-[var(--muted)]">
              Check back soon — flash deals update daily
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--muted)] mb-6">
              {products.length} deal{products.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: ProductDTO) => (
                <div key={product._id} className="relative">
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-danger text-white">
                        -
                        {Math.round(
                          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                        )}
                        %
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/20 text-success border border-success/30">
                        Save ${(product.compareAtPrice - product.price).toFixed(0)}
                      </span>
                    </div>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
