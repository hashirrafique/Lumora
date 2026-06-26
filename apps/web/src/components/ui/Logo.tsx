import Link from 'next/link'
import { spaceGrotesk } from '@/lib/fonts'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const sizes = {
  sm: { mark: 24, text: 'text-lg' },
  md: { mark: 32, text: 'text-xl' },
  lg: { mark: 48, text: 'text-3xl' },
}

export function Logo({ size = 'md', showWordmark = true, className = '' }: LogoProps) {
  const { mark, text } = sizes[size]

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet rounded-lg ${className}`}
      aria-label="LUMORA — home"
    >
      <LogoMark size={mark} />
      {showWordmark && (
        <span
          className={`${spaceGrotesk.className} ${text} font-semibold tracking-wide text-aurora`}
          aria-hidden="true"
        >
          LUMORA
        </span>
      )}
    </Link>
  )
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="50%" stopColor="#5B7CFA" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* Crescent arc that reads as an L — luminous stroke curving up-right */}
      <path
        d="M8 26 C8 26 8 8 8 8 L22 8"
        stroke="url(#logo-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 8 Q20 8 24 16 Q28 22 22 28"
        stroke="url(#logo-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}
