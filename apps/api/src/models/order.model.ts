import mongoose, { Schema, type Document } from 'mongoose'

export interface IOrderItem {
  product: mongoose.Types.ObjectId
  title: string
  image: string
  price: number
  qty: number
  variant?: { name: string; value: string }
}

export interface IShippingAddress {
  label?: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface IStatusHistory {
  status: string
  at: Date
}

export interface IShippingMethod {
  name: string
  price: number
  etaDays: number
}

export interface IOrderPayment {
  method: 'simulated'
  brandGuess?: string
  last4?: string
  status: 'paid' | 'failed' | 'refunded'
}

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

export interface IOrder extends Document {
  orderNumber: string
  user: mongoose.Types.ObjectId
  items: IOrderItem[]
  shippingAddress: IShippingAddress
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
  payment: IOrderPayment
  status: OrderStatus
  statusHistory: IStatusHistory[]
  shippingMethod: IShippingMethod
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        qty: { type: Number, required: true },
        variant: { name: String, value: String, _id: false },
        _id: false,
      },
    ],
    shippingAddress: {
      label: String,
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: String,
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    payment: {
      method: { type: String, enum: ['simulated'], default: 'simulated' },
      brandGuess: String,
      last4: String,
      status: { type: String, enum: ['paid', 'failed', 'refunded'], default: 'paid' },
    },
    status: {
      type: String,
      enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: () => new Date() },
        _id: false,
      },
    ],
    shippingMethod: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      etaDays: { type: Number, required: true },
    },
  },
  { timestamps: true }
)

OrderSchema.index({ orderNumber: 1 }, { unique: true })
OrderSchema.index({ user: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

export const Order = mongoose.model<IOrder>('Order', OrderSchema)
