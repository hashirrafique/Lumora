'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { spring } from '@/lib/motion'
import {
  SlidersHorizontal,
  Search,
  X,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ProductCard } from '@/components/product/ProductCard'
import { QuickView } from '@/components/ui/QuickView'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Price } from '@/components/ui/Price'
import { RatingStars } from '@/components/ui/RatingStars'
import { useProducts, useCategories } from '@/lib/hooks/useProducts'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useCartStore } from '@/store/cart.store'
import type { ProductFilters, ProductDTO } from '@/lib/api'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
]

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

function ProductListItem({
  product,
  onQuickView,
}: {
  product: ProductDTO
  onQuickView: (p: ProductDTO) => void
}) {
  const addToCart = useAddToCart()
  const openDrawer = useCartStore((s) => s.openDrawer)
  const img = product.images[0]
  const isOutOfStock = product.stock === 0

  return (
    <div className="glass rounded-2xl overflow-hidden flex gap-4 p-3 border border-[var(--border)] hover:border-violet/30 transition-all duration-200">
      <Link
        href={`/product/${product.slug}`}
        className="relative w-28 h-28 rounded-xl overflow-hidden bg-white/5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
      >
        {img ? (
          <Image
            src={img.url}
            alt={img.alt || product.title}
            fill
            sizes="112px"
            className="object-cover hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        ) : (
          <div className="w-full h-full bg-white/5" />
        )}
      </Link>
      <div className="flex-1 min-w-0 flex flex-col gap-1 py-1">
        <div>
          <p className="text-xs text-[var(--muted)]">
            {typeof product.category === 'object' ? product.category.name : product.brand}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="font-medium text-sm text-[var(--text)] hover:text-violet transition-colors line-clamp-2 leading-snug focus-visible:outline-none focus-visible:underline"
          >
            {product.title}
          </Link>
        </div>
        {product.ratingCount > 0 && (
          <RatingStars rating={product.ratingAvg} count={product.ratingCount} size={11} />
        )}
        <div className="flex items-center justify-between gap-3 mt-auto flex-wrap">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickView(product)}
              className="text-xs px-3 py-1.5 rounded-lg glass border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-violet/30 transition-colors"
            >
              Quick view
            </button>
            <button
              onClick={async () => {
                if (isOutOfStock) return
                await addToCart.mutateAsync({ productId: product._id, qty: 1 })
                openDrawer()
              }}
              disabled={isOutOfStock || addToCart.isPending}
              className="text-xs px-3 py-1.5 rounded-lg glass border border-violet/30 text-violet hover:bg-violet/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSidebar({
  params,
  categories,
  setParam,
  clearAll,
  hasActiveFilters,
}: {
  params: URLSearchParams
  categories: Array<{ _id: string; name: string; slug: string }> | undefined
  setParam: (key: string, value: string | null) => void
  clearAll: () => void
  hasActiveFilters: boolean
}) {
  const activeCategory = params.get('category')

  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <button type="button" onClick={clearAll} className="text-xs text-violet hover:underline">
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

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={params.get('inStock') === 'true'}
            onChange={(e) => setParam('inStock', e.target.checked ? 'true' : null)}
            className="w-4 h-4 rounded accent-violet"
          />
          <span className="text-sm text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
            In stock only
          </span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={params.get('featured') === 'true'}
            onChange={(e) => setParam('featured', e.target.checked ? 'true' : null)}
            className="w-4 h-4 rounded accent-violet"
          />
          <span className="text-sm text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
            Featured only
          </span>
        </label>
      </div>
    </div>
  )
}

function ActiveFilterChips({
  params,
  categories,
  setParam,
  clearAll,
}: {
  params: URLSearchParams
  categories: Array<{ _id: string; name: string; slug: string }> | undefined
  setParam: (k: string, v: string | null) => void
  clearAll: () => void
}) {
  const chips: Array<{ label: string; key: string }> = []

  const cat = params.get('category')
  if (cat) {
    const catName = categories?.find((c) => c.slug === cat)?.name ?? cat
    chips.push({ label: `Category: ${catName}`, key: 'category' })
  }
  if (params.get('minPrice'))
    chips.push({ label: `Min $${params.get('minPrice')}`, key: 'minPrice' })
  if (params.get('maxPrice'))
    chips.push({ label: `Max $${params.get('maxPrice')}`, key: 'maxPrice' })
  if (params.get('minRating'))
    chips.push({ label: `${params.get('minRating')}★+`, key: 'minRating' })
  if (params.get('inStock') === 'true') chips.push({ label: 'In stock', key: 'inStock' })
  if (params.get('featured') === 'true') chips.push({ label: 'Featured', key: 'featured' })
  if (params.get('q')) chips.push({ label: `"${params.get('q')}"`, key: 'q' })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6" role="list" aria-label="Active filters">
      {chips.map((chip) => (
        <span
          key={chip.key}
          role="listitem"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-violet/30 text-xs font-medium text-violet"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => setParam(chip.key, null)}
            aria-label={`Remove filter: ${chip.label}`}
            className="hover:text-white transition-colors"
          >
            <X size={11} aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-[var(--muted)] hover:text-[var(--text)] underline transition-colors"
      >
        Clear all
      </button>
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  setParam,
}: {
  currentPage: number
  totalPages: number
  setParam: (k: string, v: string | null) => void
}) {
  if (totalPages <= 1) return null

  const pages: Array<number | '…'> = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('…')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++)
      pages.push(i)
    if (currentPage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <button
        type="button"
        onClick={() => setParam('page', String(currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="w-9 h-9 rounded-xl glass border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:border-violet/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {pages.map((page, i) =>
        page === '…' ? (
          <span key={`ellipsis-${i}`} className="text-[var(--muted)] text-sm px-1">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => setParam('page', String(page))}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200',
              page === currentPage
                ? 'text-white shadow-glow'
                : 'glass border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-violet/40'
            )}
            style={
              page === currentPage
                ? { background: 'linear-gradient(135deg, #7c5cff, #22d3ee)' }
                : {}
            }
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => setParam('page', String(currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="w-9 h-9 rounded-xl glass border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:border-violet/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}

function ShopContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchInput, setSearchInput] = useState(params.get('q') ?? '')
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDTO | null>(null)

  const buildFilters = useCallback(
    (): ProductFilters => ({
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
    }),
    [params]
  )

  const filters = buildFilters()
  const { data, isLoading, isError } = useProducts(filters)
  const { data: categories } = useCategories()

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const sp = new URLSearchParams(params.toString())
      if (value === null || value === '') sp.delete(key)
      else sp.set(key, value)
      sp.delete('page')
      router.push(`/shop?${sp.toString()}`, { scroll: false })
    },
    [params, router]
  )

  const clearAll = useCallback(() => {
    router.push('/shop', { scroll: false })
    setSearchInput('')
  }, [router])

  useEffect(() => {
    const t = setTimeout(() => {
      const current = params.get('q') ?? ''
      if (searchInput !== current) setParam('q', searchInput || null)
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  useEffect(() => {
    if (filtersOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [filtersOpen])

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
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
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

        {/* View toggle */}
        <div
          className="hidden sm:flex items-center gap-1 glass rounded-xl p-1 border border-[var(--border)]"
          role="group"
          aria-label="View mode"
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-violet/20 text-violet'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-violet/20 text-violet'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            <List size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Filters toggle (mobile) */}
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
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

      {/* ── Active filter chips ───────────────────────────────────────────────── */}
      <ActiveFilterChips
        params={params}
        categories={categories}
        setParam={setParam}
        clearAll={clearAll}
      />

      <div className="flex gap-8">
        {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
        <aside className="hidden sm:block shrink-0 w-56" aria-label="Product filters">
          <FilterSidebar
            params={params}
            categories={categories}
            setParam={setParam}
            clearAll={clearAll}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* ── Product grid / list ───────────────────────────────────────────── */}
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
                <button type="button" onClick={clearAll} className="btn-primary text-sm py-2 px-4">
                  Clear filters
                </button>
              }
            />
          ) : (
            <>
              {isLoading ? (
                <div
                  className={
                    viewMode === 'list'
                      ? 'space-y-3'
                      : 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  }
                >
                  {Array.from({ length: 8 }).map((_, i) =>
                    viewMode === 'list' ? (
                      <div key={i} className="h-36 skeleton rounded-2xl" />
                    ) : (
                      <SkeletonCard key={i} />
                    )
                  )}
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-3">
                  {(data?.products ?? []).map((p) => (
                    <ProductListItem key={p._id} product={p} onQuickView={setQuickViewProduct} />
                  ))}
                </div>
              ) : (
                <LayoutGroup>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                      {(data?.products ?? []).map((p) => (
                        <motion.div
                          key={p._id}
                          layout
                          layoutId={`product-${p._id}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={spring.snappy}
                        >
                          <ProductCard product={p} onQuickView={setQuickViewProduct} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </LayoutGroup>
              )}

              <Pagination currentPage={currentPage} totalPages={totalPages} setParam={setParam} />
            </>
          )}
        </div>
      </div>

      {/* ── Mobile bottom-sheet filters ───────────────────────────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 sm:hidden"
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-[var(--surface)] border-t border-[var(--border)] rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div
                  className="w-10 h-1 rounded-full bg-[var(--border-strong)]"
                  aria-hidden="true"
                />
              </div>

              <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
                <span className="font-semibold text-[var(--text)]">Filters</span>
                <button
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--muted)] hover:bg-white/5 transition-colors"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="px-6 py-6">
                <FilterSidebar
                  params={params}
                  categories={categories}
                  setParam={(k, v) => {
                    setParam(k, v)
                    setFiltersOpen(false)
                  }}
                  clearAll={() => {
                    clearAll()
                    setFiltersOpen(false)
                  }}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>

              <div className="px-6 pb-8">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Show results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick view modal */}
      <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton rounded-3xl" />
            ))}
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}
