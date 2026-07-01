'use client'

import { create } from 'zustand'
import type { ProductDTO } from '@/lib/api'

const MAX_COMPARE = 3

interface CompareState {
  compareList: ProductDTO[]
  compareOpen: boolean
  addToCompare: (product: ProductDTO) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  isInCompare: (id: string) => boolean
  setCompareOpen: (open: boolean) => void
}

export const useCompareStore = create<CompareState>((set, get) => ({
  compareList: [],
  compareOpen: false,

  addToCompare: (product) => {
    const { compareList } = get()
    if (compareList.length >= MAX_COMPARE) return
    if (compareList.some((p) => p._id === product._id)) return
    set({ compareList: [...compareList, product] })
  },

  removeFromCompare: (id) => {
    set((state) => ({ compareList: state.compareList.filter((p) => p._id !== id) }))
  },

  clearCompare: () => set({ compareList: [], compareOpen: false }),

  isInCompare: (id) => get().compareList.some((p) => p._id === id),

  setCompareOpen: (open) => set({ compareOpen: open }),
}))
