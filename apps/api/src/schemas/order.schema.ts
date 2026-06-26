import { z } from 'zod'

const AddressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  line1: z.string().min(5).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(2).max(20),
  country: z.string().min(2).max(100),
  isDefault: z.boolean().default(false),
})

const ShippingMethodSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().min(0),
  etaDays: z.number().int().min(0),
})

const PaymentSchema = z.object({
  number: z.string().min(13).max(19).regex(/^\d+$/, 'Card number must be digits only'),
  exp: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be MM/YY'),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVC must be 3-4 digits'),
  name: z.string().min(2).max(100),
})

export const CreateOrderSchema = z.object({
  shippingAddress: AddressSchema,
  shippingMethod: ShippingMethodSchema,
  payment: PaymentSchema,
})

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['placed', 'packed', 'shipped', 'delivered', 'cancelled']),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>
