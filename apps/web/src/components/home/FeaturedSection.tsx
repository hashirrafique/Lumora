'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { SectionError } from '@/components/ui/SectionError'
import { FadeUp } from '@/components/ui/FadeUp'
import { useProducts } from '@/lib/hooks/useProducts'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useCartStore } from '@/store/cart.store'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'
import type { ProductDTO } from '@/lib/api'

const TABS = [
  { label: 'All', category: undefined },
  { label: 'Electronics', category: 'electronics' },
  { label: 'Audio', category: 'audio' },
  { label: 'Wearables', category: 'wearables' },
]

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

/** The large hero card occupying col-span-2 row-span-2 in the bento grid */
function HeroCard({ product }: { product: ProductDTO }) {
  const addToCart = useAddToCart()
  const openDrawer = useCartStore((s) => s.openDrawer)
  const img = product.images?.[0]

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    await addToCart.mutateAsync({ productId: product._id, qty: 1 })
    openDrawer()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.gentle, delay: 0 }}
      className="col-span-2 row-span-2 group relative glass rounded-3xl overflow-hidden shadow-card border border-[var(--border)] hover:border-violet/30 transition-colors"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {img?.url ? (
          <Image
            src={img.url}
            alt={img.alt || product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet/20 to-cyan/10" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {product.isFeatured && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet/20 text-violet border border-violet/30 mb-3">
            Featured
          </span>
        )}
        <h3 className="font-display text-xl font-bold text-[var(--text)] mb-1 line-clamp-2">
          {product.title}
        </h3>
        {product.ratingAvg != null && product.ratingAvg > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star size={12} className="text-warning fill-warning" aria-hidden="true" />
            <span className="text-xs text-[var(--muted)]">
              {product.ratingAvg.toFixed(1)} ({product.ratingCount ?? 0})
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">${product.price.toFixed(2)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-xs text-[var(--muted)] line-through">
                ${product.compareAtPrice.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => void handleAdd(e)}
            disabled={addToCart.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-sm font-medium disabled:opacity-60"
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart size={15} aria-hidden="true" />
            Add to cart
          </button>
        </div>
      </div>

      {/* Link overlay */}
      <Link
        href={`/product/${product.slug}`}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-inset rounded-3xl"
        aria-label={`View ${product.title}`}
        tabIndex={-1}
      />
    </motion.div>
  )
}

export function FeaturedSection() {
  const [activeTab, setActiveTab] = useState(0)
  const tab = TABS[activeTab]!

  const { data, isLoading, isError, refetch } = useProducts({
    featured: true,
    limit: 4,
    category: tab.category,
  })

  const products = data?.products ?? []

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

      {isError ? (
        <SectionError onRetry={refetch} />
      ) : isLoading ? (
        <>
          {/* Mobile skeleton */}
          <div className="sm:hidden snap-scroll-x">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-56">
                <SkeletonCard />
              </div>
            ))}
          </div>
          {/* Desktop skeleton */}
          <div
            className="hidden sm:grid grid-cols-3 gap-4"
            style={{ gridTemplateRows: 'auto auto' }}
          >
            <div className="col-span-2 row-span-2 skeleton rounded-3xl aspect-[4/3]" />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : (
        <>
          {/* Mobile: horizontal snap scroll */}
          <div className="sm:hidden snap-scroll-x">
            {products.map((p) => (
              <div key={p._id} className="snap-start shrink-0 w-56">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          {/* Desktop: bento grid */}
          <AnimatePresence mode="wait">
            <div
              key={activeTab}
              className="hidden sm:grid gap-4"
              style={{ gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'auto auto' }}
            >
              {products[0] && <HeroCard product={products[0]} />}
              {products.slice(1).map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring.gentle, delay: 0.1 + i * 0.07 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </>
      )}
    </section>
  )
}
