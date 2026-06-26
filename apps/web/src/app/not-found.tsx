import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" aria-label="Page not found">
      <div className="glass p-10 text-center max-w-md w-full space-y-6">
        <p className="text-6xl font-display font-bold text-aurora">404</p>
        <h1 className="text-xl font-semibold text-[var(--text)]">Page not found</h1>
        <p className="text-[var(--muted)] text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-2xl bg-gradient-to-r from-violet via-indigo to-cyan text-white text-sm font-medium shadow-glow hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
