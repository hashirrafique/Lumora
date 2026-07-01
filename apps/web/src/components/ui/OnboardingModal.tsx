'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Zap, ShieldCheck, Headphones } from 'lucide-react'
import { spring, ease, duration as dur } from '@/lib/motion'
import { useToast } from '@/components/ui/Toast'

const STORAGE_KEY = 'lumora-welcomed'
const DISCOUNT_CODE = 'LUMORA10'

const FEATURES = [
  { icon: Zap, text: 'AI-powered recommendations tailored to you' },
  { icon: ShieldCheck, text: 'Secure checkout with 30-day returns' },
  { icon: Headphones, text: 'Lumi — your personal shopping assistant' },
]

export function OnboardingModal() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const toast = useToast()

  useEffect(() => {
    try {
      const welcomed = localStorage.getItem(STORAGE_KEY)
      if (!welcomed) {
        const timer = setTimeout(() => setShow(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      /* noop */
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE)
    } catch {
      /* noop */
    }
    toast.success(`Code ${DISCOUNT_CODE} copied to clipboard! 🎉`)
    setTimeout(dismiss, 1800)
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur.base }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={spring.bouncy}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md glass rounded-3xl border border-[var(--border)] shadow-card overflow-hidden">
              {/* Aurora header */}
              <div className="relative px-8 pt-10 pb-6 text-center overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 0%, #7C5CFF 0%, #22D3EE 60%, transparent 80%)',
                  }}
                  aria-hidden="true"
                />

                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...spring.bouncy, delay: 0.15 }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet/20 border border-violet/30 mb-4 relative z-10"
                >
                  <Sparkles size={24} className="text-violet" aria-hidden="true" />
                </motion.div>

                <h2
                  id="onboarding-title"
                  className="font-display text-2xl font-bold text-[var(--text)] mb-2 relative z-10"
                >
                  Welcome to Lumora
                </h2>
                <p className="text-sm text-[var(--muted)] relative z-10 max-w-xs mx-auto">
                  Premium tech and lifestyle products, powered by AI.
                </p>

                <button
                  type="button"
                  onClick={dismiss}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  aria-label="Close welcome modal"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Features */}
              <div className="px-8 pb-6 space-y-3">
                {FEATURES.map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, ease: ease.out, duration: dur.base }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-violet/10 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-violet" aria-hidden="true" />
                    </div>
                    <p className="text-sm text-[var(--muted)]">{text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Email capture */}
              <div className="px-8 pb-8">
                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      onSubmit={(e) => void handleSubmit(e)}
                      className="space-y-3"
                    >
                      <p className="text-xs text-center text-[var(--muted)] font-medium uppercase tracking-wider">
                        Get 10% off your first order
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email address"
                          required
                          className="flex-1 glass rounded-xl px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] focus:border-violet/50 outline-none"
                        />
                        <button
                          type="submit"
                          className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap"
                        >
                          Claim
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={dismiss}
                        className="w-full text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors py-1"
                      >
                        No thanks, skip
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={spring.snappy}
                      className="text-center py-2"
                    >
                      <p className="text-sm font-semibold text-[var(--text)] mb-1">
                        Use code <span className="text-aurora font-mono">{DISCOUNT_CODE}</span> at
                        checkout
                      </p>
                      <p className="text-xs text-[var(--muted)]">Copied to clipboard ✓</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
