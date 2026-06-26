import { Router } from 'express'
import * as orderController from '../controllers/order.controller'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { verifyCsrf } from '../middleware/csrf'
import { CreateOrderSchema } from '../schemas/order.schema'
import { z } from 'zod'

const router = Router()

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

router.use(requireAuth)

router.post('/', verifyCsrf, validate(CreateOrderSchema), orderController.createOrder)
router.get('/', validate(ListQuerySchema, 'query'), orderController.listOrders)
router.get('/:orderNumber', orderController.getOrder)

export default router
