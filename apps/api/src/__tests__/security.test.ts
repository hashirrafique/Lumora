/**
 * Security integration tests — HTTP-level checks via Supertest.
 * Covers: CSRF enforcement, IDOR, mongo-operator injection, rate limiting.
 */
import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../app'
import { Product } from '../models/product.model'
import { Category } from '../models/category.model'
import * as authService from '../services/auth.service'

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

vi.mock('../config/redis', () => ({
  getRedis: () => ({
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    call: vi.fn().mockResolvedValue(null),
  }),
  closeRedis: vi.fn(),
  getRedisStatus: vi.fn().mockReturnValue('up'),
}))

vi.mock('../sockets', () => ({
  emitStockUpdate: vi.fn(),
  emitOrderStatus: vi.fn(),
  initSocket: vi.fn(),
  getIO: vi.fn(),
}))

// Helper — login and return cookies + CSRF token
async function loginAs(email: string, password: string) {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password })
  const cookies = res.headers['set-cookie'] as string[] | string | undefined
  const cookieArr = Array.isArray(cookies) ? cookies : cookies ? [cookies] : []
  const csrfCookie = cookieArr
    .flatMap((c) => c.split(','))
    .find((c) => c.trim().startsWith('csrf='))
  const csrfToken = csrfCookie?.split('=')[1]?.split(';')[0] ?? ''
  return { cookies: cookieArr.join('; '), csrfToken }
}

async function registerAndLogin(email: string) {
  await authService.register({ name: 'Sec User', email, password: 'TestPass1' })
  return loginAs(email, 'TestPass1')
}

describe('Security', () => {
  describe('CSRF enforcement', () => {
    it('returns 403 on mutating request without CSRF token', async () => {
      const { cookies } = await registerAndLogin('csrf-test@example.com')
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Cookie', cookies)
        .send({ productId: new mongoose.Types.ObjectId().toString(), qty: 1 })
      expect(res.status).toBe(403)
    })

    it('allows mutating request with matching CSRF token', async () => {
      const cat = await Category.findOneAndUpdate(
        { slug: 'sec-cat' },
        { name: 'Security', slug: 'sec-cat', order: 1 },
        { upsert: true, new: true }
      )
      const product = await Product.create({
        title: 'Sec Product',
        slug: 'sec-product',
        description: 'Security test product description here.',
        brand: 'Brand',
        category: cat._id,
        price: 50,
        images: [{ url: 'https://example.com/img.jpg', alt: 'img' }],
        stock: 5,
        isActive: true,
      })

      const { cookies, csrfToken } = await registerAndLogin('csrf-ok@example.com')
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
        .send({ productId: String(product._id), qty: 1 })
      expect(res.status).toBe(201)
    })
  })

  describe('IDOR — order ownership', () => {
    it('returns 403 when a user fetches another user\'s order number', async () => {
      // Owner creates an order manually in the DB
      const ownerUser = await authService.register({
        name: 'Owner',
        email: 'owner-idor@example.com',
        password: 'TestPass1',
      })
      const fakeOrder = await mongoose.connection.collection('orders').insertOne({
        orderNumber: 'IDOR-TEST-001',
        user: ownerUser.user._id,
        items: [],
        status: 'placed',
        total: 99,
        subtotal: 99,
        discount: 0,
        shipping: 0,
        payment: { method: 'simulated', status: 'paid', last4: '1234', brandGuess: 'Visa' },
        shippingAddress: { fullName: 'Owner', phone: '5551234567', line1: '1 St', city: 'NY', postalCode: '10001', country: 'US', isDefault: false },
        shippingMethod: { name: 'Standard', price: 0, etaDays: 5 },
        statusHistory: [{ status: 'placed', at: new Date() }],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(fakeOrder.insertedId).toBeTruthy()

      // Attacker logs in and tries to access the owner's order
      const { cookies, csrfToken } = await registerAndLogin('attacker-idor@example.com')
      const res = await request(app)
        .get('/api/v1/orders/IDOR-TEST-001')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', csrfToken)
      expect(res.status).toBe(403)
    })
  })

  describe('MongoDB operator injection', () => {
    it('sanitizes operator keys in query params', async () => {
      // $gt operator in query string should not blow up the server
      const res = await request(app)
        .get('/api/v1/products')
        .query({ 'price[$gt]': '0' })
      // Should return 200 with results, not 500
      expect(res.status).toBeLessThan(500)
    })

    it('sanitizes operator keys in request body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: { $gt: '' }, password: 'anything' })
      // Should be 400/401, not 500
      expect(res.status).toBeLessThan(500)
      expect(res.status).not.toBe(200)
    })
  })

  describe('Rate limiting', () => {
    it('returns 429 after exceeding auth rate limit (10 req/min)', async () => {
      // Send 11 login attempts to the same endpoint
      const reqs = Array.from({ length: 11 }, () =>
        request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'rate@test.com', password: 'wrong' })
      )
      const results = await Promise.all(reqs)
      const statuses = results.map((r) => r.status)
      expect(statuses).toContain(429)
    })
  })

  describe('Security headers', () => {
    it('sets X-Content-Type-Options: nosniff on all responses', async () => {
      const res = await request(app).get('/api/v1/health')
      expect(res.headers['x-content-type-options']).toBe('nosniff')
    })

    it('sets X-Frame-Options on all responses', async () => {
      const res = await request(app).get('/api/v1/health')
      // helmet sets this as SAMEORIGIN or DENY
      expect(res.headers['x-frame-options']).toBeTruthy()
    })
  })
})
