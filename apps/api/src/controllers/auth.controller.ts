import type { Request, Response } from 'express'
import crypto from 'crypto'
import * as authService from '../services/auth.service'
import { User } from '../models/user.model'
import { ApiError } from '../utils/ApiError'
import { sendSuccess, sendCreated } from '../utils/response'
import { asyncHandler } from '../utils/asyncHandler'
import { env } from '../config/env'

function cookieOpts(ttlMs: number) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    maxAge: ttlMs,
  }
}

function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('access', tokens.accessToken, cookieOpts(15 * 60 * 1000))
  res.cookie('refresh', tokens.refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000))
  // Issue a CSRF double-submit token (readable by JS, validated on mutating requests)
  const csrfToken = crypto.randomBytes(32).toString('hex')
  res.cookie('csrf', csrfToken, {
    httpOnly: false,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access', { httpOnly: true, secure: env.NODE_ENV === 'production', path: '/' })
  res.clearCookie('refresh', { httpOnly: true, secure: env.NODE_ENV === 'production', path: '/' })
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body)
  setAuthCookies(res, tokens)
  sendCreated(res, user)
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body)
  setAuthCookies(res, tokens)
  sendSuccess(res, user)
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.id)
  clearAuthCookies(res)
  sendSuccess(res, { loggedOut: true })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies['refresh'] as string | undefined
  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'No refresh token' },
    })
    return
  }
  const { user, tokens } = await authService.refreshTokens(refreshToken)
  setAuthCookies(res, tokens)
  sendSuccess(res, user)
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id)
  sendSuccess(res, user)
})

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email)
  sendSuccess(res, { sent: true }) // Always 200 — no account enumeration
})

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password)
  sendSuccess(res, { reset: true })
})

// ── Address CRUD ──────────────────────────────────────────────────────────────

export const listAddresses = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).select('addresses').lean()
  sendSuccess(res, user?.addresses ?? [])
})

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.unauthenticated()
  const isFirst = user.addresses.length === 0
  const addr = { ...req.body, isDefault: isFirst || !!req.body.isDefault }
  if (addr.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false })
  }
  user.addresses.push(addr)
  await user.save()
  sendCreated(res, user.addresses[user.addresses.length - 1])
})

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.unauthenticated()
  const addr = user.addresses.find((a) => String(a._id) === req.params['id'])
  if (!addr) throw ApiError.notFound('Address')
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false })
  }
  Object.assign(addr, req.body)
  await user.save()
  sendSuccess(res, addr)
})

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id)
  if (!user) throw ApiError.unauthenticated()
  const idx = user.addresses.findIndex((a) => String(a._id) === req.params['id'])
  if (idx === -1) throw ApiError.notFound('Address')
  const wasDefault = user.addresses[idx].isDefault
  user.addresses.splice(idx, 1)
  // If deleted was default, promote first remaining
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true
  }
  await user.save()
  sendSuccess(res, { deleted: true })
})
