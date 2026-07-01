'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Heart, ShoppingCart, Check, Eye, GitCompare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { spring } from '@/lib/motion'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { RatingStars } from '@/components/ui/RatingStars'
import { Price } from '@/components/ui/Price'
import { Badge } from '@/components/ui/Badge'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useToggleWishlist, useWishlist } from '@/lib/hooks/useWishlist'
import { useCartStore } from '@/store/cart.store'
import { useCompareStore } from '@/store/compare.store'
import type { ProductDTO } from '@/lib/api'

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

// Pre-computed burst angles so particles radiate in 6 evenly spaced directions
const BURST_ANGLES = [0, 60, 120, 180, 240, 300]

interface ProductCardProps {
  product: ProductDTO
  className?: string
  onQuickView?: (product: ProductDTO) => void
}

export function ProductCard({ product, className, onQuickView }: ProductCardProps) {
  const reduced = useReducedMotion()
  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)
  const [justWishlisted, setJustWishlisted] = useState(false)
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })

  const cardRef = useRef<HTMLDivElement>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)

  const addToCart = useAddToCart()
  const toggleWishlist = useToggleWishlist()
  const { data: wishlist } = useWishlist()
  const openDrawer = useCartStore((s) => s.openDrawer)
  const { addToCompare, removeFromCompare, isInCompare, compareList } = useCompareStore()
  const inCompare = isInCompare(product._id)
  const compareListFull = compareList.length >= 3 && !inCompare

  // 3D tilt motion values
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useTransform(my, [-0.5, 0.5], reduced || !canHover ? [0, 0] : [6, -6])
  const rotateY = useTransform(mx, [-0.5, 0.5], reduced || !canHover ? [0, 0] : [-6, 6])

  const isWishlisted = wishlist?.products.some((p) => p._id === product._id) ?? false
  const mainImage = product.images[0]
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced || !canHover) return
      const rect = e.currentTarget.getBoundingClientRect()
      mx.set((e.clientX - rect.left) / rect.width - 0.5)
      my.set((e.clientY - rect.top) / rect.height - 0.5)
      setSpotlight({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    },
    [reduced, canHover, mx, my]
  )

  const handleMouseLeave = useCallback(() => {
    mx.set(0)
    my.set(0)
  }, [mx, my])

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isOutOfStock || added) return
      const btnRect = addBtnRef.current?.getBoundingClientRect()
      await addToCart.mutateAsync({ productId: product._id, qty: 1 })
      setAdded(true)
      openDrawer()
      if (btnRect && mainImage?.url) {
        window.dispatchEvent(
          new CustomEvent('lumora:cart-fly', {
            detail: { srcX: btnRect.left, srcY: btnRect.top, productImage: mainImage.url },
          })
        )
      }
      setTimeout(() => setAdded(false), 1800)
    },
    [isOutOfStock, added, addToCart, product._id, openDrawer, mainImage]
  )

  const handleWishlist = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const wasWishlisted = isWishlisted
      await toggleWishlist.mutateAsync(product._id)
      if (!wasWishlisted) {
        setJustWishlisted(true)
        setTimeout(() => setJustWishlisted(false), 700)
      }
    },
    [toggleWishlist, product._id, isWishlisted]
  )

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onQuickView?.(product)
    },
    [onQuickView, product]
  )

  const handleCompare = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (inCompare) removeFromCompare(product._id)
      else addToCompare(product)
    },
    [inCompare, addToCompare, removeFromCompare, product]
  )

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={reduced ? {} : { y: -4, scale: 1.01 }}
      transition={spring.snappy}
      className="relative"
    >
      <Link
        href={`/product/${product.slug}`}
        className={cn(
          'group glass rounded-3xl overflow-hidden flex flex-col',
          'border border-[var(--border)] hover:border-violet/40',
          'transition-all duration-300 hover:shadow-card',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
          isOutOfStock && 'opacity-70',
          className
        )}
        aria-label={`View ${product.title}`}
      >
        {/* Spotlight overlay */}
        {canHover && !reduced && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(120px circle at ${spotlight.x}% ${spotlight.y}%, rgba(124,92,255,0.12), transparent)`,
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-white/5">
          {mainImage && !imgError ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
              <ShoppingCart size={32} aria-hidden="true" />
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && <Badge variant="violet">Featured</Badge>}
            {product.isBestseller && <Badge variant="bestseller">Bestseller</Badge>}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <Badge variant="success">
                -
                {Math.round(
                  ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                )}
                %
              </Badge>
            )}
            {isOutOfStock && <Badge variant="danger">Out of stock</Badge>}
          </div>

          {/* Top-right actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {/* Wishlist + burst */}
            <div className="relative">
              <motion.button
                type="button"
                onClick={handleWishlist}
                disabled={toggleWishlist.isPending}
                className={cn(
                  'p-2 rounded-xl glass touch-always-visible',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                  'hover:bg-white/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                  'disabled:cursor-not-allowed'
                )}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isWishlisted}
                whileTap={{ scale: 0.85 }}
              >
                <motion.div
                  animate={
                    justWishlisted && !reduced
                      ? { scale: [1, 0, 1.5, 1], rotate: [0, 0, -12, 0] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Heart
                    size={16}
                    className={cn(
                      'transition-colors duration-150',
                      isWishlisted ? 'fill-danger text-danger' : 'text-[var(--muted)]'
                    )}
                    aria-hidden="true"
                  />
                </motion.div>
              </motion.button>

              {/* Burst particles */}
              <AnimatePresence>
                {justWishlisted && !reduced && (
                  <>
                    {BURST_ANGLES.map((angle) => (
                      <motion.div
                        key={angle}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        animate={{
                          opacity: 0,
                          x: Math.cos((angle * Math.PI) / 180) * 22,
                          y: Math.sin((angle * Math.PI) / 180) * 22,
                          scale: 0.4,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <Heart size={8} className="fill-danger text-danger" />
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick view */}
            {onQuickView && (
              <button
                type="button"
                onClick={handleQuickView}
                className={cn(
                  'p-2 rounded-xl glass touch-always-visible',
                  'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                  'hover:bg-white/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet'
                )}
                aria-label={`Quick view ${product.title}`}
              >
                <Eye size={15} className="text-[var(--muted)]" aria-hidden="true" />
              </button>
            )}

            {/* Compare */}
            <button
              type="button"
              onClick={handleCompare}
              disabled={compareListFull}
              title={
                compareListFull
                  ? 'Max 3 products'
                  : inCompare
                    ? 'Remove from compare'
                    : 'Add to compare'
              }
              className={cn(
                'p-2 rounded-xl glass touch-always-visible',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                'hover:bg-white/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                inCompare && 'text-violet opacity-100'
              )}
              aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
              aria-pressed={inCompare}
            >
              <GitCompare
                size={15}
                className={inCompare ? 'text-violet' : 'text-[var(--muted)]'}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Low stock warning */}
          {isLowStock && (
            <div className="absolute bottom-3 left-3 right-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning/20 text-warning border border-warning/30">
                Only {product.stock} left!
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          <div className="flex flex-col gap-0.5 flex-1">
            <p className="text-xs text-[var(--muted)] truncate">
              {typeof product.category === 'object' ? product.category.name : product.brand}
            </p>
            <h3 className="font-medium text-sm text-[var(--text)] line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </div>

          {product.ratingCount > 0 && (
            <RatingStars rating={product.ratingAvg} count={product.ratingCount} size={12} />
          )}

          <div className="flex items-center justify-between gap-2 mt-auto pt-2">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />

            <motion.button
              ref={addBtnRef}
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCart.isPending}
              className={cn(
                'p-2 rounded-xl glass flex items-center gap-1.5 shrink-0',
                'text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150',
                added
                  ? 'text-success border border-success/30 bg-success/10'
                  : 'text-violet border border-violet/30 hover:bg-violet/10'
              )}
              aria-label={`Add ${product.title} to cart`}
              whileTap={{ scale: 0.92 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={spring.bouncy}
                  >
                    <Check size={14} aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={spring.bouncy}
                  >
                    <ShoppingCart size={14} aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="hidden sm:inline">{added ? 'Added!' : 'Add'}</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
