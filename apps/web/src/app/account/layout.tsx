'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Package, Heart, User, MapPin, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/profile', label: 'Profile', icon: User },
]

export default function AccountLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const pathname = usePathname()
  const logout = useLogout()

  useEffect(() => {
    // Redirect unauthenticated — check after a brief delay so AuthBootstrap can run
    const t = setTimeout(() => {
      if (user === null) router.replace(`/login?redirect=${pathname}`)
    }, 800)
    return () => clearTimeout(t)
  }, [user, router, pathname])

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
        <div className="glass rounded-3xl p-8 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--muted)]">Loading your account…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Sidebar */}
        <aside className="sm:w-56 shrink-0">
          <div className="glass rounded-3xl p-5 space-y-1">
            <div className="pb-4 mb-3 border-b border-[var(--border)]">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
            </div>
            <nav aria-label="Account navigation">
              <ul className="space-y-0.5" role="list">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                        pathname.startsWith(href)
                          ? 'bg-violet/15 text-violet font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
                      )}
                      aria-current={pathname.startsWith(href) ? 'page' : undefined}
                    >
                      <Icon size={16} aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="pt-3 mt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--muted)] hover:text-danger hover:bg-white/5 transition-colors w-full"
              >
                <LogOut size={16} aria-hidden="true" />
                {logout.isPending ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
