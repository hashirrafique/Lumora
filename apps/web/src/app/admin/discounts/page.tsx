'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Tag, X, Check } from 'lucide-react'
import { spring, ease, duration as dur } from '@/lib/motion'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'lumora-admin-discounts'

interface Coupon {
  id: string
  code: string
  discount: number
  minOrder: number
  uses: number
  maxUses: number
  active: boolean
  createdAt: string
}

const SEED: Coupon[] = [
  {
    id: '1',
    code: 'LUMORA10',
    discount: 10,
    minOrder: 0,
    uses: 42,
    maxUses: 1000,
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    code: 'SUMMER20',
    discount: 20,
    minOrder: 50,
    uses: 18,
    maxUses: 200,
    active: true,
    createdAt: '2026-06-01',
  },
  {
    id: '3',
    code: 'FIRST15',
    discount: 15,
    minOrder: 25,
    uses: 200,
    maxUses: 200,
    active: false,
    createdAt: '2026-03-15',
  },
]

function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setCoupons(stored ? (JSON.parse(stored) as Coupon[]) : SEED)
    } catch {
      setCoupons(SEED)
    }
  }, [])

  const save = (next: Coupon[]) => {
    setCoupons(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* noop */
    }
  }

  return { coupons, save }
}

function NewCouponSlide({ onAdd, onClose }: { onAdd: (c: Coupon) => void; onClose: () => void }) {
  const [code, setCode] = useState('')
  const [discount, setDiscount] = useState(10)
  const [minOrder, setMinOrder] = useState(0)
  const [maxUses, setMaxUses] = useState(100)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Code is required')
      return
    }
    if (discount < 1 || discount > 100) {
      setError('Discount must be 1–100%')
      return
    }
    onAdd({
      id: String(Date.now()),
      code: code.toUpperCase().trim(),
      discount,
      minOrder,
      uses: 0,
      maxUses,
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    })
    onClose()
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

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted)]">Discount %</label>
            <input
              type="number"
              min={1}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm border border-[var(--border)] focus:border-violet/50 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted)]">Min. order ($)</label>
            <input
              type="number"
              min={0}
              value={minOrder}
              onChange={(e) => setMinOrder(Number(e.target.value))}
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

        <button type="submit" className="btn-primary w-full justify-center py-3 mt-2">
          Create coupon
        </button>
      </form>
    </motion.div>
  )
}

export default function DiscountsPage() {
  const { coupons, save } = useCoupons()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleAdd = (c: Coupon) => save([c, ...coupons])

  const handleToggle = (id: string) =>
    save(coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)))

  const handleDelete = (id: string) => {
    save(coupons.filter((c) => c.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-xl">Discount coupons</h1>
          <p className="text-sm text-[var(--muted)]">
            {coupons.filter((c) => c.active).length} active codes
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
              <AnimatePresence initial={false}>
                {coupons.map((c) => (
                  <motion.tr
                    key={c.id}
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
                    <td className="px-4 py-3 font-semibold text-success">{c.discount}%</td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {c.minOrder > 0 ? `$${c.minOrder}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet transition-all"
                            style={{ width: `${Math.min(100, (c.uses / c.maxUses) * 100)}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-xs',
                            c.uses >= c.maxUses ? 'text-danger' : 'text-[var(--muted)]'
                          )}
                        >
                          {c.uses}/{c.maxUses}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(c.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                          c.active
                            ? 'bg-success/10 text-success hover:bg-success/20'
                            : 'bg-white/5 text-[var(--muted)] hover:bg-white/10'
                        )}
                      >
                        {c.active ? (
                          <Check size={11} aria-hidden="true" />
                        ) : (
                          <X size={11} aria-hidden="true" />
                        )}
                        {c.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] text-xs">{c.createdAt}</td>
                    <td className="px-4 py-3">
                      {deleteId === c.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
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
                          onClick={() => setDeleteId(c.id)}
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
              {coupons.length === 0 && (
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
            <NewCouponSlide onAdd={handleAdd} onClose={() => setShowForm(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
