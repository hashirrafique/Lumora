'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Check, Package, Truck, MapPin, CreditCard } from 'lucide-react'
import { useOrder } from '@/lib/hooks/useOrders'
import { useOrderSocket } from '@/lib/hooks/useOrderSocket'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 skeleton rounded-lg w-1/3" />
        <div className="glass rounded-2xl p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 skeleton rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Order not found"
        action={<Link href="/account/orders" className="btn-primary">Back to orders</Link>}
      />
    )
  }

  const currentStepIdx = order.status === 'cancelled' ? -1 : STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number])

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
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant={STATUS_BADGE[order.status] ?? 'default'}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Status timeline */}
      {order.status !== 'cancelled' && (
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-5">Order status</h2>
          <div className="flex items-center" role="list" aria-label="Order progress">
            {STATUS_STEPS.map((s, i) => {
              const done = i <= currentStepIdx
              const active = i === currentStepIdx
              const Icon = STATUS_ICONS[s]
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none" role="listitem">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                        done ? 'bg-violet text-white' : 'bg-white/5 text-[var(--muted)]',
                        active && 'ring-2 ring-violet ring-offset-2 ring-offset-[var(--surface)]'
                      )}
                      aria-current={active ? 'step' : undefined}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </div>
                    <span className={cn('text-xs hidden sm:block', done ? 'text-[var(--text)]' : 'text-[var(--muted)]')}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={cn('flex-1 h-px mx-2 transition-colors', i < currentStepIdx ? 'bg-violet/40' : 'bg-[var(--border)]')} aria-hidden="true" />
                  )}
                </div>
              )
            })}
          </div>
          {/* Status history */}
          <div className="mt-5 space-y-1.5">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className={cn('font-medium capitalize', i === 0 ? 'text-violet' : 'text-[var(--muted)]')}>
                  {h.status}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  {new Date(h.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-sm">Items</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4 py-2 border-b border-[var(--border)] last:border-0">
            {item.image ? (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              {item.variant && (
                <p className="text-xs text-[var(--muted)]">{item.variant.name}: {item.variant.value}</p>
              )}
              <p className="text-xs text-[var(--muted)]">Qty {item.qty} × ${item.price.toFixed(2)}</p>
            </div>
            <p className="text-sm font-semibold shrink-0">${(item.price * item.qty).toFixed(2)}</p>
          </div>
        ))}

        {/* Totals */}
        <div className="space-y-1.5 text-sm pt-2">
          <div className="flex justify-between text-[var(--muted)]">
            <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
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
            <span>Total</span><span>${order.total.toFixed(2)}</span>
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
            Status: <span className={cn(order.payment.status === 'paid' ? 'text-success' : 'text-danger')}>{order.payment.status}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
