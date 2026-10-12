import bcrypt from 'bcrypt'
import { SignJWT } from 'jose'
import { env } from '../config/env.js'
import { pool } from '../db/client.js'
import { AppError } from '../utils/errors.js'
import type { LoginInput } from '../schemas/auth.js'

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET)

export async function loginStudent(input: LoginInput) {
  const result = await pool.query<{
    estudiante_id: number
    numero_registro: string
    nombres: string
    apellidos: string
    numero_celular: string
    contrasena: string
    rol: 'ESTUDIANTE' | 'ADMINISTRADOR'
  }>(
    `SELECT estudiante_id, numero_registro, nombres, apellidos,
            numero_celular, contrasena, rol
       FROM estudiante
      WHERE numero_registro = $1`,
    [input.numeroRegistro],
  )

  const student = result.rows[0]
  if (!student || !(await bcrypt.compare(input.contrasena, student.contrasena))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales incorrectas')
  }

  const token = await new SignJWT({ role: student.rol })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(String(student.estudiante_id))
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(jwtSecret)

  return {
    token,
    student: {
      id: student.estudiante_id,
      numeroRegistro: student.numero_registro,
      nombres: student.nombres,
      apellidos: student.apellidos,
      numeroCelular: student.numero_celular,
      rol: student.rol,
    },
  }
}
