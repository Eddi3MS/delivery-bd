import z from 'zod'
import { createAddressSchema } from './addressSchema'

const orderItemSchema = z.object({
  product: z.string().min(1),
  quantity: z.number(),
  price: z.number(),
})

export const createOrderSchema = z.object({
  address: createAddressSchema,
  items: z.array(orderItemSchema).min(1),
  total: z.number(),
})

export const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED']),
  message: z.string().optional(),
})
