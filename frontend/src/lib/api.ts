import { getSession, clearSession } from './session'

const baseUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message) }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`)

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers })
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.success) {
    const isLoginRequest = path === '/auth/login'
    if (response.status === 401 && !isLoginRequest) { clearSession(); window.location.href = '/login' }
    throw new ApiError(response.status, body?.error?.code || 'REQUEST_ERROR', body?.error?.message || 'No se pudo completar la solicitud')
  }
  return body.data as T
}

async function requestBlob(path: string): Promise<Blob> {
  const session = getSession()
  const headers = new Headers({ Accept: 'image/*' })
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`)

  const response = await fetch(`${baseUrl}${path}`, { headers })
  if (!response.ok) {
    if (response.status === 401) { clearSession(); window.location.href = '/login' }
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.error?.code || 'REQUEST_ERROR', body?.error?.message || 'No se pudo cargar la imagen')
  }
  return response.blob()
}

export const api = {
  login: (data: { numeroRegistro: string; contrasena: string }) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: object) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  profile: () => request('/students/me'),
  updateProfile: (data: object) => request('/students/me', { method: 'PATCH', body: JSON.stringify(data) }),
  profilePhoto: () => requestBlob('/students/me/photo'),
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData()
    formData.append('photo', file)
    return request('/students/me/photo', { method: 'PUT', body: formData })
  },
  curriculum: () => request('/curriculum'),
  periods: () => request('/periods'),
  currentPeriod: () => request('/periods/current'),
  createPeriod: (data: { nombre: string; fechaInicio?: string; fechaFin?: string }) => request('/periods', { method: 'POST', body: JSON.stringify(data) }),
  closePeriod: (id: number) => request(`/periods/${id}/close`, { method: 'POST' }),
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
  schedule: (periodId?: number) => request(`/academic/schedule${periodId ? `?periodoId=${periodId}` : ''}`),
  createSchedule: (enrollmentId: number, data: object) => request(`/enrollments/${enrollmentId}/schedule`, { method: 'POST', body: JSON.stringify(data) }),
  updateSchedule: (id: number, data: object) => request(`/schedule/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSchedule: (id: number) => request(`/schedule/${id}`, { method: 'DELETE' }),
  history: () => request('/academic/history'),
  createManualHistory: (data: object) => request('/academic/history/manual', { method: 'POST', body: JSON.stringify(data) }),
  updateManualHistory: (id: number, data: object) => request(`/academic/history/manual/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteManualHistory: (id: number) => request(`/academic/history/manual/${id}`, { method: 'DELETE' }),
  grades: () => request('/academic/grades'),
}
