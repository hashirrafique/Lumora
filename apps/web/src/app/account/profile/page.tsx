'use client'

import { useAuthStore } from '@/store/auth.store'
import { Badge } from '@/components/ui/Badge'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
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
          {user.role === 'admin' && <Badge variant="violet" className="ml-auto">Admin</Badge>}
        </div>
        <div className="border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
          <p>Profile editing coming in a future update.</p>
        </div>
      </div>
    </div>
  )
}
