'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useLogin } from '@/lib/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const login = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ email, password })
      const redirect = params.get('redirect') ?? '/'
      router.push(redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    }
  }

  return (
    <div className="glass rounded-3xl p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display font-semibold text-2xl">Welcome back</h1>
        <p className="text-sm text-[var(--muted)]">Sign in to your LUMORA account</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={login.isPending}
        />
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={login.isPending}
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-violet hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={login.isPending || !email || !password}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-violet hover:underline focus-visible:outline-none focus-visible:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="glass rounded-3xl p-8 h-96 skeleton" />}>
      <LoginForm />
    </Suspense>
  )
}
