'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { FadeUp } from '@/components/ui/FadeUp'
import { ProductCard } from '@/components/product/ProductCard'
import { SectionError } from '@/components/ui/SectionError'
import { useProducts } from '@/lib/hooks/useProducts'

export function NewArrivalsSection() {
  const { data, isLoading, isError, refetch } = useProducts({ sort: 'newest', limit: 6 })
  const products = data?.products ?? []

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-label="New arrivals">
      <FadeUp className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-0 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-violet" aria-hidden="true" />
            <p className="text-sm font-medium text-violet">New this week</p>
          </div>
          <h2 className="font-display font-bold text-2xl text-[var(--text)]">Just Landed</h2>
        </div>
        <Link
          href="/new-arrivals"
          className="sm:ml-auto flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-violet font-medium transition-colors"
        >
          Shop all new arrivals <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </FadeUp>

      {isError ? (
        <SectionError onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-3xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Mobile: horizontal scroll */}
          <div className="snap-scroll-x sm:hidden pb-4">
            {products.map((product) => (
              <div key={product._id} className="snap-center shrink-0 w-48">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          {/* Desktop: grid */}
          <div className="hidden sm:grid grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/new-arrivals"
          className="btn-secondary inline-flex items-center gap-2 px-6 py-2.5 text-sm"
        >
          See everything new <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
