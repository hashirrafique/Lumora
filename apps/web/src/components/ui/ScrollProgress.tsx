'use client'

import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const bar = barRef.current
      if (!bar) return
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? (scrolled / total) * 100 : 0
      bar.style.width = `${pct}%`
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full transition-none"
        style={{
          background: 'linear-gradient(92deg, #7c5cff, #22d3ee)',
          width: '0%',
        }}
      />
    </div>
  )
}
