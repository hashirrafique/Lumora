'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronDown, Star, Package, Truck } from 'lucide-react'
import { useProducts } from '@/lib/hooks/useProducts'

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM3QzVDRkYiLz48L3N2Zz4='

const microStats = [
  { icon: Package, value: '40+', label: 'Products' },
  { icon: Star, value: '4.8★', label: 'Avg rating' },
  { icon: Truck, value: 'Free', label: 'Shipping $75+' },
]

const floatVariants = [
  { style: { top: '10%', left: '5%', rotate: '-8deg' }, animClass: 'animate-float' },
  { style: { top: '30%', right: '0%', rotate: '6deg' }, animClass: 'animate-float-slow' },
  { style: { bottom: '10%', left: '15%', rotate: '3deg' }, animClass: 'animate-float-delay' },
]

export function HeroSection() {
  const { data } = useProducts({ featured: true, limit: 3 })
  const featuredProducts = data?.products ?? []

  return (
    <section
      className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      <div className="aurora-mesh" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
          {/* ── Left column: text ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-[var(--muted)] border-aurora mb-6"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-violet opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet" />
              </span>
              <Sparkles size={13} className="text-violet" aria-hidden="true" />
              AI-powered shopping concierge
            </motion.div>

            {/* Headline */}
            <h1 className="font-display font-bold tracking-tight mb-5">
              Shop the future.{' '}
              <span className="text-aurora" aria-label="Beautifully">
                Beautifully.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-[var(--muted)] max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
              Premium tech and lifestyle products, curated and delivered with the help of Lumi —
              your personal AI shopping assistant.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-10">
              <Link href="/shop" className="btn-primary text-base px-6 py-3">
                Shop now <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="#ai-concierge" className="btn-secondary text-base px-6 py-3">
                Talk to Lumi
              </Link>
            </div>

            {/* Micro-stats */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
              {microStats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-xl bg-violet/10 text-violet flex items-center justify-center shrink-0">
                    <Icon size={15} aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--text)]">{value}</span>
                    <span className="text-[var(--muted)] ml-1">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right column: floating product cards ───────────────────────── */}
          <div
            className="relative hidden lg:flex items-center justify-center h-[520px]"
            aria-hidden="true"
          >
            {/* Glow orb */}
            <div
              className="absolute inset-0 m-auto w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #7C5CFF 0%, #22D3EE 60%, transparent 80%)',
              }}
            />

            {featuredProducts.slice(0, 3).map((product, i) => {
              const pos = floatVariants[i]!
              const img = product.images[0]
              return (
                <motion.div
                  key={product._id}
                  className={`absolute w-44 glass rounded-2xl overflow-hidden shadow-card ${pos.animClass}`}
                  style={{ ...pos.style, rotate: pos.style.rotate }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, type: 'spring', damping: 20 }}
                >
                  <div className="relative aspect-square bg-white/5">
                    {img ? (
                      <Image
                        src={img.url}
                        alt={img.alt || product.title}
                        fill
                        className="object-cover"
                        sizes="176px"
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                      />
                    ) : (
                      <div className="w-full h-full bg-violet/10" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-[var(--text)] line-clamp-1">
                      {product.title}
                    </p>
                    <p className="text-xs text-violet font-semibold mt-0.5">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              )
            })}

            {/* If no products yet, show placeholder boxes */}
            {featuredProducts.length === 0 &&
              floatVariants.map((pos, i) => (
                <div
                  key={i}
                  className={`absolute w-44 glass rounded-2xl overflow-hidden shadow-card ${pos.animClass}`}
                  style={pos.style}
                >
                  <div className="aspect-square skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--muted)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        aria-hidden="true"
      >
        <span className="text-xs">Scroll</span>
        <ChevronDown size={18} className="animate-bounce-subtle" />
      </motion.div>
    </section>
  )
}
