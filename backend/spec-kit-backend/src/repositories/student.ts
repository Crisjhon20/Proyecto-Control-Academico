import { pool } from '../db/client.js'

export async function findStudentById(id: number) {
  const result = await pool.query(`
    SELECT estudiante_id, numero_registro, nombres, apellidos, numero_celular, rol
      FROM estudiante
     WHERE estudiante_id = $1
  `, [id])
  return result.rows[0] ?? null
}

export async function updateStudent(id: number, data: {
  nombres?: string
  apellidos?: string
  numeroCelular?: string
  contrasena?: string
}) {
  const result = await pool.query(`
    UPDATE estudiante
       SET nombres = COALESCE($2, nombres),
           apellidos = COALESCE($3, apellidos),
           numero_celular = COALESCE($4, numero_celular),
           contrasena = COALESCE($5, contrasena)
     WHERE estudiante_id = $1
     RETURNING estudiante_id, numero_registro, nombres, apellidos, numero_celular
  `, [id, data.nombres ?? null, data.apellidos ?? null, data.numeroCelular ?? null, data.contrasena ?? null])
  return result.rows[0] ?? null
}
