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
    SELECT periodo_academico_id AS id, nombre, cerrado
      FROM periodo_academico
     ORDER BY periodo_academico_id DESC
     LIMIT 1
  `)
  return result.rows[0] ?? null
}

export async function findPeriods() {
  const result = await pool.query(`
    SELECT periodo_academico_id AS id, nombre, cerrado
      FROM periodo_academico
     ORDER BY nombre DESC
  `)
  return result.rows
}

export async function findEnrollments(studentId: number, periodId?: number) {
  const result = await pool.query(`
    SELECT i.inscripcion_id AS id, i.semestre_cursado, i.estado,
           p.periodo_academico_id AS periodo_id, p.nombre AS periodo,
           m.materia_id AS materia_id, m.codigo, m.nombre AS materia, m.semestre, m.creditos
      FROM inscripcion i
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
      JOIN materia m ON m.materia_id = i.materia_id
     WHERE i.estudiante_id = $1
       AND ($2::integer IS NULL OR i.periodo_academico_id = $2)
     ORDER BY p.nombre DESC, m.semestre, m.codigo
  `, [studentId, periodId ?? null])
  return result.rows
}

export async function findTeachers(studentId: number) {
  const result = await pool.query(`
    SELECT docente_id AS id, nombres, apellidos
      FROM docente
     WHERE creado_por_estudiante_id = $1
     ORDER BY apellidos, nombres
  `, [studentId])
  return result.rows
}

export async function createTeacher(studentId: number, data: { nombres: string; apellidos: string }) {
  const result = await pool.query(`
    INSERT INTO docente (nombres, apellidos, creado_por_estudiante_id)
    VALUES ($1, $2, $3)
    RETURNING docente_id AS id, nombres, apellidos
  `, [data.nombres, data.apellidos, studentId])
  return result.rows[0]
}

export async function findClassrooms() {
  const result = await pool.query(`
    SELECT aula_id AS id, numero
      FROM aula
     ORDER BY numero
  `)
  return result.rows
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
      FROM periodo_academico p
      WHERE inscripcion_id = $1
        AND estudiante_id = $2
        AND estado = 'Inscrita'
        AND p.periodo_academico_id = inscripcion.periodo_academico_id
        AND p.cerrado = FALSE
     RETURNING inscripcion_id AS id, estado
  `, [enrollmentId, studentId])
  return result.rows[0] ?? null
}

export async function findHistory(studentId: number) {
  const result = await pool.query(`
    SELECT h.historial_academico_id AS id, p.nombre AS periodo,
           m.materia_id AS materia_id, m.codigo, m.nombre AS materia,
           m.semestre, m.creditos, h.semestre_cursado, h.estado,
           h.nota_final, h.archivado_en
      FROM historial_academico h
      JOIN periodo_academico p ON p.periodo_academico_id = h.periodo_academico_id
      JOIN materia m ON m.materia_id = h.materia_id
     WHERE h.estudiante_id = $1
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
      JOIN inscripcion i ON i.inscripcion_id = e.inscripcion_id
      JOIN materia m ON m.materia_id = i.materia_id
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
     WHERE i.estudiante_id = $1
       AND ($2::integer IS NULL OR i.inscripcion_id = $2)
     ORDER BY p.nombre DESC, m.codigo, e.evaluacion_id
  `, [studentId, enrollmentId ?? null])
  return result.rows
}

export async function findEnrollmentEvaluations(studentId: number, enrollmentId: number) {
  const result = await pool.query(`
    SELECT e.evaluacion_id AS id, e.nombre, e.porcentaje, n.nota
      FROM evaluacion e
      JOIN inscripcion i ON i.inscripcion_id = e.inscripcion_id
      LEFT JOIN nota n ON n.evaluacion_id = e.evaluacion_id
     WHERE e.inscripcion_id = $1 AND i.estudiante_id = $2
     ORDER BY e.evaluacion_id
  `, [enrollmentId, studentId])
  return result.rows
}

export async function replaceEnrollmentEvaluations(studentId: number, enrollmentId: number, evaluations: Array<{
  nombre: string
  porcentaje: number
  nota?: number
}>) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const target = await client.query(`
      SELECT i.inscripcion_id
        FROM inscripcion i
        JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
       WHERE i.inscripcion_id = $1
         AND i.estudiante_id = $2
         AND i.estado = 'Inscrita'
         AND p.cerrado = FALSE
    `, [enrollmentId, studentId])
    if (!target.rows[0]) { await client.query('ROLLBACK'); return null }

    await client.query(`
      DELETE FROM nota
       WHERE evaluacion_id IN (SELECT evaluacion_id FROM evaluacion WHERE inscripcion_id = $1)
    `, [enrollmentId])
    await client.query('DELETE FROM evaluacion WHERE inscripcion_id = $1', [enrollmentId])

    for (const evaluation of evaluations) {
      const inserted = await client.query(`
        INSERT INTO evaluacion (inscripcion_id, nombre, porcentaje)
        VALUES ($1, $2, $3)
        RETURNING evaluacion_id AS id
      `, [enrollmentId, evaluation.nombre, evaluation.porcentaje])
      if (evaluation.nota !== undefined) {
        await client.query(
          'INSERT INTO nota (evaluacion_id, nota) VALUES ($1, $2)',
          [inserted.rows[0].id, evaluation.nota],
        )
      }
    }

    await client.query('COMMIT')
    return findEnrollmentEvaluations(studentId, enrollmentId)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function findSchedule(studentId: number, periodId?: number) {
  const result = await pool.query(`
    SELECT h.horario_id AS id, i.inscripcion_id AS inscripcion_id, m.codigo, m.nombre AS materia,
           p.nombre AS periodo, h.dia_semana, h.hora_inicio, h.hora_fin,
           d.nombres AS docente_nombres, d.apellidos AS docente_apellidos,
           au.numero AS aula
      FROM horario h
      JOIN inscripcion i ON i.inscripcion_id = h.inscripcion_id
      JOIN materia m ON m.materia_id = i.materia_id
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
      LEFT JOIN docente d
        ON d.docente_id = h.docente_id
       AND d.creado_por_estudiante_id = i.estudiante_id
      LEFT JOIN aula au ON au.aula_id = h.aula_id
      WHERE i.estudiante_id = $1
        AND i.estado = 'Inscrita'
        AND ($2::integer IS NULL OR i.periodo_academico_id = $2)
      ORDER BY h.dia_semana, h.hora_inicio
  `, [studentId, periodId ?? null])
  return result.rows
}

export async function createSchedule(studentId: number, enrollmentId: number, data: {
  docenteId: number
  aulaId: number
  diaSemana: string
  horaInicio: string
  horaFin: string
}) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const target = await client.query(`
      SELECT i.periodo_academico_id AS periodo_id
        FROM inscripcion i
        JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
       WHERE i.inscripcion_id = $1 AND i.estudiante_id = $2
         AND i.estado = 'Inscrita' AND p.cerrado = FALSE
    `, [enrollmentId, studentId])
    if (!target.rows[0]) { await client.query('ROLLBACK'); return null }

    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`schedule:${studentId}:${target.rows[0].periodo_id}`])
    const conflict = await client.query(`
      SELECT h.horario_id
        FROM horario h
        JOIN inscripcion i ON i.inscripcion_id = h.inscripcion_id
       WHERE i.estudiante_id = $1
         AND i.periodo_academico_id = $2
         AND i.estado = 'Inscrita'
         AND h.dia_semana = $3
         AND h.hora_inicio < $5::time
         AND h.hora_fin > $4::time
       LIMIT 1
    `, [studentId, target.rows[0].periodo_id, data.diaSemana, data.horaInicio, data.horaFin])
    if (conflict.rows[0]) { await client.query('ROLLBACK'); return { conflict: true as const } }

    const result = await client.query(`
      INSERT INTO horario (inscripcion_id, docente_id, aula_id, dia_semana, hora_inicio, hora_fin)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING horario_id AS id, inscripcion_id, docente_id, aula_id, dia_semana, hora_inicio, hora_fin
    `, [enrollmentId, data.docenteId, data.aulaId, data.diaSemana, data.horaInicio, data.horaFin])
    await client.query('COMMIT')
    return result.rows[0] ?? null
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function updateSchedule(studentId: number, scheduleId: number, data: {
  docenteId: number
  aulaId: number
  diaSemana: string
  horaInicio: string
  horaFin: string
}) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const target = await client.query(`
      SELECT i.inscripcion_id, i.periodo_academico_id AS periodo_id
        FROM horario h
        JOIN inscripcion i ON i.inscripcion_id = h.inscripcion_id
        JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
       WHERE h.horario_id = $1 AND i.estudiante_id = $2
         AND i.estado = 'Inscrita' AND p.cerrado = FALSE
    `, [scheduleId, studentId])
    if (!target.rows[0]) { await client.query('ROLLBACK'); return null }

    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`schedule:${studentId}:${target.rows[0].periodo_id}`])
    const conflict = await client.query(`
      SELECT h.horario_id
        FROM horario h
        JOIN inscripcion i ON i.inscripcion_id = h.inscripcion_id
       WHERE i.estudiante_id = $1
         AND i.periodo_academico_id = $2
         AND i.estado = 'Inscrita'
         AND h.horario_id <> $3
         AND h.dia_semana = $4
         AND h.hora_inicio < $6::time
         AND h.hora_fin > $5::time
       LIMIT 1
    `, [studentId, target.rows[0].periodo_id, scheduleId, data.diaSemana, data.horaInicio, data.horaFin])
    if (conflict.rows[0]) { await client.query('ROLLBACK'); return { conflict: true as const } }

    const result = await client.query(`
      UPDATE horario
         SET docente_id = $2, aula_id = $3, dia_semana = $4,
             hora_inicio = $5, hora_fin = $6
       WHERE horario_id = $1
       RETURNING horario_id AS id, inscripcion_id, docente_id, aula_id,
                 dia_semana, hora_inicio, hora_fin
    `, [scheduleId, data.docenteId, data.aulaId, data.diaSemana, data.horaInicio, data.horaFin])
    await client.query('COMMIT')
    return result.rows[0] ?? null
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function findScheduleConflict(studentId: number, enrollmentId: number, data: {
  diaSemana: string
  horaInicio: string
  horaFin: string
}, scheduleId?: number) {
  const result = await pool.query(`
    SELECT h.horario_id AS id
      FROM horario h
      JOIN inscripcion existing_i ON existing_i.inscripcion_id = h.inscripcion_id
      JOIN inscripcion target_i ON target_i.inscripcion_id = $2
      WHERE existing_i.estudiante_id = $1
        AND existing_i.periodo_academico_id = target_i.periodo_academico_id
        AND existing_i.estado = 'Inscrita'
        AND target_i.estado = 'Inscrita'
       AND h.dia_semana = $3
       AND h.hora_inicio < $5::time
       AND h.hora_fin > $4::time
       AND ($6::integer IS NULL OR h.horario_id <> $6)
     LIMIT 1
  `, [studentId, enrollmentId, data.diaSemana, data.horaInicio, data.horaFin, scheduleId ?? null])
  return result.rows[0] ?? null
}

export async function findScheduleEnrollment(studentId: number, scheduleId: number) {
  const result = await pool.query(`
    SELECT h.inscripcion_id
      FROM horario h
      JOIN inscripcion i ON i.inscripcion_id = h.inscripcion_id
     WHERE h.horario_id = $1 AND i.estudiante_id = $2
  `, [scheduleId, studentId])
  return result.rows[0]?.inscripcion_id ?? null
}

export async function deleteSchedule(studentId: number, scheduleId: number) {
  const result = await pool.query(`
    DELETE FROM horario h
     USING inscripcion i
     JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
     WHERE h.horario_id = $1 AND h.inscripcion_id = i.inscripcion_id
       AND i.estudiante_id = $2
       AND i.estado = 'Inscrita'
       AND p.cerrado = FALSE
     RETURNING h.horario_id AS id
  `, [scheduleId, studentId])
  return result.rows[0] ?? null
}

export async function findPeriod(periodId: number) {
  const result = await pool.query(`
    SELECT periodo_academico_id AS id, nombre, cerrado
      FROM periodo_academico WHERE periodo_academico_id = $1
  `, [periodId])
  return result.rows[0] ?? null
}

export async function closePeriod(periodId: number) {
  const result = await pool.query(`
    UPDATE periodo_academico
       SET cerrado = TRUE
     WHERE periodo_academico_id = $1 AND cerrado = FALSE
     RETURNING periodo_academico_id AS id, nombre, cerrado, fecha_cierre
  `, [periodId])
  return result.rows[0] ?? null
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

export async function upsertAttendance(studentId: number, data: {
  inscripcionId: number
  fechaClase: string
  estado: 'Asistió' | 'Faltó'
}) {
  const result = await pool.query(`
    INSERT INTO asistencia (inscripcion_id, fecha_clase, estado)
    SELECT i.inscripcion_id, $3::date, $4
      FROM inscripcion i
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
     WHERE i.inscripcion_id = $1
       AND i.estudiante_id = $2
       AND i.estado = 'Inscrita'
       AND p.cerrado = FALSE
       AND EXISTS (
         SELECT 1
           FROM horario h
          WHERE h.inscripcion_id = i.inscripcion_id
            AND h.dia_semana = CASE EXTRACT(DOW FROM $3::date)
              WHEN 1 THEN 'Lunes'
              WHEN 2 THEN 'Martes'
              WHEN 3 THEN 'Miércoles'
              WHEN 4 THEN 'Jueves'
              WHEN 5 THEN 'Viernes'
              WHEN 6 THEN 'Sábado'
            END
       )
    ON CONFLICT (inscripcion_id, fecha_clase)
    DO UPDATE SET estado = EXCLUDED.estado
    RETURNING asistencia_id AS id, inscripcion_id, fecha_clase, estado
  `, [data.inscripcionId, studentId, data.fechaClase, data.estado])
  return result.rows[0] ?? null
}

export async function findStudentSubjectPeriod(studentId: number, subjectId: number) {
  const result = await pool.query(`
    SELECT i.periodo_academico_id AS periodo_id
      FROM inscripcion i
      JOIN periodo_academico p ON p.periodo_academico_id = i.periodo_academico_id
     WHERE i.estudiante_id = $1
       AND i.materia_id = $2
       AND i.estado <> 'Retirada'
     ORDER BY p.periodo_academico_id DESC
     LIMIT 1
  `, [studentId, subjectId])
  return result.rows[0]?.periodo_id ?? null
}

export async function findClassmates(studentId: number, subjectId: number, periodId: number) {
  const result = await pool.query(`
    SELECT DISTINCT e.estudiante_id AS id, e.nombres, e.apellidos, e.numero_celular AS numero_celular
      FROM inscripcion i
      JOIN estudiante e ON e.estudiante_id = i.estudiante_id
     WHERE i.materia_id = $1
       AND i.periodo_academico_id = $3
       AND i.estudiante_id <> $2
       AND i.estado <> 'Retirada'
     ORDER BY e.apellidos, e.nombres
  `, [subjectId, studentId, periodId])
  return result.rows
}
