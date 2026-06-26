'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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
          <p className="text-sm font-medium text-cyan mb-1">Top sellers this week</p>
          <h2 className="font-display font-semibold">Bestsellers</h2>
        </div>
        <Link
          href="/shop?sort=popular"
          className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          View all <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </FadeUp>

      {isLoading || isError ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(data?.products ?? []).map((p) => <ProductCard key={p._id} product={p} />)}
        </StaggerGrid>
      )}
    </section>
  )
}
