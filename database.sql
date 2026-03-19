-- Habilita extensão para UUIDs (necessário para IDs únicos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profissionais (Banhistas, Veterinários, Motoristas)
CREATE TABLE IF NOT EXISTS professionals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'Groomer', 'Vet', 'Driver'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inserção inicial de Banhistas
INSERT INTO professionals (name, role) VALUES 
  ('Luiza', 'Groomer'),
  ('Raila', 'Groomer'),
  ('Assis', 'Groomer');

-- 2. Clientes (Tutores)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Pets
CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL, -- 'Cão', 'Gato'
  breed TEXT,
  age TEXT,
  weight TEXT,
  medical_notes TEXT,
  behavior_tags TEXT[], -- Array de tags: ['Dócil', 'Agitado']
  image_url TEXT,
  obs TEXT,
  gender TEXT,
  is_neutered BOOLEAN DEFAULT FALSE,
  vaccines_up_to_date BOOLEAN DEFAULT FALSE,
  birth_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Produtos e Serviços (Boutique)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Serviço', 'Alimento', 'Farmácia'
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inserção inicial de Produtos
INSERT INTO products (name, category, price, stock, available) VALUES
('Banho Simples (P/M)', 'Serviços', 45.00, 999, true),
('Tosa Higiênica', 'Serviços', 35.00, 999, true),
('Ração Premium 15kg', 'Alimentos', 189.90, 12, true),
('Coleira Anti-pulgas', 'Farmácia', 89.90, 45, true);

-- 5. Agendamentos (Banho e Tosa)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  professional_name TEXT NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  pet_id INTEGER REFERENCES pets(id),
  pet_name TEXT, -- Cache do nome para exibição rápida
  tutor_name TEXT, -- Cache do nome para exibição rápida
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL, -- Formato '08:00'
  service_type TEXT,
  status TEXT NOT NULL DEFAULT 'Agendado', -- 'Livre', 'Agendado', 'Confirmado', 'Finalizado', 'Almoço'
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Internação (Doctor Vet)
CREATE TABLE IF NOT EXISTS hospital_beds (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL, -- '01', '02', 'UTI-01'
  status TEXT DEFAULT 'Livre', -- 'Livre', 'Ocupado', 'Manutenção'
  patient_name TEXT,
  species TEXT,
  reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

INSERT INTO hospital_beds (label, status, patient_name, species, reason) VALUES 
('01', 'Ocupado', 'Thor', 'Cão', 'Pós-Op'),
('02', 'Livre', NULL, NULL, NULL),
('03', 'Livre', NULL, NULL, NULL);

-- 7. Visitas Domiciliares (Doctor Home)
CREATE TABLE IF NOT EXISTS home_visits (
  id SERIAL PRIMARY KEY,
  time TEXT NOT NULL,
  address TEXT NOT NULL,
  tutor_name TEXT,
  pet_name TEXT,
  type TEXT, -- 'Vacina', 'Consulta'
  status TEXT DEFAULT 'Pendente',
  date DATE DEFAULT CURRENT_DATE
);

INSERT INTO home_visits (time, address, tutor_name, pet_name, type, status) VALUES
('08:30', 'Rua das Flores, 123', 'Carla', 'Mel', 'Vacinação', 'Pendente'),
('10:00', 'Av. Paulista, 2000', 'Marcos', 'Bob', 'Consulta', 'Confirmado');

-- --- POLÍTICAS DE SEGURANÇA (RLS) ---
-- Remove políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Public Access" ON professionals;
DROP POLICY IF EXISTS "Public Access" ON clients;
DROP POLICY IF EXISTS "Public Access" ON pets;
DROP POLICY IF EXISTS "Public Access" ON products;
DROP POLICY IF EXISTS "Public Access" ON appointments;
DROP POLICY IF EXISTS "Public Access" ON hospital_beds;
DROP POLICY IF EXISTS "Public Access" ON home_visits;

-- Habilita RLS e cria políticas públicas (para desenvolvimento)
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON professionals FOR ALL USING (true);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON clients FOR ALL USING (true);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON pets FOR ALL USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON products FOR ALL USING (true);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON appointments FOR ALL USING (true);

ALTER TABLE hospital_beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON hospital_beds FOR ALL USING (true);

ALTER TABLE home_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON home_visits FOR ALL USING (true);
