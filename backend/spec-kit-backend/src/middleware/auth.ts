import { jwtVerify } from 'jose'
import type { JWTPayload } from 'jose'
import type { Context, Next } from 'hono'
import { env } from '../config/env.js'
import type { AppEnv } from '../types/app.js'
import { AppError } from '../utils/errors.js'

const secret = new TextEncoder().encode(env.JWT_SECRET)

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const authorization = c.req.header('Authorization')
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!token) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Se requiere autenticación')
  }

  let payload: JWTPayload
  try {
    ({ payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] }))
    const studentId = Number(payload.sub)

    if (!Number.isInteger(studentId) || payload.role !== 'ESTUDIANTE') {
      throw new Error('Invalid claims')
    }
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'El token no es válido o ha expirado')
  }

  c.set('studentId', Number(payload.sub))
  c.set('role', 'ESTUDIANTE')
  c.set('jwtPayload', payload)
  await next()
}
