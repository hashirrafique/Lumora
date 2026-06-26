import type { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { env } from '../config/env'
import { verifyAccessToken } from '../utils/token'

export let io: SocketServer

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  })

  io.use((socket, next) => {
    // Auth is optional — unauthenticated connections get public rooms only
    const token =
      socket.handshake.auth['token'] as string | undefined ??
      (socket.handshake.headers['cookie'] as string | undefined)
        ?.split(';')
        .find((c) => c.trim().startsWith('access='))
        ?.split('=')[1]

    if (token) {
      try {
        const payload = verifyAccessToken(token)
        socket.data.userId = payload.userId
        socket.data.role = payload.role
      } catch {
        // Invalid token — proceed as unauthenticated
      }
    }
    next()
  })

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string | undefined
    const role = socket.data.role as string | undefined

    if (userId) {
      void socket.join(`user:${userId}`)
    }
    if (role === 'admin') {
      void socket.join('admin')
    }

    // Client can subscribe to specific product stock updates
    socket.on('subscribe:product', (productId: string) => {
      if (typeof productId === 'string' && productId.length === 24) {
        void socket.join(`product:${productId}`)
      }
    })
    socket.on('unsubscribe:product', (productId: string) => {
      void socket.leave(`product:${productId}`)
    })
  })

  return io
}

// ── Emit helpers (called from services) ─────────────────────────────────────

export function emitStockUpdate(productId: string, stock: number): void {
  if (!io) return
  io.to(`product:${productId}`).emit('stock:update', { productId, stock })
  io.to('admin').emit('stock:update', { productId, stock })
}

export function emitOrderStatus(
  userId: string,
  orderNumber: string,
  status: string,
  at: Date
): void {
  if (!io) return
  io.to(`user:${userId}`).emit('order:status', { orderNumber, status, at: at.toISOString() })
  io.to('admin').emit('order:status', { orderNumber, status, at: at.toISOString() })
}
