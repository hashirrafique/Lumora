// Inlined from @lumora/types — keeps the API self-contained for serverless deployment
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
