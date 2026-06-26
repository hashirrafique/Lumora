'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import {
  buttonBase,
  variantClasses,
  sizeClasses,
  type ButtonVariant,
  type ButtonSize,
} from './buttonVariants'

// Re-export for convenience
export { buttonBase, variantClasses, sizeClasses }
export type { ButtonVariant, ButtonSize }

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={[buttonBase, variantClasses[variant], sizeClasses[size], className].join(' ')}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          icon && iconPosition === 'left' && <span aria-hidden="true">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === 'right' && (
          <span aria-hidden="true">{icon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
