import { createServer } from 'http'
import app from './app'
import { connectDB, closeDB } from './config/db'
import { connectRedis, closeRedis } from './config/redis'
import { env } from './config/env'
import { initSocket } from './sockets'

async function start() {
  await connectDB()
  await connectRedis()

  const httpServer = createServer(app)
  const socketIo = initSocket(httpServer)

  httpServer.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`)
  })

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[api] ${signal} received — shutting down gracefully…`)

    await new Promise<void>((resolve) => socketIo.close(() => resolve()))
    await new Promise<void>((resolve) => httpServer.close(() => resolve()))
    await Promise.all([closeDB(), closeRedis()])
    // eslint-disable-next-line no-console
    console.log('[api] clean shutdown')
    process.exit(0)

    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('[api] forced shutdown after timeout')
      process.exit(1)
    }, 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('[api] unhandledRejection:', reason)
    void shutdown('unhandledRejection')
  })
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] startup failed:', err)
  process.exit(1)
})
