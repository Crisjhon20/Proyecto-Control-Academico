-- Completa la nomenclatura del modelo de ciclos compartidos.

BEGIN;

ALTER TABLE ciclo_academico
    RENAME COLUMN periodo_academico_id TO ciclo_academico_id;

ALTER TABLE ciclo_academico
    RENAME CONSTRAINT periodo_academico_pkey TO ciclo_academico_pkey;

COMMIT;
