export const dynamic = 'force-dynamic'

import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { AIChatDock } from '@/components/ai/AIChatDock'
import { AnnouncementBar } from '@/components/ui/AnnouncementBar'
import { BackToTop } from '@/components/ui/BackToTop'
import { ToastProvider } from '@/components/ui/Toast'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { CompareBar } from '@/components/ui/CompareBar'
import { CartFly } from '@/components/ui/CartFly'
import { OnboardingModal } from '@/components/ui/OnboardingModal'

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <CartDrawer />
      <AIChatDock />
      <BackToTop />
      <CookieBanner />
      <CompareBar />
      <CartFly />
      <OnboardingModal />
    </ToastProvider>
  )
}
