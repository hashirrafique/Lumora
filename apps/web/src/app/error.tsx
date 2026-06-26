'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      aria-label="An error occurred"
    >
      <div className="glass p-10 text-center max-w-md w-full space-y-6">
        <p className="text-5xl">⚠️</p>
        <h1 className="text-xl font-semibold text-[var(--text)]">Something went wrong</h1>
        <p className="text-[var(--muted)] text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-10 px-6 rounded-2xl bg-gradient-to-r from-violet via-indigo to-cyan text-white text-sm font-medium shadow-glow hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
