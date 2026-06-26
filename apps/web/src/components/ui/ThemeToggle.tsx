'use client'

import { Moon, Sun } from 'lucide-react'
import { useUIStore } from '@/store/ui.store'

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'relative w-9 h-9 rounded-xl flex items-center justify-center',
        'text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet',
      ].join(' ')}
    >
      {theme === 'dark' ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  )
}
