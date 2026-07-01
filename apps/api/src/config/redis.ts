import Redis from 'ioredis'
import { env } from './env'

let client: Redis | null = null

export function getRedis(): Redis | null {
  if (!env.REDIS_URL) return null
  if (!client) {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    })

    client.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('[redis] connected')
    })

    client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[redis] error:', err.message)
    })
  }
  return client
}

export function getRedisStatus(): 'up' | 'down' | 'disabled' {
  if (!env.REDIS_URL) return 'disabled'
  if (!client) return 'down'
  return client.status === 'ready' ? 'up' : 'down'
}

export async function connectRedis(): Promise<void> {
  if (!env.REDIS_URL) {
    // eslint-disable-next-line no-console
    console.log(
      '[redis] REDIS_URL not set — running without Redis (rate-limit falls back to memory)'
    )
    return
  }
  const r = getRedis()!
  await r.connect()
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit()
    client = null
  }
}
