import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import { env } from '../config/env'

// Central error handler — must have 4 params for Express to recognize it
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Mongoose duplicate key
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('code' in err && (err as any).code === 11000) {
    const field = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {})[0] ?? 'field'
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      },
    })
    return
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: Object.values((err as { errors?: Record<string, { message: string }> }).errors ?? {}).map(
          (e) => ({ message: e.message })
        ),
      },
    })
    return
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired token' },
    })
    return
  }

  if (err instanceof ApiError) {
    if ('retryAfter' in err) {
      res.setHeader('Retry-After', String((err as ApiError & { retryAfter: number }).retryAfter))
    }
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    })
    return
  }

  // Log unexpected errors with request id
  const requestId = req.requestId ?? 'unknown'
  // eslint-disable-next-line no-console
  console.error(`[error][${requestId}]`, err)

  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      ...(env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
    },
  })
}
