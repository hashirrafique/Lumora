import mongoose from 'mongoose'
import { Order } from '../models/order.model'
import { Cart } from '../models/cart.model'
import { Product } from '../models/product.model'
import { Coupon } from '../models/coupon.model'
import { ApiError } from '../utils/ApiError'
import { generateOrderNumber } from '../utils/orderNumber'
import { simulatePayment } from '../lib/payment/simulate'
import { getRedis } from '../config/redis'
import { emitStockUpdate, emitOrderStatus } from '../sockets'
import type { CreateOrderInput } from '../schemas/order.schema'
import type { PaginationMeta } from '../types'
import { env } from '../config/env'

const IDEMPOTENCY_TTL = 60 * 60 * 24 // 24 hours

export async function createOrder(
  userId: string,
  input: CreateOrderInput,
  idempotencyKey?: string
): Promise<unknown> {
  // ── Idempotency check ────────────────────────────────────────────────────
  if (idempotencyKey) {
    const redis = getRedis()
    if (redis) {
      const cached = await redis.get(`idem:order:${idempotencyKey}`)
      if (cached) {
        const order = await Order.findById(cached).lean()
        if (order) return order
      }
    }
  }

  // ── Load and validate cart ────────────────────────────────────────────────
  const cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'title price stock images slug soldCount isActive'
  )

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty')
  }

  // Re-price from DB (never trust client prices)
  const priceMap: Record<string, number> = {}
  for (const item of cart.items) {
    const prod = item.product as unknown as {
      _id: mongoose.Types.ObjectId
      title: string
      price: number
      stock: number
      images: Array<{ url: string; alt: string }>
      slug: string
      soldCount: number
      isActive: boolean
    }
    if (!prod || !prod.isActive) {
      throw ApiError.badRequest(`Product "${prod?.title ?? 'unknown'}" is no longer available`)
    }
    priceMap[String(prod._id)] = prod.price
  }

  // ── Run simulated payment ──────────────────────────────────────────────────
  const paymentResult = simulatePayment(input.payment)
  if (!paymentResult.success) {
    throw ApiError.badRequest(paymentResult.errorMessage ?? 'Payment declined')
  }

  // ── Compute totals (server-authoritative) ─────────────────────────────────
  const subtotal = cart.items.reduce((sum, item) => {
    const prod = item.product as unknown as { _id: mongoose.Types.ObjectId; price: number }
    return sum + (priceMap[String(prod._id)] ?? 0) * item.qty
  }, 0)

  let discount = 0
  let couponCode: string | undefined

  if (cart.coupon) {
    const coupon = await Coupon.findById(cart.coupon).select(
      'code type value minSubtotal maxUses usedCount expiresAt isActive'
    )
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      subtotal >= coupon.minSubtotal
    ) {
      couponCode = coupon.code
      if (coupon.type === 'percent') {
        discount = (subtotal * coupon.value) / 100
      } else {
        discount = Math.min(coupon.value, subtotal)
      }
      discount = Math.round(discount * 100) / 100
    }
  }

  const afterDiscount = subtotal - discount
  const shippingCost = input.shippingMethod.price

  const total = Math.round((afterDiscount + shippingCost) * 100) / 100

  // ── Mongo transaction ─────────────────────────────────────────────────────
  const session = await mongoose.startSession()
  let createdOrder: mongoose.Document | null = null

  try {
    await session.withTransaction(async () => {
      // Stock check + decrement (per item, atomically)
      for (const item of cart.items) {
        const prod = item.product as unknown as { _id: mongoose.Types.ObjectId; title: string }
        const updated = await Product.findOneAndUpdate(
          { _id: prod._id, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty, soldCount: item.qty } },
          { session, new: true }
        )
        if (!updated) {
          throw ApiError.badRequest(`"${prod.title}" does not have enough stock for your order`)
        }
      }

      const orderNumber = generateOrderNumber()

      // Snapshot line items
      const items = cart.items.map((item) => {
        const prod = item.product as unknown as {
          _id: mongoose.Types.ObjectId
          title: string
          price: number
          images: Array<{ url: string; alt: string }>
          slug: string
        }
        return {
          product: prod._id,
          title: prod.title,
          image: prod.images[0]?.url ?? '',
          price: priceMap[String(prod._id)] ?? prod.price,
          qty: item.qty,
          variant: item.variant,
        }
      })

      const [order] = await Order.create(
        [
          {
            orderNumber,
            user: userId,
            items,
            shippingAddress: input.shippingAddress,
            subtotal,
            discount,
            shipping: shippingCost,
            total,
            couponCode,
            payment: {
              method: 'simulated',
              brandGuess: paymentResult.brandGuess,
              last4: paymentResult.last4,
              status: 'paid',
            },
            status: 'placed',
            statusHistory: [{ status: 'placed', at: new Date() }],
            shippingMethod: input.shippingMethod,
          },
        ],
        { session }
      )

      // Clear cart + increment coupon usage
      await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [], coupon: undefined } },
        { session }
      )

      if (cart.coupon) {
        await Coupon.findByIdAndUpdate(cart.coupon, { $inc: { usedCount: 1 } }, { session })
      }

      createdOrder = order!
    })
  } finally {
    await session.endSession()
  }

  if (!createdOrder) throw ApiError.internal('Order creation failed unexpectedly')

  const orderId = (createdOrder as { _id: mongoose.Types.ObjectId })._id.toString()

  // Store idempotency key
  if (idempotencyKey) {
    const redis = getRedis()
    if (redis) await redis.setex(`idem:order:${idempotencyKey}`, IDEMPOTENCY_TTL, orderId)
  }

  // Emit stock:update for each item (post-commit, best-effort)
  if (env.NODE_ENV !== 'test') {
    const orderObj = createdOrder as unknown as {
      items: Array<{ product: mongoose.Types.ObjectId; qty: number }>
    }
    for (const item of orderObj.items) {
      const updated = await Product.findById(item.product).select('stock').lean()
      if (updated) {
        emitStockUpdate(String(item.product), updated.stock)
      }
    }
  }

  return (createdOrder as unknown as { toObject: () => unknown }).toObject()
}

export async function listOrders(
  userId: string,
  page = 1,
  limit = 10
): Promise<{ orders: unknown[]; meta: PaginationMeta }> {
  const skip = (page - 1) * limit
  const filter = { user: userId }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-items.image')
      .lean(),
    Order.countDocuments(filter),
  ])

  return {
    orders,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function getOrder(
  orderNumber: string,
  userId: string,
  isAdmin: boolean
): Promise<unknown> {
  const order = await Order.findOne({ orderNumber })
    .populate('items.product', 'slug title images')
    .lean()

  if (!order) throw ApiError.notFound('Order')

  if (!isAdmin && String(order.user) !== userId) {
    throw ApiError.forbidden()
  }

  return order
}

export async function updateOrderStatus(orderId: string, status: string): Promise<unknown> {
  const order = await Order.findById(orderId)
  if (!order) throw ApiError.notFound('Order')
  if (order.status === 'cancelled' && status !== 'cancelled') {
    throw ApiError.badRequest('Cannot change status of a cancelled order')
  }

  const now = new Date()
  order.status = status as 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
  order.statusHistory.push({ status, at: now })
  await order.save()

  emitOrderStatus(String(order.user), order.orderNumber, status, now)

  return order.toObject()
}

export async function listAllOrders(
  status: string | undefined,
  page = 1,
  limit = 20
): Promise<{ orders: unknown[]; meta: PaginationMeta }> {
  const filter: Record<string, unknown> = {}
  if (status) filter['status'] = status

  const skip = (page - 1) * limit
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ])

  return { orders, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}
