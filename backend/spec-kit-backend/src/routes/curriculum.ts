import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { getClassmates, getCurriculum, getSubject } from '../services/academic.js'
import { AppError } from '../utils/errors.js'

function parseId(value: string, resource: string) {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'INVALID_ID', `${resource} inválido`)
  return id
}

export const curriculumRoutes = new Hono<AppEnv>()

curriculumRoutes.get('/', async (c) => c.json({ success: true, data: await getCurriculum() }))
curriculumRoutes.get('/subjects/:id/classmates', async (c) => {
  const subjectId = parseId(c.req.param('id'), 'Identificador de materia')
  return c.json({ success: true, data: await getClassmates(c.get('studentId'), subjectId) })
})
curriculumRoutes.get('/subjects/:id', async (c) => {
  const subjectId = parseId(c.req.param('id'), 'Identificador de materia')
  return c.json({ success: true, data: await getSubject(subjectId) })
})
