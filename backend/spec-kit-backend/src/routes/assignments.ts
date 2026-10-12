import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { requireRole } from '../middleware/auth.js'
import { assignmentSchema, assignmentUpdateSchema } from '../schemas/academic.js'
import { assignSubject, changeAssignment, getAssignments, removeAssignment } from '../services/academic.js'
import { AppError } from '../utils/errors.js'

function parseId(value: string | undefined) {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'INVALID_ID', 'Identificador inválido')
  return id
}

function periodQuery(value: string | undefined) {
  if (value === undefined) return undefined
  return parseId(value)
}

export const assignmentRoutes = new Hono<AppEnv>()

assignmentRoutes.get('/', async (c) => c.json({ success: true, data: await getAssignments(periodQuery(c.req.query('periodoId'))) }))

assignmentRoutes.post('/', requireRole('ADMINISTRADOR'), async (c) => {
  const parsed = assignmentSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos de asignación no son válidos')
  return c.json({ success: true, data: await assignSubject(parsed.data) }, 201)
})

assignmentRoutes.patch('/:id', requireRole('ADMINISTRADOR'), async (c) => {
  const parsed = assignmentUpdateSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos de asignación no son válidos')
  return c.json({ success: true, data: await changeAssignment(parseId(c.req.param('id')), parsed.data) })
})

assignmentRoutes.delete('/:id', requireRole('ADMINISTRADOR'), async (c) => {
  return c.json({ success: true, data: await removeAssignment(parseId(c.req.param('id'))) })
})
