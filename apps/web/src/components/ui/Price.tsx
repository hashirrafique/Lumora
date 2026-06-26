import { cn } from '@/lib/utils'

interface PriceProps {
  price: number
  compareAtPrice?: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
  xl: 'text-2xl font-bold',
}

function fmt(price: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

export function Price({
  price,
  compareAtPrice,
  currency = 'USD',
  size = 'md',
  className,
}: PriceProps) {
  const hasDiscount = compareAtPrice != null && compareAtPrice > price
  const discountPct = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0

  return (
    <span className={cn('inline-flex items-center gap-2 flex-wrap', className)}>
      <span className={cn('text-[var(--text)]', sizes[size])}>{fmt(price, currency)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-[var(--muted)] line-through">{fmt(compareAtPrice, currency)}</span>
          <span className="text-xs font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        </>
      )}
    </span>
  )
}
