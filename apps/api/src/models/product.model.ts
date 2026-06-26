import mongoose, { Schema, type Document } from 'mongoose'

export interface IProductImage {
  url: string
  alt: string
}

export interface IProductVariantOption {
  label: string
  value: string
  hex?: string
  stockDelta?: number
}

export interface IProductVariant {
  name: string
  options: IProductVariantOption[]
}

export interface IProductSpec {
  key: string
  value: string
}

export interface IProduct extends Document {
  title: string
  slug: string
  description: string
  brand: string
  category: mongoose.Types.ObjectId
  price: number
  compareAtPrice?: number
  currency: string
  images: IProductImage[]
  variants: IProductVariant[]
  specs: IProductSpec[]
  tags: string[]
  stock: number
  ratingAvg: number
  ratingCount: number
  soldCount: number
  isFeatured: boolean
  isBestseller: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: Number,
    currency: { type: String, default: 'USD' },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, required: true },
        _id: false,
      },
    ],
    variants: [
      {
        name: String,
        options: [
          {
            label: String,
            value: String,
            hex: String,
            stockDelta: Number,
            _id: false,
          },
        ],
        _id: false,
      },
    ],
    specs: [
      {
        key: String,
        value: String,
        _id: false,
      },
    ],
    tags: [{ type: String }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Indexes per spec 02
ProductSchema.index({ category: 1 })
ProductSchema.index({ brand: 1 })
ProductSchema.index({ tags: 1 })
ProductSchema.index({ isFeatured: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ category: 1, price: 1 })
ProductSchema.index({ isActive: 1, soldCount: -1 })
ProductSchema.index(
  { title: 'text', description: 'text', brand: 'text' },
  { weights: { title: 10, brand: 5, description: 1 } }
)

export const Product = mongoose.model<IProduct>('Product', ProductSchema)
