import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { scheduleSchema } from '../schemas/academic.js'
import { changeSchedule, removeSchedule } from '../services/academic.js'
import { AppError } from '../utils/errors.js'

function parseId(value: string | undefined) {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'INVALID_ID', 'Identificador de horario inválido')
  return id
}

export const scheduleRoutes = new Hono<AppEnv>()

scheduleRoutes.patch('/:id', async (c) => {
  const parsed = scheduleSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos del horario no son válidos')
  return c.json({ success: true, data: await changeSchedule(c.get('studentId'), parseId(c.req.param('id')), parsed.data) })
})

scheduleRoutes.delete('/:id', async (c) => {
  return c.json({ success: true, data: await removeSchedule(c.get('studentId'), parseId(c.req.param('id'))) })
})
