import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { verifyCsrf } from '../middleware/csrf'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/response'
import { UpdateOrderStatusSchema } from '../schemas/order.schema'
import * as orderService from '../services/order.service'
import * as analyticsService from '../services/analytics.service'
import * as userService from '../services/user.service'
import * as reviewService from '../services/review.service'
import * as uploadService from '../services/upload.service'
import { Coupon } from '../models/coupon.model'

const router = Router()

router.use(requireAuth)
router.use((req, _res, next) => {
  if (req.user?.role !== 'admin') {
    next(Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'FORBIDDEN' }))
    return
  }
  next()
})

// ── Analytics ─────────────────────────────────────────────────────────────────

const OverviewQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
})

router.get(
  '/stats/overview',
  validate(OverviewQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { days } = req.query as unknown as { days: number }
    const data = await analyticsService.getOverview(days)
    sendSuccess(res, data)
  })
)

router.get(
  '/stats/sales',
  validate(OverviewQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { days } = req.query as unknown as { days: number }
    const data = await analyticsService.getSalesTimeSeries(days)
    sendSuccess(res, data)
  })
)

router.get(
  '/stats/top',
  asyncHandler(async (_req, res) => {
    const data = await analyticsService.getTop()
    sendSuccess(res, data)
  })
)

// ── Orders ────────────────────────────────────────────────────────────────────

const AdminOrderQuerySchema = z.object({
  status: z.enum(['placed', 'packed', 'shipped', 'delivered', 'cancelled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

router.get(
  '/orders',
  validate(AdminOrderQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query as unknown as {
      status?: string
      page: number
      limit: number
    }
    const { orders, meta } = await orderService.listAllOrders(status, page, limit)
    sendSuccess(res, { data: orders, meta })
  })
)

router.patch(
  '/orders/:id/status',
  verifyCsrf,
  validate(UpdateOrderStatusSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const { status } = req.body as { status: string }
    const order = await orderService.updateOrderStatus(id, status)
    sendSuccess(res, order)
  })
)

// ── Users ─────────────────────────────────────────────────────────────────────

const UserListQuerySchema = z.object({
  q: z.string().max(100).optional(),
  role: z.enum(['customer', 'admin']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const UpdateUserSchema = z.object({
  role: z.enum(['customer', 'admin']).optional(),
  isBanned: z.boolean().optional(),
})

router.get(
  '/users',
  validate(UserListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const { q, role, page, limit } = req.query as unknown as {
      q?: string
      role?: string
      page: number
      limit: number
    }
    const { users, meta } = await userService.listUsers(q, role, page, limit)
    sendSuccess(res, { data: users, meta })
  })
)

router.patch(
  '/users/:id',
  verifyCsrf,
  validate(UpdateUserSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const user = await userService.updateUserAdmin(
      id,
      req.body as { role?: 'customer' | 'admin'; isBanned?: boolean }
    )
    sendSuccess(res, user)
  })
)

// ── Reviews ───────────────────────────────────────────────────────────────────

const AdminReviewListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isApproved: z.enum(['true', 'false', 'all']).default('all'),
})

const ApproveReviewSchema = z.object({
  isApproved: z.boolean(),
})

router.get(
  '/reviews',
  validate(AdminReviewListSchema, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, isApproved } = req.query as unknown as {
      page: number
      limit: number
      isApproved: string
    }
    const data = await reviewService.listAllReviews(
      isApproved === 'all' ? undefined : isApproved === 'true',
      page,
      limit
    )
    sendSuccess(res, { data: data.reviews, meta: data.meta })
  })
)

router.patch(
  '/reviews/:id',
  verifyCsrf,
  validate(ApproveReviewSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const { isApproved } = req.body as { isApproved: boolean }
    const review = await reviewService.approveReview(id, isApproved)
    sendSuccess(res, review)
  })
)

router.delete(
  '/reviews/:id',
  verifyCsrf,
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    await reviewService.deleteReview(id, req.user!.id, true)
    sendSuccess(res, { deleted: true })
  })
)

// ── Uploads ───────────────────────────────────────────────────────────────────

router.post(
  '/uploads/sign',
  verifyCsrf,
  asyncHandler(async (req, res) => {
    const { folder } = (req.body as { folder?: string }) ?? {}
    const params = uploadService.signUpload(folder)
    sendSuccess(res, params)
  })
)

// ── Coupons ───────────────────────────────────────────────────────────────────

const CreateCouponSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase(),
  type: z.enum(['percent', 'fixed']),
  value: z.number().positive(),
  minSubtotal: z.number().min(0).default(0),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
})

const UpdateCouponSchema = CreateCouponSchema.partial()

router.get(
  '/coupons',
  asyncHandler(async (_req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    sendSuccess(res, coupons)
  })
)

router.post(
  '/coupons',
  verifyCsrf,
  validate(CreateCouponSchema),
  asyncHandler(async (req, res) => {
    const coupon = await Coupon.create(req.body)
    sendSuccess(res, coupon, 201)
  })
)

router.patch(
  '/coupons/:id',
  verifyCsrf,
  validate(UpdateCouponSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true })
    if (!coupon)
      throw Object.assign(new Error('Coupon not found'), { statusCode: 404, code: 'NOT_FOUND' })
    sendSuccess(res, coupon)
  })
)

router.delete(
  '/coupons/:id',
  verifyCsrf,
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string }
    await Coupon.findByIdAndDelete(id)
    sendSuccess(res, { deleted: true })
  })
)

export default router
