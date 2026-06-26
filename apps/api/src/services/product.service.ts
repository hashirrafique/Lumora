import { Product } from '../models/product.model'
import { ApiError } from '../utils/ApiError'
import { uniqueSlug } from '../utils/slug'
import type { CreateProductInput, UpdateProductInput, ProductListQuery } from '../schemas/product.schema'
import type { PaginationMeta } from '@lumora/types'

export async function listProducts(query: ProductListQuery): Promise<{
  products: unknown[]
  meta: PaginationMeta
}> {
  const filter: Record<string, unknown> = { isActive: true }

  if (query.q) {
    filter['$text'] = { $search: query.q }
  }
  if (query.category) filter['category'] = query.category
  if (query.brand) filter['brand'] = { $regex: new RegExp(query.brand, 'i') }
  if (query.inStock) filter['stock'] = { $gt: 0 }
  if (query.featured) filter['isFeatured'] = true
  if (query.tags) filter['tags'] = { $in: query.tags.split(',').map((t) => t.trim()) }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {}
    if (query.minPrice !== undefined) priceFilter['$gte'] = query.minPrice
    if (query.maxPrice !== undefined) priceFilter['$lte'] = query.maxPrice
    filter['price'] = priceFilter
  }
  if (query.minRating !== undefined) {
    filter['ratingAvg'] = { $gte: query.minRating }
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { ratingAvg: -1, ratingCount: -1 },
    popular: { soldCount: -1 },
  }
  const sort = sortMap[query.sort ?? 'newest'] ?? { createdAt: -1 }

  const skip = (query.page - 1) * query.limit

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(filter),
  ])

  return {
    products,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getProductBySlug(slug: string): Promise<unknown> {
  const product = await Product.findOne({ slug, isActive: true })
    .populate('category', 'name slug')
    .lean()
  if (!product) throw ApiError.notFound('Product')
  return product
}

export async function getProductById(id: string): Promise<unknown> {
  const product = await Product.findById(id).populate('category', 'name slug').lean()
  if (!product) throw ApiError.notFound('Product')
  return product
}

export async function createProduct(input: CreateProductInput): Promise<unknown> {
  const slug = await uniqueSlug(input.title)
  const product = new Product({ ...input, slug })
  await product.save()
  return product.toObject()
}

export async function updateProduct(id: string, input: UpdateProductInput): Promise<unknown> {
  const product = await Product.findById(id)
  if (!product) throw ApiError.notFound('Product')

  if (input.title && input.title !== product.title) {
    input = { ...input, slug: await uniqueSlug(input.title, id) } as UpdateProductInput & { slug: string }
  }

  Object.assign(product, input)
  await product.save()
  return product.toObject()
}

export async function deleteProduct(id: string): Promise<void> {
  const result = await Product.findByIdAndDelete(id)
  if (!result) throw ApiError.notFound('Product')
}

export async function getFeaturedProducts(limit = 8): Promise<unknown[]> {
  return Product.find({ isFeatured: true, isActive: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean()
}

export async function getBestsellers(limit = 8): Promise<unknown[]> {
  return Product.find({ isBestseller: true, isActive: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .lean()
}
