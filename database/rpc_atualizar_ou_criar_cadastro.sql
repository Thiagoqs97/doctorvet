-- ==========================================================
-- 🛠️ RPC: Atualizar ou Criar Cadastro (Tutor + Pet)
-- ==========================================================
-- Esta função recebe todos os dados do Tutor e de 1 Pet em uma 
-- única chamada. Ela irá:
-- 1. Buscar o cliente pelo telefone (usando a mesma lógica flexível dos 8 dígitos)
-- 2. Se o cliente existir, ATUALIZA os dados dele. Se não existir, CRIA.
-- 3. Busca o pet pelo nome (pertencente a este cliente)
-- 4. Se o pet existir, ATUALIZA. Se não existir, CRIA.
--
-- COMO INSTALAR:
--   1. Abra o Supabase Dashboard → SQL Editor
--   2. Cole este SQL e clique em "Run" (Executar)
-- ==========================================================

CREATE OR REPLACE FUNCTION atualizar_ou_criar_cadastro(
    p_telefone TEXT,
    p_nome_tutor TEXT,
    p_cpf TEXT,
    p_data_nascimento_tutor TEXT,
    p_email TEXT,
    p_endereco TEXT,
    p_cep TEXT,
    
    p_nome_pet TEXT,
    p_especie TEXT,
    p_raca TEXT,
    p_peso TEXT,
    p_sexo TEXT,
    p_comportamento TEXT,
    p_alergias TEXT,
    p_pulgas BOOLEAN,
    p_vacinas BOOLEAN,
    p_data_nascimento_pet TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    telefone_limpo TEXT;
    telefone_sem_ddi TEXT;
    telefone_sem_nono TEXT;
    ultimos_8 TEXT;
    
    v_client_id INT;
    v_pet_id INT;
    
    v_comportamento_array TEXT[];
BEGIN
    -- ==========================================
    -- 1. TRATAMENTO DO TELEFONE
    -- ==========================================
    telefone_limpo := regexp_replace(COALESCE(p_telefone, ''), '[^0-9]', '', 'g');
    telefone_sem_ddi := telefone_limpo;
    IF length(telefone_limpo) > 11 AND left(telefone_limpo, 2) = '55' THEN
        telefone_sem_ddi := substring(telefone_limpo FROM 3);
    END IF;

    telefone_sem_nono := telefone_sem_ddi;
    IF length(telefone_sem_ddi) = 11 AND substring(telefone_sem_ddi FROM 3 FOR 1) = '9' THEN
        telefone_sem_nono := left(telefone_sem_ddi, 2) || substring(telefone_sem_ddi FROM 4);
    END IF;

    ultimos_8 := right(telefone_sem_ddi, 8);

    -- ==========================================
    -- 2. BUSCAR OU CRIAR CLIENTE (UPSERT LÓGICO)
    -- ==========================================
    IF length(telefone_limpo) >= 8 THEN
        SELECT id INTO v_client_id
        FROM clients c
        WHERE 
            regexp_replace(c.phone, '[^0-9]', '', 'g') LIKE '%' || ultimos_8
            OR regexp_replace(c.phone, '[^0-9]', '', 'g') = telefone_limpo
            OR regexp_replace(c.phone, '[^0-9]', '', 'g') = telefone_sem_ddi
            OR regexp_replace(c.phone, '[^0-9]', '', 'g') = telefone_sem_nono
        LIMIT 1;
    END IF;

    IF v_client_id IS NOT NULL THEN
        -- CLiente existe: ATUALIZAR
        UPDATE clients SET
            name = COALESCE(NULLIF(p_nome_tutor, ''), name),
            cpf = COALESCE(NULLIF(p_cpf, ''), cpf),
            birth_date = COALESCE(NULLIF(p_data_nascimento_tutor, ''), birth_date),
            email = COALESCE(NULLIF(p_email, ''), email),
            address = COALESCE(NULLIF(p_endereco, ''), address),
            cep = COALESCE(NULLIF(p_cep, ''), cep)
            -- O telefone não atualizamos aqui para não quebrar a chave de busca caso digitem errado, 
            -- mas se quiser forçar a reescrita do telefone com a formatação nova enviada:
            -- phone = COALESCE(NULLIF(p_telefone, ''), phone)
        WHERE id = v_client_id;
    ELSE
        -- Cliente não existe: CRIAR
        INSERT INTO clients (name, phone, cpf, birth_date, email, address, cep)
        VALUES (
            COALESCE(p_nome_tutor, 'Sem Nome'), 
            COALESCE(p_telefone, ''), 
            p_cpf, 
            p_data_nascimento_tutor, 
            p_email, 
            p_endereco, 
            p_cep
        ) RETURNING id INTO v_client_id;
    END IF;

    -- ==========================================
    -- 3. BUSCAR OU CRIAR PET (UPSERT LÓGICO)
    -- ==========================================
    -- Converter string vazia de comportamento para NULL e evitar array vazio
    IF p_comportamento IS NOT NULL AND trim(p_comportamento) != '' THEN
        -- Transforma "Agitado, Bravo" num array de strings
        v_comportamento_array := string_to_array(p_comportamento, ',');
    ELSE
        v_comportamento_array := '{}';
    END IF;

    SELECT id INTO v_pet_id
    FROM pets
    WHERE owner_id = v_client_id AND lower(trim(name)) = lower(trim(p_nome_pet))
    LIMIT 1;

    IF v_pet_id IS NOT NULL THEN
        -- Pet Existe: ATUALIZAR
        UPDATE pets SET
            species = COALESCE(NULLIF(p_especie, ''), species),
            breed = COALESCE(NULLIF(p_raca, ''), breed),
            weight = COALESCE(NULLIF(p_peso, ''), weight),
            gender = COALESCE(NULLIF(p_sexo, ''), gender),
            behavior_tags = CASE WHEN array_length(v_comportamento_array, 1) > 0 THEN v_comportamento_array ELSE behavior_tags END,
            medical_notes = COALESCE(NULLIF(p_alergias, ''), medical_notes),
            has_fleas_ticks = COALESCE(p_pulgas, has_fleas_ticks),
            vaccines_up_to_date = COALESCE(p_vacinas, vaccines_up_to_date),
            birth_date = COALESCE(NULLIF(p_data_nascimento_pet, ''), birth_date)
        WHERE id = v_pet_id;
    ELSE
        -- Pet não existe: CRIAR
        -- Se vier sem nome, tenta salvar pelo menos as outras configs pra não dar erro
        IF p_nome_pet IS NOT NULL AND trim(p_nome_pet) != '' THEN
            INSERT INTO pets (
                owner_id, name, species, breed, weight, gender, 
                behavior_tags, medical_notes, has_fleas_ticks, vaccines_up_to_date, birth_date
            ) VALUES (
                v_client_id, 
                trim(p_nome_pet), 
                p_especie, 
                p_raca, 
                p_peso, 
                p_sexo, 
                v_comportamento_array, 
                p_alergias, 
                COALESCE(p_pulgas, false), 
                COALESCE(p_vacinas, false), 
                p_data_nascimento_pet
            ) RETURNING id INTO v_pet_id;
        END IF;
    END IF;

    -- ==========================================
    -- 4. RETORNA SUCESSO E OS IDs
    -- ==========================================
    RETURN json_build_object(
        'sucesso', true,
        'mensagem', 'Cadastro atualizado/criado com sucesso!',
        'dados', json_build_object(
            'cliente_id', v_client_id,
            'pet_id', v_pet_id
        )
    );
END;
$$;
