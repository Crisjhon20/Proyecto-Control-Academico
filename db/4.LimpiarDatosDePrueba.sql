-- Limpieza puntual de datos de prueba.
-- No elimina tablas, restricciones ni catálogos académicos.
BEGIN;

DELETE FROM nota
 WHERE evaluacion_id IN (
    SELECT e.evaluacion_id
      FROM evaluacion e
      JOIN inscripcion i ON i.inscripcion_id = e.inscripcion_id
      JOIN estudiante s ON s.estudiante_id = i.estudiante_id
 );

DELETE FROM asistencia
 WHERE inscripcion_id IN (
    SELECT i.inscripcion_id
      FROM inscripcion i
      JOIN estudiante s ON s.estudiante_id = i.estudiante_id
 );

DELETE FROM horario
 WHERE inscripcion_id IN (
    SELECT i.inscripcion_id
      FROM inscripcion i
      JOIN estudiante s ON s.estudiante_id = i.estudiante_id
 );

DELETE FROM evaluacion
 WHERE inscripcion_id IN (
    SELECT i.inscripcion_id
      FROM inscripcion i
      JOIN estudiante s ON s.estudiante_id = i.estudiante_id
 );

DELETE FROM historial_academico
 WHERE estudiante_id IN (SELECT estudiante_id FROM estudiante);

DELETE FROM inscripcion;
DELETE FROM docente WHERE creado_por_estudiante_id IS NOT NULL;
DELETE FROM estudiante;

COMMIT;
