'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, ChevronLeft, ArrowRight } from 'lucide-react'
import { useProduct, useProductReviews } from '@/lib/hooks/useProducts'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useToggleWishlist, useWishlist } from '@/lib/hooks/useWishlist'
import { useCartStore } from '@/store/cart.store'
import { useStockSocket } from '@/lib/hooks/useStockSocket'
import { Price } from '@/components/ui/Price'
import { RatingStars } from '@/components/ui/RatingStars'
import { StockBadge } from '@/components/ui/StockBadge'
import { Badge } from '@/components/ui/Badge'
import { QtyStepper } from '@/components/ui/QtyStepper'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

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

  const liveStock = useStockSocket(product?._id ?? '', product?.stock ?? 0)

  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

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
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-8" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-[var(--text)] transition-colors flex items-center gap-1">
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
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5">
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
                  <Image src={img.url} alt={img.alt || `Image ${i + 1}`} fill className="object-cover" sizes="80px" />
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

          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="xl"
          />

          <StockBadge stock={liveStock} />

          <p className="text-sm text-[var(--muted)] leading-relaxed">{product.description}</p>

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
          <div className="flex items-center gap-3 pt-2">
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

      {/* ── Reviews ─────────────────────────────────────────────────────────── */}
      <section className="mt-16" aria-label="Customer reviews">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-semibold text-xl">Customer reviews</h2>
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-3">
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

        {!reviewsData || reviewsData.reviews.length === 0 ? (
          <EmptyState
            icon={<Star size={24} />}
            title="No reviews yet"
            description="Be the first to review this product."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {reviewsData.reviews.map((review) => {
              const r = review as {
                _id: string
                user: { name: string }
                rating: number
                title?: string
                body: string
                isVerifiedPurchase: boolean
                createdAt: string
              }
              return (
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
                        <Badge variant="success" className="text-[10px]">Verified</Badge>
                      )}
                    </div>
                  </div>
                  {r.title && <p className="font-medium text-sm">{r.title}</p>}
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{r.body}</p>
                </article>
              )
            })}
          </div>
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
    </div>
  )
}
