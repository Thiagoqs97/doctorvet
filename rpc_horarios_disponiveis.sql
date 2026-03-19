-- ==========================================================
-- 📅 RPC: Horários Disponíveis por Profissional
-- ==========================================================
-- Retorna os horários LIVRES de cada profissional ativo
-- para uma data específica, de forma organizada.
--
-- COMO INSTALAR:
--   1. Abra o Supabase Dashboard → SQL Editor
--   2. Cole este SQL e execute
--
-- COMO USAR VIA CURL:
--   curl -X POST "${SUPABASE_URL}/rest/v1/rpc/horarios_disponiveis" \
--     -H "apikey: ${SUPABASE_KEY}" \
--     -H "Authorization: Bearer ${SUPABASE_KEY}" \
--     -H "Content-Type: application/json" \
--     -d '{"data_consulta": "2026-03-17"}'
-- ==========================================================

CREATE OR REPLACE FUNCTION horarios_disponiveis(data_consulta DATE)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    resultado JSON;
    todos_horarios TEXT[] := ARRAY['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];
BEGIN
    SELECT json_build_object(
        'data', data_consulta,
        'horarios_de_trabalho', todos_horarios,
        'profissionais', COALESCE((
            SELECT json_agg(
                json_build_object(
                    'nome', prof.name,
                    'horarios_disponiveis', COALESCE((
                        SELECT json_agg(h ORDER BY h)
                        FROM unnest(todos_horarios) AS h
                        WHERE h NOT IN (
                            SELECT a.time
                            FROM appointments a
                            WHERE a.professional_name = prof.name
                              AND a.date = data_consulta
                              AND a.status NOT IN ('Cancelado')
                        )
                    ), '[]'::json),
                    'horarios_ocupados', COALESCE((
                        SELECT json_agg(
                            json_build_object(
                                'horario', a.time,
                                'status', a.status,
                                'tutor', a.tutor_name,
                                'pet', a.pet_name,
                                'servico', a.service_type
                            ) ORDER BY a.time
                        )
                        FROM appointments a
                        WHERE a.professional_name = prof.name
                          AND a.date = data_consulta
                          AND a.status NOT IN ('Cancelado')
                    ), '[]'::json),
                    'total_livres', (
                        SELECT count(*)
                        FROM unnest(todos_horarios) AS h
                        WHERE h NOT IN (
                            SELECT a.time
                            FROM appointments a
                            WHERE a.professional_name = prof.name
                              AND a.date = data_consulta
                              AND a.status NOT IN ('Cancelado')
                        )
                    ),
                    'total_ocupados', (
                        SELECT count(*)
                        FROM appointments a
                        WHERE a.professional_name = prof.name
                          AND a.date = data_consulta
                          AND a.status NOT IN ('Cancelado')
                    )
                ) ORDER BY prof.name
            )
            FROM professionals prof
            WHERE prof.active = true
              AND prof.role = 'Groomer'
        ), '[]'::json)
    ) INTO resultado;

    RETURN resultado;
END;
$$;
