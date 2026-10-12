import { z } from 'zod'

export const loginSchema = z.object({
  numeroRegistro: z.string().regex(/^\d{8,20}$/),
  contrasena: z.string().min(1).max(72),
})

export type LoginInput = z.infer<typeof loginSchema>
