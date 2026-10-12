import { z } from 'zod'

export const idParamSchema = z.coerce.number().int().positive()

export const enrollmentSchema = z.object({
  materiaId: z.number().int().positive(),
  periodoAcademicoId: z.number().int().positive(),
  semestreCursado: z.number().int().min(1).max(20),
})

export const assignmentSchema = z.object({
  materiaId: z.number().int().positive(),
  periodoAcademicoId: z.number().int().positive(),
  docenteId: z.number().int().positive(),
  aulaId: z.number().int().positive(),
})

export const assignmentUpdateSchema = z.object({
  docenteId: z.number().int().positive(),
  aulaId: z.number().int().positive(),
})

export const profileSchema = z.object({
  nombres: z.string().trim().min(2).max(100).optional(),
  apellidos: z.string().trim().min(2).max(100).optional(),
  numeroCelular: z.string().regex(/^[0-9+() -]{7,20}$/).optional(),
  contrasena: z.string().min(1).max(72).optional(),
}).refine((value) => Object.keys(value).length > 0, 'Debe enviar al menos un campo')
