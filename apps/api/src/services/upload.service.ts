import { createHmac } from 'crypto'
import { ApiError } from '../utils/ApiError'
import { env } from '../config/env'

export function signUpload(folder = 'lumora'): {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
} {
  if (!env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_CLOUD_NAME) {
    throw ApiError.internal('Cloudinary is not configured')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = createHmac('sha256', env.CLOUDINARY_API_SECRET)
    .update(paramsToSign)
    .digest('hex')

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder,
  }
}

