import z from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1),
  price: z.number().min(100),
  description: z.string().min(1),
  category: z.string().min(1),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().min(1).optional(),
  price: z.number().min(100).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
})
