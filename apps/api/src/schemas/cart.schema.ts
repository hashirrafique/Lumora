import { z } from 'zod'

const VariantSchema = z.object({
  name: z.string().max(50),
  value: z.string().max(50),
})

export const AddCartItemSchema = z.object({
  productId: z.string().length(24),
  qty: z.number().int().min(1).max(999),
  variant: VariantSchema.optional(),
})

export const UpdateCartItemSchema = z.object({
  qty: z.number().int().min(0).max(999),
})

export const ApplyCouponSchema = z.object({
  code: z.string().min(1).max(30).toUpperCase(),
})

export const MergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().length(24),
        qty: z.number().int().min(1).max(999),
        variant: VariantSchema.optional(),
      })
    )
    .max(100),
})

export type AddCartItemInput = z.infer<typeof AddCartItemSchema>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>
