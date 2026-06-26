import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Reset your LUMORA account password.',
}

export default function ForgotLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
