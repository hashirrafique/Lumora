'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flame, ArrowRight } from 'lucide-react'
import { FadeUp } from '@/components/ui/FadeUp'
import { ProductCard } from '@/components/product/ProductCard'
import { SectionError } from '@/components/ui/SectionError'
import { useProducts } from '@/lib/hooks/useProducts'

function getTimeUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1_000)
  return { h, m, s }
}

function Digit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {str.split('').map((d, i) => (
          <span
            key={i}
            className="w-8 h-10 flex items-center justify-center glass rounded-xl text-lg font-bold font-mono text-[var(--text)] border border-[var(--border)]"
          >
            {d}
          </span>
        ))}
      </div>
      <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{label}</span>
    </div>
  )
}

export function FlashDealsSection() {
  const [time, setTime] = useState(getTimeUntilMidnight())
  const { data, isLoading, isError, refetch } = useProducts({ featured: true, limit: 4 })
  const products = data?.products ?? []

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeUntilMidnight()), 1_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto" aria-label="Flash deals">
      {/* Header */}
      <FadeUp className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-10">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-danger/15 flex items-center justify-center shrink-0">
            <Flame size={20} className="text-danger" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs text-danger font-semibold uppercase tracking-wider">
              Limited time
            </p>
            <h2 className="font-display font-bold text-2xl text-[var(--text)]">Flash Deals</h2>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-xs text-[var(--muted)] mr-1">Ends in</span>
          <Digit value={time.h} label="hrs" />
          <span className="text-[var(--muted)] font-bold text-lg mb-4">:</span>
          <Digit value={time.m} label="min" />
          <span className="text-[var(--muted)] font-bold text-lg mb-4">:</span>
          <Digit value={time.s} label="sec" />
        </div>

        <Link
          href="/deals"
          className="hidden sm:flex items-center gap-1.5 text-sm text-violet hover:text-violet/80 font-medium transition-colors"
        >
          View all deals <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </FadeUp>

      {/* Products */}
      {isError ? (
        <SectionError onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-3xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product._id} className="relative">
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-danger text-white">
                    -
                    {Math.round(
                      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                    )}
                    %
                  </span>
                </div>
              )}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center sm:hidden">
        <Link
          href="/deals"
          className="flex items-center gap-1.5 text-sm text-violet font-medium hover:text-violet/80 transition-colors"
        >
          View all deals <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
