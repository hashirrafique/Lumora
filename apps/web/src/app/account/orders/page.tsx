'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Package } from 'lucide-react'
import { useOrders } from '@/lib/hooks/useOrders'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import type { BadgeVariant } from '@/components/ui/Badge'

const STATUS_BADGE: Record<string, BadgeVariant> = {
  placed: 'cyan',
  packed: 'violet',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'danger',
}

const STATUS_LABEL: Record<string, string> = {
  placed: 'Order placed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders()

  return (
    <div className="space-y-4">
      <h1 className="font-display font-semibold text-xl">Order history</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 space-y-3">
              <div className="h-5 skeleton rounded-lg w-1/3" />
              <div className="h-4 skeleton rounded-lg w-1/2" />
              <div className="h-4 skeleton rounded-lg w-1/4" />
            </div>
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon={<Package size={24} />}
          title="No orders yet"
          description="Your order history will appear here once you make a purchase."
          action={
            <Link href="/shop" className="btn-primary">
              Start shopping
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order.orderNumber}`}
              className="block glass rounded-2xl p-5 hover:border-violet/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="font-mono font-semibold text-violet truncate">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                    <strong className="text-[var(--text)]">${order.total.toFixed(2)}</strong>
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant={STATUS_BADGE[order.status] ?? 'default'}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
