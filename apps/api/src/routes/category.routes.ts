import { Router } from 'express'
import * as categoryController from '../controllers/category.controller'
import { requireAuth } from '../middleware/auth'
import { rbac } from '../middleware/rbac'
import { verifyCsrf } from '../middleware/csrf'

const router = Router()

router.get('/', categoryController.listCategories)
router.get('/:slug', categoryController.getCategory)

router.post('/', requireAuth, rbac('admin'), verifyCsrf, categoryController.createCategory)
router.patch('/:id', requireAuth, rbac('admin'), verifyCsrf, categoryController.updateCategory)
router.delete('/:id', requireAuth, rbac('admin'), verifyCsrf, categoryController.deleteCategory)

export default router
