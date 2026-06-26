import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { authRateLimit } from '../middleware/rateLimit'
import { verifyCsrf } from '../middleware/csrf'
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../schemas/auth.schema'

const router = Router()

router.post('/register', authRateLimit, validate(RegisterSchema), authController.register)
router.post('/login', authRateLimit, validate(LoginSchema), authController.login)
router.post('/logout', requireAuth, verifyCsrf, authController.logout)
router.post('/refresh', authController.refresh)
router.get('/me', requireAuth, authController.me)
router.post(
  '/forgot-password',
  authRateLimit,
  validate(ForgotPasswordSchema),
  authController.forgotPassword
)
router.post(
  '/reset-password',
  authRateLimit,
  validate(ResetPasswordSchema),
  authController.resetPassword
)

// Addresses
router.get('/me/addresses', requireAuth, authController.listAddresses)
router.post('/me/addresses', requireAuth, verifyCsrf, authController.addAddress)
router.patch('/me/addresses/:id', requireAuth, verifyCsrf, authController.updateAddress)
router.delete('/me/addresses/:id', requireAuth, verifyCsrf, authController.deleteAddress)

export default router
