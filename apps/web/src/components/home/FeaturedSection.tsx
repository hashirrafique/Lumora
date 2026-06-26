'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { FadeUp, StaggerGrid } from '@/components/ui/FadeUp'
import { useProducts } from '@/lib/hooks/useProducts'

export function FeaturedSection() {
  const { data, isLoading, isError } = useProducts({ featured: true, limit: 4 })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20" aria-label="Featured products">
      <FadeUp className="flex items-end justify-between mb-10">
        <div>
          <p className="text-sm font-medium text-violet mb-1">Hand-picked for you</p>
          <h2 className="font-display font-semibold">Featured collection</h2>
        </div>
        <Link
          href="/shop?featured=true"
          className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          View all <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </FadeUp>

      {isLoading || isError ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(data?.products ?? []).map((p) => <ProductCard key={p._id} product={p} />)}
        </StaggerGrid>
      )}
    </section>
  )
}
