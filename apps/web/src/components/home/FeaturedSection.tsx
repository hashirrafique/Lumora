'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { FadeUp, StaggerGrid } from '@/components/ui/FadeUp'
import { useProducts } from '@/lib/hooks/useProducts'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'All', category: undefined },
  { label: 'Electronics', category: 'electronics' },
  { label: 'Audio', category: 'audio' },
  { label: 'Wearables', category: 'wearables' },
]

export function FeaturedSection() {
  const [activeTab, setActiveTab] = useState(0)
  const tab = TABS[activeTab]!

  const { data, isLoading, isError } = useProducts({
    featured: true,
    limit: 4,
    category: tab.category,
  })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20" aria-label="Featured products">
      <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-violet mb-1">Hand-picked for you</p>
          <h2 className="font-display font-semibold">Featured collection</h2>
        </div>
        <Link
          href="/shop?featured=true"
          className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline shrink-0"
        >
          View all <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </FadeUp>

      {/* Category filter tabs */}
      <div
        className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Filter featured products"
      >
        {TABS.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={activeTab === i}
            onClick={() => setActiveTab(i)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
              activeTab === i
                ? 'bg-gradient-to-r from-violet to-cyan text-white shadow-glow'
                : 'glass text-[var(--muted)] hover:text-[var(--text)] hover:border-violet/30'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mobile: horizontal snap scroll */}
      <div className="sm:hidden snap-scroll-x">
        {isLoading || isError
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-56">
                <SkeletonCard />
              </div>
            ))
          : (data?.products ?? []).map((p) => (
              <div key={p._id} className="snap-start shrink-0 w-56">
                <ProductCard product={p} />
              </div>
            ))}
      </div>

      {/* Desktop: grid */}
      {isLoading || isError ? (
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <StaggerGrid className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(data?.products ?? []).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </StaggerGrid>
      )}
    </section>
  )
}
