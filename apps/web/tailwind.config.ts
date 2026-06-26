import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // dark ("Aurora") — default
        bg: '#070710',
        surface: '#0d0d1a',
        'surface-2': '#13132400',
        border: 'rgba(255,255,255,0.08)',
        'border-strong': 'rgba(255,255,255,0.14)',
        text: '#F5F6FF',
        muted: '#A0A3BD',
        // accent (aurora gradient stops)
        violet: '#7C5CFF',
        cyan: '#22D3EE',
        indigo: '#5B7CFA',
        // semantic
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,92,255,0.25), 0 8px 40px -8px rgba(124,92,255,0.45)',
        'glow-cyan': '0 0 0 1px rgba(34,211,238,0.25), 0 8px 40px -8px rgba(34,211,238,0.40)',
        card: '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 60px -20px rgba(0,0,0,0.7)',
      },
      backdropBlur: {
        glass: '14px',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'aurora-text': 'linear-gradient(92deg, #7C5CFF 0%, #5B7CFA 45%, #22D3EE 100%)',
        'aurora-line': 'linear-gradient(92deg, #7C5CFF, #22D3EE)',
      },
      keyframes: {
        'aurora-drift': {
          '0%,100%': { transform: 'translate3d(-2%,-1%,0) scale(1.05)' },
          '50%': { transform: 'translate3d(2%,1%,0) scale(1.1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'aurora-drift': 'aurora-drift 18s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up .5s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}

export default config
