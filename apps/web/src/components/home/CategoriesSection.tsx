'use client'

import Link from 'next/link'
import { useCategories } from '@/lib/hooks/useProducts'

const CATEGORY_ICONS: Record<string, string> = {
  audio: '🎧',
  wearables: '⌚',
  computing: '⌨️',
  'home-tech': '💡',
  lifestyle: '🎒',
  gaming: '🎮',
  photography: '📷',
}

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories()

  const items = isLoading
    ? Array.from({ length: 5 }).map((_, i) => ({ _id: String(i), name: '', slug: '' }))
    : (categories ?? [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20" aria-label="Product categories">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-[var(--muted)] mb-1">Browse by category</p>
        <h2 className="font-display font-semibold">What are you looking for?</h2>
      </div>
      <ul
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        role="list"
        aria-label="Product categories"
      >
        {items.map((cat) => (
          <li key={cat._id}>
            {isLoading ? (
              <div className="skeleton aspect-square rounded-3xl" />
            ) : (
              <Link
                href={`/shop?category=${cat.slug}`}
                className={[
                  'glass rounded-3xl flex flex-col items-center justify-center gap-3 p-6 text-center',
                  'hover:border-[var(--border-strong)] hover:-translate-y-1',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                ].join(' ')}
              >
                <span className="text-3xl" role="img" aria-hidden="true">
                  {CATEGORY_ICONS[cat.slug] ?? '🛒'}
                </span>
                <span className="text-sm font-semibold text-[var(--text)]">{cat.name}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
