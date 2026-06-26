interface StockBadgeProps {
  stock: number
  threshold?: number
}

export function StockBadge({ stock, threshold = 5 }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-danger">
        <span className="w-1.5 h-1.5 rounded-full bg-danger" aria-hidden="true" />
        Out of stock
      </span>
    )
  }

  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warning animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-warning" aria-hidden="true" />
        Only {stock} left
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
      <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden="true" />
      In stock
    </span>
  )
}
