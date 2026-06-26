import mongoose, { Schema, type Document } from 'mongoose'

export interface IReview extends Document {
  product: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  rating: number
  title?: string
  body: string
  isVerifiedPurchase: boolean
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120 },
    body: { type: String, required: true, maxlength: 2000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
)

ReviewSchema.index({ product: 1 })
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

export const Review = mongoose.model<IReview>('Review', ReviewSchema)
