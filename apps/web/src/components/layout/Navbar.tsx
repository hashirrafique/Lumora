'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, Search, Menu, X, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { useCommandPalette } from '@/lib/hooks/useCommandPalette'
import { useCartStore } from '@/store/cart.store'
import { useCart } from '@/lib/hooks/useCart'
import { useAuthStore } from '@/store/auth.store'

const navLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'Audio', href: '/shop?category=audio' },
  { label: 'Wearables', href: '/shop?category=wearables' },
  { label: 'Computing', href: '/shop?category=computing' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette()
  const { openDrawer } = useCartStore()
  const { data: cart } = useCart()
  const user = useAuthStore((s) => s.user)
  const itemCount = cart?.items.reduce((n, i) => n + i.qty, 0) ?? 0

  return (
    <>
      <header
        role="banner"
        className={[
          'sticky top-0 z-50',
          'glass rounded-none border-x-0 border-t-0',
          'border-b border-[var(--border)]',
        ].join(' ')}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4"
          aria-label="Main navigation"
        >
          {/* Left — logo */}
          <Logo size="md" />

          {/* Center — desktop nav */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={[
                    'px-3 py-2 text-sm rounded-xl text-[var(--muted)]',
                    'hover:text-[var(--text)] hover:bg-white/5',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right — actions */}
          <div className="flex items-center gap-1">
            {/* ⌘K search hint */}
            <button
              onClick={() => setCmdOpen(true)}
              aria-label="Search products (⌘K)"
              className={[
                'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl',
                'text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5',
                'border border-[var(--border)] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
              ].join(' ')}
            >
              <Search size={14} aria-hidden="true" />
              <span>Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 text-xs font-mono">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            {/* Account */}
            {user ? (
              <Link
                href="/account"
                aria-label={`Account: ${user.name}`}
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center',
                  'bg-gradient-to-br from-violet to-cyan text-white',
                  'text-xs font-bold shrink-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                ].join(' ')}
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Sign in"
                className={[
                  'w-9 h-9 rounded-xl flex items-center justify-center',
                  'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5',
                  'transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                ].join(' ')}
              >
                <User size={18} aria-hidden="true" />
              </Link>
            )}

            {/* Cart */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              className={[
                'relative w-9 h-9 rounded-xl flex items-center justify-center',
                'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
              ].join(' ')}
            >
              <ShoppingCart size={18} aria-hidden="true" />
              {itemCount > 0 && (
                <span
                  className={[
                    'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1',
                    'flex items-center justify-center',
                    'text-[10px] font-bold text-white',
                    'bg-gradient-to-r from-violet to-cyan rounded-full',
                    'animate-fade-up',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className={[
                'md:hidden w-9 h-9 rounded-xl flex items-center justify-center',
                'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
              ].join(' ')}
            >
              {mobileOpen ? (
                <X size={18} aria-hidden="true" />
              ) : (
                <Menu size={18} aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className={[
            'fixed inset-0 z-40 md:hidden',
            'glass rounded-none',
            'flex flex-col pt-20 px-6 pb-8',
            'animate-fade-up',
          ].join(' ')}
        >
          <nav aria-label="Mobile navigation">
            <ul className="space-y-1" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-2xl',
                      'text-lg font-medium text-[var(--text)]',
                      'hover:bg-white/5 transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-1">
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <User size={18} aria-hidden="true" />
                Account
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <ShoppingCart size={18} aria-hidden="true" />
                Cart {itemCount > 0 && `(${itemCount})`}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

// Suppress unused import warnings — ChevronDown reserved for categories dropdown in P2
void ChevronDown
