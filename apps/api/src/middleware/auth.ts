import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/token'
import { ApiError } from '../utils/ApiError'
import { User } from '../models/user.model'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: 'customer' | 'admin'
        isBanned: boolean
      }
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = req.cookies['access'] as string | undefined
    if (!token) throw ApiError.unauthenticated()

    const payload = verifyAccessToken(token)
    req.user = { id: payload.userId, role: payload.role, isBanned: false }
    next()
  } catch {
    next(ApiError.unauthenticated())
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = req.cookies['access'] as string | undefined
    if (token) {
      const payload = verifyAccessToken(token)
      req.user = { id: payload.userId, role: payload.role, isBanned: false }
    }
  } catch {
    // ignore — optional
  }
  next()
}

// Additional check: reject banned users (call after requireAuth when needed)
export async function rejectBanned(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) return next()
  try {
    const user = await User.findById(req.user.id).select('isBanned').lean()
    if (user?.isBanned) return next(ApiError.forbidden('Your account has been suspended'))
    next()
  } catch {
    next()
  }
}
