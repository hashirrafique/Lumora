'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeUp } from '@/components/ui/FadeUp'
import { useCategories } from '@/lib/hooks/useProducts'

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻',
  audio: '🎧',
  wearables: '⌚',
  'smart-home': '💡',
  lifestyle: '🎒',
  gaming: '🎮',
  photography: '📷',
  computing: '⌨️',
  'home-tech': '🏠',
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  electronics: 'from-blue-600/80 to-indigo-600/80',
  audio: 'from-violet-600/80 to-purple-600/80',
  wearables: 'from-cyan-600/80 to-teal-600/80',
  'smart-home': 'from-amber-500/80 to-orange-500/80',
  gaming: 'from-red-600/80 to-pink-600/80',
  photography: 'from-emerald-600/80 to-green-600/80',
  lifestyle: 'from-rose-500/80 to-pink-500/80',
}

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories()

  const items = isLoading
    ? Array.from({ length: 6 }).map((_, i) => ({ _id: String(i), name: '', slug: '' }))
    : (categories ?? [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20" aria-label="Product categories">
      <FadeUp className="text-center mb-12">
        <p className="text-sm font-medium text-[var(--muted)] mb-1">Browse by category</p>
        <h2 className="font-display font-semibold">What are you looking for?</h2>
      </FadeUp>

      {/* Mobile: horizontal snap scroll */}
      <div className="sm:hidden snap-scroll-x px-0">
        {items.map((cat) => (
          <div key={cat._id} className="snap-start shrink-0 w-36">
            {isLoading ? (
              <div className="skeleton aspect-square rounded-3xl w-36" />
            ) : (
              <Link
                href={`/shop?category=${cat.slug}`}
                className="glass rounded-3xl flex flex-col items-center justify-center gap-3 p-5 text-center hover:border-[var(--border-strong)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <span className="text-3xl" role="img" aria-hidden="true">
                  {CATEGORY_ICONS[cat.slug] ?? '🛒'}
                </span>
                <span className="text-xs font-semibold text-[var(--text)] leading-snug">
                  {cat.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <ul
        className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        role="list"
        aria-label="Product categories"
      >
        {items.map((cat) => (
          <li key={cat._id}>
            {isLoading ? (
              <div className="skeleton aspect-square rounded-3xl" />
            ) : (
              <motion.div whileHover={{ scale: 1.04, y: -4 }} transition={{ duration: 0.2 }}>
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group glass rounded-3xl flex flex-col items-center justify-center gap-3 p-6 text-center hover:shadow-glow hover:border-violet/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet overflow-hidden relative"
                >
                  {/* Gradient bg on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${CATEGORY_GRADIENTS[cat.slug] ?? 'from-violet/80 to-cyan/80'}`}
                    aria-hidden="true"
                  />
                  <span
                    className="text-3xl relative z-10 transition-transform duration-200 group-hover:scale-110"
                    role="img"
                    aria-hidden="true"
                  >
                    {CATEGORY_ICONS[cat.slug] ?? '🛒'}
                  </span>
                  <span className="text-sm font-semibold text-[var(--text)] relative z-10">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
