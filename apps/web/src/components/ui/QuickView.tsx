'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, ArrowRight } from 'lucide-react'
import { Price } from './Price'
import { RatingStars } from './RatingStars'
import { Badge } from './Badge'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useCartStore } from '@/store/cart.store'
import type { ProductDTO } from '@/lib/api'

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

interface QuickViewProps {
  product: ProductDTO | null
  onClose: () => void
}

export function QuickView({ product, onClose }: QuickViewProps) {
  const addToCart = useAddToCart()
  const openDrawer = useCartStore((s) => s.openDrawer)

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    if (product) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [product, handleClose])

  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [product])

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return
    await addToCart.mutateAsync({ productId: product._id, qty: 1 })
    openDrawer()
    handleClose()
  }

  const img = product?.images[0]
  const isOutOfStock = (product?.stock ?? 0) === 0

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="quick-view-overlay"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.title}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto shadow-card">
              {/* Close button */}
              <div className="flex justify-end p-4 pb-0">
                <button
                  onClick={handleClose}
                  aria-label="Close quick view"
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 pt-2">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5">
                  {img ? (
                    <Image
                      src={img.url}
                      alt={img.alt || product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                      <ShoppingCart size={40} aria-hidden="true" />
                    </div>
                  )}

                  {/* Badges */}
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
                </div>

                {/* Info */}
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-[var(--muted)] mb-1">
                      {typeof product.category === 'object' ? product.category.name : product.brand}
                    </p>
                    <h2 className="font-display font-bold text-xl leading-tight text-[var(--text)] mb-2">
                      {product.title}
                    </h2>
                    {product.ratingCount > 0 && (
                      <RatingStars
                        rating={product.ratingAvg}
                        count={product.ratingCount}
                        size={13}
                      />
                    )}
                  </div>

                  <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />

                  {product.description && (
                    <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  {product.stock > 0 && product.stock <= 5 && (
                    <p className="text-xs font-semibold text-warning">
                      Only {product.stock} left in stock!
                    </p>
                  )}

                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || addToCart.isPending}
                      className="btn-primary w-full justify-center text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={16} aria-hidden="true" />
                      {isOutOfStock ? 'Out of stock' : 'Add to cart'}
                    </button>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={handleClose}
                      className="btn-secondary w-full text-center text-sm py-2.5 flex items-center justify-center gap-1.5"
                    >
                      View full details <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
