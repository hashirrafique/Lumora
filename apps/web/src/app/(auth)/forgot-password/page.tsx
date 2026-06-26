'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useForgotPassword } from '@/lib/hooks/useAuth'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await forgot.mutateAsync(email)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (submitted) {
    return (
      <div className="glass rounded-3xl p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto">
          <CheckCircle size={28} className="text-success" aria-hidden="true" />
        </div>
        <h1 className="font-display font-semibold text-xl">Check your email</h1>
        <p className="text-sm text-[var(--muted)]">
          If an account exists for <strong className="text-[var(--text)]">{email}</strong>, you&apos;ll receive a reset link shortly.
        </p>
        <Link href="/login" className="inline-block text-sm text-violet hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="glass rounded-3xl p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display font-semibold text-2xl">Reset password</h1>
        <p className="text-sm text-[var(--muted)]">
          Enter your email and we&apos;ll send a reset link
        </p>
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
          disabled={forgot.isPending}
        />
        <button
          type="submit"
          disabled={forgot.isPending || !email}
          className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {forgot.isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--muted)]">
        <Link href="/login" className="text-violet hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
