import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { createAcademicPeriod, closeAcademicPeriod, getAcademicPeriods, getCurrentAcademicPeriod } from '../services/academic.js'
import { periodSchema } from '../schemas/academic.js'
import { AppError } from '../utils/errors.js'

export const periodRoutes = new Hono<AppEnv>()

periodRoutes.get('/', async (c) => c.json({ success: true, data: await getAcademicPeriods(c.get('studentId')) }))
periodRoutes.get('/current', async (c) => c.json({ success: true, data: await getCurrentAcademicPeriod(c.get('studentId')) }))
periodRoutes.post('/', async (c) => {
  const parsed = periodSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Los datos del periodo no son válidos')
  return c.json({ success: true, data: await createAcademicPeriod(c.get('studentId'), parsed.data) }, 201)
})
periodRoutes.post('/:id/close', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'INVALID_ID', 'Identificador de periodo inválido')
  return c.json({ success: true, data: await closeAcademicPeriod(c.get('studentId'), id) })
})
