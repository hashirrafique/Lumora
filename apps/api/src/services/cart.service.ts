import { Cart } from '../models/cart.model'
import { Product } from '../models/product.model'
import { Coupon } from '../models/coupon.model'
import { ApiError } from '../utils/ApiError'
import type { AddCartItemInput } from '../schemas/cart.schema'

interface CartTotals {
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
}

function computeTotals(
  items: Array<{ price: number; qty: number }>,
  coupon?: { type: string; value: number; code?: string } | null
): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  let discount = 0
  if (coupon) {
    if (coupon.type === 'percent') {
      discount = (subtotal * coupon.value) / 100
    } else {
      discount = Math.min(coupon.value, subtotal)
    }
  }
  const afterDiscount = subtotal - discount
  const shipping = afterDiscount > 0 && afterDiscount < 75 ? 9.99 : 0
  return {
    subtotal,
    discount: Math.round(discount * 100) / 100,
    shipping,
    total: Math.round((afterDiscount + shipping) * 100) / 100,
    couponCode: coupon?.code,
  }
}

export async function getCart(userId: string) {
  const cart = await Cart.findOne({ user: userId })
    .populate('items.product', 'title images price compareAtPrice stock slug variants')
    .populate('coupon', 'code type value')
    .lean()

  if (!cart) {
    return { items: [], ...computeTotals([]) }
  }

  // Filter out items whose product was deleted
  const validItems = cart.items.filter((item) => item.product != null)

  const couponData = cart.coupon as unknown as { type: string; value: number; code: string } | null

  return {
    _id: cart._id,
    items: validItems,
    coupon: cart.coupon,
    ...computeTotals(
      validItems.map((i) => ({
        price: (i.product as unknown as { price: number }).price,
        qty: i.qty,
      })),
      couponData
    ),
  }
}

export async function addItem(userId: string, input: AddCartItemInput) {
  const product = await Product.findById(input.productId).select('price stock title images')
  if (!product) throw ApiError.notFound('Product')
  if (product.stock <= 0) throw ApiError.badRequest('Product is out of stock')

  let cart = await Cart.findOne({ user: userId })
  if (!cart) {
    cart = new Cart({ user: userId, items: [] })
  }

  const variantKey = input.variant
    ? `${input.productId}-${input.variant.name}-${input.variant.value}`
    : input.productId

  const existingIdx = cart.items.findIndex((item) => {
    const k = item.variant?.name && item.variant?.value
      ? `${item.product}-${item.variant.name}-${item.variant.value}`
      : String(item.product)
    return k === variantKey
  })

  if (existingIdx >= 0) {
    const newQty = cart.items[existingIdx]!.qty + input.qty
    if (newQty > product.stock) {
      throw ApiError.badRequest(`Only ${product.stock} units available`)
    }
    cart.items[existingIdx]!.qty = newQty
  } else {
    if (input.qty > product.stock) {
      throw ApiError.badRequest(`Only ${product.stock} units available`)
    }
    const newItem: { product: typeof product._id; qty: number; variant?: typeof input.variant } = {
      product: product._id,
      qty: input.qty,
    }
    if (input.variant) newItem.variant = input.variant
    cart.items.push(newItem)
  }

  await cart.save()
  return getCart(userId)
}

export async function updateItem(
  userId: string,
  productId: string,
  qty: number,
  variantName?: string,
  variantValue?: string
) {
  const cart = await Cart.findOne({ user: userId })
  if (!cart) throw ApiError.notFound('Cart')

  const variant =
    variantName && variantValue ? { name: variantName, value: variantValue } : undefined

  const variantKey = variant
    ? `${productId}-${variant.name}-${variant.value}`
    : productId

  const idx = cart.items.findIndex((item) => {
    const k = item.variant?.name && item.variant?.value
      ? `${item.product}-${item.variant.name}-${item.variant.value}`
      : String(item.product)
    return k === variantKey
  })

  if (idx < 0) throw ApiError.notFound('Cart item')

  if (qty <= 0) {
    cart.items.splice(idx, 1)
  } else {
    const product = await Product.findById(productId).select('stock')
    if (product && qty > product.stock) {
      throw ApiError.badRequest(`Only ${product.stock} units available`)
    }
    cart.items[idx]!.qty = qty
  }

  await cart.save()
  return getCart(userId)
}

export async function removeItem(
  userId: string,
  productId: string,
  variantName?: string,
  variantValue?: string
) {
  const variant =
    variantName && variantValue ? { name: variantName, value: variantValue } : undefined
  const variantKey = variant ? `${productId}-${variant.name}-${variant.value}` : productId

  const cart = await Cart.findOne({ user: userId })
  if (!cart) throw ApiError.notFound('Cart')

  cart.items = cart.items.filter((item) => {
    const k = item.variant?.name && item.variant?.value
      ? `${item.product}-${item.variant.name}-${item.variant.value}`
      : String(item.product)
    return k !== variantKey
  })

  await cart.save()
  return getCart(userId)
}

export async function clearCart(userId: string) {
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [], coupon: undefined } },
    { upsert: true }
  )
  return getCart(userId)
}

export async function applyCoupon(userId: string, code: string) {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    $and: [
      { $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: { $exists: false } }] },
      { $or: [{ maxUses: { $exists: false } }, { $expr: { $lt: ['$usedCount', '$maxUses'] } }] },
    ],
  })
  if (!coupon) throw ApiError.badRequest('Invalid or expired coupon code')

  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'price')
  if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty')

  const subtotal = cart.items.reduce((sum, item) => {
    const p = item.product as unknown as { price: number }
    return sum + p.price * item.qty
  }, 0)

  if (subtotal < coupon.minSubtotal) {
    throw ApiError.badRequest(
      `Minimum order of $${coupon.minSubtotal.toFixed(2)} required for this coupon`
    )
  }

  cart.coupon = coupon._id
  await cart.save()
  return getCart(userId)
}

export async function removeCoupon(userId: string) {
  const cart = await Cart.findOne({ user: userId })
  if (!cart) throw ApiError.notFound('Cart')
  cart.coupon = undefined
  await cart.save()
  return getCart(userId)
}

export async function mergeGuestCart(
  userId: string,
  guestItems: Array<{ productId: string; qty: number; variant?: { name: string; value: string } }>
) {
  for (const item of guestItems) {
    try {
      await addItem(userId, { productId: item.productId, qty: item.qty, variant: item.variant })
    } catch {
      // Skip items that fail (out of stock, deleted) — best-effort merge
    }
  }
  return getCart(userId)
}
