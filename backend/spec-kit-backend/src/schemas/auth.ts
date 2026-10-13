import { z } from 'zod'

export const loginSchema = z.object({
  numeroRegistro: z.string().regex(/^\d{8,20}$/),
  contrasena: z.string().min(1).max(72),
})

export const registerSchema = z.object({
  numeroRegistro: z.string().regex(/^\d{8,20}$/),
  nombres: z.string().trim().min(2).max(100),
  apellidos: z.string().trim().min(2).max(100),
  numeroCelular: z.string().regex(/^[0-9+() -]{7,20}$/),
  contrasena: z.string().min(8).max(72),
})

export type LoginInput = z.infer<typeof loginSchema>
