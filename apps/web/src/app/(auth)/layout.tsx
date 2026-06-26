import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export const metadata: Metadata = {
  title: { default: 'Account', template: '%s | LUMORA' },
  description: 'Sign in or create your LUMORA account to start shopping.',
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative">
      <div className="aurora-mesh opacity-40" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" aria-label="LUMORA home">
            <Logo size="lg" />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
