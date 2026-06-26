import mongoose, { Schema, type Document } from 'mongoose'

export interface ICartItem {
  product: mongoose.Types.ObjectId
  qty: number
  variant?: { name: string; value: string }
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId
  items: ICartItem[]
  coupon?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true, min: 1 },
        variant: {
          name: String,
          value: String,
          _id: false,
        },
        _id: false,
      },
    ],
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  },
  { timestamps: true }
)

CartSchema.index({ user: 1 }, { unique: true })

export const Cart = mongoose.model<ICart>('Cart', CartSchema)
