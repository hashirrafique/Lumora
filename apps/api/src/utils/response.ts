import type { Response } from 'express'
import type { PaginationMeta } from '@lumora/types'

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): void {
  const payload: Record<string, unknown> = { success: true, data }
  if (meta) payload['meta'] = meta
  res.status(statusCode).json(payload)
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201)
}
