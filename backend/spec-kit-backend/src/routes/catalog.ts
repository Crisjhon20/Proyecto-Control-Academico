import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { findClassrooms, findTeachers } from '../services/academic.js'
import { registerTeacher } from '../services/academic.js'
import { teacherSchema } from '../schemas/academic.js'
import { AppError } from '../utils/errors.js'

export const catalogRoutes = new Hono<AppEnv>()

catalogRoutes.get('/teachers', async (c) => c.json({ success: true, data: await findTeachers() }))
catalogRoutes.get('/classrooms', async (c) => c.json({ success: true, data: await findClassrooms() }))
catalogRoutes.post('/teachers', async (c) => {
  const parsed = teacherSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) throw new AppError(400, 'VALIDATION_ERROR', 'Los datos del docente no son válidos')
  return c.json({ success: true, data: await registerTeacher(c.get('studentId'), parsed.data) }, 201)
})
