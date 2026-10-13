-- Actualiza el cálculo del estado histórico sin modificar la estructura.
CREATE OR REPLACE FUNCTION archivar_historial_periodo_estudiante()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cerrado = TRUE AND OLD.cerrado = FALSE THEN
        INSERT INTO historial_academico
            (estudiante_id, materia_id, periodo_estudiante_id,
             semestre_cursado, nota_final, estado)
        SELECT i.estudiante_id,
               i.materia_id,
               i.periodo_estudiante_id,
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
         WHERE i.periodo_estudiante_id = NEW.periodo_estudiante_id
         GROUP BY i.estudiante_id, i.materia_id,
                  i.periodo_estudiante_id, i.semestre_cursado, i.estado
         ON CONFLICT (estudiante_id, materia_id, periodo_estudiante_id)
        DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
