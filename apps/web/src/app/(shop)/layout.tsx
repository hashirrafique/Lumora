import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { AIChatDock } from '@/components/ai/AIChatDock'
import { AnnouncementBar } from '@/components/ui/AnnouncementBar'
import { BackToTop } from '@/components/ui/BackToTop'

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <CartDrawer />
      <AIChatDock />
      <BackToTop />
    </>
  )
}
