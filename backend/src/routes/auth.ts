import { Hono } from 'hono'
import { loginSchema, registerSchema } from '../schemas/auth.js'
import { loginStudent, registerStudent } from '../services/auth.js'
import { authMiddleware } from '../middleware/auth.js'
import type { AppEnv } from '../types/app.js'
import { AppError } from '../utils/errors.js'

export const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Los datos de inicio de sesión no son válidos')
  }

  const data = await loginStudent(parsed.data)
  return c.json({ success: true, data })
})

authRoutes.post('/register', async (c) => {
  const parsed = registerSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos de registro no son válidos')
  try {
    return c.json({ success: true, data: await registerStudent(parsed.data) }, 201)
  } catch (error: any) {
    if (error?.code === '23505') throw new AppError(409, 'REGISTRATION_CONFLICT', 'El número de registro ya está registrado')
    throw error
  }
})

authRoutes.post('/logout', authMiddleware, (c) => {
  return c.json({ success: true, data: { message: 'Sesión cerrada correctamente' } })
})
