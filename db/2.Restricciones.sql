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
        CHECK (contrasena IS NOT NULL AND contrasena ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'),
    ADD CONSTRAINT ck_estudiante_rol
        CHECK (rol IS NOT NULL AND rol = 'ESTUDIANTE');

ALTER TABLE malla_curricular
    ADD CONSTRAINT ck_malla_curricular_nombre
        CHECK (nombre IS NOT NULL AND btrim(nombre) <> '');

ALTER TABLE materia
    ADD CONSTRAINT ck_materia_codigo
        CHECK (codigo IS NOT NULL AND codigo ~ '^[A-Z]{3}[0-9]{3}$'),
    ADD CONSTRAINT ck_materia_nombre
        CHECK (nombre IS NOT NULL AND btrim(nombre) <> ''),
    ADD CONSTRAINT ck_materia_semestre
        CHECK (semestre IS NOT NULL AND semestre BETWEEN 1 AND 20),
    ADD CONSTRAINT ck_materia_creditos
        CHECK (creditos IS NOT NULL AND creditos > 0);

ALTER TABLE periodo_academico
    ADD CONSTRAINT ck_periodo_academico_nombre
        CHECK (nombre IS NOT NULL AND nombre ~ '^[0-9]{4}-(I|II)$'),
    ADD CONSTRAINT ck_periodo_academico_cierre
        CHECK ((cerrado = FALSE AND fecha_cierre IS NULL) OR (cerrado = TRUE AND fecha_cierre IS NOT NULL));

ALTER TABLE inscripcion
    ADD CONSTRAINT ck_inscripcion_semestre_cursado
        CHECK (semestre_cursado IS NOT NULL AND semestre_cursado BETWEEN 1 AND 20),
    ADD CONSTRAINT ck_inscripcion_estado
        CHECK (estado IS NOT NULL AND estado IN ('Inscrita', 'Retirada', 'Aprobada', 'Reprobada'));

ALTER TABLE docente
    ADD CONSTRAINT ck_docente_nombres
        CHECK (nombres IS NOT NULL AND nombres ~ '^[[:alpha:]][[:alpha:] ''-]*$'),
    ADD CONSTRAINT ck_docente_apellidos
        CHECK (apellidos IS NOT NULL AND apellidos ~ '^[[:alpha:]][[:alpha:] ''-]*$');

ALTER TABLE aula
    ADD CONSTRAINT ck_aula_numero
        CHECK (numero IS NOT NULL AND numero BETWEEN 1 AND 32);

ALTER TABLE evaluacion
    ADD CONSTRAINT ck_evaluacion_inscripcion
        CHECK (inscripcion_id IS NOT NULL),
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
        CHECK (
            hora_inicio IS NOT NULL
            AND hora_fin IS NOT NULL
            AND hora_inicio < hora_fin
            AND hora_inicio >= TIME '07:00'
            AND hora_fin <= TIME '22:30'
        );

ALTER TABLE historial_academico
    ADD CONSTRAINT ck_historial_semestre
        CHECK (semestre_cursado IS NOT NULL AND semestre_cursado BETWEEN 1 AND 20),
    ADD CONSTRAINT ck_historial_nota
        CHECK (nota_final IS NOT NULL AND nota_final BETWEEN 0 AND 100),
    ADD CONSTRAINT ck_historial_estado
        CHECK (estado IS NOT NULL AND estado IN ('Inscrita', 'Retirada', 'Aprobada', 'Reprobada'));

ALTER TABLE asistencia
    ADD CONSTRAINT ck_asistencia_estado
        CHECK (estado IS NOT NULL AND estado IN ('Asistió', 'Faltó'));

-- DEFAULT
ALTER TABLE inscripcion
    ALTER COLUMN estado SET DEFAULT 'Inscrita';

-- UNIQUE
ALTER TABLE estudiante
    ADD CONSTRAINT uq_estudiante_numero_registro UNIQUE (numero_registro);

ALTER TABLE aula
    ADD CONSTRAINT uq_aula_numero UNIQUE (numero);

ALTER TABLE malla_curricular
    ADD CONSTRAINT uq_malla_curricular_nombre UNIQUE (nombre);

ALTER TABLE materia
    ADD CONSTRAINT uq_materia_malla_codigo UNIQUE (malla_curricular_id, codigo),
    ADD CONSTRAINT uq_materia_malla_nombre UNIQUE (malla_curricular_id, nombre);

ALTER TABLE periodo_academico
    ADD CONSTRAINT uq_periodo_academico_nombre UNIQUE (nombre);

ALTER TABLE inscripcion
    ADD CONSTRAINT uq_inscripcion_estudiante_materia_periodo
        UNIQUE (estudiante_id, materia_id, periodo_academico_id);

ALTER TABLE evaluacion
    ADD CONSTRAINT uq_evaluacion_inscripcion_nombre UNIQUE (inscripcion_id, nombre);

ALTER TABLE nota
    ADD CONSTRAINT uq_nota_evaluacion UNIQUE (evaluacion_id);

ALTER TABLE horario
    ADD CONSTRAINT uq_horario_inscripcion_dia_hora
        UNIQUE (inscripcion_id, dia_semana, hora_inicio, hora_fin);

ALTER TABLE asistencia
    ADD CONSTRAINT uq_asistencia_inscripcion_fecha
        UNIQUE (inscripcion_id, fecha_clase);

ALTER TABLE docente
    ADD CONSTRAINT uq_docente_estudiante_nombre
        UNIQUE (creado_por_estudiante_id, nombres, apellidos);

ALTER TABLE historial_academico
    ADD CONSTRAINT uq_historial_estudiante_materia_periodo
        UNIQUE (estudiante_id, materia_id, periodo_academico_id);

CREATE INDEX idx_horario_inscripcion_dia_hora
    ON horario (inscripcion_id, dia_semana, hora_inicio, hora_fin);

-- Al cerrar un periodo, se conserva una copia inmutable del resultado académico.
CREATE OR REPLACE FUNCTION preparar_cierre_periodo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cerrado = TRUE AND OLD.cerrado = FALSE THEN
        NEW.fecha_cierre := COALESCE(NEW.fecha_cierre, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION archivar_historial_periodo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cerrado = TRUE AND OLD.cerrado = FALSE THEN
        INSERT INTO historial_academico
            (estudiante_id, materia_id, periodo_academico_id,
             semestre_cursado, nota_final, estado)
         SELECT i.estudiante_id,
                i.materia_id,
                i.periodo_academico_id,
                i.semestre_cursado,
                ROUND(COALESCE(SUM(n.nota * e.porcentaje / 100), 0), 2),
                CASE
                    WHEN i.estado = 'Retirada' THEN 'Retirada'
                    WHEN COALESCE(SUM(n.nota * e.porcentaje / 100), 0) >= 51 THEN 'Aprobada'
                    ELSE 'Reprobada'
                END
          FROM inscripcion i
          LEFT JOIN evaluacion e ON e.inscripcion_id = i.inscripcion_id
          LEFT JOIN nota n ON n.evaluacion_id = e.evaluacion_id
         WHERE i.periodo_academico_id = NEW.periodo_academico_id
         GROUP BY i.estudiante_id, i.materia_id,
                   i.periodo_academico_id, i.semestre_cursado, i.estado
        ON CONFLICT (estudiante_id, materia_id, periodo_academico_id)
        DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_preparar_cierre_periodo
BEFORE UPDATE OF cerrado ON periodo_academico
FOR EACH ROW EXECUTE FUNCTION preparar_cierre_periodo();

CREATE TRIGGER trg_archivar_historial_periodo
AFTER UPDATE OF cerrado ON periodo_academico
FOR EACH ROW EXECUTE FUNCTION archivar_historial_periodo();
