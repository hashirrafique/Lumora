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
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-subtle': {
          '0%,100%': { transform: 'translateY(0)', animationTimingFunction: 'ease-in-out' },
          '50%': { transform: 'translateY(6px)', animationTimingFunction: 'ease-in-out' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'aurora-drift': 'aurora-drift 18s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up .5s cubic-bezier(.16,1,.3,1) both',
        marquee: 'marquee 28s linear infinite',
        'marquee-reverse': 'marquee-reverse 28s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delay': 'float 5s ease-in-out infinite 1s',
        'bounce-subtle': 'bounce-subtle 1.8s ease-in-out infinite',
        'scale-in': 'scale-in 0.25s cubic-bezier(.16,1,.3,1) both',
        'slide-up': 'slide-up 0.35s cubic-bezier(.16,1,.3,1) both',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'fade-in': 'fade-in 0.3s ease both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(.16,1,.3,1) both',
        'count-up': 'count-up 0.5s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}

export default config
