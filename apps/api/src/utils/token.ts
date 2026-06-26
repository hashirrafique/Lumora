import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AccessTokenPayload {
  userId: string
  role: 'customer' | 'admin'
}

export interface RefreshTokenPayload {
  userId: string
  version: number
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TTL as jwt.SignOptions['expiresIn'],
    issuer: 'lumora',
    audience: 'lumora-client',
  })
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TTL as jwt.SignOptions['expiresIn'],
    issuer: 'lumora',
    audience: 'lumora-client',
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'lumora',
    audience: 'lumora-client',
  }) as AccessTokenPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'lumora',
    audience: 'lumora-client',
  }) as RefreshTokenPayload
}
