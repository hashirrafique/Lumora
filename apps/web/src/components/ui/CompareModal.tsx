'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import { useCompareStore } from '@/store/compare.store'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useCartStore } from '@/store/cart.store'
import { Price } from './Price'
import { RatingStars } from './RatingStars'

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

const ROWS = [
  { label: 'Image', key: 'image' },
  { label: 'Price', key: 'price' },
  { label: 'Rating', key: 'rating' },
  { label: 'Brand', key: 'brand' },
  { label: 'Stock', key: 'stock' },
  { label: 'Category', key: 'category' },
]

interface CompareModalProps {
  onClose: () => void
}

export function CompareModal({ onClose }: CompareModalProps) {
  const { compareList, clearCompare } = useCompareStore()
  const addToCart = useAddToCart()
  const openDrawer = useCartStore((s) => s.openDrawer)

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [handleClose])

  const handleAddToCart = async (productId: string) => {
    await addToCart.mutateAsync({ productId, qty: 1 })
    openDrawer()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <motion.div
        key="panel"
        role="dialog"
        aria-modal="true"
        aria-label="Compare products"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="glass rounded-3xl overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-card">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-glass">
            <h2 className="font-display font-bold text-lg text-[var(--text)]">
              Compare Products ({compareList.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  clearCompare()
                  handleClose()
                }}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close compare"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <colgroup>
                <col className="w-28" />
                {compareList.map((p) => (
                  <col key={p._id} />
                ))}
              </colgroup>
              <tbody>
                {ROWS.map(({ label, key }) => (
                  <tr key={key} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-4 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap align-top">
                      {label}
                    </td>
                    {compareList.map((product) => (
                      <td key={product._id} className="px-4 py-4 align-top text-[var(--text)]">
                        {key === 'image' && (
                          <Link href={`/product/${product.slug}`} onClick={handleClose}>
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/5 mb-3 max-w-[180px]">
                              {product.images[0] && (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.title}
                                  fill
                                  sizes="180px"
                                  className="object-cover"
                                  placeholder="blur"
                                  blurDataURL={BLUR_PLACEHOLDER}
                                />
                              )}
                            </div>
                            <p className="font-medium text-sm leading-snug hover:text-violet transition-colors">
                              {product.title}
                            </p>
                          </Link>
                        )}
                        {key === 'price' && (
                          <Price
                            price={product.price}
                            compareAtPrice={product.compareAtPrice}
                            size="md"
                          />
                        )}
                        {key === 'rating' &&
                          (product.ratingCount > 0 ? (
                            <RatingStars
                              rating={product.ratingAvg}
                              count={product.ratingCount}
                              size={13}
                            />
                          ) : (
                            <span className="text-[var(--muted)]">No reviews</span>
                          ))}
                        {key === 'brand' && <span>{product.brand || '—'}</span>}
                        {key === 'stock' && (
                          <span
                            className={
                              product.stock === 0
                                ? 'text-danger'
                                : product.stock <= 5
                                  ? 'text-warning'
                                  : 'text-success'
                            }
                          >
                            {product.stock === 0
                              ? 'Out of stock'
                              : product.stock <= 5
                                ? `Only ${product.stock} left`
                                : 'In stock'}
                          </span>
                        )}
                        {key === 'category' && (
                          <span className="capitalize">
                            {typeof product.category === 'object'
                              ? product.category.name
                              : product.category || '—'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Add to cart row */}
                <tr>
                  <td className="px-4 py-4" />
                  {compareList.map((product) => (
                    <td key={product._id} className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => void handleAddToCart(product._id)}
                        disabled={product.stock === 0 || addToCart.isPending}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet to-cyan text-white text-xs font-medium disabled:opacity-50 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet max-w-[180px]"
                      >
                        <ShoppingCart size={13} aria-hidden="true" />
                        {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
