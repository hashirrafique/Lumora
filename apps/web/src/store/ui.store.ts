'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface UIState {
  theme: Theme
  cartOpen: boolean
  commandPaletteOpen: boolean
  chatOpen: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  setCartOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setChatOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
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

      setCartOpen: (open) => set({ cartOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setChatOpen: (open) => set({ chatOpen: open }),
    }),
    {
      name: 'lumora-ui',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          document.documentElement.dataset['theme'] = state.theme
        }
      },
    }
  )
)
