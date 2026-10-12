import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { enrollmentSchema } from '../schemas/academic.js'
import { scheduleSchema } from '../schemas/academic.js'
import { evaluationsSchema } from '../schemas/academic.js'
import { addSchedule, enroll, getAvailableSubjects, getEnrollmentEvaluations, getEnrollmentList, saveEnrollmentEvaluations, withdraw } from '../services/academic.js'
import { AppError } from '../utils/errors.js'

function parseOptionalId(value: string | undefined) {
  if (value === undefined) return undefined
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'INVALID_ID', 'Identificador de periodo inválido')
  return id
}

function parseId(value: string) {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'INVALID_ID', 'Identificador de inscripción inválido')
  return id
}

export const enrollmentRoutes = new Hono<AppEnv>()

enrollmentRoutes.get('/', async (c) => {
  const periodId = parseOptionalId(c.req.query('periodoId'))
  return c.json({ success: true, data: await getEnrollmentList(c.get('studentId'), periodId) })
})

enrollmentRoutes.get('/available', async (c) => {
  const periodId = parseOptionalId(c.req.query('periodoId'))
  if (!periodId) throw new AppError(400, 'MISSING_PERIOD', 'Debe indicar periodoId')
  return c.json({ success: true, data: await getAvailableSubjects(c.get('studentId'), periodId) })
})

enrollmentRoutes.post('/', async (c) => {
  const parsed = enrollmentSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos de inscripción no son válidos')
  return c.json({ success: true, data: await enroll(c.get('studentId'), parsed.data) }, 201)
})

enrollmentRoutes.patch('/:id/withdraw', async (c) => {
  return c.json({ success: true, data: await withdraw(c.get('studentId'), parseId(c.req.param('id'))) })
})

enrollmentRoutes.get('/:id/evaluations', async (c) => {
  return c.json({ success: true, data: await getEnrollmentEvaluations(c.get('studentId'), parseId(c.req.param('id'))) })
})

enrollmentRoutes.put('/:id/evaluations', async (c) => {
  const parsed = evaluationsSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Las evaluaciones no son válidas')
  return c.json({
    success: true,
    data: await saveEnrollmentEvaluations(c.get('studentId'), parseId(c.req.param('id')), parsed.data.evaluaciones),
  })
})

enrollmentRoutes.post('/:id/schedule', async (c) => {
  const parsed = scheduleSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos del horario no son válidos')
  return c.json({
    success: true,
    data: await addSchedule(c.get('studentId'), parseId(c.req.param('id')), parsed.data),
  }, 201)
})
