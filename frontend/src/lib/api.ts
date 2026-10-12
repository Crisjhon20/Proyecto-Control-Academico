import { getSession, clearSession } from './session'

const baseUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`)

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.success) {
    if (response.status === 401) { clearSession(); window.location.href = '/login' }
    throw new ApiError(response.status, body?.error?.code || 'REQUEST_ERROR', body?.error?.message || 'No se pudo completar la solicitud')
  }
  return body.data as T
}

export const api = {
  login: (data: { numeroRegistro: string; contrasena: string }) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  profile: () => request('/students/me'),
  updateProfile: (data: object) => request('/students/me', { method: 'PATCH', body: JSON.stringify(data) }),
  curriculum: () => request('/curriculum'),
  periods: () => request('/periods'),
  currentPeriod: () => request('/periods/current'),
  enrollments: (periodId?: number) => request(`/enrollments${periodId ? `?periodoId=${periodId}` : ''}`),
  availableSubjects: (periodId: number) => request(`/enrollments/available?periodoId=${periodId}`),
  enroll: (data: object) => request('/enrollments', { method: 'POST', body: JSON.stringify(data) }),
  withdraw: (id: number) => request(`/enrollments/${id}/withdraw`, { method: 'PATCH' }),
  evaluations: (enrollmentId: number) => request(`/enrollments/${enrollmentId}/evaluations`),
  saveEvaluations: (enrollmentId: number, data: object) => request(`/enrollments/${enrollmentId}/evaluations`, { method: 'PUT', body: JSON.stringify(data) }),
  teachers: () => request('/teachers'),
  createTeacher: (data: object) => request('/teachers', { method: 'POST', body: JSON.stringify(data) }),
  classrooms: () => request('/classrooms'),
  classmates: (subjectId: number) => request(`/curriculum/subjects/${subjectId}/classmates`),
  schedule: () => request('/academic/schedule'),
  createSchedule: (enrollmentId: number, data: object) => request(`/enrollments/${enrollmentId}/schedule`, { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id: number, data: object) => request(`/schedule/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSchedule: (id: number) => request(`/schedule/${id}`, { method: 'DELETE' }),
  history: () => request('/academic/history'),
  grades: () => request('/academic/grades'),
  attendance: () => request('/academic/attendance'),
  attendanceSummary: () => request('/academic/attendance/summary'),
}
