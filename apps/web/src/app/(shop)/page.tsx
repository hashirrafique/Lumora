import Script from 'next/script'
import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react'
import { buttonBase, variantClasses, sizeClasses } from '@/components/ui/buttonVariants'
import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { BestsellersSection } from '@/components/home/BestsellersSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'

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
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        aria-label="Hero"
      >
        <div className="aurora-mesh" aria-hidden="true" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-[var(--muted)] border-aurora mb-2">
            <Sparkles size={14} className="text-violet" aria-hidden="true" />
            AI-powered shopping concierge
          </div>

          <h1 className="font-display font-bold tracking-tight">
            Shop the future.{' '}
            <span className="text-aurora" aria-label="Beautifully">
              Beautifully.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
            Premium tech and lifestyle products, curated and delivered with the help of Lumi — your
            personal AI shopping assistant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className={[buttonBase, variantClasses.primary, sizeClasses.lg].join(' ')}
            >
              Shop now <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="#ai-concierge"
              className={[buttonBase, variantClasses.secondary, sizeClasses.lg].join(' ')}
            >
              Talk to Lumi
            </Link>
          </div>
        </div>
      </section>

      <FeaturedSection />
      <BestsellersSection />
      <CategoriesSection />

      {/* ── Value props strip ────────────────────────────────────────────────── */}
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

      {/* ── Newsletter ───────────────────────────────────────────────────────── */}
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
