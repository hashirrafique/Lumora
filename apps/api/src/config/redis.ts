import Redis from 'ioredis'
import { env } from './env'

let client: Redis | null = null

export function getRedis(): Redis {
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

export function getRedisStatus(): 'up' | 'down' {
  if (!client) return 'down'
  return client.status === 'ready' ? 'up' : 'down'
}

export async function connectRedis(): Promise<void> {
  const r = getRedis()
  await r.connect()
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit()
    client = null
  }
}
