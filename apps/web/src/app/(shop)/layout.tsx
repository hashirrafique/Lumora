import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { AIChatDock } from '@/components/ai/AIChatDock'

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <CartDrawer />
      <AIChatDock />
    </>
  )
}
