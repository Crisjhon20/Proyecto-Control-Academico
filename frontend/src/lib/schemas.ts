import { z } from 'zod'

export const loginSchema = z.object({
  numeroRegistro: z.string().regex(/^\d{8,20}$/, 'Ingresa un número de registro válido'),
  contrasena: z.string().min(1, 'Ingresa tu contraseña'),
})

export const registerSchema = z.object({
  numeroRegistro: z.string().regex(/^\d{8,20}$/, 'Ingresa un número de registro válido'),
  nombres: z.string().trim().min(2, 'Ingresa los nombres').max(100),
  apellidos: z.string().trim().min(2, 'Ingresa los apellidos').max(100),
  numeroCelular: z.string().regex(/^[0-9+() -]{7,20}$/, 'Ingresa un celular válido'),
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
})

export const teacherSchema = z.object({
  nombres: z.string().trim().min(2, 'Ingresa los nombres').max(100),
  apellidos: z.string().trim().min(2, 'Ingresa los apellidos').max(100),
})

export const profileSchema = z.object({
  nombres: z.string().trim().min(2).max(100),
  apellidos: z.string().trim().min(2).max(100),
  numeroCelular: z.string().regex(/^[0-9+() -]{7,20}$/),
  contrasena: z.string().max(72).optional(),
})

export const scheduleSchema = z.object({
  docenteId: z.coerce.number().int().positive(),
  aulaId: z.coerce.number().int().positive(),
  diaSemana: z.enum(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).refine(v => v >= '07:00' && v <= '22:30', 'La hora debe estar entre 07:00 y 22:30'),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).refine(v => v >= '07:00' && v <= '22:30', 'La hora debe estar entre 07:00 y 22:30'),
}).refine(v => v.horaInicio < v.horaFin, { message: 'La hora inicial debe ser menor que la final', path: ['horaFin'] })
