import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { ApiError } from '../utils/ApiError'
import { env } from '../config/env'

const CSRF_COOKIE = 'csrf'
const CSRF_HEADER = 'x-csrf-token'
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Issue a CSRF token if not present (called on authenticated requests)
export function issueCsrf(req: Request, res: Response, next: NextFunction): void {
  if (!req.cookies[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex')
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // Must be readable by JS
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  }
  next()
}

// Verify CSRF on state-changing requests (SameSite=None cookies require this)
export function verifyCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (!MUTATING_METHODS.has(req.method)) return next()

  const cookieToken = req.cookies[CSRF_COOKIE] as string | undefined
  const headerToken = req.headers[CSRF_HEADER] as string | undefined

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(ApiError.forbidden('CSRF token mismatch'))
  }
  next()
}
