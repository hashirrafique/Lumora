import mongoose from 'mongoose'
import { Wishlist } from '../models/wishlist.model'
import { Product } from '../models/product.model'
import { ApiError } from '../utils/ApiError'

export async function getWishlist(userId: string) {
  const wishlist = await Wishlist.findOne({ user: userId })
    .populate('products', 'title slug images price compareAtPrice ratingAvg ratingCount stock isFeatured brand')
    .lean()

  return {
    products: wishlist?.products ?? [],
    count: wishlist?.products?.length ?? 0,
  }
}

export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<{ added: boolean }> {
  const product = await Product.findById(productId).select('_id')
  if (!product) throw ApiError.notFound('Product')

  let wishlist = await Wishlist.findOne({ user: userId })

  if (!wishlist) {
    wishlist = new Wishlist({
      user: userId,
      products: [product._id],
    })
    await wishlist.save()
    return { added: true }
  }

  const pid = new mongoose.Types.ObjectId(productId)
  const isPresent = wishlist.products.some((p) => p.equals(pid))

  if (isPresent) {
    wishlist.products = wishlist.products.filter((p) => !p.equals(pid))
    await wishlist.save()
    return { added: false }
  } else {
    wishlist.products.push(pid)
    await wishlist.save()
    return { added: true }
  }
}
