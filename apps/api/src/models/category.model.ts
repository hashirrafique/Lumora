import mongoose, { Schema, type Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    imageUrl: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Category = mongoose.model<ICategory>('Category', CategorySchema)
