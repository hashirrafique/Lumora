import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { z, type ZodSchema } from 'zod'
import { ApiError } from '../utils/ApiError'

type Target = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: Target = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return next(
        new ApiError('VALIDATION_ERROR', 'Validation failed', 400, details)
      )
    }
    // Overwrite with parsed (coerced + stripped) data
    req[target] = result.data as Request[typeof target]
    next()
  }
}

export { z }
