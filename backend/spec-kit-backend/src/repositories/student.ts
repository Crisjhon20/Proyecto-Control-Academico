import { pool } from '../db/client.js'

export async function findStudentById(id: number) {
  const result = await pool.query(`
    SELECT estudiante_id AS id, numero_registro AS "numeroRegistro", nombres,
           apellidos, numero_celular AS "numeroCelular", rol
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
    RETURNING estudiante_id AS id, numero_registro AS "numeroRegistro", nombres,
              apellidos, numero_celular AS "numeroCelular", rol
  `, [id, data.nombres ?? null, data.apellidos ?? null, data.numeroCelular ?? null, data.contrasena ?? null])
  return result.rows[0] ?? null
}

export async function updateStudentPhoto(id: number, photo: Buffer, mimeType: string) {
  const result = await pool.query(`
    UPDATE estudiante
       SET foto_perfil = $2,
           foto_perfil_mime = $3
     WHERE estudiante_id = $1
     RETURNING estudiante_id AS id
  `, [id, photo, mimeType])
  return result.rows[0] ?? null
}

export async function findStudentPhoto(id: number) {
  const result = await pool.query(`
    SELECT foto_perfil AS data, foto_perfil_mime AS "mimeType"
      FROM estudiante
     WHERE estudiante_id = $1
  `, [id])
  return result.rows[0] ?? null
}
