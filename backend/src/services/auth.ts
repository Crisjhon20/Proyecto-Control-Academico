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
    rol: 'ESTUDIANTE'
  }>(
    `SELECT estudiante_id, numero_registro, nombres, apellidos,
            numero_celular, contrasena, rol
       FROM estudiante
      WHERE numero_registro = $1`,
    [input.numeroRegistro],
  )

  const student = result.rows[0]
  if (!student) throw new AppError(401, 'STUDENT_NOT_FOUND', 'Usuario incorrecto o no registrado')
  if (!(await bcrypt.compare(input.contrasena, student.contrasena))) {
    throw new AppError(401, 'INVALID_PASSWORD', 'Contraseña incorrecta')
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

export async function registerStudent(input: {
  numeroRegistro: string
  nombres: string
  apellidos: string
  numeroCelular: string
  contrasena: string
}) {
  const password = await bcrypt.hash(input.contrasena, 8)
  const result = await pool.query(`
    INSERT INTO estudiante (numero_registro, nombres, apellidos, numero_celular, contrasena)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING estudiante_id AS id, numero_registro AS "numeroRegistro", nombres,
              apellidos, numero_celular AS "numeroCelular", rol
  `, [input.numeroRegistro, input.nombres, input.apellidos, input.numeroCelular, password])
  return result.rows[0]
}
