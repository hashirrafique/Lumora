import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'violet' | 'cyan' | 'success' | 'warning' | 'danger' | 'bestseller'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-[var(--muted)]',
  violet: 'bg-violet/15 text-violet',
  cyan: 'bg-cyan/15 text-cyan',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  bestseller:
    'bg-gradient-to-r from-violet/20 to-cyan/20 text-[var(--text)] border border-violet/30',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
