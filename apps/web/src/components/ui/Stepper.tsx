import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperProps {
  steps: string[]
  current: number
  className?: string
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <nav aria-label="Checkout steps" className={cn('flex items-center gap-0', className)}>
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                  done && 'bg-violet text-white',
                  active && 'bg-violet/20 text-violet border-2 border-violet',
                  !done && !active && 'bg-white/5 text-[var(--muted)] border border-[var(--border)]'
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check size={14} aria-hidden="true" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-sm font-medium hidden sm:block',
                  active ? 'text-[var(--text)]' : 'text-[var(--muted)]'
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-3 transition-colors',
                  done ? 'bg-violet/40' : 'bg-[var(--border)]'
                )}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
