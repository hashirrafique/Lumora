'use client'

import { useState } from 'react'
import { useAdminOrders, useUpdateOrderStatus } from '@/lib/hooks/useAdmin'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/components/ui/Badge'
import type { OrderDTO } from '@/lib/api'

const STATUS_STEPS = ['placed', 'packed', 'shipped', 'delivered', 'cancelled'] as const
type OrderStatus = typeof STATUS_STEPS[number]

const STATUS_BADGE: Record<OrderStatus, BadgeVariant> = {
  placed: 'cyan',
  packed: 'violet',
  shipped: 'warning',
  delivered: 'success',
  cancelled: 'danger',
}

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminOrders(statusFilter || undefined, page)
  const updateStatus = useUpdateOrderStatus()

  const orders = (data?.data ?? []) as OrderDTO[]
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Orders</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage and update order statuses</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['', ...STATUS_STEPS] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatusFilter(s as OrderStatus | ''); setPage(1) }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
              statusFilter === s
                ? 'bg-violet/15 border-violet text-violet'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-violet/40'
            )}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-[var(--muted)]">No orders found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Order</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Date</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Customer</th>
                <th className="text-right px-4 py-3 text-xs text-[var(--muted)] font-medium">Total</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-[var(--border)] last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-violet">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] truncate max-w-[120px]">
                    {typeof order.user === 'object' ? (order.user as { name?: string }).name ?? '—' : order.user}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[order.status] ?? 'default'}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updateStatus.isPending}
                      onChange={(e) => {
                        updateStatus.mutate({ id: order._id, status: e.target.value })
                      }}
                      className="text-xs bg-transparent border border-[var(--border)] rounded-lg px-2 py-1 focus:outline-none focus:border-violet text-[var(--text)] disabled:opacity-50"
                      aria-label={`Change status for ${order.orderNumber}`}
                    >
                      {STATUS_STEPS.map((s) => (
                        <option key={s} value={s} style={{ background: 'var(--bg)' }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-xl text-xs glass border border-[var(--border)] disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-xs text-[var(--muted)]">
            {page} / {meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="px-3 py-1.5 rounded-xl text-xs glass border border-[var(--border)] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
