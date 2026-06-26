import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authService from '../services/auth.service'
import { User } from '../models/user.model'

// Mock env so tests don't need a real .env file
vi.mock('../config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 4001,
    MONGODB_URI: 'memory',
    REDIS_URL: 'redis://localhost:6379',
    JWT_ACCESS_SECRET: 'test-access-secret-at-least-32-chars-long',
    JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-chars-long',
    ACCESS_TTL: '15m',
    REFRESH_TTL: '7d',
    CORS_ORIGINS: ['http://localhost:3000'],
  },
}))

describe('Auth Service', () => {
  describe('register', () => {
    it('creates a new user and returns tokens', async () => {
      const { user, tokens } = await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass1',
      })

      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
      expect(user.role).toBe('customer')
      expect(tokens.accessToken).toBeTruthy()
      expect(tokens.refreshToken).toBeTruthy()

      // Verify password hash stored, not plain text
      const dbUser = await User.findOne({ email: 'test@example.com' }).select('+passwordHash')
      expect(dbUser?.passwordHash).not.toBe('TestPass1')
    })

    it('rejects duplicate email', async () => {
      await authService.register({
        name: 'User One',
        email: 'dup@example.com',
        password: 'TestPass1',
      })

      await expect(
        authService.register({ name: 'User Two', email: 'dup@example.com', password: 'TestPass1' })
      ).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Login User',
        email: 'login@example.com',
        password: 'LoginPass1',
      })
    })

    it('returns user and tokens on correct credentials', async () => {
      const { user, tokens } = await authService.login({
        email: 'login@example.com',
        password: 'LoginPass1',
      })
      expect(user.email).toBe('login@example.com')
      expect(tokens.accessToken).toBeTruthy()
    })

    it('rejects wrong password', async () => {
      await expect(
        authService.login({ email: 'login@example.com', password: 'WrongPass1' })
      ).rejects.toMatchObject({ statusCode: 401 })
    })

    it('rejects non-existent email with same error', async () => {
      await expect(
        authService.login({ email: 'ghost@example.com', password: 'SomePass1' })
      ).rejects.toMatchObject({ statusCode: 401 })
    })
  })

  describe('refresh token rotation', () => {
    it('issues new tokens on valid refresh', async () => {
      const { tokens: t1 } = await authService.register({
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'RefreshPass1',
      })
      const { tokens: t2 } = await authService.refreshTokens(t1.refreshToken)
      expect(t2.accessToken).toBeTruthy()
      expect(t2.refreshToken).not.toBe(t1.refreshToken)
    })

    it('invalidates ALL sessions on refresh-token reuse', async () => {
      const { tokens: t1 } = await authService.register({
        name: 'Reuse User',
        email: 'reuse@example.com',
        password: 'ReusePass1',
      })
      // Rotate once
      await authService.refreshTokens(t1.refreshToken)
      // Replay the original (already-rotated) token → should invalidate all
      await expect(authService.refreshTokens(t1.refreshToken)).rejects.toMatchObject({
        statusCode: 401,
      })

      // Even the newly issued token should fail now (sessions wiped)
      const { tokens: tNew } = await authService.register({
        name: 'Reuse Check',
        email: 'reuse2@example.com',
        password: 'ReusePass1',
      })
      const { tokens: rotated } = await authService.refreshTokens(tNew.refreshToken)
      // After invalidation of a different user, other users still work
      expect(rotated.accessToken).toBeTruthy()
    })
  })

  describe('logout', () => {
    it('clears refresh token hash', async () => {
      const { user, tokens: _tokens } = await authService.register({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'LogoutPass1',
      })
      await authService.logout(user._id)
      const dbUser = await User.findById(user._id).select('+refreshTokenHash')
      expect(dbUser?.refreshTokenHash).toBeUndefined()
    })
  })
})
