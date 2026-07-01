'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Truck, Heart, Gift, ChevronDown, ShoppingBag } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { QtyStepper } from '@/components/ui/QtyStepper'
import { Price } from '@/components/ui/Price'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCartStore } from '@/store/cart.store'
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/lib/hooks/useCart'
import { useToggleWishlist } from '@/lib/hooks/useWishlist'
import { useProducts } from '@/lib/hooks/useProducts'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useToast } from '@/components/ui/Toast'
import { spring } from '@/lib/motion'
import type { CartItemDTO } from '@/lib/api'
import { cn } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 75

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

function ShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <div className="px-6 py-3 border-b border-[var(--border)]">
      <div className="flex items-center gap-2 mb-2">
        <Truck
          size={14}
          className={isFree ? 'text-success' : 'text-[var(--muted)]'}
          aria-hidden="true"
        />
        {isFree ? (
          <p className="text-xs font-medium text-success">You have free shipping!</p>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            Add <span className="font-semibold text-[var(--text)]">${remaining.toFixed(2)}</span>{' '}
            more for free shipping
          </p>
        )}
      </div>
      <div
        className="shipping-progress"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="shipping-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function CartItem({ item }: { item: CartItemDTO }) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const toggleWishlist = useToggleWishlist()
  const toast = useToast()

  const product = item.product
  const img = product.images[0]

  const handleSaveForLater = async () => {
    await toggleWishlist.mutateAsync(product._id)
    removeItem.mutate({
      productId: product._id,
      variantName: item.variant?.name,
      variantValue: item.variant?.value,
    })
    toast.success('Saved to wishlist ♡')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, paddingBottom: 0 }}
      transition={spring.gentle}
      className="flex gap-3 py-4 border-b border-[var(--border)] last:border-0"
    >
      {/* Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0">
        {img ? (
          <Image
            src={img.url}
            alt={img.alt || product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
            <ShoppingCart size={20} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text)] line-clamp-2 leading-snug">
              {product.title}
            </p>
            {item.variant && (
              <p className="text-xs text-[var(--muted)]">
                {item.variant.name}: {item.variant.value}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              removeItem.mutate({
                productId: product._id,
                variantName: item.variant?.name,
                variantValue: item.variant?.value,
              })
            }
            disabled={removeItem.isPending}
            className="p-1 rounded-lg hover:bg-white/5 text-[var(--muted)] hover:text-danger transition-colors shrink-0"
            aria-label={`Remove ${product.title}`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <QtyStepper
            value={item.qty}
            min={1}
            max={product.stock}
            loading={updateItem.isPending}
            onChange={(qty) =>
              updateItem.mutate({
                productId: product._id,
                qty,
                variantName: item.variant?.name,
                variantValue: item.variant?.value,
              })
            }
          />
          <Price price={product.price * item.qty} size="sm" />
        </div>

        {/* Save for later */}
        <button
          type="button"
          onClick={() => void handleSaveForLater()}
          disabled={toggleWishlist.isPending}
          className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-violet transition-colors w-fit focus-visible:outline-none focus-visible:underline disabled:opacity-50"
        >
          <Heart size={11} aria-hidden="true" />
          Save for later
        </button>
      </div>
    </motion.div>
  )
}

function GiftWrapSection() {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <div className="border-t border-[var(--border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-6 py-3 text-left hover:bg-white/5 transition-colors"
        aria-expanded={open}
      >
        <Gift size={14} className="text-violet shrink-0" aria-hidden="true" />
        <span className="flex-1 text-sm text-[var(--muted)]">Add gift wrap or message</span>
        <ChevronDown
          size={13}
          className={cn(
            'text-[var(--muted)] transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.gentle}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet"
                />
                <span className="text-sm text-[var(--text)]">
                  Add gift wrap <span className="text-[var(--muted)]">($4.99)</span>
                </span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a gift message (optional)…"
                rows={2}
                className="w-full glass rounded-xl px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] focus:border-violet/50 outline-none resize-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CrossSellRow({ closeDrawer }: { closeDrawer: () => void }) {
  const { data } = useProducts({ featured: true, limit: 4 })
  const addToCart = useAddToCart()
  const openDrawer = useCartStore((s) => s.openDrawer)
  const products = data?.products ?? []

  if (products.length === 0) return null

  return (
    <div className="border-t border-[var(--border)] px-6 py-4">
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <ShoppingBag size={11} aria-hidden="true" />
        Complete your setup
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
        {products.map((p) => {
          const img = p.images[0]
          return (
            <div key={p._id} className="flex flex-col gap-2 shrink-0 w-24 snap-start">
              <Link
                href={`/product/${p.slug}`}
                onClick={closeDrawer}
                className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5 block"
              >
                {img && (
                  <Image
                    src={img.url}
                    alt={p.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                  />
                )}
              </Link>
              <p className="text-[10px] text-[var(--text)] line-clamp-2 leading-tight">{p.title}</p>
              <button
                type="button"
                onClick={async () => {
                  await addToCart.mutateAsync({ productId: p._id, qty: 1 })
                  openDrawer()
                }}
                disabled={addToCart.isPending || p.stock === 0}
                className="text-[10px] px-2 py-1 rounded-lg glass border border-violet/30 text-violet hover:bg-violet/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {p.stock === 0 ? 'OOS' : '+ Add'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CartDrawer() {
  const { drawerOpen, closeDrawer } = useCartStore()
  const { data: cart, isLoading } = useCart()

  const isEmpty = !cart || cart.items.length === 0
  const itemCount = cart?.items.reduce((n, i) => n + i.qty, 0) ?? 0

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      title={`Cart${itemCount > 0 ? ` (${itemCount})` : ''}`}
    >
      <div className="flex flex-col h-full">
        {/* Shipping progress */}
        {!isEmpty && cart && <ShippingProgress subtotal={cart.subtotal} />}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="py-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl skeleton shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton rounded-lg w-3/4" />
                    <div className="h-3 skeleton rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <EmptyState
              icon={<ShoppingCart size={28} />}
              title="Your cart is empty"
              description="Add some products to get started"
              action={
                <Link href="/shop" onClick={closeDrawer} className="btn-primary text-sm py-2 px-4">
                  Browse shop
                </Link>
              }
            />
          ) : (
            <AnimatePresence>
              {cart.items.map((item) => (
                <CartItem key={`${item.product._id}-${item.variant?.value ?? ''}`} item={item} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Cross-sell row */}
        {!isEmpty && <CrossSellRow closeDrawer={closeDrawer} />}

        {/* Gift wrap */}
        {!isEmpty && <GiftWrapSection />}

        {/* Footer totals */}
        {!isEmpty && cart && (
          <div className="px-6 py-4 border-t border-[var(--border)] space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount{cart.couponCode ? ` (${cart.couponCode})` : ''}</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--muted)]">
                <span>Shipping</span>
                <span>
                  {cart.shipping === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    `$${cart.shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-[var(--text)] pt-1.5 border-t border-[var(--border)]">
                <span>Total</span>
                <span className={cn('text-aurora')}>${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full text-center py-3 rounded-xl glass border border-[var(--border)] text-sm font-medium hover:border-violet/40 transition-colors"
              >
                View cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="btn-primary w-full text-center justify-center py-3 text-sm"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
