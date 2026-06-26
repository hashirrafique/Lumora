import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-20 text-center',
        className
      )}
      role="status"
    >
      {icon && (
        <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center text-[var(--muted)]">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <p className="font-semibold text-[var(--text)]">{title}</p>
        {description && <p className="text-sm text-[var(--muted)] max-w-sm">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
