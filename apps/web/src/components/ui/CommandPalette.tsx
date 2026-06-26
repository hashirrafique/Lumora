'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Package, Home, ShoppingBag, User, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import type { ProductDTO } from '@lumora/types'

interface StaticItem {
  type: 'nav'
  label: string
  href: string
  icon: React.ReactNode
}

const STATIC_ITEMS: StaticItem[] = [
  { type: 'nav', label: 'Home', href: '/', icon: <Home size={14} /> },
  { type: 'nav', label: 'Shop all products', href: '/shop', icon: <ShoppingBag size={14} /> },
  { type: 'nav', label: 'My account', href: '/account', icon: <User size={14} /> },
  { type: 'nav', label: 'My orders', href: '/account/orders', icon: <Package size={14} /> },
]

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const { data: searchResults } = useQuery({
    queryKey: ['cmd-search', query],
    queryFn: () => productsApi.list({ q: query, limit: 5 }),
    enabled: query.trim().length >= 2,
    staleTime: 10_000,
  })

  const products: ProductDTO[] = (searchResults as unknown as { data?: ProductDTO[] })?.data ?? []

  const navItems = query.trim()
    ? STATIC_ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : STATIC_ITEMS

  const allItems: Array<{ label: string; href: string; sub?: string; icon?: React.ReactNode }> = [
    ...navItems,
    ...products.map((p) => ({
      label: p.title,
      href: `/product/${p.slug}`,
      sub: `$${p.price.toFixed(2)}`,
      icon: <Package size={14} />,
    })),
  ]

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const navigate = useCallback(
    (href: string) => {
      router.push(href)
      onClose()
    },
    [router, onClose]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const item = allItems[activeIdx]
      if (item) navigate(item.href)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl glass rounded-2xl shadow-glow overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search size={16} className="text-[var(--muted)] flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products or navigate…"
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none"
            aria-label="Search"
            aria-autocomplete="list"
            aria-activedescendant={allItems[activeIdx] ? `cmd-item-${activeIdx}` : undefined}
            role="combobox"
            aria-expanded={allItems.length > 0}
            aria-controls="cmd-list"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close command palette"
          >
            <X size={14} className="text-[var(--muted)]" />
          </button>
        </div>

        {/* Results */}
        {allItems.length > 0 && (
          <ul
            ref={listRef}
            id="cmd-list"
            role="listbox"
            aria-label="Search results"
            className="max-h-72 overflow-y-auto py-2"
          >
            {allItems.map((item, idx) => (
              <li
                key={item.href}
                id={`cmd-item-${idx}`}
                role="option"
                aria-selected={idx === activeIdx}
              >
                <button
                  className={[
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                    idx === activeIdx
                      ? 'bg-violet/15 text-[var(--text)]'
                      : 'text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]',
                  ].join(' ')}
                  onClick={() => navigate(item.href)}
                  onMouseEnter={() => setActiveIdx(idx)}
                >
                  <span className="text-[var(--muted)] flex-shrink-0">{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.sub && (
                    <span className="text-xs text-violet flex-shrink-0">{item.sub}</span>
                  )}
                  <ArrowRight size={12} className="text-[var(--muted)] flex-shrink-0 opacity-50" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && products.length === 0 && navItems.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-[var(--muted)]">No results found</p>
        )}

        {/* Footer hint */}
        <div className="flex items-center gap-3 px-4 py-2 border-t border-[var(--border)] text-[10px] text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
