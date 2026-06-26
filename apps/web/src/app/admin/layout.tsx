'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const pathname = usePathname()
  const logout = useLogout()

  useEffect(() => {
    if (user === null) {
      router.push('/login?redirect=/admin/overview')
    } else if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-violet border-t-transparent animate-spin" aria-label="Loading" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 glass border-r border-[var(--border)] flex flex-col">
        <div className="px-5 py-5 border-b border-[var(--border)]">
          <p className="font-display font-bold text-lg text-aurora">LUMORA</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">Admin dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Admin navigation">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
                  active
                    ? 'bg-violet/15 text-violet'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" aria-hidden="true" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--border)]">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--muted)] hover:text-danger hover:bg-danger/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
