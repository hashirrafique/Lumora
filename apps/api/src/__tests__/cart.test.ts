import { describe, it, expect, vi, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { Product } from '../models/product.model'
import { Cart } from '../models/cart.model'
import { Category } from '../models/category.model'
import { Coupon } from '../models/coupon.model'
import * as cartService from '../services/cart.service'

vi.mock('../config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 4001,
    MONGODB_URI: 'memory',
    REDIS_URL: 'redis://localhost:6379',
    JWT_ACCESS_SECRET: 'test-access-secret-at-least-32-chars-long',
    JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-chars-long',
    ACCESS_TTL: '15m',
    REFRESH_TTL: '7d',
    CORS_ORIGINS: ['http://localhost:3000'],
  },
}))

async function makeProduct(overrides: Record<string, unknown> = {}) {
  const cat = await Category.findOneAndUpdate(
    { slug: 'test-cat' },
    { name: 'Test', slug: 'test-cat', order: 1 },
    { upsert: true, new: true }
  )
  return Product.create({
    title: 'Test Product',
    slug: `test-product-${Math.random()}`,
    description: 'A test product',
    brand: 'Brand',
    category: cat._id,
    price: 100,
    images: [{ url: 'https://example.com/img.jpg', alt: 'img' }],
    stock: 10,
    isActive: true,
    ...overrides,
  })
}

const userId = new mongoose.Types.ObjectId().toString()

describe('Cart Service', () => {
  beforeEach(async () => {
    await Cart.deleteMany({})
    await Product.deleteMany({})
  })

  describe('addItem', () => {
    it('adds a product to an empty cart', async () => {
      const product = await makeProduct()
      const cart = await cartService.addItem(userId, { productId: String(product._id), qty: 2 })
      expect(cart.items).toHaveLength(1)
      expect(cart.items[0]?.qty).toBe(2)
    })

    it('increments qty when same product added again', async () => {
      const product = await makeProduct()
      await cartService.addItem(userId, { productId: String(product._id), qty: 1 })
      const cart = await cartService.addItem(userId, { productId: String(product._id), qty: 2 })
      expect(cart.items).toHaveLength(1)
      expect(cart.items[0]?.qty).toBe(3)
    })

    it('rejects qty exceeding available stock', async () => {
      const product = await makeProduct({ stock: 3 })
      await expect(
        cartService.addItem(userId, { productId: String(product._id), qty: 5 })
      ).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects out-of-stock product', async () => {
      const product = await makeProduct({ stock: 0 })
      await expect(
        cartService.addItem(userId, { productId: String(product._id), qty: 1 })
      ).rejects.toMatchObject({ statusCode: 400 })
    })

    it('throws 404 for unknown product id', async () => {
      await expect(
        cartService.addItem(userId, {
          productId: new mongoose.Types.ObjectId().toString(),
          qty: 1,
        })
      ).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('updateItem', () => {
    it('updates qty of existing cart item', async () => {
      const product = await makeProduct({ stock: 10 })
      await cartService.addItem(userId, { productId: String(product._id), qty: 1 })
      const cart = await cartService.updateItem(userId, String(product._id), 4)
      expect(cart.items[0]?.qty).toBe(4)
    })
  })

  describe('removeItem', () => {
    it('removes a product from the cart', async () => {
      const product = await makeProduct()
      await cartService.addItem(userId, { productId: String(product._id), qty: 1 })
      const cart = await cartService.removeItem(userId, String(product._id))
      expect(cart.items).toHaveLength(0)
    })
  })

  describe('applyCoupon', () => {
    it('applies a valid percent coupon', async () => {
      const product = await makeProduct()
      await cartService.addItem(userId, { productId: String(product._id), qty: 1 })
      const coupon = await Coupon.create({
        code: 'SAVE10',
        type: 'percent',
        value: 10,
        minSubtotal: 0,
        maxUses: 100,
        usedCount: 0,
        isActive: true,
      })
      const cart = await cartService.applyCoupon(userId, coupon.code)
      // getCart populates the coupon; compare via the nested _id
      const populatedCoupon = (cart as { coupon?: unknown }).coupon as { _id: string; code: string } | undefined
      expect(String(populatedCoupon?._id)).toBe(String(coupon._id))
    })

    it('rejects an expired coupon', async () => {
      await Coupon.create({
        code: 'EXPIRED',
        type: 'percent',
        value: 10,
        minSubtotal: 0,
        maxUses: 100,
        usedCount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() - 86400000), // yesterday
      })
      await expect(cartService.applyCoupon(userId, 'EXPIRED')).rejects.toMatchObject({
        statusCode: 400,
      })
    })

    it('rejects an inactive coupon', async () => {
      await Coupon.create({
        code: 'INACTIVE',
        type: 'percent',
        value: 10,
        minSubtotal: 0,
        maxUses: 100,
        usedCount: 0,
        isActive: false,
      })
      await expect(cartService.applyCoupon(userId, 'INACTIVE')).rejects.toMatchObject({
        statusCode: 400,
      })
    })

    it('rejects unknown coupon code', async () => {
      await expect(cartService.applyCoupon(userId, 'FAKE')).rejects.toMatchObject({
        statusCode: 400,
      })
    })
  })
})
