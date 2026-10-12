import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { findCurrentPeriod, findPeriods } from '../services/academic.js'
import { closeAcademicPeriod } from '../services/academic.js'
import { env } from '../config/env.js'
import { AppError } from '../utils/errors.js'

export const periodRoutes = new Hono<AppEnv>()

periodRoutes.get('/', async (c) => c.json({ success: true, data: await findPeriods() }))
periodRoutes.get('/current', async (c) => c.json({ success: true, data: await findCurrentPeriod() }))
periodRoutes.post('/:id/close', async (c) => {
  if (c.req.header('X-Period-Close-Key') !== env.PERIOD_CLOSURE_KEY) {
    throw new AppError(403, 'FORBIDDEN', 'No tienes permisos para cerrar periodos')
  }
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id < 1) throw new AppError(400, 'INVALID_ID', 'Identificador de periodo inválido')
  return c.json({ success: true, data: await closeAcademicPeriod(id) })
})
