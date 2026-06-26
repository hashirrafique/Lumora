'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useResetPassword } from '@/lib/hooks/useAuth'
import { Input } from '@/components/ui/Input'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const reset = useResetPassword()

  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const pwValid = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)

  if (!token) {
    return (
      <div className="glass rounded-3xl p-8 text-center space-y-4">
        <p className="text-danger">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-sm text-violet hover:underline">
          Request a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="glass rounded-3xl p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-success" aria-hidden="true" />
        </div>
        <h1 className="font-display font-semibold text-xl">Password updated</h1>
        <p className="text-sm text-[var(--muted)]">You can now sign in with your new password.</p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="btn-primary mx-auto"
        >
          Sign in
        </button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await reset.mutateAsync({ token, password })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    }
  }

  return (
    <div className="glass rounded-3xl p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display font-semibold text-2xl">New password</h1>
        <p className="text-sm text-[var(--muted)]">Choose a strong password for your account</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="New password"
          type={showPw ? 'text' : 'password'}
          placeholder="Min 8 chars, letter + number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={reset.isPending}
          hint="At least 8 characters with a letter and a number"
          error={password.length > 0 && !pwValid ? 'Include at least one letter and one number' : undefined}
          trailing={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <button
          type="submit"
          disabled={reset.isPending || !pwValid}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {reset.isPending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="glass rounded-3xl p-8 h-64 skeleton" />}>
      <ResetForm />
    </Suspense>
  )
}
