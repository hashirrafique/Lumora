'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

const MESSAGES = [
  'Free shipping on all orders over $75 🚚',
  'Use code AURORA10 for 10% off your first order ✨',
  'New: Chat with Lumi — your AI shopping assistant 🤖',
  'WELCOME15 gives 15% off orders over $30 🎉',
]

const STORAGE_KEY = 'lumora-announcement-dismissed'

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true)
  const [msgIndex, setMsgIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(STORAGE_KEY) === 'true'
    if (!isDismissed) setDismissed(false)
  }, [])

  useEffect(() => {
    if (dismissed) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length)
        setVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(id)
  }, [dismissed])

  const dismiss = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setDismissed(true)
  }, [])

  if (dismissed) return null

  return (
    <div
      className="relative z-50 h-9 flex items-center justify-center px-8 overflow-hidden"
      style={{ background: 'linear-gradient(92deg, rgba(124,92,255,0.85), rgba(34,211,238,0.85))' }}
      role="banner"
      aria-label="Announcement"
    >
      <p
        className="text-white text-xs sm:text-sm font-medium text-center transition-opacity duration-300 select-none"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {MESSAGES[msgIndex]}
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
