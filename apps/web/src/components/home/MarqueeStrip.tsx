const items = [
  'Sony',
  'Apple',
  'Samsung',
  'Free Returns',
  'AI Assistant',
  'Free Shipping $75+',
  '4.8★ Rated',
  'Fast Delivery',
  'Secure Checkout',
  'Premium Quality',
  'Sony',
  'Apple',
  'Samsung',
  'Free Returns',
  'AI Assistant',
  'Free Shipping $75+',
  '4.8★ Rated',
  'Fast Delivery',
  'Secure Checkout',
  'Premium Quality',
]

const dot = (
  <span className="mx-3 text-violet opacity-60" aria-hidden="true">
    ·
  </span>
)

export function MarqueeStrip() {
  return (
    <div className="border-y border-[var(--border)] py-4 overflow-hidden" aria-hidden="true">
      <div className="marquee-track">
        <div className="marquee-content">
          {items.map((item, i) => (
            <span key={i} className="text-sm text-[var(--muted)] font-medium">
              {item}
              {dot}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
