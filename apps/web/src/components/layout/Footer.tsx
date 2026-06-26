import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Github, Twitter, Instagram } from 'lucide-react'

const shopLinks = [
  { label: 'All Products', href: '/shop' },
  { label: 'Audio', href: '/shop?category=audio' },
  { label: 'Wearables', href: '/shop?category=wearables' },
  { label: 'Computing', href: '/shop?category=computing' },
  { label: 'Home Tech', href: '/shop?category=home-tech' },
  { label: 'Lifestyle', href: '/shop?category=lifestyle' },
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

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t border-[var(--border)] mt-24"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" />
            <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed max-w-xs">
              Premium tech & lifestyle store with an AI shopping concierge. Shop the future.
              Beautifully.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com"
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
          <p className="text-xs text-[var(--muted)]">
            &copy; {year} LUMORA. All rights reserved.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Crafted with care &mdash; AI-powered commerce.
          </p>
        </div>
      </div>
    </footer>
  )
}
