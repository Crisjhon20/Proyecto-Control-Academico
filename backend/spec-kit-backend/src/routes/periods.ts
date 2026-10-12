import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { findCurrentPeriod, findPeriods } from '../services/academic.js'

export const periodRoutes = new Hono<AppEnv>()

periodRoutes.get('/', async (c) => c.json({ success: true, data: await findPeriods() }))
periodRoutes.get('/current', async (c) => c.json({ success: true, data: await findCurrentPeriod() }))
