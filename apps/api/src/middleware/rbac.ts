import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { ApiError } from '../utils/ApiError'

export function rbac(role: 'admin' | 'customer'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthenticated())
    if (role === 'admin' && req.user.role !== 'admin') {
      return next(ApiError.forbidden())
    }
    next()
  }
}
