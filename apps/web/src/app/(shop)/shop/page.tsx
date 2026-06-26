'use client'

import { Suspense } from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Search, X } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { StaggerGrid } from '@/components/ui/FadeUp'
import { useProducts, useCategories } from '@/lib/hooks/useProducts'
import type { ProductFilters } from '@/lib/api'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
]

function ShopContent() {
  const router = useRouter()
  const params = useSearchParams()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(params.get('q') ?? '')

  const buildFilters = useCallback((): ProductFilters => ({
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    brand: params.get('brand') ?? undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    inStock: params.get('inStock') === 'true' ? true : undefined,
    featured: params.get('featured') === 'true' ? true : undefined,
    sort: (params.get('sort') as ProductFilters['sort']) ?? undefined,
    page: params.get('page') ? Number(params.get('page')) : 1,
    limit: 20,
  }), [params])

  const filters = buildFilters()
  const { data, isLoading, isError } = useProducts(filters)
  const { data: categories } = useCategories()

  function setParam(key: string, value: string | null) {
    const sp = new URLSearchParams(params.toString())
    if (value === null || value === '') {
      sp.delete(key)
    } else {
      sp.set(key, value)
    }
    sp.delete('page')
    router.push(`/shop?${sp.toString()}`, { scroll: false })
  }

  function clearAll() {
    router.push('/shop', { scroll: false })
    setSearchInput('')
  }

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      const current = params.get('q') ?? ''
      if (searchInput !== current) setParam('q', searchInput || null)
    }, 400)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const activeCategory = params.get('category')
  const activeSort = params.get('sort') ?? 'newest'
  const hasActiveFilters =
    !!params.get('q') ||
    !!params.get('category') ||
    !!params.get('brand') ||
    !!params.get('minPrice') ||
    !!params.get('maxPrice') ||
    !!params.get('minRating') ||
    params.get('inStock') === 'true' ||
    params.get('featured') === 'true'

  const total = data?.meta.total ?? 0
  const totalPages = data?.meta.totalPages ?? 1
  const currentPage = filters.page ?? 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* ── Header bar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <h1 className="font-display font-semibold text-2xl">
            {activeCategory
              ? (categories?.find((c) => c.slug === activeCategory)?.name ?? 'Shop')
              : 'Shop'}
          </h1>
          {!isLoading && (
            <p className="text-sm text-[var(--muted)] mt-0.5">
              {total.toLocaleString()} product{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] focus:border-violet/50 focus:ring-1 focus:ring-violet/50 outline-none transition-colors"
            aria-label="Search products"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={activeSort}
          onChange={(e) => setParam('sort', e.target.value)}
          className="glass rounded-xl px-4 py-2.5 text-sm text-[var(--text)] border border-[var(--border)] focus:border-violet/50 outline-none bg-transparent cursor-pointer"
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[var(--bg)]">
              {o.label}
            </option>
          ))}
        </select>

        {/* Filters toggle (mobile) */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            'sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-[var(--border)] text-sm',
            hasActiveFilters && 'border-violet/50 text-violet'
          )}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-violet" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar filters ───────────────────────────────────────────────── */}
        <aside
          className={cn(
            'shrink-0 w-56 space-y-6',
            'hidden sm:block',
            filtersOpen && '!block fixed inset-0 z-50 bg-[var(--bg)] p-6 overflow-y-auto'
          )}
          aria-label="Product filters"
        >
          {filtersOpen && (
            <div className="flex items-center justify-between sm:hidden mb-4">
              <span className="font-semibold">Filters</span>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-violet hover:underline"
            >
              Clear all filters
            </button>
          )}

          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-3">
              Category
            </p>
            <ul className="space-y-1" role="list">
              <li>
                <button
                  type="button"
                  onClick={() => setParam('category', null)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors',
                    !activeCategory
                      ? 'bg-violet/15 text-violet font-medium'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
                  )}
                >
                  All
                </button>
              </li>
              {categories?.map((cat) => (
                <li key={cat._id}>
                  <button
                    type="button"
                    onClick={() => setParam('category', cat.slug)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors',
                      activeCategory === cat.slug
                        ? 'bg-violet/15 text-violet font-medium'
                        : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
                    )}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price range */}
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-3">
              Price range
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                min={0}
                defaultValue={params.get('minPrice') ?? ''}
                onBlur={(e) => setParam('minPrice', e.target.value || null)}
                className="w-full glass rounded-xl px-3 py-2 text-sm text-[var(--text)] border border-[var(--border)] focus:border-violet/50 outline-none"
                aria-label="Minimum price"
              />
              <span className="text-[var(--muted)] text-xs">–</span>
              <input
                type="number"
                placeholder="Max"
                min={0}
                defaultValue={params.get('maxPrice') ?? ''}
                onBlur={(e) => setParam('maxPrice', e.target.value || null)}
                className="w-full glass rounded-xl px-3 py-2 text-sm text-[var(--text)] border border-[var(--border)] focus:border-violet/50 outline-none"
                aria-label="Maximum price"
              />
            </div>
          </div>

          {/* Min rating */}
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-3">
              Min rating
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() =>
                    setParam('minRating', params.get('minRating') === String(r) ? null : String(r))
                  }
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    params.get('minRating') === String(r)
                      ? 'bg-violet/20 text-violet'
                      : 'glass text-[var(--muted)] hover:text-[var(--text)]'
                  )}
                  aria-pressed={params.get('minRating') === String(r)}
                  aria-label={`${r} stars minimum`}
                >
                  {r}★
                </button>
              ))}
            </div>
          </div>

          {/* In stock */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={params.get('inStock') === 'true'}
              onChange={(e) => setParam('inStock', e.target.checked ? 'true' : null)}
              className="w-4 h-4 rounded border-[var(--border)] bg-transparent accent-violet"
            />
            <span className="text-sm text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
              In stock only
            </span>
          </label>

          {/* Featured */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={params.get('featured') === 'true'}
              onChange={(e) => setParam('featured', e.target.checked ? 'true' : null)}
              className="w-4 h-4 rounded border-[var(--border)] bg-transparent accent-violet"
            />
            <span className="text-sm text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
              Featured only
            </span>
          </label>
        </aside>

        {/* ── Product grid ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {isError ? (
            <EmptyState
              title="Failed to load products"
              description="There was an error fetching products. Please try again."
            />
          ) : !isLoading && data?.products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search term."
              action={
                <button
                  type="button"
                  onClick={clearAll}
                  className="btn-primary"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <StaggerGrid className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(data?.products ?? []).map((p) => <ProductCard key={p._id} product={p} />)}
                </StaggerGrid>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10" role="navigation" aria-label="Pagination">
                  <button
                    type="button"
                    onClick={() => setParam('page', String(currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded-xl glass border border-[var(--border)] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-violet/40 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[var(--muted)] px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setParam('page', String(currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 rounded-xl glass border border-[var(--border)] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-violet/40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 py-10"><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i)=><div key={i} className="aspect-square skeleton rounded-3xl"/>)}</div></div>}>
      <ShopContent />
    </Suspense>
  )
}
