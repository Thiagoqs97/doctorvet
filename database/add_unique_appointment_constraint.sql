-- ==========================================================
-- 🔒 ADICIONAR BLOQUEIO DE HORÁRIO DUPLICADO
-- ==========================================================
-- Este script cria um "Índice Único Parcial" (Partial Unique Index) 
-- na sua tabela de agendamentos.
--
-- O QUE ELE FAZ:
-- Ele impede fisicamente que duas linhas tenham o mesmo Profissional
-- na mesma Data e na mesma Hora, *A NÃO SER* que o status de uma 
-- delas seja 'Cancelado'.
--
-- COMO INSTALAR:
--   1. Copie todo este código.
--   2. Cole no SQL Editor do seu Supabase.
--   3. Aperte "Run".
-- ==========================================================

-- Cria o índice único (se ele já existir, o IF NOT EXISTS impede erro)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_appointment 
ON appointments (professional_name, date, time) 
WHERE status != 'Cancelado';

-- A partir de agora, se o n8n tentar colocar dois pets no mesmo 
-- horário, o Supabase vai retornar um erro e bloquear a segunda inserção.
