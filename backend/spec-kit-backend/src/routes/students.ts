import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { profileSchema } from '../schemas/academic.js'
import { getProfile, updateProfile } from '../services/academic.js'
import { AppError } from '../utils/errors.js'

export const studentRoutes = new Hono<AppEnv>()

studentRoutes.get('/me', async (c) => {
  return c.json({ success: true, data: await getProfile(c.get('studentId')) })
})

studentRoutes.patch('/me', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos del perfil no son válidos')
  return c.json({ success: true, data: await updateProfile(c.get('studentId'), parsed.data) })
})
