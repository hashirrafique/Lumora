import type { Metadata } from 'next'
import { inter, spaceGrotesk } from '@/lib/fonts'
import { Providers } from './providers'
import { ThemeScript } from './theme-script'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'LUMORA — Shop the future. Beautifully.',
    template: '%s | LUMORA',
  },
  description:
    'LUMORA is a premium tech & lifestyle store with an AI shopping concierge. Find the perfect headphones, wearables, keyboards, smart home devices and more.',
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'LUMORA',
    title: 'LUMORA — Shop the future. Beautifully.',
    description: 'Premium tech & lifestyle store with an AI shopping concierge.',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans bg-[var(--bg)] text-[var(--text)] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-violet focus:text-white focus:rounded-xl focus:shadow-glow"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
