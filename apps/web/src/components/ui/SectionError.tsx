'use client'

import { AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface SectionErrorProps {
  onRetry: () => void
  message?: string
}

export function SectionError({ onRetry, message = "Couldn't load products" }: SectionErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-3 py-16 text-[var(--muted)]"
    >
      <AlertCircle size={24} className="opacity-40" aria-hidden="true" />
      <p className="text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="text-xs px-4 py-2 rounded-xl border border-[var(--border)] hover:border-violet/40 hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
      >
        Try again
      </button>
    </motion.div>
  )
}
