import { Router } from 'express'
import * as cartController from '../controllers/cart.controller'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { verifyCsrf } from '../middleware/csrf'
import {
  AddCartItemSchema,
  UpdateCartItemSchema,
  ApplyCouponSchema,
  MergeCartSchema,
} from '../schemas/cart.schema'

const router = Router()

// All cart routes require authentication
router.use(requireAuth)

router.get('/', cartController.getCart)
router.post('/items', verifyCsrf, validate(AddCartItemSchema), cartController.addItem)
router.patch(
  '/items/:productId',
  verifyCsrf,
  validate(UpdateCartItemSchema),
  cartController.updateItem
)
router.delete('/items/:productId', verifyCsrf, cartController.removeItem)
router.delete('/', verifyCsrf, cartController.clearCart)
router.post('/coupon', verifyCsrf, validate(ApplyCouponSchema), cartController.applyCoupon)
router.delete('/coupon', verifyCsrf, cartController.removeCoupon)
router.post('/merge', verifyCsrf, validate(MergeCartSchema), cartController.mergeCart)

export default router
