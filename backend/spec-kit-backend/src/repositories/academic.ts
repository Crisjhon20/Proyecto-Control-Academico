import { pool } from '../db/client.js'

export async function findCurriculum() {
  const result = await pool.query(`
    SELECT m.malla_curricular_id AS id, m.nombre,
           ma.materia_id AS materia_id, ma.codigo, ma.nombre AS materia_nombre,
           ma.semestre, ma.creditos
      FROM malla_curricular m
      LEFT JOIN materia ma ON ma.malla_curricular_id = m.malla_curricular_id
     ORDER BY m.malla_curricular_id, ma.semestre, ma.codigo
  `)
  return result.rows
}

export async function findSubject(id: number) {
  const result = await pool.query(`
    SELECT materia_id AS id, codigo, nombre, semestre, creditos, malla_curricular_id
      FROM materia
     WHERE materia_id = $1
  `, [id])
  return result.rows[0] ?? null
}

export async function findCurrentPeriod() {
  const result = await pool.query(`
    SELECT periodo_academico_id AS id, nombre
      FROM periodo_academico
     ORDER BY periodo_academico_id DESC
     LIMIT 1
  `)
  return result.rows[0] ?? null
}

export async function findPeriods() {
  const result = await pool.query(`
    SELECT periodo_academico_id AS id, nombre
      FROM periodo_academico
     ORDER BY nombre DESC
  `)
  return result.rows
}

export async function findEnrollments(studentId: number, periodId?: number) {
  const result = await pool.query(`
    SELECT i.inscripcion_id AS id, i.semestre_cursado, i.estado,
           p.periodo_academico_id AS periodo_id, p.nombre AS periodo,
           m.materia_id AS materia_id, m.codigo, m.nombre AS materia, m.semestre, m.creditos,
           d.nombres AS docente_nombres, d.apellidos AS docente_apellidos,
           au.numero AS aula
      FROM inscripcion i
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
      JOIN materia m ON m.materia_id = i.materia_id
      LEFT JOIN asignacion_materia am
        ON am.materia_id = i.materia_id
       AND am.periodo_academico_id = i.periodo_academico_id
      LEFT JOIN docente d ON d.docente_id = am.docente_id
      LEFT JOIN aula au ON au.aula_id = am.aula_id
     WHERE i.estudiante_id = $1
       AND ($2::integer IS NULL OR i.periodo_academico_id = $2)
     ORDER BY p.nombre DESC, m.semestre, m.codigo
  `, [studentId, periodId ?? null])
  return result.rows
}

export async function findTeachers() {
  const result = await pool.query(`
    SELECT docente_id AS id, nombres, apellidos
      FROM docente
     ORDER BY apellidos, nombres
  `)
  return result.rows
}

export async function findClassrooms() {
  const result = await pool.query(`
    SELECT aula_id AS id, numero
      FROM aula
     ORDER BY numero
  `)
  return result.rows
}

export async function findAssignments(periodId?: number) {
  const result = await pool.query(`
    SELECT a.asignacion_id AS id,
           p.periodo_academico_id AS periodo_id, p.nombre AS periodo,
           m.materia_id AS materia_id, m.codigo, m.nombre AS materia,
           d.docente_id AS docente_id, d.nombres AS docente_nombres, d.apellidos AS docente_apellidos,
           au.aula_id AS aula_id, au.numero AS aula
      FROM asignacion_materia a
      JOIN periodo_academico p ON p.periodo_academico_id = a.periodo_academico_id
      JOIN materia m ON m.materia_id = a.materia_id
      JOIN docente d ON d.docente_id = a.docente_id
      JOIN aula au ON au.aula_id = a.aula_id
     WHERE ($1::integer IS NULL OR a.periodo_academico_id = $1)
     ORDER BY p.nombre DESC, m.semestre, m.codigo
  `, [periodId ?? null])
  return result.rows
}

export async function createAssignment(data: {
  materiaId: number
  periodoAcademicoId: number
  docenteId: number
  aulaId: number
}) {
  const result = await pool.query(`
    INSERT INTO asignacion_materia (materia_id, periodo_academico_id, docente_id, aula_id)
    VALUES ($1, $2, $3, $4)
    RETURNING asignacion_id AS id, materia_id, periodo_academico_id AS periodo_id,
              docente_id, aula_id
  `, [data.materiaId, data.periodoAcademicoId, data.docenteId, data.aulaId])
  return result.rows[0]
}

export async function updateAssignment(id: number, data: { docenteId: number; aulaId: number }) {
  const result = await pool.query(`
    UPDATE asignacion_materia
       SET docente_id = $2, aula_id = $3
     WHERE asignacion_id = $1
     RETURNING asignacion_id AS id, materia_id, periodo_academico_id AS periodo_id,
               docente_id, aula_id
  `, [id, data.docenteId, data.aulaId])
  return result.rows[0] ?? null
}

export async function deleteAssignment(id: number) {
  const result = await pool.query(`
    DELETE FROM asignacion_materia
     WHERE asignacion_id = $1
     RETURNING asignacion_id AS id
  `, [id])
  return result.rows[0] ?? null
}

export async function findAvailableSubjects(studentId: number, periodId: number) {
  const result = await pool.query(`
    SELECT m.materia_id AS id, m.codigo, m.nombre, m.semestre, m.malla_curricular_id
      FROM materia m
     WHERE NOT EXISTS (
       SELECT 1 FROM inscripcion i
        WHERE i.estudiante_id = $1
          AND i.materia_id = m.materia_id
          AND i.periodo_academico_id = $2
     )
     ORDER BY m.semestre, m.codigo
  `, [studentId, periodId])
  return result.rows
}

export async function createEnrollment(studentId: number, data: {
  materiaId: number
  periodoAcademicoId: number
  semestreCursado: number
}) {
  const result = await pool.query(`
    INSERT INTO inscripcion (estudiante_id, materia_id, periodo_academico_id, semestre_cursado)
    VALUES ($1, $2, $3, $4)
    RETURNING inscripcion_id AS id, estudiante_id, materia_id,
              periodo_academico_id AS periodo_id, semestre_cursado, estado
  `, [studentId, data.materiaId, data.periodoAcademicoId, data.semestreCursado])
  return result.rows[0]
}

export async function withdrawEnrollment(studentId: number, enrollmentId: number) {
  const result = await pool.query(`
    UPDATE inscripcion
       SET estado = 'Retirada'
     WHERE inscripcion_id = $1
       AND estudiante_id = $2
       AND estado = 'Inscrita'
     RETURNING inscripcion_id AS id, estado
  `, [enrollmentId, studentId])
  return result.rows[0] ?? null
}

export async function findHistory(studentId: number) {
  const result = await pool.query(`
    SELECT i.inscripcion_id AS id, p.nombre AS periodo,
           m.materia_id AS materia_id, m.codigo, m.nombre AS materia,
           i.semestre_cursado, i.estado,
           COALESCE(SUM(n.nota * e.porcentaje / 100), 0)::numeric AS nota_final
      FROM inscripcion i
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
      JOIN materia m ON m.materia_id = i.materia_id
      LEFT JOIN nota n ON n.inscripcion_id = i.inscripcion_id
      LEFT JOIN evaluacion e ON e.evaluacion_id = n.evaluacion_id
     WHERE i.estudiante_id = $1
     GROUP BY i.inscripcion_id, p.nombre, m.materia_id, m.codigo, m.nombre
     ORDER BY p.nombre DESC, m.semestre, m.codigo
  `, [studentId])
  return result.rows
}

export async function findGrades(studentId: number, enrollmentId?: number) {
  const result = await pool.query(`
    SELECT i.inscripcion_id AS inscripcion_id, m.codigo, m.nombre AS materia,
           p.nombre AS periodo, e.evaluacion_id AS evaluacion_id,
           e.nombre AS evaluacion, e.porcentaje, n.nota
      FROM nota n
      JOIN evaluacion e ON e.evaluacion_id = n.evaluacion_id
      JOIN inscripcion i ON i.inscripcion_id = n.inscripcion_id
      JOIN materia m ON m.materia_id = i.materia_id
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
     WHERE i.estudiante_id = $1
       AND ($2::integer IS NULL OR i.inscripcion_id = $2)
     ORDER BY p.nombre DESC, m.codigo, e.evaluacion_id
  `, [studentId, enrollmentId ?? null])
  return result.rows
}

export async function findSchedule(studentId: number) {
  const result = await pool.query(`
    SELECT i.inscripcion_id AS inscripcion_id, m.codigo, m.nombre AS materia,
           p.nombre AS periodo, h.dia_semana, h.hora_inicio, h.hora_fin,
           d.nombres AS docente_nombres, d.apellidos AS docente_apellidos,
           au.numero AS aula
      FROM horario h
      JOIN inscripcion i ON i.inscripcion_id = h.inscripcion_id
      JOIN materia m ON m.materia_id = i.materia_id
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
      LEFT JOIN asignacion_materia am
        ON am.materia_id = i.materia_id
       AND am.periodo_academico_id = i.periodo_academico_id
      LEFT JOIN docente d ON d.docente_id = am.docente_id
      LEFT JOIN aula au ON au.aula_id = am.aula_id
     WHERE i.estudiante_id = $1
       AND i.estado = 'Inscrita'
     ORDER BY h.dia_semana, h.hora_inicio
  `, [studentId])
  return result.rows
}

export async function findAttendance(studentId: number) {
  const result = await pool.query(`
    SELECT i.inscripcion_id AS inscripcion_id, m.codigo, m.nombre AS materia,
           p.nombre AS periodo, a.fecha_clase, a.estado
      FROM asistencia a
      JOIN inscripcion i ON i.inscripcion_id = a.inscripcion_id
      JOIN materia m ON m.materia_id = i.materia_id
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
     WHERE i.estudiante_id = $1
     ORDER BY a.fecha_clase DESC, m.codigo
  `, [studentId])
  return result.rows
}

export async function findAttendanceSummary(studentId: number) {
  const result = await pool.query(`
    SELECT m.codigo, m.nombre AS materia, p.nombre AS periodo,
           COUNT(*)::integer AS total,
           COUNT(*) FILTER (WHERE a.estado = 'Asistió')::integer AS asistencias,
           ROUND((COUNT(*) FILTER (WHERE a.estado = 'Asistió') * 100.0 / COUNT(*)), 2) AS porcentaje
      FROM asistencia a
      JOIN inscripcion i ON i.inscripcion_id = a.inscripcion_id
      JOIN materia m ON m.materia_id = i.materia_id
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
     WHERE i.estudiante_id = $1
     GROUP BY m.codigo, m.nombre, p.nombre
     ORDER BY p.nombre DESC, m.codigo
  `, [studentId])
  return result.rows
}

export async function isStudentEnrolled(studentId: number, subjectId: number) {
  const result = await pool.query(`
    SELECT 1 FROM inscripcion
     WHERE estudiante_id = $1 AND materia_id = $2 AND estado <> 'Retirada'
     LIMIT 1
  `, [studentId, subjectId])
  return result.rowCount === 1
}

export async function findClassmates(studentId: number, subjectId: number) {
  const result = await pool.query(`
    SELECT DISTINCT e.estudiante_id AS id, e.nombres, e.apellidos, e.numero_celular AS numero_celular
      FROM inscripcion i
      JOIN estudiante e ON e.estudiante_id = i.estudiante_id
     WHERE i.materia_id = $1
       AND i.estudiante_id <> $2
       AND i.estado <> 'Retirada'
     ORDER BY e.apellidos, e.nombres
  `, [subjectId, studentId])
  return result.rows
}
