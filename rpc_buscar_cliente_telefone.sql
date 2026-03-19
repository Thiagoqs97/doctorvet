-- ==========================================================
-- 🔍 RPC: Buscar Cliente Completo por Telefone
-- ==========================================================
-- Esta função busca um cliente pelo número de telefone,
-- lidando automaticamente com:
--   ✅ Telefone com ou sem DDI (55)
--   ✅ Telefone com ou sem nono dígito
--   ✅ Retorna dados do cliente, pets e histórico de serviços
--
-- COMO INSTALAR:
--   1. Abra o Supabase Dashboard → SQL Editor
--   2. Cole este SQL e execute
--
-- COMO USAR VIA CURL:
--   curl -X POST "${SUPABASE_URL}/rest/v1/rpc/buscar_cliente_por_telefone" \
--     -H "apikey: ${SUPABASE_KEY}" \
--     -H "Authorization: Bearer ${SUPABASE_KEY}" \
--     -H "Content-Type: application/json" \
--     -d '{"telefone_input": "11999887766"}'
-- ==========================================================

CREATE OR REPLACE FUNCTION buscar_cliente_por_telefone(telefone_input TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    telefone_limpo TEXT;
    telefone_sem_ddi TEXT;
    telefone_sem_nono TEXT;
    ultimos_8 TEXT;
    resultado JSON;
BEGIN
    -- 1. Limpa o input: remove tudo que não é número
    telefone_limpo := regexp_replace(telefone_input, '[^0-9]', '', 'g');

    -- 2. Remove DDI 55 se presente (telefones BR têm 10-11 dígitos sem DDI)
    telefone_sem_ddi := telefone_limpo;
    IF length(telefone_limpo) > 11 AND left(telefone_limpo, 2) = '55' THEN
        telefone_sem_ddi := substring(telefone_limpo FROM 3);
    END IF;

    -- 3. Gera variação sem o nono dígito
    -- Se tem 11 dígitos (DDD + 9 + 8 dígitos), remove o 9 após o DDD
    telefone_sem_nono := telefone_sem_ddi;
    IF length(telefone_sem_ddi) = 11 AND substring(telefone_sem_ddi FROM 3 FOR 1) = '9' THEN
        telefone_sem_nono := left(telefone_sem_ddi, 2) || substring(telefone_sem_ddi FROM 4);
    END IF;

    -- 4. Pega os últimos 8 dígitos (parte mais confiável do número)
    ultimos_8 := right(telefone_sem_ddi, 8);

    -- 5. Busca o cliente + pets + histórico completo
    SELECT json_build_object(
        'busca_info', json_build_object(
            'telefone_informado', telefone_input,
            'telefone_limpo', telefone_limpo,
            'telefone_sem_ddi', telefone_sem_ddi,
            'telefone_sem_nono', telefone_sem_nono,
            'ultimos_8_digitos', ultimos_8
        ),
        'clientes_encontrados', COALESCE((
            SELECT json_agg(
                json_build_object(
                    'cliente', json_build_object(
                        'id', c.id,
                        'nome', c.name,
                        'telefone', c.phone,
                        'email', c.email,
                        'endereco', c.address,
                        'cadastrado_em', c.created_at
                    ),
                    'pets', COALESCE((
                        SELECT json_agg(
                            json_build_object(
                                'id', p.id,
                                'nome', p.name,
                                'especie', p.species,
                                'raca', p.breed,
                                'idade', p.age,
                                'peso', p.weight,
                                'sexo', p.gender,
                                'pulgas_carrapatos', p.has_fleas_ticks,
                                'vacinas_em_dia', p.vaccines_up_to_date,
                                'data_nascimento', p.birth_date,
                                'notas_medicas', p.medical_notes,
                                'comportamento', p.behavior_tags,
                                'observacoes', p.obs,
                                'foto_url', p.image_url
                            ) ORDER BY p.name
                        )
                        FROM pets p
                        WHERE p.owner_id = c.id
                    ), '[]'::json),
                    'historico_agendamentos', COALESCE((
                        SELECT json_agg(
                            json_build_object(
                                'id', a.id,
                                'data', a.date,
                                'horario', a.time,
                                'profissional', a.professional_name,
                                'pet', a.pet_name,
                                'servico', a.service_type,
                                'status', a.status,
                                'preco', a.price
                            ) ORDER BY a.date DESC, a.time DESC
                        )
                        FROM appointments a
                        WHERE a.client_id = c.id
                    ), '[]'::json),
                    'visitas_domiciliares', COALESCE((
                        SELECT json_agg(
                            json_build_object(
                                'id', hv.id,
                                'data', hv.date,
                                'horario', hv.time,
                                'endereco', hv.address,
                                'pet', hv.pet_name,
                                'tipo', hv.type,
                                'status', hv.status
                            ) ORDER BY hv.date DESC
                        )
                        FROM home_visits hv
                        WHERE hv.tutor_name = c.name
                    ), '[]'::json),
                    'resumo', json_build_object(
                        'total_pets', (SELECT count(*) FROM pets p WHERE p.owner_id = c.id),
                        'total_agendamentos', (SELECT count(*) FROM appointments a WHERE a.client_id = c.id),
                        'agendamentos_finalizados', (SELECT count(*) FROM appointments a WHERE a.client_id = c.id AND a.status = 'Finalizado'),
                        'total_gasto', COALESCE((SELECT sum(a.price) FROM appointments a WHERE a.client_id = c.id AND a.status = 'Finalizado'), 0),
                        'ultimo_servico', (SELECT a.date FROM appointments a WHERE a.client_id = c.id AND a.status = 'Finalizado' ORDER BY a.date DESC LIMIT 1),
                        'total_visitas_domiciliares', (SELECT count(*) FROM home_visits hv WHERE hv.tutor_name = c.name)
                    )
                )
            )
            FROM clients c
            WHERE 
                -- Busca por variações do telefone usando os últimos 8 dígitos
                regexp_replace(c.phone, '[^0-9]', '', 'g') LIKE '%' || ultimos_8
                -- OU busca exata pelas variações completas
                OR regexp_replace(c.phone, '[^0-9]', '', 'g') = telefone_limpo
                OR regexp_replace(c.phone, '[^0-9]', '', 'g') = telefone_sem_ddi
                OR regexp_replace(c.phone, '[^0-9]', '', 'g') = telefone_sem_nono
                OR regexp_replace(c.phone, '[^0-9]', '', 'g') = '55' || telefone_sem_ddi
                OR regexp_replace(c.phone, '[^0-9]', '', 'g') = '55' || telefone_sem_nono
        ), '[]'::json)
    ) INTO resultado;

    RETURN resultado;
END;
$$;
