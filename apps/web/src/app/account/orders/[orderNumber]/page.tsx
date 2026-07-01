'use client'

export const dynamic = 'force-dynamic'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Check,
  Package,
  Truck,
  MapPin,
  CreditCard,
  RefreshCw,
  Printer,
} from 'lucide-react'
import { useOrder } from '@/lib/hooks/useOrders'
import { useOrderSocket } from '@/lib/hooks/useOrderSocket'
import { useAddToCart } from '@/lib/hooks/useCart'
import { useCartStore } from '@/store/cart.store'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { spring, ease, duration as dur } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'

const STATUS_STEPS = ['placed', 'packed', 'shipped', 'delivered'] as const

const STATUS_ICONS = {
  placed: Package,
  packed: Package,
  shipped: Truck,
  delivered: Check,
  cancelled: Package,
}

const STATUS_LABELS: Record<string, string> = {
  placed: 'Order placed',
  packed: 'Being packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

const STATUS_BADGE: Record<string, BadgeVariant> = {
  placed: 'cyan',
  packed: 'violet',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'danger',
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, isLoading, isError } = useOrder(orderNumber)
  useOrderSocket(orderNumber)
  const addToCart = useAddToCart()
  const openDrawer = useCartStore((s) => s.openDrawer)
  const toast = useToast()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 skeleton rounded-lg w-1/3" />
        <div className="glass rounded-2xl p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Order not found"
        action={
          <Link href="/account/orders" className="btn-primary">
            Back to orders
          </Link>
        }
      />
    )
  }

  const currentStepIdx =
    order.status === 'cancelled'
      ? -1
      : STATUS_STEPS.indexOf(order.status as (typeof STATUS_STEPS)[number])

  const handleReorder = async () => {
    await Promise.all(
      order.items.map((item) => {
        const productId = typeof item.product === 'string' ? item.product : item.product._id
        return addToCart.mutateAsync({
          productId,
          qty: item.qty,
          variant: item.variant,
        })
      })
    )
    openDrawer()
    toast.success(`${order.items.length} item${order.items.length > 1 ? 's' : ''} added to cart`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/account/orders"
          className="p-2 rounded-xl hover:bg-white/5 text-[var(--muted)] transition-colors"
          aria-label="Back to orders"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </Link>
        <div>
          <p className="font-mono font-semibold text-violet">{order.orderNumber}</p>
          <p className="text-xs text-[var(--muted)]">
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={STATUS_BADGE[order.status] ?? 'default'}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleReorder()}
          disabled={addToCart.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-[var(--border)] text-sm hover:border-violet/40 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Reorder
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-[var(--border)] text-sm hover:border-violet/40 transition-colors"
        >
          <Printer size={14} aria-hidden="true" />
          Print receipt
        </button>
      </div>

      {/* Animated status timeline */}
      {order.status !== 'cancelled' && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-8">Order status</h2>
          <div
            className="relative flex items-start justify-between"
            role="list"
            aria-label="Order progress"
          >
            {/* Background connector track */}
            <div
              className="absolute top-4 left-4 right-4 h-px bg-[var(--border)]"
              style={{ zIndex: 0 }}
              aria-hidden="true"
            />

            {STATUS_STEPS.map((s, i) => {
              const done = i <= currentStepIdx
              const active = i === currentStepIdx
              const Icon = STATUS_ICONS[s]

              return (
                <div
                  key={s}
                  className="relative flex flex-col items-center gap-2 z-10"
                  role="listitem"
                >
                  {/* Animated circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...spring.bouncy, delay: i * 0.07 }}
                    className="relative"
                    aria-current={active ? 'step' : undefined}
                  >
                    {/* Pulsing ring for current step */}
                    {active && (
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-violet opacity-60"
                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: ease.out }}
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                        done
                          ? 'bg-violet text-white'
                          : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]',
                        active && 'ring-2 ring-violet ring-offset-2 ring-offset-[var(--surface)]'
                      )}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </div>
                  </motion.div>

                  {/* Filled connector line after this step */}
                  {i < STATUS_STEPS.length - 1 && (
                    <motion.div
                      className="absolute top-4 h-px bg-violet/60"
                      style={{ left: '2.25rem', right: 'calc(-100% + 2.25rem)' }}
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{ scaleX: i < currentStepIdx ? 1 : 0 }}
                      transition={{ ...spring.gentle, delay: i * 0.07 + 0.15 }}
                      aria-hidden="true"
                    />
                  )}

                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 + 0.2, duration: dur.base, ease: ease.out }}
                    className={cn(
                      'text-[10px] text-center max-w-[4rem]',
                      done ? 'text-[var(--text)]' : 'text-[var(--muted)]'
                    )}
                  >
                    {STATUS_LABELS[s] ?? s}
                  </motion.span>
                </div>
              )
            })}
          </div>

          {/* Status history */}
          {order.statusHistory.length > 0 && (
            <div className="mt-6 space-y-1.5 border-t border-[var(--border)] pt-4">
              {[...order.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      'font-medium capitalize',
                      i === 0 ? 'text-violet' : 'text-[var(--muted)]'
                    )}
                  >
                    {h.status}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(h.at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-sm">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4 py-2 border-b border-[var(--border)] last:border-0">
            {item.image ? (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              {item.variant && (
                <p className="text-xs text-[var(--muted)]">
                  {item.variant.name}: {item.variant.value}
                </p>
              )}
              <p className="text-xs text-[var(--muted)]">
                Qty {item.qty} × ${item.price.toFixed(2)}
              </p>
            </div>
            <p className="text-sm font-semibold shrink-0">${(item.price * item.qty).toFixed(2)}</p>
          </div>
        ))}

        {/* Totals */}
        <div className="space-y-1.5 text-sm pt-2">
          <div className="flex justify-between text-[var(--muted)]">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[var(--muted)]">
            <span>Shipping ({order.shippingMethod.name})</span>
            <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-semibold text-[var(--text)] border-t border-[var(--border)] pt-2">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Address + payment */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <MapPin size={15} className="text-violet" aria-hidden="true" />
            Shipping address
          </div>
          <p className="text-sm">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-[var(--muted)]">
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {order.shippingAddress.city}
            {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}{' '}
            {order.shippingAddress.postalCode}
          </p>
          <p className="text-sm text-[var(--muted)]">{order.shippingAddress.country}</p>
        </div>

        <div className="glass rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <CreditCard size={15} className="text-violet" aria-hidden="true" />
            Payment
          </div>
          <p className="text-sm text-[var(--muted)] capitalize">
            {order.payment.brandGuess ?? 'Card'} ending in {order.payment.last4}
          </p>
          <p className="text-sm text-[var(--muted)] capitalize">
            Status:{' '}
            <span className={cn(order.payment.status === 'paid' ? 'text-success' : 'text-danger')}>
              {order.payment.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
