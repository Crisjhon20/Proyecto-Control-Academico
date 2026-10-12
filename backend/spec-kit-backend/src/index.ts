import { cors } from 'hono/cors'
import { Hono } from 'hono'
import { env } from './config/env.js'
import { errorHandler } from './middleware/errors.js'
import { authMiddleware } from './middleware/auth.js'
import { authRoutes } from './routes/auth.js'
import { studentRoutes } from './routes/students.js'
import { curriculumRoutes } from './routes/curriculum.js'
import { periodRoutes } from './routes/periods.js'
import { enrollmentRoutes } from './routes/enrollments.js'
import { academicRoutes } from './routes/academic.js'
import { catalogRoutes } from './routes/catalog.js'
import { scheduleRoutes } from './routes/schedule.js'
import type { AppEnv } from './types/app.js'

const app = new Hono<AppEnv>()

app.use('/api/*', cors({
  origin: env.CORS_ORIGIN,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.get('/', (c) => c.json({ success: true, message: 'Control Académico API' }))
app.get('/api/health', (c) => c.json({ success: true, data: { status: 'ok' } }))
app.route('/api/auth', authRoutes)
app.use('/api/students', authMiddleware)
app.use('/api/students/*', authMiddleware)
app.use('/api/curriculum', authMiddleware)
app.use('/api/curriculum/*', authMiddleware)
app.use('/api/periods', authMiddleware)
app.use('/api/periods/*', authMiddleware)
app.use('/api/enrollments', authMiddleware)
app.use('/api/enrollments/*', authMiddleware)
app.use('/api/academic', authMiddleware)
app.use('/api/academic/*', authMiddleware)
app.use('/api/teachers', authMiddleware)
app.use('/api/classrooms', authMiddleware)
app.use('/api/schedule', authMiddleware)
app.use('/api/schedule/*', authMiddleware)
app.route('/api/students', studentRoutes)
app.route('/api/curriculum', curriculumRoutes)
app.route('/api/periods', periodRoutes)
app.route('/api/enrollments', enrollmentRoutes)
app.route('/api/academic', academicRoutes)
app.route('/api', catalogRoutes)
app.route('/api/schedule', scheduleRoutes)
app.onError(errorHandler)

export default app
