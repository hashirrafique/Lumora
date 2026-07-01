'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Tag, X, Check } from 'lucide-react'
import { spring, ease, duration as dur } from '@/lib/motion'
import { cn } from '@/lib/utils'
import {
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from '@/lib/hooks/useAdmin'
import type { CouponDTO } from '@/lib/api'

function NewCouponSlide({ onClose }: { onClose: () => void }) {
  const createCoupon = useCreateCoupon()
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState(10)
  const [minSubtotal, setMinSubtotal] = useState(0)
  const [maxUses, setMaxUses] = useState(100)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Code is required')
      return
    }
    if (value <= 0) {
      setError('Value must be greater than 0')
      return
    }
    if (type === 'percent' && value > 100) {
      setError('Percent discount cannot exceed 100%')
      return
    }
    try {
      await createCoupon.mutateAsync({
        code: code.toUpperCase().trim(),
        type,
        value,
        minSubtotal,
        maxUses,
        isActive: true,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create coupon')
    }
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={spring.gentle}
      className="fixed inset-y-0 right-0 w-full max-w-sm z-50 glass border-l border-[var(--border)] shadow-card p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold">New coupon</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-white/5 text-[var(--muted)] transition-colors"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted)]">Coupon code</label>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="e.g. SUMMER20"
            className="w-full glass rounded-xl px-3 py-2.5 text-sm border border-[var(--border)] focus:border-violet/50 outline-none font-mono uppercase"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted)]">Discount type</label>
          <div className="flex gap-2">
            {(['percent', 'fixed'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                  type === t
                    ? 'bg-violet/15 border-violet/40 text-violet'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                )}
              >
                {t === 'percent' ? '% Percent' : '$ Fixed'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted)]">
              {type === 'percent' ? 'Discount %' : 'Amount ($)'}
            </label>
            <input
              type="number"
              min={1}
              max={type === 'percent' ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm border border-[var(--border)] focus:border-violet/50 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted)]">Min. order ($)</label>
            <input
              type="number"
              min={0}
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(Number(e.target.value))}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm border border-[var(--border)] focus:border-violet/50 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted)]">Max uses</label>
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className="w-full glass rounded-xl px-3 py-2.5 text-sm border border-[var(--border)] focus:border-violet/50 outline-none"
          />
        </div>

        {error && <p className="text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={createCoupon.isPending}
          className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60"
        >
          {createCoupon.isPending ? 'Creating…' : 'Create coupon'}
        </button>
      </form>
    </motion.div>
  )
}

export default function DiscountsPage() {
  const { data: coupons, isLoading } = useAdminCoupons()
  const updateCoupon = useUpdateCoupon()
  const deleteCoupon = useDeleteCoupon()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const list: CouponDTO[] = coupons ?? []

  const handleToggle = (c: CouponDTO) => {
    updateCoupon.mutate({ id: c._id, data: { isActive: !c.isActive } })
  }

  const handleDelete = (id: string) => {
    deleteCoupon.mutate(id)
    setDeleteId(null)
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-xl">Discount coupons</h1>
          <p className="text-sm text-[var(--muted)]">
            {list.filter((c) => c.isActive).length} active codes
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus size={15} aria-hidden="true" />
          Add coupon
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Code', 'Discount', 'Min. order', 'Usage', 'Status', 'Created', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div
                          className="h-4 skeleton rounded-lg"
                          style={{ width: j === 0 ? 80 : j === 3 ? 96 : 48 }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <AnimatePresence initial={false}>
                  {list.map((c) => (
                    <motion.tr
                      key={c._id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={spring.gentle}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Tag size={13} className="text-violet shrink-0" aria-hidden="true" />
                          <span className="font-mono font-semibold text-violet">{c.code}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-success">
                        {c.type === 'percent' ? `${c.value}%` : `$${c.value}`}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {c.minSubtotal > 0 ? `$${c.minSubtotal}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {c.maxUses != null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-violet transition-all"
                                style={{
                                  width: `${Math.min(100, (c.usedCount / c.maxUses) * 100)}%`,
                                }}
                              />
                            </div>
                            <span
                              className={cn(
                                'text-xs',
                                c.usedCount >= c.maxUses ? 'text-danger' : 'text-[var(--muted)]'
                              )}
                            >
                              {c.usedCount}/{c.maxUses}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">{c.usedCount} used</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(c)}
                          disabled={updateCoupon.isPending}
                          className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-60',
                            c.isActive
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'bg-white/5 text-[var(--muted)] hover:bg-white/10'
                          )}
                        >
                          {c.isActive ? (
                            <Check size={11} aria-hidden="true" />
                          ) : (
                            <X size={11} aria-hidden="true" />
                          )}
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)] text-xs">
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {deleteId === c._id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDelete(c._id)}
                              className="text-xs text-danger hover:underline"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(null)}
                              className="text-xs text-[var(--muted)] hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteId(c._id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--muted)] hover:text-danger transition-colors"
                            aria-label={`Delete ${c.code}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!isLoading && list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--muted)] text-sm">
                    No coupons yet. Create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: dur.base, ease: ease.out }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
              aria-hidden="true"
            />
            <NewCouponSlide onClose={() => setShowForm(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
