-- Datos de prueba para la base de datos controlacademico.

INSERT INTO estudiante
    (numero_registro, nombres, apellidos, numero_celular, contrasena)
VALUES
    ('20260001', 'Cristian', 'Aguilera', '70000000', '123456789'),
    ('20260002', 'Ana', 'Perez', '70000001', '987654321'),
    ('20260003', 'Luis', 'Mamani', '70000002', '111222333'),
    ('20260004', 'Sofia', 'Quispe', '70000003', '444555666'),
    ('20260005', 'Diego', 'Rojas', '70000004', '777888999');

INSERT INTO malla_curricular (nombre)
VALUES ('Ingeniería en Sistemas');

INSERT INTO materia (nombre, semestre, malla_curricular_id)
SELECT datos.nombre, datos.semestre, malla.malla_curricular_id
FROM (VALUES
    ('Matemática', 1),
    ('Programación', 1),
    ('Estadística', 3),
    ('Estructuras de Datos', 3),
    ('Base de Datos', 4),
    ('Ingeniería de Software', 6)
) AS datos(nombre, semestre)
JOIN malla_curricular AS malla
    ON malla.nombre = 'Ingeniería en Sistemas';

INSERT INTO periodo_academico (nombre)
VALUES ('2026-I'), ('2026-II'), ('2027-I');

INSERT INTO inscripcion
    (estudiante_id, materia_id, periodo_academico_id, estado)
SELECT estudiante.estudiante_id, materia.materia_id, periodo.periodo_academico_id, datos.estado
FROM (VALUES
    ('20260001', 'Estructuras de Datos', '2026-II', 'Reprobada'),
    ('20260001', 'Estadística', '2026-II', 'Aprobada'),
    ('20260001', 'Base de Datos', '2026-II', 'Inscrita'),
    ('20260001', 'Ingeniería de Software', '2026-II', 'Inscrita'),
    ('20260001', 'Estructuras de Datos', '2027-I', 'Inscrita'),
    ('20260001', 'Programación', '2027-I', 'Retirada'),
    ('20260002', 'Estructuras de Datos', '2026-II', 'Inscrita'),
    ('20260003', 'Estructuras de Datos', '2026-II', 'Inscrita'),
    ('20260004', 'Estructuras de Datos', '2026-II', 'Inscrita'),
    ('20260002', 'Base de Datos', '2026-II', 'Inscrita'),
    ('20260005', 'Base de Datos', '2026-II', 'Inscrita')
) AS datos(numero_registro, materia_nombre, periodo_nombre, estado)
JOIN estudiante
    ON estudiante.numero_registro = datos.numero_registro
JOIN materia
    ON materia.nombre = datos.materia_nombre
JOIN periodo_academico AS periodo
    ON periodo.nombre = datos.periodo_nombre;

INSERT INTO evaluacion (materia_id, nombre, porcentaje)
SELECT materia.materia_id, datos.nombre, datos.porcentaje
FROM (VALUES
    ('Primer Parcial', 20.00),
    ('Segundo Parcial', 20.00),
    ('Examen Final', 40.00)
) AS datos(nombre, porcentaje)
JOIN materia
    ON materia.nombre = 'Estructuras de Datos';

INSERT INTO nota (inscripcion_id, evaluacion_id, nota)
SELECT inscripcion.inscripcion_id, evaluacion.evaluacion_id, datos.nota
FROM (VALUES
    ('Primer Parcial', 80.00),
    ('Segundo Parcial', 70.00),
    ('Examen Final', 85.00)
) AS datos(nombre, nota)
JOIN evaluacion
    ON evaluacion.nombre = datos.nombre
JOIN materia
    ON materia.materia_id = evaluacion.materia_id
JOIN inscripcion
    ON inscripcion.materia_id = materia.materia_id
    AND inscripcion.estudiante_id = 1
JOIN periodo_academico AS periodo
    ON periodo.periodo_academico_id = inscripcion.periodo_academico_id
WHERE materia.nombre = 'Estructuras de Datos'
  AND periodo.nombre = '2026-II';

INSERT INTO horario (inscripcion_id, dia_semana, hora_inicio, hora_fin)
SELECT inscripcion.inscripcion_id, datos.dia_semana, datos.hora_inicio, datos.hora_fin
FROM (VALUES
    ('Estructuras de Datos', '2026-II', 'Lunes', TIME '16:00', TIME '18:00'),
    ('Estructuras de Datos', '2026-II', 'Miércoles', TIME '16:00', TIME '18:00'),
    ('Base de Datos', '2026-II', 'Martes', TIME '14:00', TIME '16:00'),
    ('Ingeniería de Software', '2026-II', 'Jueves', TIME '18:00', TIME '20:00'),
    ('Estructuras de Datos', '2027-I', 'Lunes', TIME '08:00', TIME '10:00'),
    ('Programación', '2027-I', 'Viernes', TIME '10:00', TIME '12:00')
) AS datos(materia_nombre, periodo_nombre, dia_semana, hora_inicio, hora_fin)
JOIN materia
    ON materia.nombre = datos.materia_nombre
JOIN periodo_academico AS periodo
    ON periodo.nombre = datos.periodo_nombre
JOIN inscripcion
    ON inscripcion.materia_id = materia.materia_id
    AND inscripcion.periodo_academico_id = periodo.periodo_academico_id
    AND inscripcion.estudiante_id = 1;

INSERT INTO asistencia (inscripcion_id, fecha_clase, estado)
SELECT inscripcion.inscripcion_id, datos.fecha_clase, datos.estado
FROM (VALUES
    ('Estructuras de Datos', '2026-II', DATE '2026-09-01', 'Asistió'),
    ('Estructuras de Datos', '2026-II', DATE '2026-09-03', 'Faltó'),
    ('Base de Datos', '2026-II', DATE '2026-09-02', 'Asistió'),
    ('Base de Datos', '2026-II', DATE '2026-09-04', 'Asistió'),
    ('Ingeniería de Software', '2026-II', DATE '2026-09-05', 'Faltó')
) AS datos(materia_nombre, periodo_nombre, fecha_clase, estado)
JOIN materia
    ON materia.nombre = datos.materia_nombre
JOIN periodo_academico AS periodo
    ON periodo.nombre = datos.periodo_nombre
JOIN inscripcion
    ON inscripcion.materia_id = materia.materia_id
    AND inscripcion.periodo_academico_id = periodo.periodo_academico_id
    AND inscripcion.estudiante_id = 1;
