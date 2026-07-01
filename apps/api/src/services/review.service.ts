import mongoose from 'mongoose'
import { Review } from '../models/review.model'
import { Product } from '../models/product.model'
import { Order } from '../models/order.model'
import { ApiError } from '../utils/ApiError'
import type { CreateReviewInput } from '../schemas/review.schema'
import type { PaginationMeta } from '../types'

async function recomputeRating(productId: string | mongoose.Types.ObjectId): Promise<void> {
  const agg = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const { avg = 0, count = 0 } = agg[0] ?? {}
  await Product.findByIdAndUpdate(productId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  })
}

export async function listReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: unknown[]; meta: PaginationMeta }> {
  const product = await Product.findById(productId).select('_id')
  if (!product) throw ApiError.notFound('Product')

  const filter = { product: new mongoose.Types.ObjectId(productId), isApproved: true }
  const skip = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatarUrl')
      .lean(),
    Review.countDocuments(filter),
  ])

  return {
    reviews,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function createReview(
  productId: string,
  userId: string,
  input: CreateReviewInput
): Promise<unknown> {
  const product = await Product.findById(productId).select('_id')
  if (!product) throw ApiError.notFound('Product')

  const existing = await Review.findOne({
    product: productId,
    user: userId,
  })
  if (existing) throw ApiError.conflict('You have already reviewed this product')

  // Check if user has a delivered order containing this product
  const verifiedOrder = await Order.findOne({
    user: userId,
    status: 'delivered',
    'items.product': new mongoose.Types.ObjectId(productId),
  })

  const review = await Review.create({
    product: productId,
    user: userId,
    rating: input.rating,
    title: input.title,
    body: input.body,
    isVerifiedPurchase: !!verifiedOrder,
    isApproved: true,
  })

  await recomputeRating(productId)
  return review.toObject()
}

export async function listAllReviews(
  isApproved: boolean | undefined,
  page = 1,
  limit = 20
): Promise<{ reviews: unknown[]; meta: PaginationMeta }> {
  const filter: Record<string, unknown> = {}
  if (isApproved !== undefined) filter['isApproved'] = isApproved

  const skip = (page - 1) * limit
  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatarUrl')
      .populate('product', 'title slug')
      .lean(),
    Review.countDocuments(filter),
  ])

  return { reviews, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function approveReview(reviewId: string, isApproved: boolean): Promise<unknown> {
  const review = await Review.findByIdAndUpdate(reviewId, { isApproved }, { new: true })
    .populate('user', 'name')
    .lean()
  if (!review) throw ApiError.notFound('Review')
  await recomputeRating(review.product)
  return review
}

export async function deleteReview(
  reviewId: string,
  userId: string,
  isAdmin: boolean
): Promise<void> {
  const review = await Review.findById(reviewId)
  if (!review) throw ApiError.notFound('Review')
  if (!isAdmin && String(review.user) !== userId) throw ApiError.forbidden()
  await review.deleteOne()
  await recomputeRating(review.product)
}
