'use client'

import { useRef, useEffect } from 'react'
import { Star } from 'lucide-react'
import { FadeUp } from '@/components/ui/FadeUp'

const testimonials = [
  {
    name: 'Alice Johnson',
    initial: 'A',
    rating: 5,
    product: 'Sony WH-1000XM5',
    text: "Absolutely incredible noise cancellation. Lumi recommended these and they arrived the next day. Best headphones I've ever owned!",
  },
  {
    name: 'Bob Martinez',
    initial: 'B',
    rating: 5,
    product: 'Apple AirPods Pro',
    text: 'The AI assistant helped me find exactly what I needed for my home studio. Transparent mode is perfect for when I need to hear my surroundings.',
  },
  {
    name: 'Carol White',
    initial: 'C',
    rating: 5,
    product: 'Samsung Galaxy Watch',
    text: 'Gorgeous watch, fast delivery, and the checkout was seamless. LUMORA made the whole experience a pleasure.',
  },
  {
    name: 'David Lee',
    initial: 'D',
    rating: 5,
    product: 'GoPro Hero 12',
    text: 'Asked Lumi to find an action camera under $400 and it immediately found this. Stunning video quality for the price!',
  },
  {
    name: 'Eva Chen',
    initial: 'E',
    rating: 5,
    product: 'Logitech MX Master 3',
    text: "I've been eyeing this mouse for months. The AI chat helped me compare options and I'm so glad I went with this one.",
  },
  {
    name: 'Frank Brown',
    initial: 'F',
    rating: 5,
    product: 'Bose SoundLink Max',
    text: 'Amazing Bluetooth speaker. LUMORA had the best price I found anywhere online. Will definitely shop here again.',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rating ? 'fill-warning text-warning' : 'text-[var(--border-strong)]'}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let paused = false
    const step = () => {
      if (!paused && track) {
        track.scrollLeft += 1
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0
        }
      }
    }
    const id = setInterval(step, 20)
    track.addEventListener('mouseenter', () => {
      paused = true
    })
    track.addEventListener('mouseleave', () => {
      paused = false
    })
    return () => clearInterval(id)
  }, [])

  const allItems = [...testimonials, ...testimonials]

  return (
    <section className="py-20 overflow-hidden" aria-label="Customer testimonials">
      <FadeUp className="text-center mb-12 px-4">
        <p className="text-sm font-medium text-violet mb-1">What customers say</p>
        <h2 className="font-display font-semibold">Loved by shoppers</h2>
      </FadeUp>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-hidden cursor-default"
        style={{ scrollBehavior: 'auto' }}
        aria-label="Testimonials carousel"
      >
        {allItems.map((t, i) => (
          <article
            key={i}
            className="glass rounded-3xl p-6 flex-shrink-0 w-[300px] sm:w-[340px] flex flex-col gap-3"
          >
            <StarRating rating={t.rating} />
            <p className="text-sm text-[var(--muted)] leading-relaxed flex-1">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-white text-xs font-bold shrink-0">
                {t.initial}
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">{t.name}</p>
                <p className="text-xs text-[var(--muted)]">{t.product}</p>
              </div>
              <span className="ml-auto text-xs text-success font-medium">✓ Verified</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
