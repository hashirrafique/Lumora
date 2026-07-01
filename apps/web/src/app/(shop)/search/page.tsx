'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { StaggerGrid } from '@/components/ui/FadeUp'
import { useProducts } from '@/lib/hooks/useProducts'
import Link from 'next/link'

function SearchResults() {
  const params = useSearchParams()
  const router = useRouter()
  const q = params.get('q') ?? ''

  const { data, isLoading } = useProducts(q ? { q, limit: 24 } : { limit: 0 })

  const products = data?.products ?? []
  const total = data?.meta?.total ?? 0

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const query = String(fd.get('q') ?? '').trim()
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Search bar */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative" role="search">
          <label htmlFor="search-input" className="sr-only">
            Search products
          </label>
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="search-input"
            name="q"
            type="search"
            autoComplete="off"
            defaultValue={q}
            placeholder="Search products, brands, categories…"
            className="w-full bg-white/5 border border-[var(--border)] rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet/50 focus:border-violet/50"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-violet text-white text-sm font-medium hover:bg-violet/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results heading */}
      {q && (
        <div className="flex items-center justify-between">
          <h1 className="font-display font-semibold text-xl">
            {isLoading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''} for "${q}"`}
          </h1>
          <Link
            href="/shop"
            className="text-sm text-[var(--muted)] hover:text-violet transition-colors"
          >
            Browse all →
          </Link>
        </div>
      )}

      {/* Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && products.length > 0 && (
        <StaggerGrid>
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </StaggerGrid>
      )}

      {/* Empty state */}
      {!isLoading && q && products.length === 0 && (
        <EmptyState
          icon={<Search size={24} />}
          title={`No results for "${q}"`}
          description="Try a different keyword, or browse the catalog."
          action={
            <Link href="/shop" className="btn-primary">
              Browse shop
            </Link>
          }
        />
      )}

      {/* No query yet */}
      {!q && !isLoading && (
        <EmptyState
          icon={<Search size={24} />}
          title="What are you looking for?"
          description="Type a keyword above to search products, brands, and categories."
        />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  )
}
