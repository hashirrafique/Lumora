'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RatingStars } from '@/components/ui/RatingStars'
import { Price } from '@/components/ui/Price'
import { Badge } from '@/components/ui/Badge'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useToggleWishlist, useWishlist } from '@/lib/hooks/useWishlist'
import { useCartStore } from '@/store/cart.store'
import type { ProductDTO } from '@/lib/api'

interface ProductCardProps {
  product: ProductDTO
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const addToCart = useAddToCart()
  const toggleWishlist = useToggleWishlist()
  const { data: wishlist } = useWishlist()
  const openDrawer = useCartStore((s) => s.openDrawer)

  const isWishlisted = wishlist?.products.some((p) => p._id === product._id) ?? false
  const mainImage = product.images[0]
  const isOutOfStock = product.stock === 0

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    await addToCart.mutateAsync({ productId: product._id, qty: 1 })
    openDrawer()
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await toggleWishlist.mutateAsync(product._id)
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        'group glass rounded-3xl overflow-hidden flex flex-col',
        'border border-[var(--border)] hover:border-violet/40',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-card',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
        isOutOfStock && 'opacity-70',
        className
      )}
      aria-label={`View ${product.title}`}
    >
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
              -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
            </Badge>
          )}
          {isOutOfStock && <Badge variant="danger">Out of stock</Badge>}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={toggleWishlist.isPending}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-xl glass',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'hover:bg-white/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
            'disabled:cursor-not-allowed'
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Heart
            size={16}
            className={cn(
              'transition-colors duration-150',
              isWishlisted ? 'fill-danger text-danger' : 'text-[var(--muted)]'
            )}
            aria-hidden="true"
          />
        </button>
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
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="sm"
          />

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || addToCart.isPending}
            className={cn(
              'p-2 rounded-xl glass flex items-center gap-1.5',
              'text-xs font-medium text-violet border border-violet/30',
              'hover:bg-violet/10 transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shrink-0'
            )}
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </Link>
    </motion.div>
  )
}
