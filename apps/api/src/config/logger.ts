import morgan from 'morgan'
import { env } from './env'

// Compact JSON-like log for production, dev-friendly for development
const format = env.NODE_ENV === 'production'
  ? ':remote-addr :method :url :status :res[content-length] - :response-time ms'
  : 'dev'

export const httpLogger = morgan(format, {
  skip: (_req, res) => env.NODE_ENV === 'test' && res.statusCode < 400,
})
