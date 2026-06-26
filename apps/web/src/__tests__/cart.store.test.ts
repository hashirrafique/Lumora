import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/cart.store'
import type { GuestCartItem } from '@/store/cart.store'

// Zustand stores persist state between tests — reset before each
function resetStore() {
  useCartStore.setState({
    guestItems: [],
    drawerOpen: false,
  })
}

function makeItem(overrides: Partial<GuestCartItem> = {}): GuestCartItem {
  return {
    productId: 'prod-1',
    title: 'Test Headphones',
    image: 'https://example.com/img.jpg',
    price: 99.99,
    qty: 1,
    stock: 10,
    ...overrides,
  }
}

describe('Cart Store', () => {
  beforeEach(resetStore)

  describe('addItem', () => {
    it('adds a new item to an empty cart', () => {
      useCartStore.getState().addItem(makeItem())
      expect(useCartStore.getState().guestItems).toHaveLength(1)
    })

    it('increments qty when the same product is added again', () => {
      useCartStore.getState().addItem(makeItem({ qty: 1 }))
      useCartStore.getState().addItem(makeItem({ qty: 2 }))
      const items = useCartStore.getState().guestItems
      expect(items).toHaveLength(1)
      expect(items[0]?.qty).toBe(3)
    })

    it('caps qty at stock limit', () => {
      useCartStore.getState().addItem(makeItem({ qty: 8, stock: 10 }))
      useCartStore.getState().addItem(makeItem({ qty: 5, stock: 10 }))
      const items = useCartStore.getState().guestItems
      expect(items[0]?.qty).toBe(10) // capped at stock=10
    })

    it('treats items with different variants as separate entries', () => {
      useCartStore.getState().addItem(makeItem({ variant: { name: 'Color', value: 'Black' } }))
      useCartStore.getState().addItem(makeItem({ variant: { name: 'Color', value: 'White' } }))
      expect(useCartStore.getState().guestItems).toHaveLength(2)
    })
  })

  describe('updateQty', () => {
    it('updates item quantity', () => {
      useCartStore.getState().addItem(makeItem())
      useCartStore.getState().updateQty('prod-1', 5)
      expect(useCartStore.getState().guestItems[0]?.qty).toBe(5)
    })

    it('removes item when qty set to 0', () => {
      useCartStore.getState().addItem(makeItem())
      useCartStore.getState().updateQty('prod-1', 0)
      expect(useCartStore.getState().guestItems).toHaveLength(0)
    })

    it('removes item when qty set to negative', () => {
      useCartStore.getState().addItem(makeItem())
      useCartStore.getState().updateQty('prod-1', -1)
      expect(useCartStore.getState().guestItems).toHaveLength(0)
    })
  })

  describe('removeItem', () => {
    it('removes the correct item, leaving others intact', () => {
      useCartStore.getState().addItem(makeItem({ productId: 'prod-1' }))
      useCartStore.getState().addItem(makeItem({ productId: 'prod-2', title: 'Keyboard' }))
      useCartStore.getState().removeItem('prod-1')
      const items = useCartStore.getState().guestItems
      expect(items).toHaveLength(1)
      expect(items[0]?.productId).toBe('prod-2')
    })
  })

  describe('clearCart', () => {
    it('empties all items', () => {
      useCartStore.getState().addItem(makeItem({ productId: 'prod-1' }))
      useCartStore.getState().addItem(makeItem({ productId: 'prod-2', title: 'Keyboard' }))
      useCartStore.getState().clearCart()
      expect(useCartStore.getState().guestItems).toHaveLength(0)
    })
  })

  describe('itemCount', () => {
    it('returns the total quantity across all items', () => {
      useCartStore.getState().addItem(makeItem({ productId: 'prod-1', qty: 2 }))
      useCartStore.getState().addItem(makeItem({ productId: 'prod-2', qty: 3, title: 'Keyboard' }))
      expect(useCartStore.getState().itemCount()).toBe(5)
    })

    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().itemCount()).toBe(0)
    })
  })

  describe('drawer', () => {
    it('opens and closes the drawer', () => {
      expect(useCartStore.getState().drawerOpen).toBe(false)
      useCartStore.getState().openDrawer()
      expect(useCartStore.getState().drawerOpen).toBe(true)
      useCartStore.getState().closeDrawer()
      expect(useCartStore.getState().drawerOpen).toBe(false)
    })

    it('toggles the drawer', () => {
      useCartStore.getState().toggleDrawer()
      expect(useCartStore.getState().drawerOpen).toBe(true)
      useCartStore.getState().toggleDrawer()
      expect(useCartStore.getState().drawerOpen).toBe(false)
    })
  })
})
