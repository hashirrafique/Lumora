import { Router } from 'express'
import * as wishlistController from '../controllers/wishlist.controller'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { verifyCsrf } from '../middleware/csrf'
import { z } from 'zod'

const router = Router()

router.use(requireAuth)

router.get('/', wishlistController.getWishlist)
router.post(
  '/toggle',
  verifyCsrf,
  validate(z.object({ productId: z.string().length(24) })),
  wishlistController.toggleWishlist
)

export default router
