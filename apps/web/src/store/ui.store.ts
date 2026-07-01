'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'
export type AccentColor = 'violet' | 'blue' | 'green' | 'orange'

interface UIState {
  theme: Theme
  accent: AccentColor
  cartOpen: boolean
  commandPaletteOpen: boolean
  chatOpen: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  setAccent: (accent: AccentColor) => void
  setCartOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setChatOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      accent: 'violet',
      cartOpen: false,
      commandPaletteOpen: false,
      chatOpen: false,

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        if (typeof document !== 'undefined') {
          document.documentElement.dataset['theme'] = next
        }
      },

      setTheme: (theme) => {
        set({ theme })
        if (typeof document !== 'undefined') {
          document.documentElement.dataset['theme'] = theme
        }
      },

      setAccent: (accent) => {
        set({ accent })
        if (typeof document !== 'undefined') {
          document.documentElement.dataset['accent'] = accent === 'violet' ? '' : accent
        }
      },

      setCartOpen: (open) => set({ cartOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setChatOpen: (open) => set({ chatOpen: open }),
    }),
    {
      name: 'lumora-ui',
      partialize: (state) => ({ theme: state.theme, accent: state.accent }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          document.documentElement.dataset['theme'] = state.theme
          if (state.accent && state.accent !== 'violet') {
            document.documentElement.dataset['accent'] = state.accent
          }
        }
      },
    }
  )
)
