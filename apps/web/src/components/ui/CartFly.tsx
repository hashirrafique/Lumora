'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface FlyState {
  id: number
  src: string
  startX: number
  startY: number
  endX: number
  endY: number
}

export function CartFly() {
  const [flies, setFlies] = useState<FlyState[]>([])
  const nextId = useCallback(() => Date.now(), [])

  useEffect(() => {
    function handler(e: Event) {
      const { srcX, srcY, productImage } = (
        e as CustomEvent<{ srcX: number; srcY: number; productImage: string }>
      ).detail

      const cartEl = document.querySelector('[data-cart-icon]')
      if (!cartEl || !productImage) return

      const cartRect = cartEl.getBoundingClientRect()
      const endX = cartRect.left + cartRect.width / 2
      const endY = cartRect.top + cartRect.height / 2

      const id = nextId()
      setFlies((prev) => [
        ...prev,
        { id, src: productImage, startX: srcX, startY: srcY, endX, endY },
      ])

      setTimeout(() => {
        setFlies((prev) => prev.filter((f) => f.id !== id))
      }, 800)
    }

    window.addEventListener('lumora:cart-fly', handler)
    return () => window.removeEventListener('lumora:cart-fly', handler)
  }, [nextId])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {flies.map((fly) => (
        <motion.img
          key={fly.id}
          src={fly.src}
          alt=""
          aria-hidden="true"
          initial={{ x: fly.startX, y: fly.startY, scale: 1, opacity: 0.9, borderRadius: '12px' }}
          animate={{ x: fly.endX - 16, y: fly.endY - 16, scale: 0, opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 48,
            height: 48,
            objectFit: 'cover',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      ))}
    </AnimatePresence>,
    document.body
  )
}
