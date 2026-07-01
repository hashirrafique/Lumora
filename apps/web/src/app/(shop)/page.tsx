import Script from 'next/script'
import { Truck, ShieldCheck, Sparkles } from 'lucide-react'
import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { HeroSection } from '@/components/home/HeroSection'
import { MarqueeStrip } from '@/components/home/MarqueeStrip'
import { StatsSection } from '@/components/home/StatsSection'
import { FlashDealsSection } from '@/components/home/FlashDealsSection'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { BestsellersSection } from '@/components/home/BestsellersSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { PromoBanner } from '@/components/home/PromoBanner'

export const metadata = {
  title: 'LUMORA — Shop the future. Beautifully.',
  description:
    'Premium tech & lifestyle store with an AI shopping concierge. Headphones, wearables, keyboards, smart home and more.',
}

const valueProps = [
  {
    icon: <Truck size={20} aria-hidden="true" />,
    title: 'Free shipping over $75',
    desc: 'On all domestic orders',
  },
  {
    icon: <ShieldCheck size={20} aria-hidden="true" />,
    title: 'Secure checkout',
    desc: 'Your data, protected',
  },
  {
    icon: <Sparkles size={20} aria-hidden="true" />,
    title: 'AI concierge',
    desc: 'Real product picks, instantly',
  },
]

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LUMORA',
  url: process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000',
  description: 'Premium tech & lifestyle store with an AI shopping concierge.',
  sameAs: [],
}

export default function HomePage() {
  return (
    <>
      <Script
        id="org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* Hero */}
      <HeroSection />

      {/* Brand / feature marquee */}
      <MarqueeStrip />

      {/* Animated stats strip */}
      <StatsSection />

      {/* Flash deals with countdown */}
      <FlashDealsSection />

      {/* Category grid */}
      <CategoriesSection />

      {/* Featured products with category tabs */}
      <FeaturedSection />

      {/* Bestsellers */}
      <BestsellersSection />

      {/* New arrivals */}
      <NewArrivalsSection />

      {/* Lumi AI promo banner */}
      <PromoBanner />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Value props strip */}
      <section className="border-y border-[var(--border)] py-10" aria-label="Why LUMORA">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-8" role="list">
            {valueProps.map((vp) => (
              <li key={vp.title} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-violet/10 text-violet flex items-center justify-center flex-shrink-0">
                  {vp.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{vp.title}</p>
                  <p className="text-xs text-[var(--muted)]">{vp.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Newsletter */}
      <section
        className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center"
        aria-label="Newsletter signup"
      >
        <h2 className="font-display font-semibold mb-3">
          Stay in the{' '}
          <span className="text-aurora" aria-label="loop">
            loop
          </span>
        </h2>
        <p className="text-[var(--muted)] mb-8">
          New drops, exclusive deals, and AI-curated picks — delivered to your inbox.
        </p>
        <NewsletterForm />
      </section>
    </>
  )
}
