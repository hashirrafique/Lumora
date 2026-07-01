'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Cpu,
  Headphones,
  Watch,
  Gamepad2,
  Camera,
  Home as HomeIcon,
  Flame,
  Sparkles,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { SearchDropdown } from '@/components/layout/SearchDropdown'
import { useCommandPalette } from '@/lib/hooks/useCommandPalette'
import { useCartStore } from '@/store/cart.store'
import { useCart } from '@/lib/hooks/useCart'
import { useAuthStore } from '@/store/auth.store'
import { useProducts } from '@/lib/hooks/useProducts'
import { cn } from '@/lib/utils'

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

const CATEGORIES = [
  { label: 'Electronics', href: '/shop?category=electronics', icon: Cpu },
  { label: 'Audio', href: '/shop?category=audio', icon: Headphones },
  { label: 'Wearables', href: '/shop?category=wearables', icon: Watch },
  { label: 'Gaming', href: '/shop?category=gaming', icon: Gamepad2 },
  { label: 'Photography', href: '/shop?category=photography', icon: Camera },
  { label: 'Smart Home', href: '/shop?category=smart-home', icon: HomeIcon },
]

const navLinks = [
  { label: 'Shop', href: '/shop', hasMegaMenu: true },
  { label: 'Audio', href: '/shop?category=audio' },
  { label: 'Wearables', href: '/shop?category=wearables' },
  { label: 'Gaming', href: '/shop?category=gaming' },
]

function MegaMenu({ onClose }: { onClose: () => void }) {
  const { data } = useProducts({ featured: true, limit: 2 })
  const products = data?.products ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="absolute top-full left-0 right-0 z-50 shadow-card"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="glass border border-[var(--border)] border-t-0 rounded-b-3xl overflow-hidden p-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Categories */}
            <div className="col-span-2">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Browse categories
              </p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                  >
                    <span className="w-7 h-7 rounded-lg bg-violet/10 flex items-center justify-center shrink-0 group-hover:bg-violet/15 transition-colors">
                      <Icon size={14} className="text-violet" aria-hidden="true" />
                    </span>
                    {label}
                  </Link>
                ))}
              </div>
              {/* Quick links */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="text-xs font-medium text-violet hover:text-violet/80 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  View all products →
                </Link>
                <Link
                  href="/new-arrivals"
                  onClick={onClose}
                  className="text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  New arrivals →
                </Link>
                <Link
                  href="/deals"
                  onClick={onClose}
                  className="text-xs font-medium text-[var(--muted)] hover:text-danger transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Today&apos;s deals →
                </Link>
              </div>
            </div>

            {/* Trending products */}
            <div>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">
                Trending now
              </p>
              <div className="flex flex-col gap-3">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 shrink-0">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].url}
                          alt={product.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL={BLUR_PLACEHOLDER}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text)] truncate group-hover:text-violet transition-colors">
                        {product.title}
                      </p>
                      <p className="text-xs text-violet font-semibold mt-0.5">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
                {products.length === 0 &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-14 glass rounded-2xl animate-pulse" />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const [megaOpen, setMegaOpen] = useState(false)
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const pathname = usePathname()
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()
  const { openDrawer } = useCartStore()
  const { data: cart } = useCart()
  const user = useAuthStore((s) => s.user)
  const itemCount = cart?.items.reduce((n, i) => n + i.qty, 0) ?? 0

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setCmdOpen])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (mobileSearchOpen) searchRef.current?.focus()
  }, [mobileSearchOpen])

  const openMega = useCallback(() => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    setMegaOpen(true)
  }, [])

  const closeMega = useCallback(() => {
    megaTimer.current = setTimeout(() => setMegaOpen(false), 150)
  }, [])

  function handleMobileSearch(e: React.FormEvent) {
    e.preventDefault()
    if (mobileSearchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(mobileSearchQuery.trim())}`
    }
  }

  const isActive = (href: string) => {
    if (href === '/shop') return pathname === '/shop'
    return pathname.startsWith(href.split('?')[0]!) && href.includes(pathname)
  }

  return (
    <>
      <header
        role="banner"
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[var(--bg)]/95 shadow-card backdrop-blur-glass border-b border-[var(--border)]'
            : 'glass rounded-none border-x-0 border-t-0 border-b border-[var(--border)]'
        )}
      >
        {/* Mobile search bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleMobileSearch}
              className="sm:hidden overflow-hidden border-b border-[var(--border)] px-4 py-2"
            >
              <input
                ref={searchRef}
                type="search"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-violet/50"
                aria-label="Search products"
              />
            </motion.form>
          )}
        </AnimatePresence>

        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4"
          aria-label="Main navigation"
        >
          {/* Left — logo */}
          <Logo size="md" />

          {/* Center — desktop nav */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href} className="relative">
                {link.hasMegaMenu ? (
                  <div onMouseEnter={openMega} onMouseLeave={closeMega} className="relative">
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-1 px-3 py-2 text-sm rounded-xl transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                        isActive(link.href)
                          ? 'text-violet font-medium bg-violet/8'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
                      )}
                      aria-haspopup="true"
                      aria-expanded={megaOpen}
                    >
                      {link.label}
                      <ChevronDown
                        size={13}
                        className={cn(
                          'transition-transform duration-200',
                          megaOpen && 'rotate-180'
                        )}
                        aria-hidden="true"
                      />
                    </Link>
                    <AnimatePresence>
                      {megaOpen && (
                        <div
                          className="fixed left-0 right-0 z-50"
                          style={{ top: '4rem' }}
                          onMouseEnter={openMega}
                          onMouseLeave={closeMega}
                        >
                          <MegaMenu onClose={() => setMegaOpen(false)} />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      'px-3 py-2 text-sm rounded-xl transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                      isActive(link.href)
                        ? 'text-violet font-medium bg-violet/8'
                        : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}

            {/* Deals — special styling */}
            <li>
              <Link
                href="/deals"
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm rounded-xl transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                  pathname === '/deals'
                    ? 'text-danger font-medium bg-danger/8'
                    : 'text-danger/80 hover:text-danger hover:bg-danger/5'
                )}
              >
                <Flame size={13} aria-hidden="true" />
                Deals
              </Link>
            </li>
            <li>
              <Link
                href="/new-arrivals"
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm rounded-xl transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                  pathname === '/new-arrivals'
                    ? 'text-success font-medium bg-success/8'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
                )}
              >
                <Sparkles size={13} className="text-success" aria-hidden="true" />
                New
              </Link>
            </li>
          </ul>

          {/* Right — actions */}
          <div className="flex items-center gap-1">
            {/* Desktop search dropdown */}
            <div className="hidden sm:block w-52 lg:w-64">
              <SearchDropdown />
            </div>

            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              aria-label="Toggle search"
              className={cn(
                'sm:hidden w-9 h-9 rounded-xl flex items-center justify-center',
                'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                mobileSearchOpen && 'text-violet bg-violet/10'
              )}
            >
              <Search size={18} aria-hidden="true" />
            </button>

            <ThemeToggle />

            {/* Account */}
            {user ? (
              <Link
                href="/account"
                aria-label={`Account: ${user.name}`}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-violet to-cyan text-white text-xs font-bold shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Sign in"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <User size={18} aria-hidden="true" />
              </Link>
            )}

            {/* Cart */}
            <button
              type="button"
              onClick={openDrawer}
              data-cart-icon="true"
              aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              <ShoppingCart size={18} aria-hidden="true" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-r from-violet to-cyan rounded-full"
                    aria-hidden="true"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile menu toggle */}
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={18} aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={18} aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="panel"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] md:hidden flex flex-col bg-[var(--surface)] border-l border-[var(--border)] shadow-card"
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--border)]">
                <Logo size="md" />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:bg-white/5 transition-colors"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-4 py-4">
                <ul className="space-y-1" role="list">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, type: 'spring', damping: 30 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-colors duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                          isActive(link.href)
                            ? 'text-violet bg-violet/10'
                            : 'text-[var(--text)] hover:bg-white/5'
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                  <motion.li
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, type: 'spring', damping: 30 }}
                  >
                    <Link
                      href="/deals"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-danger hover:bg-danger/5 transition-colors"
                    >
                      <Flame size={16} aria-hidden="true" />
                      Deals
                    </Link>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 30 }}
                  >
                    <Link
                      href="/new-arrivals"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-[var(--text)] hover:bg-white/5 transition-colors"
                    >
                      <Sparkles size={16} className="text-success" aria-hidden="true" />
                      New Arrivals
                    </Link>
                  </motion.li>
                </ul>

                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-1">
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                  >
                    <User size={18} aria-hidden="true" />
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      openDrawer()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
                  >
                    <ShoppingCart size={18} aria-hidden="true" />
                    Cart {itemCount > 0 && `(${itemCount})`}
                  </button>
                </div>
              </nav>

              <div className="px-4 py-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 px-4">
                  <ThemeToggle />
                  <span className="text-xs text-[var(--muted)]">Toggle theme</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
