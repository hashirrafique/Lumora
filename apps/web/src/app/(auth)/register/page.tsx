'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useRegister } from '@/lib/hooks/useAuth'
import { Input } from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const register = useRegister()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await register.mutateAsync({ name, email, password })
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  const pwValid = password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)

  return (
    <div className="glass rounded-3xl p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display font-semibold text-2xl">Create account</h1>
        <p className="text-sm text-[var(--muted)]">Join LUMORA for the best shopping experience</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          type="text"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
          disabled={register.isPending}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={register.isPending}
        />
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          placeholder="Min 8 chars, letter + number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          disabled={register.isPending}
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
          disabled={register.isPending || !name || !email || !pwValid}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {register.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link href="/login" className="text-violet hover:underline focus-visible:outline-none focus-visible:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
