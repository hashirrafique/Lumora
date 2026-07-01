import type { ErrorCode } from '../types'

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: ErrorCode
  public readonly details?: unknown[]
  public readonly isOperational: boolean

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    details?: unknown[],
    isOperational = true
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message: string, details?: unknown[]): ApiError {
    return new ApiError('VALIDATION_ERROR', message, 400, details)
  }

  static unauthenticated(message = 'Authentication required'): ApiError {
    return new ApiError('UNAUTHENTICATED', message, 401)
  }

  static forbidden(message = 'Insufficient permissions'): ApiError {
    return new ApiError('FORBIDDEN', message, 403)
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError('NOT_FOUND', `${resource} not found`, 404)
  }

  static conflict(message: string): ApiError {
    return new ApiError('CONFLICT', message, 409)
  }

  static rateLimited(retryAfter?: number): ApiError {
    const err = new ApiError('RATE_LIMITED', 'Too many requests', 429)
    if (retryAfter) {
      // attach for header use
      Object.assign(err, { retryAfter })
    }
    return err
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError('SERVER_ERROR', message, 500, undefined, false)
  }
}
