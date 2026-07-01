import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Github, Twitter, Instagram, Shield, RefreshCcw, Headphones, Bot } from 'lucide-react'

const shopLinks = [
  { label: 'All Products', href: '/shop' },
  { label: 'Electronics', href: '/shop?category=electronics' },
  { label: 'Audio', href: '/shop?category=audio' },
  { label: 'Wearables', href: '/shop?category=wearables' },
  { label: 'Photography', href: '/shop?category=photography' },
  { label: 'Gaming', href: '/shop?category=gaming' },
]

const accountLinks = [
  { label: 'My Orders', href: '/account/orders' },
  { label: 'Wishlist', href: '/account/wishlist' },
  { label: 'Profile', href: '/account/profile' },
  { label: 'Addresses', href: '/account/addresses' },
  { label: 'Login', href: '/login' },
  { label: 'Register', href: '/register' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refund Policy', href: '/refunds' },
]

const trustBadges = [
  { icon: Shield, label: 'SSL Secure' },
  { icon: RefreshCcw, label: 'Free Returns' },
  { icon: Headphones, label: '24/7 Support' },
  { icon: Bot, label: 'AI-Powered' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t border-[var(--border)] mt-24"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Trust badges strip */}
      <div className="border-b border-[var(--border)] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ul
            className="flex flex-wrap justify-center sm:justify-between gap-4 sm:gap-0"
            role="list"
          >
            {trustBadges.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <span className="w-7 h-7 rounded-lg bg-violet/10 text-violet flex items-center justify-center shrink-0">
                  <Icon size={14} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column — full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" />
            <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              Premium tech & lifestyle store powered by AI. Find the perfect gear with Lumi — your
              personal shopping assistant.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com/hashirrafique/Lumora"
                aria-label="GitHub"
                rel="noopener noreferrer"
                target="_blank"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <Github size={16} aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com"
                aria-label="Twitter / X"
                rel="noopener noreferrer"
                target="_blank"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <Twitter size={16} aria-hidden="true" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                rel="noopener noreferrer"
                target="_blank"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <Instagram size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Shop</h3>
            <ul className="space-y-2.5" role="list">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Account</h3>
            <ul className="space-y-2.5" role="list">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Legal</h3>
            <ul className="space-y-2.5" role="list">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">&copy; {year} LUMORA. All rights reserved.</p>

          {/* Payment method pills */}
          <div className="flex items-center gap-2" aria-label="Accepted payment methods">
            {['Visa', 'Mastercard', 'AMEX', 'PayPal'].map((method) => (
              <span
                key={method}
                className="px-2 py-0.5 rounded border border-[var(--border)] text-[10px] font-medium text-[var(--muted)] bg-white/3"
              >
                {method}
              </span>
            ))}
          </div>

          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
