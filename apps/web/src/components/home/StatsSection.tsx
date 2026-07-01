'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: '40+', label: 'Curated Products', desc: 'Premium tech & lifestyle' },
  { value: '4.8★', label: 'Average Rating', desc: 'From verified buyers' },
  { value: 'Free', label: 'Shipping', desc: 'On all orders over $75' },
  { value: 'AI', label: 'Concierge', desc: 'Powered by Lumi assistant' },
]

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 py-16" aria-label="Key statistics">
      <div className="border-aurora glass rounded-3xl p-8">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-8" role="list">
          {stats.map(({ value, label, desc }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-display font-bold text-aurora mb-1">
                {value}
              </p>
              <p className="text-sm font-semibold text-[var(--text)] mb-0.5">{label}</p>
              <p className="text-xs text-[var(--muted)]">{desc}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
