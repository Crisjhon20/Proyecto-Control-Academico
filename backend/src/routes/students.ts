import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { profileSchema } from '../schemas/academic.js'
import { getProfile, getProfilePhoto, saveProfilePhoto, updateProfile } from '../services/academic.js'
import { AppError } from '../utils/errors.js'

export const studentRoutes = new Hono<AppEnv>()

studentRoutes.get('/me', async (c) => {
  return c.json({ success: true, data: await getProfile(c.get('studentId')) })
})

studentRoutes.get('/me/photo', async (c) => {
  const photo = await getProfilePhoto(c.get('studentId'))
  if (!photo?.data) return c.json({ success: false, error: { code: 'PHOTO_NOT_FOUND', message: 'El estudiante no tiene foto de perfil' } }, 404)
  return new Response(photo.data, { headers: { 'Content-Type': photo.mimeType, 'Cache-Control': 'private, max-age=300' } })
})

studentRoutes.put('/me/photo', async (c) => {
  const body = await c.req.parseBody()
  const file = body.photo
  if (!(file instanceof File)) throw new AppError(400, 'PHOTO_REQUIRED', 'Debes seleccionar una imagen')
  return c.json({ success: true, data: await saveProfilePhoto(c.get('studentId'), file) })
})

studentRoutes.patch('/me', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos del perfil no son válidos')
  return c.json({ success: true, data: await updateProfile(c.get('studentId'), parsed.data) })
})
