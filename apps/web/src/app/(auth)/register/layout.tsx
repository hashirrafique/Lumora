import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Join LUMORA and start shopping the future.',
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
