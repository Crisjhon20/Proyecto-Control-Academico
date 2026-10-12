import { Hono } from 'hono'
import type { AppEnv } from '../types/app.js'
import { findClassrooms, findTeachers } from '../services/academic.js'

export const catalogRoutes = new Hono<AppEnv>()

catalogRoutes.get('/teachers', async (c) => c.json({ success: true, data: await findTeachers() }))
catalogRoutes.get('/classrooms', async (c) => c.json({ success: true, data: await findClassrooms() }))
