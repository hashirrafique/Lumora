import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import { env } from './config/env'
import { httpLogger } from './config/logger'
import { getDBStatus } from './config/db'
import { getRedisStatus } from './config/redis'
import { requestId } from './middleware/requestId'
import { generalRateLimit } from './middleware/rateLimit'
import { notFound } from './middleware/notFound'
import { errorHandler } from './middleware/error'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import cartRoutes from './routes/cart.routes'
import wishlistRoutes from './routes/wishlist.routes'
import reviewRoutes from './routes/review.routes'
import orderRoutes from './routes/order.routes'
import adminRoutes from './routes/admin.routes'
import aiRoutes from './routes/ai.routes'

const app = express()

// ── Middleware (exact order from spec 08) ─────────────────────────────────────
app.use(requestId)
app.use(httpLogger)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
)
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = env.CORS_ORIGINS
      if (!origin || allowed.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: ${origin} not allowed`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'Retry-After'],
  })
)
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(mongoSanitize())
app.use(generalRateLimit)

// ── Health ─────────────────────────────────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      db: getDBStatus(),
      redis: getRedisStatus(),
      uptime: process.uptime(),
      env: env.NODE_ENV,
    },
  })
})

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/cart', cartRoutes)
app.use('/api/v1/wishlist', wishlistRoutes)
app.use('/api/v1/products/:productId/reviews', reviewRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/ai', aiRoutes)

// ── Fallbacks ──────────────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
