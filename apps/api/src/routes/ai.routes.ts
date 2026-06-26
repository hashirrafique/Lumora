import { Router } from 'express'
import { z } from 'zod'
import { optionalAuth } from '../middleware/auth'
import { aiRateLimit } from '../middleware/rateLimit'
import { validate } from '../middleware/validate'
import { asyncHandler } from '../utils/asyncHandler'
import { streamChat } from '../services/ai.service'
import type { Request, Response } from 'express'
import OpenAI from 'openai'

const router = Router()

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(40),
  sessionId: z.string().max(64).optional(),
})

router.post(
  '/chat',
  aiRateLimit,
  optionalAuth,
  validate(ChatSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { messages } = req.body as z.infer<typeof ChatSchema>

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    const userId = req.user?.id

    await streamChat(
      messages as OpenAI.Chat.ChatCompletionMessageParam[],
      userId,
      res
    )

    res.end()
  })
)

export default router
