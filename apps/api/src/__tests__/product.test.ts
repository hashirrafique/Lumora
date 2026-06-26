import { describe, it, expect, vi } from 'vitest'
import mongoose from 'mongoose'
import { Category } from '../models/category.model'
import { Product } from '../models/product.model'
import * as productService from '../services/product.service'

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

async function createTestCategory() {
  return Category.findOneAndUpdate(
    { slug: 'electronics' },
    { name: 'Electronics', slug: 'electronics', order: 1 },
    { upsert: true, new: true }
  )
}

async function createTestProduct(overrides: Record<string, unknown> = {}) {
  const cat = await createTestCategory()
  return Product.create({
    title: 'Test Laptop',
    slug: 'test-laptop',
    description: 'A great test laptop for all your needs.',
    brand: 'TestBrand',
    category: cat._id,
    price: 999,
    images: [{ url: 'https://images.unsplash.com/photo-test', alt: 'Test Laptop' }],
    stock: 10,
    ...overrides,
  })
}

describe('Product Service', () => {
  describe('listProducts', () => {
    it('returns empty list when no products', async () => {
      const { products, meta } = await productService.listProducts({ page: 1, limit: 20 })
      expect(products).toHaveLength(0)
      expect(meta.total).toBe(0)
    })

    it('returns paginated products', async () => {
      await createTestProduct()
      await createTestProduct({ title: 'Test Phone', slug: 'test-phone' })

      const { products, meta } = await productService.listProducts({ page: 1, limit: 10 })
      expect(products).toHaveLength(2)
      expect(meta.total).toBe(2)
      expect(meta.totalPages).toBe(1)
    })

    it('respects limit and page', async () => {
      await createTestProduct({ title: 'Product 1', slug: 'product-1' })
      await createTestProduct({ title: 'Product 2', slug: 'product-2' })
      await createTestProduct({ title: 'Product 3', slug: 'product-3' })

      const { products, meta } = await productService.listProducts({ page: 1, limit: 2 })
      expect(products).toHaveLength(2)
      expect(meta.totalPages).toBe(2)
    })

    it('filters by featured', async () => {
      await createTestProduct({ isFeatured: true, slug: 'featured-product' })
      await createTestProduct({ slug: 'normal-product', title: 'Normal Product' })

      const { products } = await productService.listProducts({ page: 1, limit: 20, featured: true })
      expect(products).toHaveLength(1)
    })

    it('filters in-stock only', async () => {
      await createTestProduct({ stock: 5, slug: 'in-stock' })
      await createTestProduct({ stock: 0, slug: 'out-of-stock', title: 'Out of Stock Product' })

      const { products } = await productService.listProducts({ page: 1, limit: 20, inStock: true })
      expect(products).toHaveLength(1)
    })
  })

  describe('getProductBySlug', () => {
    it('returns product for valid slug', async () => {
      await createTestProduct({ slug: 'my-product', title: 'My Product' })
      const product = await productService.getProductBySlug('my-product') as { slug: string }
      expect(product.slug).toBe('my-product')
    })

    it('throws 404 for unknown slug', async () => {
      await expect(productService.getProductBySlug('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      })
    })
  })

  describe('createProduct', () => {
    it('creates a product with generated slug', async () => {
      const cat = await createTestCategory()
      const product = await productService.createProduct({
        title: 'Amazing Laptop Pro',
        description: 'A very amazing laptop for professionals.',
        brand: 'TechBrand',
        category: String(cat._id),
        price: 1299,
        images: [{ url: 'https://images.unsplash.com/photo-test', alt: 'Laptop' }],
        variants: [],
        specs: [],
        tags: [],
        stock: 10,
        isFeatured: false,
        isBestseller: false,
        isActive: true,
      }) as { slug: string; title: string }
      expect(product.slug).toBe('amazing-laptop-pro')
      expect(product.title).toBe('Amazing Laptop Pro')
    })

    it('generates unique slug for duplicate titles', async () => {
      const cat = await createTestCategory()
      const base = {
        description: 'Test product description here.',
        brand: 'Brand',
        category: String(cat._id),
        price: 99,
        images: [{ url: 'https://images.unsplash.com/photo-test', alt: 'Product' }],
        variants: [] as [],
        specs: [] as [],
        tags: [] as string[],
        stock: 5,
        isFeatured: false,
        isBestseller: false,
        isActive: true,
      }
      const p1 = await productService.createProduct({ ...base, title: 'Widget' }) as { slug: string }
      const p2 = await productService.createProduct({ ...base, title: 'Widget' }) as { slug: string }
      expect(p1.slug).toBe('widget')
      expect(p2.slug).toBe('widget-1')
    })
  })

  describe('updateProduct', () => {
    it('updates product fields', async () => {
      const p = await createTestProduct({ slug: 'update-me', title: 'Update Me' })
      const updated = await productService.updateProduct(String(p._id), { price: 1499 }) as { price: number }
      expect(updated.price).toBe(1499)
    })

    it('throws 404 for unknown id', async () => {
      await expect(
        productService.updateProduct(new mongoose.Types.ObjectId().toString(), { price: 1 })
      ).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('deleteProduct', () => {
    it('deletes an existing product', async () => {
      const p = await createTestProduct({ slug: 'delete-me', title: 'Delete Me' })
      await expect(productService.deleteProduct(String(p._id))).resolves.not.toThrow()
      const found = await Product.findById(p._id)
      expect(found).toBeNull()
    })
  })
})
