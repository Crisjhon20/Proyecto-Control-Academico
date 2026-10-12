import bcrypt from 'bcrypt'
import {
  createEnrollment,
  createSchedule,
  createTeacher,
  deleteSchedule,
  findAttendance,
  findAttendanceSummary,
  findAvailableSubjects,
  findClassmates,
  findCurrentPeriod,
  findCurriculum,
  findEnrollments,
  findGrades,
  findHistory,
  findClassrooms,
  findPeriods,
  findSchedule,
  findScheduleConflict,
  findScheduleEnrollment,
  findSubject,
  findTeachers,
  closePeriod,
  findPeriod,
  isStudentEnrolled,
  updateSchedule,
  withdrawEnrollment,
} from '../repositories/academic.js'
import { findStudentById, updateStudent } from '../repositories/student.js'
import { AppError } from '../utils/errors.js'

export async function getProfile(studentId: number) {
  const student = await findStudentById(studentId)
  if (!student) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado')
  return student
}

export async function updateProfile(studentId: number, input: {
  nombres?: string
  apellidos?: string
  numeroCelular?: string
  contrasena?: string
}) {
  const data = { ...input, contrasena: input.contrasena ? await bcrypt.hash(input.contrasena, 8) : undefined }
  const student = await updateStudent(studentId, data)
  if (!student) throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado')
  return student
}

export async function getCurriculum() {
  const rows = await findCurriculum()
  const curriculum = new Map<number, { id: number; nombre: string; semestres: Map<number, object[]> }>()
  for (const row of rows) {
    if (!curriculum.has(row.id)) curriculum.set(row.id, { id: row.id, nombre: row.nombre, semestres: new Map() })
    if (row.materia_id !== null) {
      const item = curriculum.get(row.id)!
      if (!item.semestres.has(row.semestre)) item.semestres.set(row.semestre, [])
      item.semestres.get(row.semestre)!.push({
        id: row.materia_id,
        codigo: row.codigo,
        nombre: row.materia_nombre,
        semestre: row.semestre,
        creditos: row.creditos,
      })
    }
  }
  return [...curriculum.values()].map((item) => ({
    id: item.id,
    nombre: item.nombre,
    semestres: [...item.semestres.entries()].map(([semestre, materias]) => ({ semestre, materias })),
  }))
}

export async function getSubject(subjectId: number) {
  const subject = await findSubject(subjectId)
  if (!subject) throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Materia no encontrada')
  return subject
}

export async function getEnrollmentList(studentId: number, periodId?: number) {
  return findEnrollments(studentId, periodId)
}

export async function getAvailableSubjects(studentId: number, periodId: number) {
  const period = await findPeriods()
  const selectedPeriod = period.find((item) => item.id === periodId)
  if (!selectedPeriod) throw new AppError(404, 'PERIOD_NOT_FOUND', 'Periodo académico no encontrado')
  if (selectedPeriod.cerrado) throw new AppError(409, 'PERIOD_CLOSED', 'El periodo académico está cerrado')
  return findAvailableSubjects(studentId, periodId)
}

export async function enroll(studentId: number, input: { materiaId: number; periodoAcademicoId: number; semestreCursado: number }) {
  const [subject, periods] = await Promise.all([findSubject(input.materiaId), findPeriods()])
  if (!subject) throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Materia no encontrada')
  const selectedPeriod = periods.find((item) => item.id === input.periodoAcademicoId)
  if (!selectedPeriod) throw new AppError(404, 'PERIOD_NOT_FOUND', 'Periodo académico no encontrado')
  if (selectedPeriod.cerrado) throw new AppError(409, 'PERIOD_CLOSED', 'El periodo académico está cerrado')
  try {
    return await createEnrollment(studentId, input)
  } catch (error: any) {
    if (error?.code === '23505') throw new AppError(409, 'ENROLLMENT_CONFLICT', 'La materia ya está inscrita en ese periodo')
    throw error
  }
}

export async function withdraw(studentId: number, enrollmentId: number) {
  const result = await withdrawEnrollment(studentId, enrollmentId)
  if (!result) throw new AppError(404, 'ENROLLMENT_NOT_FOUND', 'Inscripción no encontrada o no puede retirarse')
  return result
}

export async function getClassmates(studentId: number, subjectId: number) {
  if (!(await findSubject(subjectId))) throw new AppError(404, 'SUBJECT_NOT_FOUND', 'Materia no encontrada')
  if (!(await isStudentEnrolled(studentId, subjectId))) throw new AppError(403, 'FORBIDDEN', 'No estás inscrito en esta materia')
  return findClassmates(studentId, subjectId)
}

export async function registerTeacher(studentId: number, data: { nombres: string; apellidos: string }) {
  try {
    return await createTeacher(studentId, data)
  } catch (error: any) {
    if (error?.code === '23505') throw new AppError(409, 'TEACHER_CONFLICT', 'El docente ya está registrado')
    throw error
  }
}

export async function addSchedule(studentId: number, enrollmentId: number, data: {
  docenteId: number
  aulaId: number
  diaSemana: string
  horaInicio: string
  horaFin: string
}) {
  const [teachers, classrooms] = await Promise.all([findTeachers(), findClassrooms()])
  if (!teachers.some((item) => item.id === data.docenteId)) throw new AppError(404, 'TEACHER_NOT_FOUND', 'Docente no encontrado')
  if (!classrooms.some((item) => item.id === data.aulaId)) throw new AppError(404, 'CLASSROOM_NOT_FOUND', 'Aula no encontrada')
  if (await findScheduleConflict(studentId, enrollmentId, data)) {
    throw new AppError(409, 'SCHEDULE_CONFLICT', 'El horario se cruza con otra materia del estudiante')
  }
  try {
    const result = await createSchedule(studentId, enrollmentId, data)
    if (!result) throw new AppError(404, 'ENROLLMENT_NOT_FOUND', 'Inscripción no encontrada o no pertenece al estudiante')
    return result
  } catch (error: any) {
    if (error?.code === '23505') throw new AppError(409, 'SCHEDULE_CONFLICT', 'Ya existe un horario igual para esta inscripción')
    throw error
  }
}

export async function changeSchedule(studentId: number, id: number, data: {
  docenteId: number
  aulaId: number
  diaSemana: string
  horaInicio: string
  horaFin: string
}) {
  const [teachers, classrooms] = await Promise.all([findTeachers(), findClassrooms()])
  if (!teachers.some((item) => item.id === data.docenteId)) throw new AppError(404, 'TEACHER_NOT_FOUND', 'Docente no encontrado')
  if (!classrooms.some((item) => item.id === data.aulaId)) throw new AppError(404, 'CLASSROOM_NOT_FOUND', 'Aula no encontrada')
  const enrollmentId = await findScheduleEnrollment(studentId, id)
  if (!enrollmentId) throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Horario no encontrado')
  if (await findScheduleConflict(studentId, enrollmentId, data, id)) {
    throw new AppError(409, 'SCHEDULE_CONFLICT', 'El horario se cruza con otra materia del estudiante')
  }
  const result = await updateSchedule(studentId, id, data)
  if (!result) throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Horario no encontrado')
  return result
}

export async function removeSchedule(studentId: number, id: number) {
  const result = await deleteSchedule(studentId, id)
  if (!result) throw new AppError(404, 'SCHEDULE_NOT_FOUND', 'Horario no encontrado')
  return result
}

export async function closeAcademicPeriod(periodId: number) {
  const period = await findPeriod(periodId)
  if (!period) throw new AppError(404, 'PERIOD_NOT_FOUND', 'Periodo académico no encontrado')
  if (period.cerrado) throw new AppError(409, 'PERIOD_ALREADY_CLOSED', 'El periodo ya está cerrado')
  return closePeriod(periodId)
}

export { findCurrentPeriod, findPeriods, findTeachers, findClassrooms, findHistory, findGrades, findSchedule, findAttendance, findAttendanceSummary }
