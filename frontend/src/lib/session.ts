export type Session = {
  token: string
  student: {
    id: number
    numeroRegistro: string
    nombres: string
    apellidos: string
    numeroCelular: string
    rol: 'ESTUDIANTE'
  }
}

const SESSION_KEY = 'control-academico.session'

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as Session } catch { return null }
}

export function setSession(session: Session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() { window.localStorage.removeItem(SESSION_KEY) }
export function isAuthenticated() { return Boolean(getSession()?.token) }

export function requireSession() {
  const session = getSession()
  if (!session) window.location.href = '/login'
  return session
}
