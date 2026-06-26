import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leading, trailing, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leading && (
            <span className="absolute left-3 text-[var(--muted)] pointer-events-none">
              {leading}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full glass rounded-xl px-4 py-2.5 text-sm text-[var(--text)]',
              'placeholder:text-[var(--muted)] outline-none',
              'border border-[var(--border)] focus:border-violet/50 focus:ring-1 focus:ring-violet/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-150',
              leading && 'pl-10',
              trailing && 'pr-10',
              error && 'border-danger/50 focus:border-danger focus:ring-danger/30',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 text-[var(--muted)]">{trailing}</span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--muted)]">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
