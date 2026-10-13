-- Agrega fotos de perfil privadas y persistentes para estudiantes existentes.

ALTER TABLE estudiante
    ADD COLUMN IF NOT EXISTS foto_perfil BYTEA,
    ADD COLUMN IF NOT EXISTS foto_perfil_mime VARCHAR(50);

ALTER TABLE estudiante
    DROP CONSTRAINT IF EXISTS ck_estudiante_foto_perfil;

ALTER TABLE estudiante
    ADD CONSTRAINT ck_estudiante_foto_perfil
        CHECK (foto_perfil IS NULL OR (foto_perfil_mime IN ('image/jpeg', 'image/png', 'image/webp') AND octet_length(foto_perfil) <= 2097152));
