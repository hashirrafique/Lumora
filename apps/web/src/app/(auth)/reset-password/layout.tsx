import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set new password',
}

export default function ResetLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
