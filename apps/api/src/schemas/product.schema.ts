import { z } from 'zod'

const ImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(200),
})

const VariantOptionSchema = z.object({
  label: z.string().max(50),
  value: z.string().max(50),
  hex: z.string().optional(),
  stockDelta: z.number().optional(),
})

const VariantSchema = z.object({
  name: z.string().max(50),
  options: z.array(VariantOptionSchema).max(20),
})

const SpecSchema = z.object({
  key: z.string().max(100),
  value: z.string().max(200),
})

export const CreateProductSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  brand: z.string().min(1).max(100).trim(),
  category: z.string().length(24),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  images: z.array(ImageSchema).min(1).max(10),
  variants: z.array(VariantSchema).max(5).default([]),
  specs: z.array(SpecSchema).max(30).default([]),
  tags: z.array(z.string().max(50)).max(20).default([]),
  stock: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export const ProductListQuerySchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().optional(),
  brand: z.string().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  tags: z.string().optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  featured: z.coerce.boolean().optional(),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>
