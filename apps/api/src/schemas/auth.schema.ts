import { z } from 'zod'

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const RegisterSchema = z.object({
  name: z.string().min(2).max(60).trim(),
  email: z.string().email().toLowerCase(),
  password: passwordRule,
})

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordRule,
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
