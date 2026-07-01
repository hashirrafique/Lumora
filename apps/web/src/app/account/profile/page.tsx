'use client'

export const dynamic = 'force-dynamic'

import { useAuthStore } from '@/store/auth.store'
import { Badge } from '@/components/ui/Badge'
import { AccentPicker } from '@/components/ui/AccentPicker'
import { useUIStore } from '@/store/ui.store'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { theme, toggleTheme } = useUIStore()
  if (!user) return null

  return (
    <div className="space-y-4">
      <h1 className="font-display font-semibold text-xl">Profile</h1>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-[var(--muted)]">{user.email}</p>
          </div>
          {user.role === 'admin' && (
            <Badge variant="violet" className="ml-auto">
              Admin
            </Badge>
          )}
        </div>
        <div className="border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
          <p>Profile editing coming in a future update.</p>
        </div>
      </div>

      {/* Appearance settings */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-sm">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-[var(--muted)]">Currently {theme}</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl glass border border-[var(--border)] text-sm hover:border-violet/40 transition-colors capitalize"
          >
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
        <div className="border-t border-[var(--border)] pt-4">
          <AccentPicker />
        </div>
      </div>
    </div>
  )
}
