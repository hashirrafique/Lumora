'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GitCompare } from 'lucide-react'
import { useCompareStore } from '@/store/compare.store'
import { CompareModal } from './CompareModal'

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

export function CompareBar() {
  const { compareList, compareOpen, setCompareOpen, removeFromCompare, clearCompare } =
    useCompareStore()

  return (
    <>
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            key="compare-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[150] glass border-t border-[var(--border)] shadow-card"
            role="region"
            aria-label="Compare products"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
              {/* Slots */}
              <div className="flex gap-3 flex-1 overflow-x-auto">
                {Array.from({ length: 3 }).map((_, i) => {
                  const product = compareList[i]
                  return product ? (
                    <div
                      key={product._id}
                      className="relative flex items-center gap-2 glass border border-[var(--border)] rounded-2xl px-2 py-1.5 shrink-0"
                    >
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/5 shrink-0">
                        {product.images[0] && (
                          <Image
                            src={product.images[0].url}
                            alt={product.title}
                            fill
                            sizes="32px"
                            className="object-cover"
                            placeholder="blur"
                            blurDataURL={BLUR_PLACEHOLDER}
                          />
                        )}
                      </div>
                      <p className="text-xs font-medium text-[var(--text)] max-w-[100px] truncate">
                        {product.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCompare(product._id)}
                        aria-label={`Remove ${product.title} from comparison`}
                        className="ml-1 p-0.5 rounded text-[var(--muted)] hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet"
                      >
                        <X size={12} aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="w-32 h-11 rounded-2xl border-2 border-dashed border-[var(--border)] flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      <span className="text-xs text-[var(--muted)]">+ Add</span>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={clearCompare}
                  className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setCompareOpen(true)}
                  disabled={compareList.length < 2}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet to-cyan text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                >
                  <GitCompare size={14} aria-hidden="true" />
                  Compare ({compareList.length})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {compareOpen && <CompareModal onClose={() => setCompareOpen(false)} />}
    </>
  )
}
