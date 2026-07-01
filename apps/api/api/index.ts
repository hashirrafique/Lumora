// Vercel serverless entry-point — wraps the Express app.
// MongoDB connection is cached across warm function invocations.
// Socket.io real-time features are not available in serverless mode.
import type { IncomingMessage, ServerResponse } from 'http'
import { connectDB } from '../src/config/db'
import app from '../src/app'

let isConnected = false

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!isConnected) {
    await connectDB()
    isConnected = true
  }
  return new Promise<void>((resolve, reject) => {
    ;(app as any)(req, res, (err: unknown) => {
      if (err) reject(err)
      else resolve()
    })
  })
}
