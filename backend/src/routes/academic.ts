import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { addManualHistory, editManualHistory, findGrades, findHistory, findSchedule, removeManualHistory } from '../services/academic.js'
import { manualHistorySchema } from '../schemas/academic.js'
import { AppError } from '../utils/errors.js'

function parseOptionalId(value: string | undefined) {
  if (value === undefined) return undefined
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'INVALID_ID', 'Identificador inválido')
  return id
}

export const academicRoutes = new Hono<AppEnv>()

academicRoutes.get('/history', async (c) => c.json({ success: true, data: await findHistory(c.get('studentId')) }))
academicRoutes.get('/grades', async (c) => c.json({ success: true, data: await findGrades(c.get('studentId'), parseOptionalId(c.req.query('inscripcionId'))) }))
academicRoutes.get('/schedule', async (c) => c.json({ success: true, data: await findSchedule(c.get('studentId'), parseOptionalId(c.req.query('periodoId'))) }))
academicRoutes.post('/history/manual', async (c) => {
  const parsed = manualHistorySchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Los datos del historial no son válidos')
  return c.json({ success: true, data: await addManualHistory(c.get('studentId'), parsed.data) }, 201)
})
academicRoutes.patch('/history/manual/:id', async (c) => {
  const id = parseOptionalId(c.req.param('id'))
  const parsed = manualHistorySchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Los datos del historial no son válidos')
  return c.json({ success: true, data: await editManualHistory(c.get('studentId'), id!, parsed.data) })
})
academicRoutes.delete('/history/manual/:id', async (c) => {
  const id = parseOptionalId(c.req.param('id'))
  return c.json({ success: true, data: await removeManualHistory(c.get('studentId'), id!) })
})
