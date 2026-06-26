'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QtyStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (val: number) => void
  loading?: boolean
  className?: string
}

export function QtyStepper({
  value,
  min = 1,
  max = 999,
  onChange,
  loading = false,
  className,
}: QtyStepperProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-0 glass rounded-xl overflow-hidden', className)}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min || loading}
        className="p-2.5 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
        aria-label="Decrease quantity"
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <span
        className="w-10 text-center text-sm font-semibold tabular-nums select-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {loading ? '…' : value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max || loading}
        className="p-2.5 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
        aria-label="Increase quantity"
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
