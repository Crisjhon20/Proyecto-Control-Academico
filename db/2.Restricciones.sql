-- Restricciones para la base de datos controlacademico.

-- CHECK
ALTER TABLE estudiante
    ADD CONSTRAINT ck_estudiante_numero_registro
        CHECK (numero_registro IS NOT NULL AND numero_registro ~ '^[0-9]{8,20}$'),
    ADD CONSTRAINT ck_estudiante_nombres
        CHECK (nombres IS NOT NULL AND nombres ~ '^[[:alpha:]][[:alpha:] ''-]*$'),
    ADD CONSTRAINT ck_estudiante_apellidos
        CHECK (apellidos IS NOT NULL AND apellidos ~ '^[[:alpha:]][[:alpha:] ''-]*$'),
    ADD CONSTRAINT ck_estudiante_numero_celular
        CHECK (numero_celular IS NOT NULL AND numero_celular ~ '^[0-9+() -]{7,20}$'),
    ADD CONSTRAINT ck_estudiante_contrasena
        CHECK (contrasena IS NOT NULL AND contrasena ~ '^[0-9]{9}$');

ALTER TABLE malla_curricular
    ADD CONSTRAINT ck_malla_curricular_nombre
        CHECK (nombre IS NOT NULL AND btrim(nombre) <> '');

ALTER TABLE materia
    ADD CONSTRAINT ck_materia_nombre
        CHECK (nombre IS NOT NULL AND btrim(nombre) <> ''),
    ADD CONSTRAINT ck_materia_semestre
        CHECK (semestre IS NOT NULL AND semestre BETWEEN 1 AND 20);

ALTER TABLE periodo_academico
    ADD CONSTRAINT ck_periodo_academico_nombre
        CHECK (nombre IS NOT NULL AND nombre ~ '^[0-9]{4}-(I|II)$');

ALTER TABLE inscripcion
    ADD CONSTRAINT ck_inscripcion_estado
        CHECK (estado IS NOT NULL AND estado IN ('Inscrita', 'Retirada', 'Aprobada', 'Reprobada'));

ALTER TABLE evaluacion
    ADD CONSTRAINT ck_evaluacion_nombre
        CHECK (nombre IS NOT NULL AND btrim(nombre) <> ''),
    ADD CONSTRAINT ck_evaluacion_porcentaje
        CHECK (porcentaje IS NOT NULL AND porcentaje > 0 AND porcentaje <= 100);

ALTER TABLE nota
    ADD CONSTRAINT ck_nota_rango
        CHECK (nota IS NOT NULL AND nota BETWEEN 0 AND 100);

ALTER TABLE horario
    ADD CONSTRAINT ck_horario_dia
        CHECK (dia_semana IS NOT NULL AND dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')),
    ADD CONSTRAINT ck_horario_horas
        CHECK (hora_inicio IS NOT NULL AND hora_fin IS NOT NULL AND hora_inicio < hora_fin);

ALTER TABLE asistencia
    ADD CONSTRAINT ck_asistencia_estado
        CHECK (estado IS NOT NULL AND estado IN ('Asistió', 'Faltó'));

-- DEFAULT
ALTER TABLE inscripcion
    ALTER COLUMN estado SET DEFAULT 'Inscrita';

-- UNIQUE
ALTER TABLE estudiante
    ADD CONSTRAINT uq_estudiante_numero_registro UNIQUE (numero_registro);

ALTER TABLE malla_curricular
    ADD CONSTRAINT uq_malla_curricular_nombre UNIQUE (nombre);

ALTER TABLE materia
    ADD CONSTRAINT uq_materia_malla_nombre UNIQUE (malla_curricular_id, nombre);

ALTER TABLE periodo_academico
    ADD CONSTRAINT uq_periodo_academico_nombre UNIQUE (nombre);

ALTER TABLE inscripcion
    ADD CONSTRAINT uq_inscripcion_estudiante_materia_periodo
        UNIQUE (estudiante_id, materia_id, periodo_academico_id);

ALTER TABLE evaluacion
    ADD CONSTRAINT uq_evaluacion_materia_nombre UNIQUE (materia_id, nombre);

ALTER TABLE nota
    ADD CONSTRAINT uq_nota_inscripcion_evaluacion UNIQUE (inscripcion_id, evaluacion_id);

ALTER TABLE horario
    ADD CONSTRAINT uq_horario_inscripcion_dia_hora
        UNIQUE (inscripcion_id, dia_semana, hora_inicio, hora_fin);

ALTER TABLE asistencia
    ADD CONSTRAINT uq_asistencia_inscripcion_fecha
        UNIQUE (inscripcion_id, fecha_clase);
