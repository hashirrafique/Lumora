import { Router } from 'express'
import * as productController from '../controllers/product.controller'
import { requireAuth } from '../middleware/auth'
import { rbac } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { verifyCsrf } from '../middleware/csrf'
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductListQuerySchema,
} from '../schemas/product.schema'

const router = Router()

router.get('/', validate(ProductListQuerySchema, 'query'), productController.listProducts)
router.get('/featured', productController.getFeatured)
router.get('/bestsellers', productController.getBestsellers)
router.get('/:slug', productController.getProduct)

// Admin-only mutations
router.post(
  '/',
  requireAuth,
  rbac('admin'),
  verifyCsrf,
  validate(CreateProductSchema),
  productController.createProduct
)
router.patch(
  '/:id',
  requireAuth,
  rbac('admin'),
  verifyCsrf,
  validate(UpdateProductSchema),
  productController.updateProduct
)
router.delete(
  '/:id',
  requireAuth,
  rbac('admin'),
  verifyCsrf,
  productController.deleteProduct
)

export default router
