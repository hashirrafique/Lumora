// Plain CSS class maps — no 'use client', safe to import in Server Components.

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export const buttonBase =
  'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]'

export const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-gradient-to-r from-violet via-indigo to-cyan text-white',
    'shadow-glow hover:shadow-[0_0_0_1px_rgba(124,92,255,0.4),0_12px_48px_-8px_rgba(124,92,255,0.6)]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  ].join(' '),

  secondary: [
    'glass text-[var(--text)] hover:border-[var(--border-strong)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  ghost: [
    'text-[var(--text)] hover:bg-white/5 rounded-xl',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  destructive: [
    'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
}

export const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
}
