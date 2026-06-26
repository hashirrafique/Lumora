import crypto from 'crypto'

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'LUM-'
  const bytes = crypto.randomBytes(6)
  for (let i = 0; i < 6; i++) {
    result += chars[bytes[i]! % chars.length]
  }
  return result
}
