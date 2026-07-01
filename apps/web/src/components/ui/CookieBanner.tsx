'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import Link from 'next/link'

const STORAGE_KEY = 'lumora-cookies-accepted'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {
      // localStorage not available
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed bottom-6 left-4 sm:left-6 z-[250] max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
          role="dialog"
          aria-label="Cookie consent"
          aria-modal="false"
        >
          <div className="glass border border-[var(--border)] rounded-3xl p-5 shadow-card flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-violet/10 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie size={16} className="text-violet" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text)] mb-1">We use cookies</p>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  We use cookies to enhance your browsing experience and analyse our traffic.{' '}
                  <Link
                    href="/privacy"
                    className="text-violet hover:underline focus-visible:outline-none"
                  >
                    Learn more
                  </Link>
                </p>
              </div>
              <button
                type="button"
                onClick={accept}
                aria-label="Dismiss cookie notice"
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet rounded-lg"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={accept}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet to-cyan text-white text-xs font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={accept}
                className="flex-1 py-2 rounded-xl glass border border-[var(--border)] text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:border-violet/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                Essential Only
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
