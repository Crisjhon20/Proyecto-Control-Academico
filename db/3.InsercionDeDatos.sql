-- Catálogos académicos iniciales. Los estudiantes y sus registros
-- se crean desde la aplicación, no mediante datos de prueba.

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

INSERT INTO aula (numero)
SELECT numero FROM generate_series(1, 32) AS numeros(numero);
