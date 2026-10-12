import { Hono } from 'hono'
import { loginSchema } from '../schemas/auth.js'
import { loginStudent } from '../services/auth.js'
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

authRoutes.post('/logout', authMiddleware, (c) => {
  return c.json({ success: true, data: { message: 'Sesión cerrada correctamente' } })
})
