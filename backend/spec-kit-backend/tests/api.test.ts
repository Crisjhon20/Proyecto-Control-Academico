import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { scheduleSchema } from '../src/schemas/academic.js'

process.env.DATABASE_URL = 'postgresql:///controlacademico?user=cristian&host=/var/run/postgresql'
process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters-long'
process.env.JWT_EXPIRES_IN = '2h'
process.env.CORS_ORIGIN = 'http://localhost:5173'
process.env.NODE_ENV = 'test'

const { default: app } = await import('../src/index.js')
const { pool } = await import('../src/db/client.js')

let token = ''
let studentId = 0
let periodId = 0
let cycleId = 0
const testRegistration = `8${String(Date.now()).slice(-7)}`

describe('Control Académico API', () => {
  beforeAll(async () => {
    const registration = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroRegistro: testRegistration, nombres: 'Estudiante', apellidos: 'Prueba', numeroCelular: '70000000', contrasena: '123456789' }),
    })
    expect(registration.status).toBe(201)
    const registeredBody = await registration.json() as { data: { id: number } }
    studentId = registeredBody.data.id

    const response = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroRegistro: testRegistration, contrasena: '123456789' }),
    })
    expect(response.status).toBe(200)
    const body = await response.json() as { data: { token: string } }
    token = body.data.token

    const periodResponse = await app.request('/api/periods', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: '2099-I', fechaInicio: '2099-02-01', fechaFin: '2099-07-31' }),
    })
    expect(periodResponse.status).toBe(201)
    const periodBody = await periodResponse.json() as { data: { id: number; cicloId: number } }
    periodId = periodBody.data.id
    cycleId = periodBody.data.cicloId

    const enrollment = await app.request('/api/enrollments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ materiaId: 18, periodoAcademicoId: periodId }),
    })
    expect(enrollment.status).toBe(201)
  })

  afterAll(async () => {
    const client = await pool.connect()
    await client.query('BEGIN')
    try {
      await client.query('DELETE FROM nota WHERE evaluacion_id IN (SELECT e.evaluacion_id FROM evaluacion e JOIN inscripcion i ON i.inscripcion_id = e.inscripcion_id WHERE i.estudiante_id = $1)', [studentId])
      await client.query('DELETE FROM horario WHERE inscripcion_id IN (SELECT inscripcion_id FROM inscripcion WHERE estudiante_id = $1)', [studentId])
      await client.query('DELETE FROM evaluacion WHERE inscripcion_id IN (SELECT inscripcion_id FROM inscripcion WHERE estudiante_id = $1)', [studentId])
      await client.query('DELETE FROM historial_academico WHERE estudiante_id = $1', [studentId])
      await client.query('DELETE FROM inscripcion WHERE estudiante_id = $1', [studentId])
      await client.query('DELETE FROM periodo_estudiante WHERE estudiante_id = $1', [studentId])
      await client.query('DELETE FROM estudiante WHERE estudiante_id = $1', [studentId])
      await client.query('DELETE FROM ciclo_academico WHERE ciclo_academico_id = $1', [cycleId])
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
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
    expect(body.data.numeroRegistro).toBe(testRegistration)
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
      body: JSON.stringify({ materiaId: 18, periodoAcademicoId: periodId }),
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
