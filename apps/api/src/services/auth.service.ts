import crypto from 'crypto'
import { User, hashToken } from '../models/user.model'
import { hashPassword } from '../utils/password'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token'
import { ApiError } from '../utils/ApiError'
import type { RegisterInput, LoginInput } from '../schemas/auth.schema'
import { env } from '../config/env'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SafeUser {
  _id: string
  name: string
  email: string
  role: 'customer' | 'admin'
  avatarUrl?: string
  addresses: unknown[]
  isBanned: boolean
  createdAt: string
  updatedAt: string
}

async function toSafeUser(user: InstanceType<typeof User>): Promise<SafeUser> {
  const obj = user.toObject()
  return {
    _id: String(obj._id),
    name: obj.name,
    email: obj.email,
    role: obj.role,
    avatarUrl: obj.avatarUrl,
    addresses: obj.addresses ?? [],
    isBanned: obj.isBanned,
    createdAt: obj.createdAt?.toISOString(),
    updatedAt: obj.updatedAt?.toISOString(),
  }
}

function issueTokens(userId: string, role: 'customer' | 'admin'): AuthTokens {
  const accessToken = signAccessToken({ userId, role })
  const refreshToken = signRefreshToken({ userId, version: Date.now() })
  return { accessToken, refreshToken }
}

export async function register(input: RegisterInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const exists = await User.findOne({ email: input.email }).lean()
  if (exists) throw ApiError.conflict('Email already registered')

  const passwordHash = await hashPassword(input.password)
  const user = new User({ name: input.name, email: input.email, passwordHash })

  const tokens = issueTokens(String(user._id), user.role)
  user.refreshTokenHash = hashToken(tokens.refreshToken)
  await user.save()

  return { user: await toSafeUser(user), tokens }
}

export async function login(
  input: LoginInput
): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash')
  // Generic error — never reveal which field was wrong
  const genericErr = ApiError.unauthenticated('Invalid email or password')
  if (!user) throw genericErr

  const valid = await user.comparePassword(input.password)
  if (!valid) throw genericErr
  if (user.isBanned) throw ApiError.forbidden('Account suspended')

  const tokens = issueTokens(String(user._id), user.role)
  user.refreshTokenHash = hashToken(tokens.refreshToken)
  await user.save()

  return { user: await toSafeUser(user), tokens }
}

export async function refreshTokens(
  oldRefresh: string
): Promise<{ user: SafeUser; tokens: AuthTokens }> {
  let payload: { userId: string }
  try {
    payload = verifyRefreshToken(oldRefresh) as { userId: string }
  } catch {
    throw ApiError.unauthenticated('Invalid refresh token')
  }

  const user = await User.findById(payload.userId).select('+refreshTokenHash')
  if (!user) throw ApiError.unauthenticated()

  const incoming = hashToken(oldRefresh)
  // Refresh-reuse detection: token hash doesn't match → possible theft
  if (user.refreshTokenHash !== incoming) {
    user.refreshTokenHash = undefined
    await user.save()
    throw ApiError.unauthenticated('Session invalidated. Please log in again.')
  }

  const tokens = issueTokens(String(user._id), user.role)
  user.refreshTokenHash = hashToken(tokens.refreshToken)
  await user.save()

  return { user: await toSafeUser(user), tokens }
}

export async function logout(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } })
}

export async function getMe(userId: string): Promise<SafeUser> {
  const user = await User.findById(userId).lean()
  if (!user) throw ApiError.notFound('User')
  const { passwordHash: _p, refreshTokenHash: _r, resetTokenHash: _rt, ...safe } = user
  return { ...safe, _id: String(safe._id) } as unknown as SafeUser
}

export async function forgotPassword(email: string): Promise<{ token: string }> {
  const user = await User.findOne({ email })
  if (!user) {
    // No enumeration — always return success
    return { token: '' }
  }
  const rawToken = crypto.randomBytes(32).toString('hex')
  user.resetTokenHash = hashToken(rawToken)
  user.resetTokenExp = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  await user.save()

  if (env.RESEND_API_KEY) {
    // Future: send email via Resend
  } else {
    // eslint-disable-next-line no-console
    console.log(`[auth] reset token for ${email}: ${rawToken}`)
  }

  return { token: rawToken }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const tokenHash = hashToken(token)
  const user = await User.findOne({
    resetTokenHash: tokenHash,
    resetTokenExp: { $gt: new Date() },
  }).select('+resetTokenHash +resetTokenExp')

  if (!user) throw ApiError.badRequest('Invalid or expired reset token')

  user.passwordHash = await hashPassword(password)
  user.resetTokenHash = undefined
  user.resetTokenExp = undefined
  user.refreshTokenHash = undefined // Invalidate all sessions
  await user.save()
}
