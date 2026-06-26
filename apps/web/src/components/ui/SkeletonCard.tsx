interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div
      className={`rounded-2xl overflow-hidden bg-surface border border-[var(--border)] ${className}`}
      aria-hidden="true"
    >
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="skeleton h-5 w-1/3 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="skeleton rounded-full flex-shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}
