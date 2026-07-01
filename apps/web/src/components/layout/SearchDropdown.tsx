'use client'

import {
  useState,
  useRef,
  useCallback,
  useDeferredValue,
  useEffect,
  type KeyboardEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp } from 'lucide-react'
import { useProducts } from '@/lib/hooks/useProducts'
import { Price } from '@/components/ui/Price'
import { spring, ease } from '@/lib/motion'

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

const TRENDING = ['Wireless headphones', 'Smartwatch', 'Gaming mouse', 'Mechanical keyboard']

interface SearchDropdownProps {
  onClose?: () => void
  autoFocus?: boolean
  placeholder?: string
}

export function SearchDropdown({
  onClose,
  autoFocus,
  placeholder = 'Search products…',
}: SearchDropdownProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const deferredQuery = useDeferredValue(query)
  const enabled = deferredQuery.trim().length >= 2

  const { data } = useProducts({ q: deferredQuery.trim(), limit: 6 })
  const products = data?.products ?? []

  const isOpen = focused && (enabled || query === '')

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    setActiveIdx(-1)
  }, [deferredQuery])

  const navigate = useCallback(
    (href: string) => {
      router.push(href)
      setQuery('')
      setFocused(false)
      onClose?.()
    },
    [router, onClose]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const items = enabled ? products : []
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && items[activeIdx]) {
        navigate(`/product/${items[activeIdx]!.slug}`)
      } else if (query.trim()) {
        navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
      }
    } else if (e.key === 'Escape') {
      setFocused(false)
      onClose?.()
    }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full glass rounded-xl pl-9 pr-8 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] focus:border-violet/50 focus:ring-1 focus:ring-violet/50 outline-none transition-colors"
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-dropdown-list"
          aria-activedescendant={activeIdx >= 0 ? `search-item-${activeIdx}` : undefined}
          role="combobox"
          aria-expanded={isOpen}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Clear search"
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ ...spring.snappy, duration: 0.15, ease: ease.out }}
            className="absolute top-full left-0 right-0 mt-2 z-50 glass rounded-2xl border border-[var(--border)] shadow-card overflow-hidden"
            id="search-dropdown-list"
            role="listbox"
          >
            {/* Results */}
            {enabled && (
              <>
                {products.length > 0 ? (
                  <div className="py-2">
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                      Products
                    </p>
                    {products.map((product, idx) => {
                      const img = product.images[0]
                      return (
                        <button
                          key={product._id}
                          id={`search-item-${idx}`}
                          role="option"
                          aria-selected={idx === activeIdx}
                          onClick={() => navigate(`/product/${product.slug}`)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            idx === activeIdx ? 'bg-violet/10' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
                            {img && (
                              <Image
                                src={img.url}
                                alt={img.alt || product.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                                placeholder="blur"
                                blurDataURL={BLUR_PLACEHOLDER}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[var(--text)] truncate">{product.title}</p>
                            <p className="text-xs text-[var(--muted)] truncate">
                              {typeof product.category === 'object'
                                ? product.category.name
                                : product.brand}
                            </p>
                          </div>
                          <Price price={product.price} size="sm" />
                        </button>
                      )
                    })}
                    <div className="px-4 py-2 border-t border-[var(--border)] mt-1">
                      <button
                        onClick={() =>
                          navigate(`/shop?q=${encodeURIComponent(deferredQuery.trim())}`)
                        }
                        className="text-xs text-violet hover:underline focus-visible:outline-none focus-visible:underline"
                      >
                        See all results for &ldquo;{deferredQuery}&rdquo; →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[var(--muted)] mb-2">
                      No results for &ldquo;{deferredQuery}&rdquo;
                    </p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="text-xs text-violet hover:underline"
                    >
                      Browse all products →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Trending — shown when focused but empty */}
            {!enabled && (
              <div className="py-3">
                <p className="px-4 py-1.5 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={10} aria-hidden="true" />
                  Trending searches
                </p>
                {TRENDING.map((term) => (
                  <button
                    key={term}
                    onClick={() => navigate(`/shop?q=${encodeURIComponent(term)}`)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors text-left"
                  >
                    <Search size={12} aria-hidden="true" />
                    {term}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
