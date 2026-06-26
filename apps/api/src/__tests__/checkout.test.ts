/**
 * Checkout — the crown jewel.
 *
 * Tests cover the full purchase transaction: happy path, stock rollback on
 * insufficient stock, payment validation, idempotency replay, and IDOR
 * (users can only see their own orders).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { Product } from '../models/product.model'
import { Cart } from '../models/cart.model'
import { Order } from '../models/order.model'
import { Category } from '../models/category.model'
import * as orderService from '../services/order.service'
import type { CreateOrderInput } from '../schemas/order.schema'

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

// Redis mock — in-memory store for idempotency key tests
const mockRedisStore: Record<string, string> = {}
vi.mock('../config/redis', () => ({
  getRedis: () => ({
    get: vi.fn((key: string) => Promise.resolve(mockRedisStore[key] ?? null)),
    setex: vi.fn((key: string, _ttl: number, value: string) => {
      mockRedisStore[key] = value
      return Promise.resolve('OK')
    }),
  }),
  closeRedis: vi.fn(),
  getRedisStatus: vi.fn().mockReturnValue('up'),
}))

// Sockets mock — avoid emitting in tests
vi.mock('../sockets', () => ({
  emitStockUpdate: vi.fn(),
  emitOrderStatus: vi.fn(),
  initSocket: vi.fn(),
  getIO: vi.fn(),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VALID_CARD: CreateOrderInput['payment'] = {
  number: '4532015112830366', // valid Luhn, Visa
  exp: '12/99',
  cvc: '123',
  name: 'Test User',
}

const SHIPPING: CreateOrderInput['shippingAddress'] = {
  fullName: 'Test User',
  phone: '5551234567',
  line1: '123 Test St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
  isDefault: false,
}

const SHIPPING_METHOD: CreateOrderInput['shippingMethod'] = {
  name: 'Standard',
  price: 0,
  etaDays: 5,
}

function orderInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    shippingAddress: SHIPPING,
    shippingMethod: SHIPPING_METHOD,
    payment: VALID_CARD,
    ...overrides,
  }
}

async function makeProduct(overrides: Record<string, unknown> = {}) {
  const cat = await Category.findOneAndUpdate(
    { slug: 'checkout-cat' },
    { name: 'Checkout', slug: 'checkout-cat', order: 1 },
    { upsert: true, new: true }
  )
  return Product.create({
    title: 'Checkout Product',
    slug: `checkout-product-${Math.random()}`,
    description: 'Test product for checkout',
    brand: 'Brand',
    category: cat._id,
    price: 99.99,
    images: [{ url: 'https://example.com/img.jpg', alt: 'img' }],
    stock: 10,
    soldCount: 0,
    isActive: true,
    ...overrides,
  })
}

async function seedCartWithProduct(
  userId: string,
  productId: string,
  qty: number
) {
  await Cart.findOneAndUpdate(
    { user: userId },
    { $push: { items: { product: productId, qty } } },
    { upsert: true, new: true }
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Checkout (createOrder)', () => {
  const userId = new mongoose.Types.ObjectId().toString()

  beforeEach(async () => {
    await Product.deleteMany({})
    await Cart.deleteMany({})
    await Order.deleteMany({})
    Object.keys(mockRedisStore).forEach((k) => delete mockRedisStore[k])
  })

  describe('Happy path', () => {
    it('creates order, decrements stock, increments soldCount, clears cart', async () => {
      const product = await makeProduct({ stock: 5, soldCount: 0 })
      await seedCartWithProduct(userId, String(product._id), 2)

      const order = await orderService.createOrder(userId, orderInput()) as {
        status: string
        total: number
        items: Array<{ qty: number }>
      }

      expect(order.status).toBe('placed')
      expect(order.items[0]?.qty).toBe(2)
      // Total = 2 × 99.99 + 0 shipping = 199.98
      expect(order.total).toBeCloseTo(199.98)

      // Stock decremented
      const updated = await Product.findById(product._id)
      expect(updated?.stock).toBe(3) // 5 - 2
      expect(updated?.soldCount).toBe(2)

      // Cart cleared
      const cart = await Cart.findOne({ user: userId })
      expect(cart?.items).toHaveLength(0)
    })
  })

  describe('Insufficient stock → transaction rollback', () => {
    it('rolls back ALL stock decrements when one item fails', async () => {
      const goodProduct = await makeProduct({ title: 'Product A', slug: 'prod-a', stock: 10 })
      const lowStockProduct = await makeProduct({
        title: 'Product B',
        slug: 'prod-b',
        stock: 1,
      })

      // Cart has: 2 of A + 3 of B (B only has 1 in stock → should fail)
      await Cart.findOneAndUpdate(
        { user: userId },
        {
          $set: {
            items: [
              { product: goodProduct._id, qty: 2 },
              { product: lowStockProduct._id, qty: 3 },
            ],
          },
        },
        { upsert: true, new: true }
      )

      await expect(orderService.createOrder(userId, orderInput())).rejects.toMatchObject({
        statusCode: 400,
      })

      // Neither product stock should have changed (full rollback)
      const [a, b] = await Promise.all([
        Product.findById(goodProduct._id),
        Product.findById(lowStockProduct._id),
      ])
      expect(a?.stock).toBe(10) // unchanged
      expect(b?.stock).toBe(1) // unchanged
    })
  })

  describe('Payment validation', () => {
    it('rejects a card failing Luhn check', async () => {
      const product = await makeProduct()
      await seedCartWithProduct(userId, String(product._id), 1)

      await expect(
        orderService.createOrder(
          userId,
          orderInput({ payment: { ...VALID_CARD, number: '1234567890123456' } })
        )
      ).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects an expired card', async () => {
      const product = await makeProduct()
      await seedCartWithProduct(userId, String(product._id), 1)

      await expect(
        orderService.createOrder(
          userId,
          orderInput({ payment: { ...VALID_CARD, exp: '01/20' } })
        )
      ).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects empty cart', async () => {
      await expect(orderService.createOrder(userId, orderInput())).rejects.toMatchObject({
        statusCode: 400,
      })
    })
  })

  describe('Idempotency', () => {
    it('replays same key → returns the original order without double-decrementing', async () => {
      const product = await makeProduct({ stock: 5 })
      await seedCartWithProduct(userId, String(product._id), 1)

      const key = 'test-idem-key-' + Math.random()

      const order1 = await orderService.createOrder(userId, orderInput(), key) as {
        _id: unknown
      }

      // Reload cart with the same item (cart was cleared after first order)
      await seedCartWithProduct(userId, String(product._id), 1)

      // Replay with the same idempotency key
      const order2 = await orderService.createOrder(userId, orderInput(), key) as {
        _id: unknown
      }

      // Same order returned
      expect(String(order2._id)).toBe(String(order1._id))

      // Stock decremented only ONCE (still 4, not 3)
      const updated = await Product.findById(product._id)
      expect(updated?.stock).toBe(4)
    })
  })

  describe('IDOR — order ownership', () => {
    it('returns 403 when a user tries to access another user\'s order', async () => {
      const ownerUserId = new mongoose.Types.ObjectId().toString()
      const attackerUserId = new mongoose.Types.ObjectId().toString()

      const product = await makeProduct()
      await seedCartWithProduct(ownerUserId, String(product._id), 1)

      const order = await orderService.createOrder(ownerUserId, orderInput()) as {
        orderNumber: string
      }

      // Attacker tries to fetch the order
      await expect(
        orderService.getOrder(order.orderNumber, attackerUserId, false)
      ).rejects.toMatchObject({ statusCode: 403 })

      // Owner can fetch it
      const fetched = await orderService.getOrder(order.orderNumber, ownerUserId, false)
      expect(fetched).toBeDefined()
    })
  })
})
