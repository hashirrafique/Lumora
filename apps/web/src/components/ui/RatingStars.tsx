import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  count?: number
  size?: number
  showCount?: boolean
  className?: string
}

export function RatingStars({
  rating,
  count,
  size = 14,
  showCount = true,
  className,
}: RatingStarsProps) {
  const full = Math.floor(rating)
  const partial = rating - full
  const empty = 5 - Math.ceil(rating)

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex items-center" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f${i}`} size={size} className="fill-warning text-warning" aria-hidden="true" />
        ))}
        {partial > 0 && (
          <span className="relative inline-block" aria-hidden="true">
            <Star size={size} className="text-white/20" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${partial * 100}%` }}
            >
              <Star size={size} className="fill-warning text-warning" />
            </span>
          </span>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} size={size} className="text-white/20" aria-hidden="true" />
        ))}
      </span>
      {showCount && count !== undefined && (
        <span className="text-xs text-[var(--muted)]">({count.toLocaleString()})</span>
      )}
    </span>
  )
}
