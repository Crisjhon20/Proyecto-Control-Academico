import type { JWTPayload } from 'jose'

export type AppEnv = {
  Variables: {
    studentId: number
    role: 'ESTUDIANTE'
    jwtPayload: JWTPayload
  }
}

export type Student = {
  id: number
  numeroRegistro: string
  nombres: string
  apellidos: string
  numeroCelular: string
}
