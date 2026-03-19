# 📋 Doctor Vet CRM 360 — Documentação Completa da API

> **Base URL:** `https://lezskryhspxfptbzccld.supabase.co`
> **API REST:** `{BASE_URL}/rest/v1/{tabela}`
> **Autenticação:** Bearer Token via `apikey` header

---

## 🔑 Autenticação

Todas as requisições exigem dois headers obrigatórios:

```
apikey: SUA_SUPABASE_ANON_KEY
Authorization: Bearer SUA_SUPABASE_ANON_KEY
```

**Variáveis usadas nos exemplos:**

```bash
SUPABASE_URL="https://lezskryhspxfptbzccld.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlenNrcnloc3B4ZnB0YnpjY2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzM0MTMsImV4cCI6MjA4ODcwOTQxM30.DCXBWBs7Vj9NAhr6zMjU2qIBGzSC3OqJXdoHGTNqZsI"
```

---

## 📊 Esquema do Banco de Dados

| Tabela | Descrição | PK |
|---|---|---|
| `professionals` | Banhistas, veterinários e motoristas | UUID |
| `clients` | Clientes/Tutores | SERIAL (int) |
| `pets` | Animais de estimação (FK → clients) | SERIAL (int) |
| `products` | Produtos e serviços da boutique | SERIAL (int) |
| `appointments` | Agendamentos de banho e tosa | UUID |
| `hospital_beds` | Leitos de internação | SERIAL (int) |
| `home_visits` | Visitas domiciliares | SERIAL (int) |

---

## 1️⃣ Profissionais (`professionals`)

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | ID único (auto) |
| `name` | TEXT | Nome do profissional |
| `role` | TEXT | Função: `Groomer`, `Vet`, `Driver` |
| `active` | BOOLEAN | Se está ativo |
| `created_at` | TIMESTAMPTZ | Data de criação (auto) |

### Listar todos os profissionais

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/professionals?select=*" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Listar apenas Groomers ativos

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/professionals?select=name&active=eq.true&role=eq.Groomer" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Criar profissional

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/professionals" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Maria",
    "role": "Groomer",
    "active": true
  }'
```

### Atualizar profissional

```bash
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/professionals?id=eq.UUID_DO_PROFISSIONAL" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"active": false}'
```

### Deletar profissional

```bash
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/professionals?id=eq.UUID_DO_PROFISSIONAL" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

---

## 2️⃣ Clientes (`clients`)

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL | ID auto-incremento |
| `name` | TEXT | Nome do tutor |
| `phone` | TEXT | Telefone |
| `email` | TEXT | E-mail |
| `address` | TEXT | Endereço |
| `created_at` | TIMESTAMPTZ | Data de criação (auto) |

### Listar todos os clientes (com paginação)

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/clients?select=*,pets(*)&order=name&offset=0&limit=50" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Prefer: count=exact"
```

### Buscar clientes por nome ou telefone

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/clients?select=*,pets(*)&or=(name.ilike.%25João%25,phone.ilike.%2511%25)&order=name" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Contar total de clientes

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/clients?select=id&limit=0" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Prefer: count=exact"
```

> O total vem no header `content-range` da resposta.

### Criar cliente

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/clients" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "João Silva",
    "phone": "11999887766",
    "email": "joao@email.com",
    "address": "Rua das Flores, 123"
  }'
```

**Resposta (201):**
```json
[{
  "id": 42,
  "name": "João Silva",
  "phone": "11999887766",
  "email": "joao@email.com",
  "address": "Rua das Flores, 123",
  "created_at": "2026-03-15T13:00:00+00:00"
}]
```

### Atualizar cliente

```bash
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/clients?id=eq.42" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "João Silva Santos",
    "phone": "11999887755"
  }'
```

### Deletar cliente

```bash
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/clients?id=eq.42" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

> ⚠️ Deletar um cliente remove automaticamente seus pets (ON DELETE CASCADE).

---

## 3️⃣ Pets (`pets`)

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL | ID auto-incremento |
| `owner_id` | INTEGER | FK → `clients.id` |
| `name` | TEXT | Nome do pet |
| `species` | TEXT | Espécie: `Cão`, `Gato` |
| `breed` | TEXT | Raça |
| `age` | TEXT | Idade |
| `weight` | TEXT | Peso |
| `has_fleas_ticks` | BOOLEAN | Tem pulgas ou carrapatos? |
| `vaccines_up_to_date` | BOOLEAN | Vacinas estão em dia? |
| `medical_notes` | TEXT | Notas médicas |
| `behavior_tags` | TEXT[] | Tags: `["Dócil", "Agitado"]` |
| `image_url` | TEXT | URL da foto |
| `obs` | TEXT | Observações |
| `gender` | TEXT | Sexo: `Macho`, `Fêmea` |
| `birth_date` | TEXT | Data de nascimento |
| `created_at` | TIMESTAMPTZ | Data de criação (auto) |

### Listar pets de um cliente

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/pets?select=*&owner_id=eq.42" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Criar pet

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/pets" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "owner_id": 42,
    "name": "Rex",
    "species": "Cão",
    "breed": "Labrador",
    "age": "3 anos",
    "weight": "28kg",
    "has_fleas_ticks": false,
    "vaccines_up_to_date": true,
    "medical_notes": "Alérgico a carrapato",
    "behavior_tags": ["Dócil", "Brincalhão"],
    "gender": "Macho",
    "birth_date": "2023-05-10"
  }'
```

### Atualizar pet

```bash
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/pets?id=eq.10" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "weight": "30kg",
    "medical_notes": "Alérgico a carrapato. Vacina V10 em dia."
  }'
```

### Deletar pet

```bash
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/pets?id=eq.10" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Deletar todos os pets de um cliente

```bash
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/pets?owner_id=eq.42" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

---

## 4️⃣ Produtos e Serviços (`products`)

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL | ID auto-incremento |
| `name` | TEXT | Nome do produto/serviço |
| `category` | TEXT | Categoria: `Serviços`, `Alimentos`, `Farmácia` |
| `price` | DECIMAL(10,2) | Preço em R$ |
| `stock` | INTEGER | Estoque disponível |
| `available` | BOOLEAN | Se está disponível para venda |
| `created_at` | TIMESTAMPTZ | Data de criação (auto) |

### Listar todos os produtos

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/products?select=*&order=name" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Buscar serviços por nome (parcial)

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/products?select=price&name=ilike.*Banho*" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Criar produto

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/products" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Banho + Tosa Completa (G)",
    "category": "Serviços",
    "price": 95.00,
    "stock": 999,
    "available": true
  }'
```

### Atualizar produto

```bash
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/products?id=eq.5" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "price": 99.90,
    "stock": 50
  }'
```

### Deletar produto

```bash
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/products?id=eq.5" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

---

## 5️⃣ Agendamentos (`appointments`)

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | ID único (auto) |
| `professional_name` | TEXT | Nome do profissional |
| `client_id` | INTEGER | FK → `clients.id` (opcional) |
| `pet_id` | INTEGER | FK → `pets.id` (opcional) |
| `pet_name` | TEXT | Nome do pet (cache) |
| `tutor_name` | TEXT | Nome do tutor (cache) |
| `date` | DATE | Data do agendamento (`YYYY-MM-DD`) |
| `time` | TEXT | Horário: `08:00` a `17:00` |
| `service_type` | TEXT | Tipo de serviço |
| `status` | TEXT | `Agendado`, `Confirmado`, `Em Andamento`, `Finalizado`, `Bloqueado` |
| `price` | DECIMAL(10,2) | Preço do serviço |
| `created_at` | TIMESTAMPTZ | Data de criação (auto) |

### Listar agendamentos de um dia

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/appointments?select=*&date=eq.2026-03-15" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Listar histórico de um cliente (finalizados)

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/appointments?select=*&client_id=eq.42&status=eq.Finalizado&order=date.desc&limit=5" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Criar agendamento

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/appointments" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "professional_name": "Luiza",
    "pet_name": "Rex",
    "tutor_name": "João Silva",
    "service_type": "Banho + Tosa Higiênica",
    "date": "2026-03-16",
    "time": "10:00",
    "client_id": 42,
    "pet_id": 10,
    "status": "Agendado",
    "price": 80.00
  }'
```

### Criar bloqueio de horário

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/appointments" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "professional_name": "Luiza",
    "pet_name": "-",
    "tutor_name": "-",
    "service_type": "Bloqueio de Horário",
    "date": "2026-03-16",
    "time": "14:00",
    "status": "Bloqueado",
    "price": 0
  }'
```

### Atualizar status do agendamento

```bash
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/appointments?id=eq.UUID_DO_AGENDAMENTO" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"status": "Finalizado"}'
```

**Status possíveis:** `Agendado` → `Confirmado` → `Em Andamento` → `Finalizado`

### Deletar agendamento

```bash
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/appointments?id=eq.UUID_DO_AGENDAMENTO" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Buscar todos os agendamentos finalizados (para Dashboard)

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/appointments?select=service_type,client_id,tutor_name,pet_name,date,price&status=eq.Finalizado" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

---

## 6️⃣ Leitos de Internação (`hospital_beds`)

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL | ID auto-incremento |
| `label` | TEXT | Rótulo do leito: `01`, `UTI-01` |
| `status` | TEXT | `Livre`, `Ocupado`, `Manutenção` |
| `patient_name` | TEXT | Nome do animal internado |
| `species` | TEXT | Espécie |
| `reason` | TEXT | Motivo da internação |
| `updated_at` | TIMESTAMPTZ | Última atualização |

### Listar todos os leitos

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/hospital_beds?select=*" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Internar animal (atualizar leito)

```bash
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/hospital_beds?id=eq.2" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "status": "Ocupado",
    "patient_name": "Luna",
    "species": "Gato",
    "reason": "Cirurgia de castração"
  }'
```

### Liberar leito

```bash
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/hospital_beds?id=eq.2" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Livre",
    "patient_name": null,
    "species": null,
    "reason": null
  }'
```

---

## 7️⃣ Visitas Domiciliares (`home_visits`)

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL | ID auto-incremento |
| `time` | TEXT | Horário da visita |
| `address` | TEXT | Endereço completo |
| `tutor_name` | TEXT | Nome do tutor |
| `pet_name` | TEXT | Nome do pet |
| `type` | TEXT | Tipo: `Vacinação`, `Consulta` |
| `status` | TEXT | `Pendente`, `Confirmado`, `Finalizado` |
| `date` | DATE | Data da visita |

### Listar visitas do dia

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/home_visits?select=*&date=eq.2026-03-15" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

### Criar visita domiciliar

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/home_visits" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "time": "14:00",
    "address": "Rua São Paulo, 500 - Centro",
    "tutor_name": "Ana Costa",
    "pet_name": "Pipoca",
    "type": "Vacinação",
    "status": "Pendente",
    "date": "2026-03-16"
  }'
```

### Atualizar status da visita

```bash
curl -X PATCH \
  "${SUPABASE_URL}/rest/v1/home_visits?id=eq.3" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"status": "Confirmado"}'
```

### Deletar visita

```bash
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/home_visits?id=eq.3" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

---

## 🔍 Busca Facilitada de Cliente por Telefone (RPC)

> **Pré-requisito:** Execute o SQL do arquivo `rpc_buscar_cliente_telefone.sql` no SQL Editor do Supabase.
>
> Esta função resolve automaticamente:
> - ✅ Telefone **com ou sem DDI** (`55`)
> - ✅ Telefone **com ou sem nono dígito** (9)
> - ✅ Telefone com **espaços, traços, parênteses**
> - ✅ Retorna **tudo**: cliente, pets, agendamentos, visitas e resumo financeiro

### 🚀 Curl único — Busca completa por telefone

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/buscar_cliente_por_telefone" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"telefone_input": "11999887766"}'
```

### Exemplos de uso (todos encontram o mesmo cliente)

```bash
# Com DDI + nono dígito
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/buscar_cliente_por_telefone" \
  -H "apikey: ${SUPABASE_KEY}" -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"telefone_input": "5511999887766"}'

# Sem DDI + com nono dígito
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/buscar_cliente_por_telefone" \
  -H "apikey: ${SUPABASE_KEY}" -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"telefone_input": "11999887766"}'

# Sem DDI + sem nono dígito
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/buscar_cliente_por_telefone" \
  -H "apikey: ${SUPABASE_KEY}" -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"telefone_input": "1199887766"}'

# Com DDI + sem nono dígito
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/buscar_cliente_por_telefone" \
  -H "apikey: ${SUPABASE_KEY}" -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"telefone_input": "551199887766"}'

# Com formatação (parênteses, traços, espaços)
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/buscar_cliente_por_telefone" \
  -H "apikey: ${SUPABASE_KEY}" -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"telefone_input": "+55 (11) 99988-7766"}'
```

### Resposta de exemplo

```json
{
  "busca_info": {
    "telefone_informado": "11999887766",
    "telefone_limpo": "11999887766",
    "telefone_sem_ddi": "11999887766",
    "telefone_sem_nono": "1199887766",
    "ultimos_8_digitos": "99887766"
  },
  "clientes_encontrados": [
    {
      "cliente": {
        "id": 42,
        "nome": "João Silva",
        "telefone": "11999887766",
        "email": "joao@email.com",
        "endereco": "Rua das Flores, 123",
        "cadastrado_em": "2026-03-15T13:00:00+00:00"
      },
      "pets": [
        {
          "id": 10,
          "nome": "Rex",
          "especie": "Cão",
          "raca": "Labrador",
          "idade": "3 anos",
          "peso": "28kg",
          "sexo": "Macho",
          "pulgas_carrapatos": false,
          "vacinas_em_dia": true,
          "data_nascimento": "2023-05-10",
          "notas_medicas": "Alérgico a carrapato",
          "comportamento": ["Dócil", "Brincalhão"],
          "observacoes": null,
          "foto_url": null
        }
      ],
      "historico_agendamentos": [
        {
          "id": "uuid-do-agendamento",
          "data": "2026-03-15",
          "horario": "10:00",
          "profissional": "Luiza",
          "pet": "Rex",
          "servico": "Banho + Tosa Higiênica",
          "status": "Finalizado",
          "preco": 80.00
        }
      ],
      "visitas_domiciliares": [
        {
          "id": 1,
          "data": "2026-03-10",
          "horario": "14:00",
          "endereco": "Rua das Flores, 123",
          "pet": "Rex",
          "tipo": "Vacinação",
          "status": "Finalizado"
        }
      ],
      "resumo": {
        "total_pets": 1,
        "total_agendamentos": 5,
        "agendamentos_finalizados": 3,
        "total_gasto": 240.00,
        "ultimo_servico": "2026-03-15",
        "total_visitas_domiciliares": 1
      }
    }
  ]
}
```

> 💡 **Para n8n/Agente AI:** Basta enviar o telefone no formato que vier do WhatsApp e a função cuida de tudo automaticamente!

### Alternativa sem RPC (busca simples via PostgREST)

Se não quiser instalar a RPC, use este curl para buscar pelos últimos 8 dígitos:

```bash
# Busca cliente + pets (parcial por telefone)
curl -X GET \
  "${SUPABASE_URL}/rest/v1/clients?select=*,pets(*)&phone=ilike.*99887766" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"

# Depois, com o client_id retornado, busque o histórico:
curl -X GET \
  "${SUPABASE_URL}/rest/v1/appointments?select=*&client_id=eq.42&order=date.desc" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"

# E as visitas domiciliares pelo nome do tutor:
curl -X GET \
  "${SUPABASE_URL}/rest/v1/home_visits?select=*&tutor_name=eq.João%20Silva&order=date.desc" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

> ⚠️ A alternativa sem RPC exige **3 chamadas separadas** e não normaliza o telefone automaticamente. A RPC resolve tudo em **1 chamada**.

---

## 📅 Horários Disponíveis por Profissional (RPC)

> **Pré-requisito:** Execute o SQL do arquivo `rpc_horarios_disponiveis.sql` no SQL Editor do Supabase.
>
> Retorna os horários **livres e ocupados** de cada profissional ativo para uma data específica.

### Curl — Horários disponíveis de uma data

```bash
curl -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/horarios_disponiveis" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"data_consulta": "2026-03-17"}'
```

### Resposta de exemplo

```json
{
  "data": "2026-03-17",
  "horarios_de_trabalho": ["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"],
  "profissionais": [
    {
      "nome": "Luiza",
      "horarios_disponiveis": ["09:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
      "horarios_ocupados": [
        {
          "horario": "08:00",
          "status": "Agendado",
          "tutor": "João Silva",
          "pet": "Rex",
          "servico": "Banho + Tosa"
        },
        {
          "horario": "10:00",
          "status": "Confirmado",
          "tutor": "Maria",
          "pet": "Bella",
          "servico": "Banho Simples"
        }
      ],
      "total_livres": 6,
      "total_ocupados": 2
    },
    {
      "nome": "Raila",
      "horarios_disponiveis": ["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"],
      "horarios_ocupados": [],
      "total_livres": 8,
      "total_ocupados": 0
    }
  ]
}
```

> 💡 Os horários `12:00` e `13:00` (almoço) **já são excluídos** automaticamente. Só aparecem os horários úteis.

---

## 🔧 Operações Avançadas

### Criar cliente completo (cliente + pets em sequência)

```bash
# Passo 1: Criar o cliente
curl -X POST \
  "${SUPABASE_URL}/rest/v1/clients" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Maria Oliveira",
    "phone": "11988776655",
    "email": "maria@email.com",
    "address": "Av. Brasil, 200"
  }'

# Passo 2: Usar o ID retornado para criar os pets
curl -X POST \
  "${SUPABASE_URL}/rest/v1/pets" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '[
    {
      "owner_id": 43,
      "name": "Bella",
      "species": "Cão",
      "breed": "Poodle",
      "age": "2 anos",
      "weight": "5kg",
      "gender": "Fêmea",
      "behavior_tags": ["Dócil"]
    },
    {
      "owner_id": 43,
      "name": "Mimi",
      "species": "Gato",
      "breed": "Siamês",
      "age": "1 ano",
      "weight": "3kg",
      "gender": "Fêmea",
      "behavior_tags": ["Calmo"]
    }
  ]'
```

### Verificar horários disponíveis de um profissional em um dia

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/appointments?select=time,status&professional_name=eq.Luiza&date=eq.2026-03-16" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

> Os horários de trabalho são: `08:00` a `17:00` (horários de hora em hora). Horários `12:00` e `13:00` são de almoço. Horários **não retornados** estão livres.

### Buscar cliente por telefone (para verificar duplicidade)

```bash
curl -X GET \
  "${SUPABASE_URL}/rest/v1/clients?select=id&phone=eq.11999887766" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Accept: application/vnd.pgrst.object+json"
```

### Reset completo do banco (⚠️ CUIDADO)

```bash
# 1. Apagar agendamentos
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/appointments?time=neq.INVALID_TIME" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"

# 2. Apagar pets
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/pets?id=gt.0" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"

# 3. Apagar clientes
curl -X DELETE \
  "${SUPABASE_URL}/rest/v1/clients?id=gt.0" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}"
```

---

## 📌 Referência Rápida de Filtros PostgREST

| Operador | Significado | Exemplo |
|---|---|---|
| `eq` | Igual | `?status=eq.Agendado` |
| `neq` | Diferente | `?status=neq.Finalizado` |
| `gt` | Maior que | `?id=gt.0` |
| `gte` | Maior ou igual | `?price=gte.50` |
| `lt` | Menor que | `?price=lt.100` |
| `lte` | Menor ou igual | `?stock=lte.5` |
| `ilike` | Busca parcial (insensível) | `?name=ilike.*banho*` |
| `in` | Dentro de lista | `?status=in.(Agendado,Confirmado)` |
| `is` | É nulo | `?email=is.null` |
| `or` | Ou lógico | `?or=(name.ilike.*Rex*,phone.eq.119)` |

### Paginação

```
?offset=0&limit=50       # Primeiros 50 registros
?offset=50&limit=50      # Próximos 50 registros
```

### Ordenação

```
?order=name              # Ascendente por nome
?order=created_at.desc   # Descendente por data
?order=price.asc         # Ascendente por preço
```

### Selecionar campos específicos

```
?select=id,name,phone    # Apenas esses campos
?select=*,pets(*)        # Todos os campos + relação com pets
```

---

## ⏰ Nota sobre Timezone

O Supabase armazena datas em **UTC**. O fuso horário do Brasil (BRT) é **UTC-3**.

- Ao criar agendamentos, use o campo `date` no formato `YYYY-MM-DD` (sem horário) para evitar conversões de fuso.
- O campo `time` é TEXT e armazenado como string (`"10:00"`), sem conversão de timezone.
- Para campos `TIMESTAMPTZ` como `created_at`, as datas retornadas estarão em UTC. Para converter para BRT, subtraia 3 horas.

---

## 📡 Códigos de Resposta HTTP

| Código | Significado |
|---|---|
| `200` | Sucesso (GET, PATCH) |
| `201` | Criado com sucesso (POST) |
| `204` | Deletado com sucesso (DELETE) |
| `400` | Requisição inválida |
| `401` | Não autorizado (chave inválida) |
| `404` | Recurso não encontrado |
| `409` | Conflito (registro duplicado) |
| `500` | Erro interno do servidor |
