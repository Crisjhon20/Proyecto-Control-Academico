-- Datos de prueba para la base de datos controlacademico.

INSERT INTO estudiante
    (numero_registro, nombres, apellidos, numero_celular, contrasena, rol)
VALUES
    ('20260001', 'Cristian', 'Aguilera', '70000000', '$2b$08$6kOxgLYMUUZhQBPs7HbP3OEFfUYrOXDkGSPGtdmBt5xbN51gtB/VW', 'ESTUDIANTE'),
    ('20260002', 'Ana', 'Perez', '70000001', '$2b$08$a8iq3MEE.4ePfCRWnK991.ZrHkb4NAs/ecxs4NvvAi5tz.6PdT6h.', 'ESTUDIANTE'),
    ('20260003', 'Luis', 'Mamani', '70000002', '$2b$08$FxCED3C8ccAXCz9Hcaxnj.qh87c8HWBt3rcayGVgt/dOQDBq0SArW', 'ESTUDIANTE'),
    ('20260004', 'Sofia', 'Quispe', '70000003', '$2b$08$kglDBhCRQXxm7tY5DufWa.xNSgp3BWhKEriMwkIMH9pois04Z/5Qe', 'ESTUDIANTE'),
    ('20260005', 'Diego', 'Rojas', '70000004', '$2b$08$QZN5A0yh/uc39g/RpXMfYO4ZcBkGr6dwB./dCTTWi7oJSNV/mCi.K', 'ESTUDIANTE'),
    ('99999999', 'Administrador', 'Control', '70000099', '$2b$08$wPFLIq6vNyqBL81OCqgpcujnDpH86QaDu6kYMkVCLaBZOB8agQUtW', 'ADMINISTRADOR');

INSERT INTO malla_curricular (nombre)
VALUES ('Ingeniería en Sistemas');

INSERT INTO materia (codigo, nombre, semestre, creditos, malla_curricular_id)
SELECT datos.codigo, datos.nombre, datos.semestre, datos.creditos, malla.malla_curricular_id
FROM (VALUES
    -- 1 SEMESTRE
    ('LIN100', 'Inglés Técnico I', 1, 5),
    ('FIS100', 'Física I', 1, 5),
    ('INF110', 'Introducción a la Informática', 1, 5),
    ('INF119', 'Estructuras Discretas', 1, 5),
    ('MAT101', 'Cálculo I', 1, 5),
    -- 2 SEMESTRE
    ('LIN101', 'Inglés Técnico II', 2, 5),
    ('FIS102', 'Física II', 2, 5),
    ('INF120', 'Programación', 2, 5),
    ('MAT103', 'Álgebra Lineal', 2, 5),
    ('MAT102', 'Cálculo II', 2, 5),
    -- 3 SEMESTRE
    ('ADM100', 'Administración', 3, 5),
    ('FIS200', 'Física III', 3, 5),
    ('INF211', 'Arquitectura de Computadoras', 3, 5),
    ('INF210', 'Programación II', 3, 5),
    ('MAT207', 'Ecuaciones Diferenciales', 3, 5),
    -- 4 SEMESTRE
    ('ADM200', 'Contabilidad', 4, 5),
    ('INF221', 'Programación Ensamblador', 4, 5),
    ('INF220', 'Estructura de Datos I', 4, 5),
    ('MAT202', 'Probabilidades y Estadísticas', 4, 5),
    ('MAT205', 'Métodos Numéricos', 4, 5),
    -- 5 SEMESTRE
    ('ELC001', 'Administración de Recursos Humanos', 5, 5),
    ('ADM330', 'Organización y Métodos', 5, 5),
    ('ECO300', 'Economía para la Gestión', 5, 5),
    ('INF310', 'Estructura de Datos II', 5, 5),
    ('INF312', 'Base de Datos I', 5, 5),
    ('MAT302', 'Probabilidades y Estadísticas II', 5, 5),
    -- 6 SEMESTRE
    ('ELC003', 'Producción y Marketing', 6, 5),
    ('ADM320', 'Finanzas para la Empresa', 6, 5),
    ('INF323', 'Sistemas Operativos I', 6, 5),
    ('INF322', 'Base de Datos II', 6, 5),
    ('INF342', 'Sistema de Información I', 6, 5),
    ('MAT329', 'Investigación Operativa', 6, 5),
    -- 7 SEMESTRE
    ('ELC005', 'Ingeniería de Calidad', 7, 5),
    ('INF433', 'Redes I', 7, 5),
    ('INF413', 'Sistemas Operativos II', 7, 5),
    ('INF432', 'Sistema para la Toma de Decisiones', 7, 5),
    ('INF412', 'Sistema de Información II', 7, 5),
    ('MAT419', 'Investigación Operativa II', 7, 5),
    -- 8 SEMESTRE
    ('ELC007', 'Introducción a la Macroeconomía', 8, 5),
    ('INF462', 'Auditoría Informática', 8, 5),
    ('INF423', 'Redes II', 8, 5),
    ('INF422', 'Ingeniería de Software I', 8, 5),
    ('INF442', 'Sistema de Info. Geográfica', 8, 5),
    ('ECO449', 'Preparación y Evaluación de Proyectos', 8, 5),
    -- 9 SEMESTRE
    ('INF511', 'Taller de Grado I', 9, 5),
    ('INF512', 'Ingeniería de Software II', 9, 5),
    ('INF513', 'Tecnología Web', 9, 5),
    ('INF552', 'Estructura de Software II', 9, 5),
    -- 10 SEMESTRE
    ('GDI001', 'Graduación Directa', 10, 5),
    ('GRL001', 'Modalidad de Graduación', 10, 5)
) AS datos(codigo, nombre, semestre, creditos)
JOIN malla_curricular AS malla
    ON malla.nombre = 'Ingeniería en Sistemas';

INSERT INTO periodo_academico (nombre)
VALUES ('2026-I'), ('2026-II'), ('2027-I');

INSERT INTO docente (nombres, apellidos)
VALUES
    ('Carlos', 'Mendoza'),
    ('María', 'Fernández'),
    ('Jorge', 'Quispe'),
    ('Laura', 'Vargas'),
    ('Roberto', 'Salazar');

INSERT INTO aula (numero)
SELECT numero FROM generate_series(1, 32) AS numeros(numero);

INSERT INTO asignacion_materia (materia_id, periodo_academico_id, docente_id, aula_id)
SELECT materia.materia_id, periodo.periodo_academico_id, docente.docente_id, aula.aula_id
FROM (VALUES
    ('Estructura de Datos I', '2026-II', 'Carlos', 1),
    ('Base de Datos I', '2026-II', 'María', 2),
    ('Ingeniería de Software I', '2026-II', 'Jorge', 3),
    ('Probabilidades y Estadísticas', '2026-II', 'Laura', 4),
    ('Estructura de Datos I', '2027-I', 'Carlos', 5),
    ('Programación', '2027-I', 'Roberto', 6)
) AS datos(materia_nombre, periodo_nombre, docente_nombre, aula_numero)
JOIN materia ON materia.nombre = datos.materia_nombre
JOIN periodo_academico periodo ON periodo.nombre = datos.periodo_nombre
JOIN docente ON docente.nombres = datos.docente_nombre
JOIN aula ON aula.numero = datos.aula_numero;

INSERT INTO inscripcion
    (estudiante_id, materia_id, periodo_academico_id, semestre_cursado, estado)
SELECT estudiante.estudiante_id, materia.materia_id, periodo.periodo_academico_id, datos.semestre_cursado, datos.estado
FROM (VALUES
    ('20260001', 'Estructura de Datos I', '2026-II', 6, 'Reprobada'),
    ('20260001', 'Probabilidades y Estadísticas', '2026-II', 6, 'Aprobada'),
    ('20260001', 'Base de Datos I', '2026-II', 6, 'Inscrita'),
    ('20260001', 'Ingeniería de Software I', '2026-II', 6, 'Inscrita'),
    ('20260001', 'Estructura de Datos I', '2027-I', 6, 'Inscrita'),
    ('20260001', 'Programación', '2027-I', 6, 'Retirada'),
    ('20260002', 'Estructura de Datos I', '2026-II', 3, 'Inscrita'),
    ('20260003', 'Estructura de Datos I', '2026-II', 3, 'Inscrita'),
    ('20260004', 'Estructura de Datos I', '2026-II', 4, 'Inscrita'),
    ('20260002', 'Base de Datos I', '2026-II', 4, 'Inscrita'),
    ('20260005', 'Base de Datos I', '2026-II', 4, 'Inscrita')
) AS datos(numero_registro, materia_nombre, periodo_nombre, semestre_cursado, estado)
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
    ON materia.nombre = 'Estructura de Datos I';

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
WHERE materia.nombre = 'Estructura de Datos I'
  AND periodo.nombre = '2026-II';

INSERT INTO horario (inscripcion_id, dia_semana, hora_inicio, hora_fin)
SELECT inscripcion.inscripcion_id, datos.dia_semana, datos.hora_inicio, datos.hora_fin
FROM (VALUES
    ('Estructura de Datos I', '2026-II', 'Lunes', TIME '16:00', TIME '18:00'),
    ('Estructura de Datos I', '2026-II', 'Miércoles', TIME '16:00', TIME '18:00'),
    ('Base de Datos I', '2026-II', 'Martes', TIME '14:00', TIME '16:00'),
    ('Ingeniería de Software I', '2026-II', 'Jueves', TIME '18:00', TIME '20:00'),
    ('Estructura de Datos I', '2027-I', 'Lunes', TIME '08:00', TIME '10:00'),
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
    ('Estructura de Datos I', '2026-II', DATE '2026-09-01', 'Asistió'),
    ('Estructura de Datos I', '2026-II', DATE '2026-09-03', 'Faltó'),
    ('Base de Datos I', '2026-II', DATE '2026-09-02', 'Asistió'),
    ('Base de Datos I', '2026-II', DATE '2026-09-04', 'Asistió'),
    ('Ingeniería de Software I', '2026-II', DATE '2026-09-05', 'Faltó')
) AS datos(materia_nombre, periodo_nombre, fecha_clase, estado)
JOIN materia
    ON materia.nombre = datos.materia_nombre
JOIN periodo_academico AS periodo
    ON periodo.nombre = datos.periodo_nombre
JOIN inscripcion
    ON inscripcion.materia_id = materia.materia_id
    AND inscripcion.periodo_academico_id = periodo.periodo_academico_id
    AND inscripcion.estudiante_id = 1;
