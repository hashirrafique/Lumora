import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { getRedis } from '../config/redis'
import { env } from '../config/env'

function makeStore(prefix: string) {
  if (env.NODE_ENV === 'test') return undefined // use memory store in tests
  return new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => getRedis().call(args[0]!, ...args.slice(1)) as any,
    prefix: `rl:${prefix}:`,
  })
}

export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('auth'),
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many auth attempts. Try again in a minute.' },
  },
})

export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('general'),
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests.' },
  },
})

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anon',
  store: makeStore('ai'),
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'AI chat limit reached. Try again shortly.' },
  },
})
