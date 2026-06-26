'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartVariant } from '@lumora/types'

export interface GuestCartItem {
  productId: string
  title: string
  image: string
  price: number
  qty: number
  variant?: CartVariant
  stock: number
}

interface CartState {
  guestItems: GuestCartItem[]
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  addItem: (item: GuestCartItem) => void
  updateQty: (productId: string, qty: number, variant?: CartVariant) => void
  removeItem: (productId: string, variant?: CartVariant) => void
  clearCart: () => void
  itemCount: () => number
}

const variantKey = (productId: string, variant?: CartVariant) =>
  variant ? `${productId}-${variant.name}-${variant.value}` : productId

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      guestItems: [],
      drawerOpen: false,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),

      addItem: (item) => {
        const key = variantKey(item.productId, item.variant)
        set((state) => {
          const existing = state.guestItems.find(
            (i) => variantKey(i.productId, i.variant) === key
          )
          if (existing) {
            return {
              guestItems: state.guestItems.map((i) =>
                variantKey(i.productId, i.variant) === key
                  ? { ...i, qty: Math.min(i.qty + item.qty, item.stock) }
                  : i
              ),
            }
          }
          return { guestItems: [...state.guestItems, item] }
        })
      },

      updateQty: (productId, qty, variant) => {
        const key = variantKey(productId, variant)
        if (qty <= 0) {
          set((state) => ({
            guestItems: state.guestItems.filter(
              (i) => variantKey(i.productId, i.variant) !== key
            ),
          }))
        } else {
          set((state) => ({
            guestItems: state.guestItems.map((i) =>
              variantKey(i.productId, i.variant) === key ? { ...i, qty } : i
            ),
          }))
        }
      },

      removeItem: (productId, variant) => {
        const key = variantKey(productId, variant)
        set((state) => ({
          guestItems: state.guestItems.filter(
            (i) => variantKey(i.productId, i.variant) !== key
          ),
        }))
      },

      clearCart: () => set({ guestItems: [] }),

      itemCount: () => get().guestItems.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'lumora-cart' }
  )
)
