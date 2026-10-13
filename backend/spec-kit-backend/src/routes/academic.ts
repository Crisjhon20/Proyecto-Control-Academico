import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { findAttendance, findAttendanceSummary, findGrades, findHistory, findSchedule, registerAttendance } from '../services/academic.js'
import { attendanceSchema } from '../schemas/academic.js'
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
academicRoutes.get('/attendance', async (c) => c.json({ success: true, data: await findAttendance(c.get('studentId')) }))
academicRoutes.get('/attendance/summary', async (c) => c.json({ success: true, data: await findAttendanceSummary(c.get('studentId')) }))
academicRoutes.post('/attendance', async (c) => {
  const parsed = attendanceSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos de asistencia no son válidos')
  return c.json({ success: true, data: await registerAttendance(c.get('studentId'), parsed.data) }, 201)
})
