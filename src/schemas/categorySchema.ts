import z from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1),
})

export const updateCategoriesOrder = z.array(
  z.object({
    id: z.string().min(1),
    order: z.number(),
  })
)
