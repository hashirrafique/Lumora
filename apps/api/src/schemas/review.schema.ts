import { z } from 'zod'

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(10).max(2000),
})

export const UpdateReviewSchema = z.object({
  isApproved: z.boolean(),
})

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>
