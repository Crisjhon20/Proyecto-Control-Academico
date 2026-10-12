import { beforeAll, describe, expect, it } from 'vitest'
import { scheduleSchema } from '../src/schemas/academic.js'

process.env.DATABASE_URL = 'postgresql:///controlacademico?user=cristian&host=/var/run/postgresql'
process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters-long'
process.env.JWT_EXPIRES_IN = '2h'
process.env.CORS_ORIGIN = 'http://localhost:5173'
process.env.NODE_ENV = 'test'
process.env.PERIOD_CLOSURE_KEY = 'test-period-closure-key-2026'

const { default: app } = await import('../src/index.js')

let token = ''

describe('Control Académico API', () => {
  beforeAll(async () => {
    const response = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroRegistro: '20260001', contrasena: '123456789' }),
    })
    expect(response.status).toBe(200)
    const body = await response.json() as { data: { token: string } }
    token = body.data.token
  })

  it('rechaza rutas privadas sin token', async () => {
    const response = await app.request('/api/students/me')
    expect(response.status).toBe(401)
  })

  it('devuelve el perfil del estudiante autenticado', async () => {
    const response = await app.request('/api/students/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).toBe(200)
    const body = await response.json() as { data: Record<string, unknown> }
    expect(body.data.numeroRegistro).toBe('20260001')
    expect(body.data).not.toHaveProperty('contrasena')
  })

  it('devuelve la malla curricular agrupada por semestre', async () => {
    const response = await app.request('/api/curriculum', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).toBe(200)
    const body = await response.json() as { data: Array<{ semestres: unknown[] }> }
    expect(body.data[0].semestres).toHaveLength(10)
  })

  it('rechaza una inscripción duplicada', async () => {
    const response = await app.request('/api/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ materiaId: 18, periodoAcademicoId: 2, semestreCursado: 6 }),
    })
    expect(response.status).toBe(409)
  })

  it('rechaza horarios fuera de la jornada permitida', () => {
    const result = scheduleSchema.safeParse({
      docenteId: 1,
      aulaId: 1,
      diaSemana: 'Lunes',
      horaInicio: '06:00',
      horaFin: '08:00',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza horarios con inicio posterior o igual al final', () => {
    const result = scheduleSchema.safeParse({
      docenteId: 1,
      aulaId: 1,
      diaSemana: 'Lunes',
      horaInicio: '10:00',
      horaFin: '10:00',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza una ponderación que no suma 100%', async () => {
    const response = await app.request('/api/enrollments/10/evaluations', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        evaluaciones: [{ nombre: 'Parcial', porcentaje: 50, nota: 80 }],
      }),
    })
    expect(response.status).toBe(400)
  })
})
