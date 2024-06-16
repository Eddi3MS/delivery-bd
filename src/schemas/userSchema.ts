import z from 'zod'

export const registerUserSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().min(1).email(),
  password: z.string().min(5),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().min(1).email().optional(),
  password: z.string().min(5).optional(),
  profilePic: z.string().min(10).optional(),
})

export const loginUserSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(5),
})
