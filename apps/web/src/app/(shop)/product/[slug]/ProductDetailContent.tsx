'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronLeft,
  ArrowRight,
  Share2,
  Copy,
  Check as CheckIcon,
  ChevronDown,
  Truck,
  RotateCcw,
  Shield,
  ThumbsUp,
  ShoppingBag,
} from 'lucide-react'
import { useProduct, useProductReviews, useProducts } from '@/lib/hooks/useProducts'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useToggleWishlist, useWishlist } from '@/lib/hooks/useWishlist'
import { useCartStore } from '@/store/cart.store'
import { useStockSocket } from '@/lib/hooks/useStockSocket'
import { spring } from '@/lib/motion'
import { Price } from '@/components/ui/Price'
import { RatingStars } from '@/components/ui/RatingStars'
import { StockBadge } from '@/components/ui/StockBadge'
import { Badge } from '@/components/ui/Badge'
import { QtyStepper } from '@/components/ui/QtyStepper'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProductCard } from '@/components/product/ProductCard'
import { RecentlyViewed } from '@/components/ui/RecentlyViewed'
import { addRecentlyViewed } from '@/lib/recentlyViewed'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { ReviewDTO } from '@/lib/api'

const SHIPPING_INFO = [
  {
    icon: Truck,
    title: 'Free shipping on orders over $75',
    body: 'Standard delivery in 5–7 business days. Express and overnight options available at checkout.',
  },
  {
    icon: RotateCcw,
    title: '30-day hassle-free returns',
    body: 'Not satisfied? Return within 30 days for a full refund. Free return label included.',
  },
  {
    icon: Shield,
    title: '2-year warranty included',
    body: 'All products come with a 2-year manufacturer warranty against defects.',
  },
]

function ShippingAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {SHIPPING_INFO.map((item, idx) => (
        <div key={idx} className="glass rounded-xl border border-[var(--border)] overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === idx ? null : idx)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
            aria-expanded={open === idx}
          >
            <item.icon size={15} className="text-violet shrink-0" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-[var(--text)]">{item.title}</span>
            <ChevronDown
              size={14}
              className={cn(
                'text-[var(--muted)] transition-transform duration-200',
                open === idx && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </button>
          <AnimatePresence initial={false}>
            {open === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={spring.gentle}
                className="overflow-hidden"
              >
                <p className="px-4 pb-3 pt-0 text-sm text-[var(--muted)] leading-relaxed">
                  {item.body}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

type ReviewSort = 'newest' | 'rating' | 'helpful'

function ReviewBreakdownBars({ reviews }: { reviews: ReviewDTO[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const total = reviews.length
  return (
    <div ref={ref} className="space-y-1.5 mb-6">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length
        const pct = total > 0 ? (count / total) * 100 : 0
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] w-4 shrink-0">{star}★</span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
                initial={{ width: 0 }}
                animate={{ width: inView ? `${pct}%` : '0%' }}
                transition={{ duration: 0.8, delay: (5 - star) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-xs text-[var(--muted)] w-7 shrink-0 text-right">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-3">
          <div className="aspect-square skeleton rounded-3xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square skeleton rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 skeleton rounded-xl w-3/4" />
          <div className="h-4 skeleton rounded-xl w-1/2" />
          <div className="h-6 skeleton rounded-xl w-1/3" />
          <div className="h-20 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug)
  const { data: reviewsData } = useProductReviews(product?._id ?? '', 1)
  const addToCart = useAddToCart()
  const toggleWishlist = useToggleWishlist()
  const { data: wishlist } = useWishlist()
  const openDrawer = useCartStore((s) => s.openDrawer)
  const toast = useToast()

  const liveStock = useStockSocket(product?._id ?? '', product?.stock ?? 0)

  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [stickyVisible, setStickyVisible] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [reviewSort, setReviewSort] = useState<ReviewSort>('newest')
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({})
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null)
  const imgContainerRef = useRef<HTMLDivElement>(null)
  const addToCartRef = useRef<HTMLDivElement>(null)

  const categorySlug =
    typeof product?.category === 'object' ? product.category.slug : (product?.category ?? '')
  const { data: relatedData } = useProducts({ category: categorySlug, limit: 5 })
  const relatedProducts = (relatedData?.products ?? [])
    .filter((p) => p._id !== product?._id)
    .slice(0, 4)

  useEffect(() => {
    if (product) addRecentlyViewed(product)
  }, [product])

  // Load persisted helpful votes from localStorage
  useEffect(() => {
    if (!reviewsData) return
    const votes: Record<string, boolean> = {}
    reviewsData.reviews.forEach((r) => {
      try {
        if (localStorage.getItem(`lumora-helpful-${r._id}`)) votes[r._id] = true
      } catch {
        /* ignore */
      }
    })
    setHelpfulVotes(votes)
  }, [reviewsData])

  const handleHelpfulVote = useCallback((reviewId: string) => {
    setHelpfulVotes((prev) => {
      const next = { ...prev, [reviewId]: !prev[reviewId] }
      try {
        if (next[reviewId]) localStorage.setItem(`lumora-helpful-${reviewId}`, '1')
        else localStorage.removeItem(`lumora-helpful-${reviewId}`)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
  }, [])

  const handleImageMouseLeave = useCallback(() => setZoomPos(null), [])

  useEffect(() => {
    const el = addToCartRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!(entry?.isIntersecting ?? true)),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [product])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setLinkCopied(true)
        toast.success('Link copied to clipboard!')
        setTimeout(() => setLinkCopied(false), 2000)
      })
      .catch(() => toast.error('Could not copy link'))
  }, [toast])

  if (isLoading) return <ProductDetailSkeleton />

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <EmptyState
          title="Product not found"
          description="This product may have been removed or the link is incorrect."
          action={
            <Link href="/shop" className="btn-primary">
              Browse shop
            </Link>
          }
        />
      </div>
    )
  }

  const isWishlisted = wishlist?.products.some((p) => p._id === product._id) ?? false
  const mainImage = product.images[selectedImage] ?? product.images[0]

  const getVariant = () => {
    const keys = Object.keys(selectedVariants)
    if (keys.length === 0) return undefined
    const first = keys[0]!
    return { name: first, value: selectedVariants[first]! }
  }

  async function handleAddToCart() {
    await addToCart.mutateAsync({ productId: product!._id, qty, variant: getVariant() })
    openDrawer()
    toast.success(`${product!.title} added to cart!`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8"
        aria-label="Breadcrumb"
      >
        <Link
          href="/shop"
          className="hover:text-[var(--text)] transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Shop
        </Link>
        {typeof product.category === 'object' && (
          <>
            <span aria-hidden="true">/</span>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-[var(--text)] transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-[var(--text)] truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ── Image gallery ──────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div
            ref={imgContainerRef}
            className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 cursor-crosshair"
            onMouseMove={handleImageMouseMove}
            onMouseLeave={handleImageMouseLeave}
          >
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                <ShoppingCart size={48} aria-hidden="true" />
              </div>
            )}
            {product.isFeatured && (
              <div className="absolute top-4 left-4">
                <Badge variant="violet">Featured</Badge>
              </div>
            )}

            {/* Zoom lens overlay */}
            {zoomPos && mainImage && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-28 h-28 rounded-full border-2 border-violet/50 overflow-hidden shadow-card"
                style={{
                  left: `calc(${zoomPos.x * 100}% - 56px)`,
                  top: `calc(${zoomPos.y * 100}% - 56px)`,
                  backgroundImage: `url(${mainImage.url})`,
                  backgroundSize: '300%',
                  backgroundPosition: `${zoomPos.x * 100}% ${zoomPos.y * 100}%`,
                }}
              />
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2" role="list" aria-label="Product images">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden bg-white/5',
                    'ring-2 transition-all focus-visible:outline-none',
                    i === selectedImage ? 'ring-violet' : 'ring-transparent hover:ring-white/20'
                  )}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === selectedImage}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `Image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ───────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-[var(--muted)]">{product.brand}</p>
            <h1 className="font-display font-semibold text-2xl sm:text-3xl leading-tight">
              {product.title}
            </h1>
            {product.ratingCount > 0 && (
              <div className="flex items-center gap-3">
                <RatingStars rating={product.ratingAvg} count={product.ratingCount} />
              </div>
            )}
          </div>

          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="xl" />

          <StockBadge stock={liveStock} />

          <p className="text-sm text-[var(--muted)] leading-relaxed">{product.description}</p>

          {/* Shipping/returns accordion */}
          <ShippingAccordion />

          {/* Variants */}
          {product.variants.map((variant) => (
            <div key={variant.name}>
              <p className="text-sm font-medium mb-2">
                {variant.name}
                {selectedVariants[variant.name] && (
                  <span className="text-[var(--muted)] font-normal ml-2">
                    — {selectedVariants[variant.name]}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={variant.name}>
                {variant.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [variant.name]: opt.value,
                      }))
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-sm border transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                      selectedVariants[variant.name] === opt.value
                        ? 'border-violet bg-violet/15 text-violet'
                        : 'border-[var(--border)] text-[var(--muted)] hover:border-violet/40 hover:text-[var(--text)]'
                    )}
                    aria-pressed={selectedVariants[variant.name] === opt.value}
                  >
                    {opt.hex && (
                      <span
                        className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle"
                        style={{ backgroundColor: opt.hex }}
                        aria-hidden="true"
                      />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Qty + Add to cart */}
          <div ref={addToCartRef} className="flex items-center gap-3 pt-2">
            <QtyStepper
              value={qty}
              min={1}
              max={liveStock}
              onChange={setQty}
              loading={addToCart.isPending}
            />
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={liveStock === 0 || addToCart.isPending}
              className="flex-1 btn-primary py-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} aria-hidden="true" />
              {liveStock === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist.mutate(product._id)}
              disabled={toggleWishlist.isPending}
              className="p-3 rounded-xl glass border border-[var(--border)] hover:border-violet/40 transition-colors"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
            >
              <Heart
                size={20}
                className={cn(isWishlisted ? 'fill-danger text-danger' : 'text-[var(--muted)]')}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Share */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-[var(--muted)] flex items-center gap-1">
              <Share2 size={12} aria-hidden="true" />
              Share
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] glass px-2.5 py-1.5 rounded-lg border border-[var(--border)] hover:border-violet/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              {linkCopied ? <CheckIcon size={12} className="text-success" /> : <Copy size={12} />}
              {linkCopied ? 'Copied!' : 'Copy link'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] glass px-2.5 py-1.5 rounded-lg border border-[var(--border)] hover:border-violet/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              Twitter
            </a>
          </div>

          {/* Specs */}
          {product.specs.length > 0 && (
            <div className="glass rounded-2xl p-4 space-y-2">
              <p className="text-sm font-semibold mb-3">Specifications</p>
              {product.specs.map((spec) => (
                <div key={spec.key} className="flex justify-between text-sm gap-4">
                  <span className="text-[var(--muted)] shrink-0">{spec.key}</span>
                  <span className="text-[var(--text)] text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/shop?tags=${tag}`}
                  className="text-xs text-[var(--muted)] hover:text-violet glass px-2.5 py-1 rounded-full border border-[var(--border)] hover:border-violet/30 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky add-to-cart ──────────────────────────────────────────────── */}
      {stickyVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--border)] shadow-card py-3 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {product.images[0] && (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 shrink-0">
                <Image
                  src={product.images[0].url}
                  alt={product.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">{product.title}</p>
              <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={liveStock === 0 || addToCart.isPending}
              className="btn-primary px-5 py-2.5 text-sm shrink-0 disabled:opacity-50"
            >
              <ShoppingCart size={15} aria-hidden="true" />
              Add to cart
            </button>
          </div>
        </div>
      )}

      {/* ── Frequently bought together ──────────────────────────────────────── */}
      {relatedProducts.length >= 2 && (
        <section className="mt-16" aria-label="Frequently bought together">
          <h2 className="font-display font-semibold text-xl mb-6 flex items-center gap-2">
            <ShoppingBag size={20} className="text-violet" aria-hidden="true" />
            Frequently bought together
          </h2>
          <div className="glass rounded-3xl border border-[var(--border)] p-6">
            <div className="flex flex-wrap items-center gap-4 mb-5">
              {[product, ...relatedProducts.slice(0, 2)].map((p, idx, arr) => (
                <div key={p._id} className="flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                    {p.images[0] && (
                      <Image
                        src={p.images[0].url}
                        alt={p.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[var(--text)] line-clamp-1 max-w-[120px]">
                      {p.title}
                    </p>
                    <p className="text-xs text-violet font-semibold">${p.price.toFixed(2)}</p>
                  </div>
                  {idx < arr.length - 1 && (
                    <span className="text-[var(--muted)] text-lg font-light">+</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-[var(--muted)]">
                Combined total:{' '}
                <span className="font-semibold text-[var(--text)]">
                  $
                  {[product, ...relatedProducts.slice(0, 2)]
                    .reduce((s, p) => s + p.price, 0)
                    .toFixed(2)}
                </span>
              </p>
              <button
                type="button"
                onClick={async () => {
                  for (const p of [product, ...relatedProducts.slice(0, 2)]) {
                    await addToCart.mutateAsync({ productId: p._id, qty: 1 })
                  }
                  openDrawer()
                  toast.success('All 3 items added to cart!')
                }}
                disabled={addToCart.isPending}
                className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50"
              >
                <ShoppingBag size={15} aria-hidden="true" />
                Add all to cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ─────────────────────────────────────────────────────────── */}
      <section className="mt-16" aria-label="Customer reviews">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-semibold text-xl">Customer reviews</h2>
            {product.ratingCount > 0 && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-bold">{product.ratingAvg.toFixed(1)}</span>
                <div>
                  <RatingStars rating={product.ratingAvg} showCount={false} size={16} />
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {product.ratingCount} review{product.ratingCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Sort controls */}
          {reviewsData && reviewsData.reviews.length > 1 && (
            <div className="flex items-center gap-1 glass rounded-xl p-1 border border-[var(--border)]">
              {(['newest', 'rating', 'helpful'] as ReviewSort[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewSort(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                    reviewSort === s
                      ? 'bg-violet/20 text-violet'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  )}
                >
                  {s === 'newest' ? 'Newest' : s === 'rating' ? 'Top rated' : 'Helpful'}
                </button>
              ))}
            </div>
          )}
        </div>

        {!reviewsData || reviewsData.reviews.length === 0 ? (
          <EmptyState
            icon={<Star size={24} />}
            title="No reviews yet"
            description="Be the first to review this product."
          />
        ) : (
          <>
            {/* Star breakdown bars */}
            <ReviewBreakdownBars reviews={reviewsData.reviews} />

            <div className="grid gap-4 sm:grid-cols-2">
              {[...reviewsData.reviews]
                .sort((a, b) => {
                  if (reviewSort === 'rating') return b.rating - a.rating
                  if (reviewSort === 'helpful')
                    return (helpfulVotes[b._id] ? 1 : 0) - (helpfulVotes[a._id] ? 1 : 0)
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                })
                .map((r) => (
                  <article key={r._id} className="glass rounded-2xl p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{r.user.name}</p>
                        <RatingStars rating={r.rating} showCount={false} size={13} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <time className="text-xs text-[var(--muted)]">
                          {new Date(r.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                        {r.isVerifiedPurchase && (
                          <Badge variant="success" className="text-[10px]">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    {r.title && <p className="font-medium text-sm">{r.title}</p>}
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{r.body}</p>
                    <button
                      type="button"
                      onClick={() => handleHelpfulVote(r._id)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs transition-colors mt-1 focus-visible:outline-none focus-visible:underline',
                        helpfulVotes[r._id]
                          ? 'text-violet'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      )}
                    >
                      <ThumbsUp size={12} aria-hidden="true" />
                      {helpfulVotes[r._id] ? 'Helpful!' : 'Helpful?'}
                    </button>
                  </article>
                ))}
            </div>
          </>
        )}

        {reviewsData && reviewsData.meta.totalPages > 1 && (
          <div className="mt-6 text-center">
            <Link
              href={`/product/${slug}/reviews`}
              className="inline-flex items-center gap-1.5 text-sm text-violet hover:underline"
            >
              View all {reviewsData.meta.total} reviews <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>

      {/* ── You may also like ───────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="mt-16" aria-label="Related products">
          <h2 className="font-display font-semibold text-xl mb-6">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Recently viewed ─────────────────────────────────────────────────── */}
      <div className="mt-8 border-t border-[var(--border)] pt-8">
        <RecentlyViewed excludeId={product._id} />
      </div>
    </div>
  )
}
