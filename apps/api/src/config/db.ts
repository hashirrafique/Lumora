import mongoose from 'mongoose'
import { env } from './env'

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) return

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })

  isConnected = true
  // eslint-disable-next-line no-console
  console.log('[db] connected to MongoDB')
}

export function getDBStatus(): 'up' | 'down' {
  return mongoose.connection.readyState === 1 ? 'up' : 'down'
}

export async function closeDB(): Promise<void> {
  await mongoose.disconnect()
  isConnected = false
}
