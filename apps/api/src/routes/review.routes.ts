import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess, sendCreated } from '../utils/response'
import * as reviewService from '../services/review.service'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { verifyCsrf } from '../middleware/csrf'
import { CreateReviewSchema } from '../schemas/review.schema'
import { z } from 'zod'

const router = Router({ mergeParams: true })

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

router.get('/', optionalAuth, validate(ListQuerySchema, 'query'), asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string }
  const { page, limit } = req.query as unknown as { page: number; limit: number }
  const data = await reviewService.listReviews(productId, page, limit)
  sendSuccess(res, data.reviews, 200, data.meta)
}))

router.post('/', requireAuth, verifyCsrf, validate(CreateReviewSchema), asyncHandler(async (req, res) => {
  const { productId } = req.params as { productId: string }
  const review = await reviewService.createReview(productId, req.user!.id, req.body)
  sendCreated(res, review)
}))

router.delete('/:reviewId', requireAuth, verifyCsrf, asyncHandler(async (req, res) => {
  const { reviewId } = req.params as { reviewId: string }
  await reviewService.deleteReview(reviewId, req.user!.id, req.user!.role === 'admin')
  sendSuccess(res, { deleted: true })
}))

export default router
