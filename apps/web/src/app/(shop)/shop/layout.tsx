import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our full collection of premium tech and lifestyle products. Filter by category, price, brand, and more.',
  openGraph: {
    title: 'Shop — LUMORA',
    description: 'Premium tech & lifestyle. Filter by category, price, rating and more.',
  },
}

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
