'use client'

import { useState } from 'react'
import { buttonBase, variantClasses, sizeClasses } from './buttonVariants'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <p className="text-success font-medium">
        Thanks! We&apos;ll be in touch.
      </p>
    )
  }

  return (
    <form
      className="flex flex-col sm:flex-row gap-3 justify-center"
      onSubmit={handleSubmit}
      aria-label="Newsletter signup form"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
        className={[
          'flex-1 max-w-sm h-11 px-4 rounded-2xl text-sm',
          'bg-transparent text-[var(--text)] placeholder:text-[var(--muted)]',
          'border border-[var(--border)] hover:border-[var(--border-strong)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
          'transition-colors',
        ].join(' ')}
      />
      <button
        type="submit"
        className={[buttonBase, variantClasses.primary, sizeClasses.md].join(' ')}
      >
        Subscribe
      </button>
    </form>
  )
}
