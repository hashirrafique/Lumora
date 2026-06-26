'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAdminUsers, useUpdateUser } from '@/lib/hooks/useAdmin'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { AdminUserDTO } from '@/lib/api'

export default function AdminUsersPage() {
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<'' | 'customer' | 'admin'>('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminUsers(q || undefined, roleFilter || undefined, page)
  const updateUser = useUpdateUser()

  const users = (data?.data ?? []) as AdminUserDTO[]
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Users</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage roles and access</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 text-sm glass border border-[var(--border)] rounded-xl focus:outline-none focus:border-violet"
            aria-label="Search users"
          />
        </div>
        <div className="flex gap-2">
          {(['', 'customer', 'admin'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setRoleFilter(r); setPage(1) }}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                roleFilter === r
                  ? 'bg-violet/15 border-violet text-violet'
                  : 'border-[var(--border)] text-[var(--muted)] hover:border-violet/40'
              )}
            >
              {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-[var(--muted)]">No users found</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">User</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Role</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--muted)] font-medium">Banned</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-[var(--border)] last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-[var(--muted)]">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isBanned ? 'danger' : 'success'}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      disabled={updateUser.isPending}
                      onChange={(e) => {
                        updateUser.mutate({
                          id: user._id,
                          payload: { role: e.target.value as 'customer' | 'admin' },
                        })
                      }}
                      className="text-xs bg-transparent border border-[var(--border)] rounded-lg px-2 py-1 focus:outline-none focus:border-violet text-[var(--text)] disabled:opacity-50"
                      aria-label={`Change role for ${user.name}`}
                    >
                      <option value="customer" style={{ background: 'var(--bg)' }}>Customer</option>
                      <option value="admin" style={{ background: 'var(--bg)' }}>Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={updateUser.isPending}
                      onClick={() => updateUser.mutate({ id: user._id, payload: { isBanned: !user.isBanned } })}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-medium border transition-all disabled:opacity-50',
                        user.isBanned
                          ? 'border-success/40 text-success hover:bg-success/10'
                          : 'border-danger/40 text-danger hover:bg-danger/10'
                      )}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-xl text-xs glass border border-[var(--border)] disabled:opacity-40">Prev</button>
          <span className="px-3 py-1.5 text-xs text-[var(--muted)]">{page} / {meta.totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-1.5 rounded-xl text-xs glass border border-[var(--border)] disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
