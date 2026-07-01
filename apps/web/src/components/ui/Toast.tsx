'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Info, AlertTriangle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  variant: Variant
}

interface ToastContextValue {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
  warning: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANTS: Record<Variant, { icon: LucideIcon; classes: string }> = {
  success: { icon: CheckCircle, classes: 'border-success/30 bg-success/10 text-success' },
  error: { icon: XCircle, classes: 'border-danger/30 bg-danger/10 text-danger' },
  info: { icon: Info, classes: 'border-violet/30 bg-violet/10 text-violet' },
  warning: { icon: AlertTriangle, classes: 'border-warning/30 bg-warning/10 text-warning' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const add = useCallback(
    (message: string, variant: Variant) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => [...prev.slice(-4), { id, message, variant }])
      const timer = setTimeout(() => dismiss(id), 3500)
      timers.current.set(id, timer)
    },
    [dismiss]
  )

  const ctx: ToastContextValue = {
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error'),
    info: (msg) => add(msg, 'info'),
    warning: (msg) => add(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[350] flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const { icon: Icon, classes } = VARIANTS[toast.variant]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl',
                  'glass border shadow-card max-w-[340px] min-w-[240px]',
                  classes
                )}
                role="alert"
              >
                <Icon size={18} className="shrink-0 mt-0.5" />
                <p className="flex-1 text-sm font-medium text-[var(--text)] leading-snug">
                  {toast.message}
                </p>
                <button
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 mt-0.5 opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet rounded"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
