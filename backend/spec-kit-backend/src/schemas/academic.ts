import { z } from 'zod'

export const idParamSchema = z.coerce.number().int().positive()

export const enrollmentSchema = z.object({
  materiaId: z.number().int().positive(),
  periodoAcademicoId: z.number().int().positive(),
  semestreCursado: z.number().int().min(1).max(20),
})

export const teacherSchema = z.object({
  nombres: z.string().trim().min(2).max(100),
  apellidos: z.string().trim().min(2).max(100),
})

export const scheduleSchema = z.object({
  docenteId: z.number().int().positive(),
  aulaId: z.number().int().positive(),
  diaSemana: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).refine((value) => value >= '07:00' && value <= '22:30'),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).refine((value) => value >= '07:00' && value <= '22:30'),
}).refine((value) => value.horaInicio < value.horaFin, {
  message: 'La hora de inicio debe ser menor que la hora de finalización',
  path: ['horaFin'],
})

export const evaluationsSchema = z.object({
  evaluaciones: z.array(z.object({
    nombre: z.string().trim().min(1).max(80),
    porcentaje: z.number().positive().max(100),
    nota: z.number().min(0).max(100).optional(),
  })).min(1),
}).superRefine((value, context) => {
  const names = value.evaluaciones.map((item) => item.nombre.toLocaleLowerCase())
  if (new Set(names).size !== names.length) {
    context.addIssue({ code: 'custom', path: ['evaluaciones'], message: 'No puede repetir el nombre de una evaluación' })
  }
  const total = value.evaluaciones.reduce((sum, item) => sum + item.porcentaje, 0)
  if (Math.round(total * 100) !== 10000) {
    context.addIssue({ code: 'custom', path: ['evaluaciones'], message: 'La ponderación total debe ser exactamente 100%' })
  }
})

export const profileSchema = z.object({
  nombres: z.string().trim().min(2).max(100).optional(),
  apellidos: z.string().trim().min(2).max(100).optional(),
  numeroCelular: z.string().regex(/^[0-9+() -]{7,20}$/).optional(),
  contrasena: z.string().min(1).max(72).optional(),
}).refine((value) => Object.keys(value).length > 0, 'Debe enviar al menos un campo')
