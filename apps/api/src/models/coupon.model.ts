import mongoose, { Schema, type Document } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  type: 'percent' | 'fixed'
  value: number
  minSubtotal: number
  maxUses?: number
  usedCount: number
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0 },
    maxUses: Number,
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

CouponSchema.index({ code: 1 }, { unique: true })

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema)
