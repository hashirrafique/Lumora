'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ArrowRight,
  Package,
  Home,
  ShoppingBag,
  User,
  X,
  ShoppingCart,
  Truck,
  Sun,
  Bot,
  Flame,
  Sparkles,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/lib/api'
import { useCartStore } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'
import { spring } from '@/lib/motion'
import type { ProductDTO } from '@lumora/types'

type ActionItem = {
  type: 'action'
  label: string
  sub?: string
  icon: React.ReactNode
  onSelect: () => void
}

type NavItem = {
  type: 'nav'
  label: string
  href: string
  sub?: string
  icon: React.ReactNode
}

type Item = NavItem | ActionItem

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const { openDrawer } = useCartStore()
  const setChatOpen = useUIStore((s) => s.setChatOpen)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

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

  function makeActions(close: () => void): ActionItem[] {
    return [
      {
        type: 'action',
        label: 'View cart',
        sub: 'Open cart drawer',
        icon: <ShoppingCart size={14} />,
        onSelect: () => {
          openDrawer()
          close()
        },
      },
      {
        type: 'action',
        label: 'Talk to Lumi',
        sub: 'AI shopping concierge',
        icon: <Bot size={14} />,
        onSelect: () => {
          setChatOpen(true)
          close()
        },
      },
      {
        type: 'action',
        label: 'Toggle theme',
        sub: 'Light / Dark',
        icon: <Sun size={14} />,
        onSelect: () => {
          toggleTheme?.()
          close()
        },
      },
    ]
  }

  const STATIC_NAV: NavItem[] = [
    { type: 'nav', label: 'Home', href: '/', icon: <Home size={14} /> },
    { type: 'nav', label: 'Shop all products', href: '/shop', icon: <ShoppingBag size={14} /> },
    {
      type: 'nav',
      label: 'Flash Deals',
      href: '/deals',
      sub: 'Limited time',
      icon: <Flame size={14} />,
    },
    { type: 'nav', label: 'New Arrivals', href: '/new-arrivals', icon: <Sparkles size={14} /> },
    { type: 'nav', label: 'My account', href: '/account', icon: <User size={14} /> },
    {
      type: 'nav',
      label: 'My orders',
      href: '/account/orders',
      sub: 'Track your orders',
      icon: <Truck size={14} />,
    },
  ]

  const filterQuery = query.trim().toLowerCase()

  const navItems = filterQuery
    ? STATIC_NAV.filter(
        (i) =>
          i.label.toLowerCase().includes(filterQuery) ||
          (i.sub ?? '').toLowerCase().includes(filterQuery)
      )
    : STATIC_NAV

  const actionItems = filterQuery
    ? makeActions(onClose).filter(
        (i) =>
          i.label.toLowerCase().includes(filterQuery) ||
          (i.sub ?? '').toLowerCase().includes(filterQuery)
      )
    : makeActions(onClose)

  const productItems: Item[] = products.map((p) => ({
    type: 'nav',
    label: p.title,
    href: `/product/${p.slug}`,
    sub: `$${p.price.toFixed(2)}`,
    icon: <Package size={14} />,
  }))

  const allItems: Item[] = [...actionItems, ...navItems, ...productItems]

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const handleSelect = useCallback(
    (item: Item) => {
      if (item.type === 'action') {
        item.onSelect()
      } else {
        router.push(item.href)
        onClose()
      }
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
      if (item) handleSelect(item)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={spring.snappy}
            className="relative w-full max-w-xl glass rounded-2xl shadow-glow overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
              <Search size={16} className="text-[var(--muted)] flex-shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products or run actions…"
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
                    key={`${item.type}-${item.label}-${idx}`}
                    id={`cmd-item-${idx}`}
                    role="option"
                    aria-selected={idx === activeIdx}
                    className="relative"
                  >
                    {/* Moving highlight via layoutId */}
                    {idx === activeIdx && (
                      <motion.div
                        layoutId="cmd-highlight"
                        className="absolute inset-x-2 inset-y-0.5 rounded-xl bg-violet/10"
                        transition={spring.snappy}
                        aria-hidden="true"
                      />
                    )}
                    <button
                      className="relative w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors text-[var(--muted)] hover:text-[var(--text)]"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIdx(idx)}
                    >
                      <span className="flex-shrink-0 text-[var(--muted)]">{item.icon}</span>
                      <span className="flex-1 truncate text-[var(--text)]">{item.label}</span>
                      {item.sub && (
                        <span className="text-xs text-[var(--muted)] flex-shrink-0">
                          {item.sub}
                        </span>
                      )}
                      <ArrowRight
                        size={12}
                        className="text-[var(--muted)] flex-shrink-0 opacity-40"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {filterQuery.length >= 2 &&
              products.length === 0 &&
              navItems.length === 0 &&
              actionItems.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-[var(--muted)]">
                  No results for &ldquo;{filterQuery}&rdquo;
                </p>
              )}

            {/* Footer hint */}
            <div className="flex items-center gap-3 px-4 py-2 border-t border-[var(--border)] text-[10px] text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">esc</kbd> close
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
