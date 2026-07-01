'use client'

import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { FadeUp, StaggerGrid } from '@/components/ui/FadeUp'
import { useProducts } from '@/lib/hooks/useProducts'

export function BestsellersSection() {
  const { data, isLoading, isError } = useProducts({ sort: 'popular', limit: 4 })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10" aria-label="Bestselling products">
      <FadeUp className="flex items-end justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-cyan">Top sellers this week</p>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/15 text-warning border border-warning/25">
              <Flame size={11} aria-hidden="true" />
              Hot
            </span>
          </div>
          <h2 className="font-display font-semibold">Bestsellers</h2>
        </div>
        <Link
          href="/shop?sort=popular"
          className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          View all <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </FadeUp>

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
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <StaggerGrid className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4">
          {(data?.products ?? []).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </StaggerGrid>
      )}
    </section>
  )
}
