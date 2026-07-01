'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Trash2, Tag, X } from 'lucide-react'
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useApplyCoupon,
  useRemoveCoupon,
} from '@/lib/hooks/useCart'
import { QtyStepper } from '@/components/ui/QtyStepper'
import { EmptyState } from '@/components/ui/EmptyState'
import type { CartItemDTO } from '@/lib/api'
import { cn } from '@/lib/utils'

function CartRow({ item }: { item: CartItemDTO }) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const product = item.product
  const img = product.images[0]

  return (
    <tr className="border-b border-[var(--border)] last:border-0">
      {/* Product */}
      <td className="py-5 pr-4">
        <div className="flex items-center gap-4">
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
          <div className="min-w-0">
            <Link
              href={`/product/${product.slug}`}
              className="font-medium text-[var(--text)] hover:text-violet transition-colors line-clamp-2 text-sm"
            >
              {product.title}
            </Link>
            {item.variant && (
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {item.variant.name}: {item.variant.value}
              </p>
            )}
            <p className="text-xs text-[var(--muted)]">{product.brand}</p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="py-5 pr-4 text-sm text-[var(--muted)] hidden sm:table-cell">
        ${product.price.toFixed(2)}
      </td>

      {/* Qty */}
      <td className="py-5 pr-4">
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
      </td>

      {/* Subtotal */}
      <td className="py-5 pr-4 text-sm font-semibold text-[var(--text)] hidden sm:table-cell">
        ${(product.price * item.qty).toFixed(2)}
      </td>

      {/* Remove */}
      <td className="py-5">
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
          className="p-2 rounded-xl text-[var(--muted)] hover:text-danger hover:bg-white/5 transition-colors"
          aria-label={`Remove ${product.title}`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </td>
    </tr>
  )
}

export default function CartPage() {
  const { data: cart, isLoading } = useCart()
  const applyCoupon = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')

  async function handleApplyCoupon() {
    setCouponError('')
    try {
      await applyCoupon.mutateAsync(couponInput.trim())
      setCouponInput('')
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon')
    }
  }

  const isEmpty = !cart || cart.items.length === 0

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-semibold text-2xl mb-8">Your cart</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((i) => (
            <div key={String(i)} className="flex gap-4 py-4 border-b border-[var(--border)]">
              <div className="w-20 h-20 skeleton rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 skeleton rounded-lg w-2/3" />
                <div className="h-3 skeleton rounded-lg w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-semibold text-2xl mb-8">
        Your cart
        {!isEmpty && (
          <span className="text-[var(--muted)] font-normal text-lg ml-2">
            ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})
          </span>
        )}
      </h1>

      {isEmpty ? (
        <EmptyState
          icon={<ShoppingCart size={28} />}
          title="Your cart is empty"
          description="Add some products to get started"
          action={
            <Link href="/shop" className="btn-primary">
              Browse shop
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items table */}
          <div className="lg:col-span-2">
            <table className="w-full" aria-label="Cart items">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-widest pb-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-widest pb-3 hidden sm:table-cell">
                    Price
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-widest pb-3">
                    Qty
                  </th>
                  <th className="text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-widest pb-3 hidden sm:table-cell">
                    Total
                  </th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <CartRow key={`${item.product._id}-${item.variant?.value ?? ''}`} item={item} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 space-y-4">
              <h2 className="font-semibold">Order summary</h2>

              <div className="space-y-2 text-sm">
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
                  <span>{cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-[var(--text)] pt-2 border-t border-[var(--border)]">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              {cart.couponCode ? (
                <div className="flex items-center justify-between gap-2 bg-success/10 text-success rounded-xl px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} aria-hidden="true" />
                    {cart.couponCode} applied
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCoupon.mutate()}
                    disabled={removeCoupon.isPending}
                    className="text-success/70 hover:text-success transition-colors"
                    aria-label="Remove coupon"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase())
                        setCouponError('')
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className={cn(
                        'flex-1 glass rounded-xl px-3 py-2 text-sm border outline-none',
                        couponError
                          ? 'border-danger/50'
                          : 'border-[var(--border)] focus:border-violet/50',
                        'transition-colors'
                      )}
                      aria-label="Coupon code"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput || applyCoupon.isPending}
                      className="px-4 py-2 rounded-xl glass border border-[var(--border)] text-sm font-medium hover:border-violet/40 transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-danger" role="alert">
                      {couponError}
                    </p>
                  )}
                </div>
              )}

              <Link href="/checkout" className="btn-primary w-full justify-center py-3 text-center">
                Proceed to checkout
              </Link>
              <Link
                href="/shop"
                className="block text-center text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
