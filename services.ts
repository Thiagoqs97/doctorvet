import { supabase } from './supabaseClient';
import { 
  products as mockProducts, 
  professionals as mockProfessionalsList,
  initialPetClients
} from './mockData';
import { PetClient, GroomingSlot, Product, DashboardMetrics, FinanceMetrics, ClientFormData, ProductFormData } from './types';

// Utilitário para formatar data 'YYYY-MM-DD'
const getTodayString = () => new Date().toISOString().split('T')[0];

// --- LEITURA (READ) ---

export const getProfessionals = async (): Promise<string[]> => {
  if (!supabase) return mockProfessionalsList;
  
  const { data, error } = await supabase
    .from('professionals')
    .select('name')
    .eq('active', true)
    .eq('role', 'Groomer');
    
  if (error || !data || data.length === 0) return mockProfessionalsList;
  return data.map(p => p.name);
};

// Busca clientes com paginação e busca no servidor
export const getClients = async (
  page: number = 0,
  limit: number = 50,
  searchTerm: string = ''
): Promise<{ clients: PetClient[], totalCount: number }> => {
  if (!supabase) return { clients: [], totalCount: 0 };

  const from = page * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('clients')
    .select(`*, pets (*)`, { count: 'exact' })
    .order('name')
    .range(from, to);

  if (searchTerm.trim()) {
    // Busca por nome OU telefone
    query = query.or(`name.ilike.%${searchTerm.trim()}%,phone.ilike.%${searchTerm.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error || !data) {
    console.error("Erro ao buscar clientes:", error);
    return { clients: [], totalCount: 0 };
  }

  const clients = data.map((client: Record<string, unknown>) => ({
    id: client.id as number,
    name: client.name as string,
    phone: (client.phone as string) || '',
    email: (client.email as string) || '',
    address: (client.address as string) || '',
    cpf: (client.cpf as string) || '',
    birth_date: (client.birth_date as string) || '',
    cep: (client.cep as string) || '',
    pets: client.pets ? (client.pets as Record<string, unknown>[]).map((p: Record<string, unknown>) => ({
      id: p.id as number | string,
      name: p.name as string,
      species: p.species as string,
      type: p.species as string,    
      breed: p.breed as string,
      age: p.age as string,
      weight: p.weight as string,
      behavior: (p.behavior_tags as string[]) || [],
      medical: p.medical_notes as string,
      obs: (p.obs as string) || '',
      image: p.image_url as string,
      gender: p.gender as string,
      has_fleas_ticks: p.has_fleas_ticks as boolean,
      vaccines_up_to_date: p.vaccines_up_to_date as boolean,
      birth_date: p.birth_date as string
    })) : [],
    history: []
  }));

  return { clients, totalCount: count ?? 0 };
};

// Retorna apenas a contagem de clientes (para o Dashboard, sem baixar dados)
export const getClientCount = async (): Promise<number> => {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true });
  if (error) return 0;
  return count ?? 0;
};

export const getClientHistory = async (clientId: number): Promise<{ date: string; service: string; value: string; pet: string }[]> => {
  if (!supabase) return [];
  const { data: history } = await supabase
    .from('appointments')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'Finalizado')
    .order('date', { ascending: false })
    .limit(5);

  if (!history) return [];

  return history.map((h: Record<string, unknown>) => ({
    date: h.date as string,
    service: h.service_type as string,
    value: h.price ? `R$ ${(h.price as number).toFixed(2)}` : 'R$ 0,00',
    pet: h.pet_name as string
  }));
};

export const getProducts = async (): Promise<Product[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error || !data) return [];
  return data;
};

export const getDailySlots = async (date: string = getTodayString()): Promise<GroomingSlot[]> => {
  const professionalsList = await getProfessionals();
  const workHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const slots: GroomingSlot[] = [];

  let dbAppointments: any[] = [];
  if (supabase) {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', date);
    if (data) dbAppointments = data;
  }

  // Obter dia da semana da data pesquisada (0 = Domingo, 1 = Segunda, devolve index local correto)
  const [year, month, day] = date.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  const dayOfWeek = dateObj.getDay();

  professionalsList.forEach(prof => {
    workHours.forEach(time => {
      // --- REGRAS DE BLOQUEIO POR PROFISSIONAL E DIA DA SEMANA ---
      // Raila: Segunda-feira (1) bloqueia todos. Outros dias: remove 17:00.
      if (prof === 'Raila') {
        if (dayOfWeek === 1) return;
        if (time === '17:00') return;
      }
      
      // Assis: Terça-feira (2) bloqueia todos.
      if (prof === 'Assis' && dayOfWeek === 2) return;
      
      // Luiza: Quarta-feira (3) bloqueia todos.
      if (prof === 'Luiza' && dayOfWeek === 3) return;
      // -------------------------------------------------------------

      const isLunch = (prof === 'Raila') 
          ? time === '13:00' 
          : (time === '12:00' || time === '13:00');
          
      const slotId = `${prof}-${time}`;
      
      const booking = dbAppointments.find(a => 
        a.professional_name === prof && a.time === time
      );

      if (booking) {
        slots.push({
          id: booking.id,
          time,
          professional: prof,
          status: booking.status,
          pet: booking.pet_name,
          tutor: booking.tutor_name,
          service: booking.service_type,
          phone: '',
          date: booking.date
        });
      } else {
        slots.push({
          id: slotId,
          time,
          professional: prof,
          status: isLunch ? 'Almoço' : 'Livre'
        });
      }
    });
  });

  return slots;
};

// --- ESTATÍSTICAS E FINANCEIRO ---

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const emptyMetrics: DashboardMetrics = { 
      topServices: [], 
      vipClients: [], 
      riskClients: [],
      finance: {
          totalRevenue: 0,
          totalServices: 0,
          averageTicket: 0,
          dailyAvg: 0,
          monthlyHistory: [],
          dailyDistribution: [],
          topServicesFinance: [],
          topClientsFinance: []
      }
  };

  if (!supabase) return emptyMetrics;

  // 1. Busca todos agendamentos finalizados com preço
  const { data: history } = await supabase
    .from('appointments')
    .select('service_type, client_id, tutor_name, pet_name, date, price')
    .eq('status', 'Finalizado');

  // 2. Busca todos os clientes
  const { data: allClients } = await supabase
    .from('clients')
    .select('id, name, phone, pets(name)');

  if (!history || !allClients) return emptyMetrics;

  // --- Processamento de Dados ---

  interface ServiceCount { count: number; total: number }
  interface ClientStat { name: string; visits: number; totalSpent: number; pets: Set<string>; lastVisit: string; phone: string }
  const serviceCount: Record<string, ServiceCount> = {};
  const clientStats: Record<number, ClientStat> = {};
  
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const monthlyRevenue = Array(12).fill(0);
  const dailyCount = Array(7).fill(0);
  let totalRevenue = 0;

  allClients.forEach((c: Record<string, unknown>) => {
      clientStats[c.id as number] = { 
          name: c.name as string, 
          visits: 0, 
          totalSpent: 0,
          pets: new Set((c.pets as Record<string, unknown>[]).map((p: Record<string, unknown>) => p.name as string)),
          lastVisit: '2000-01-01',
          phone: (c.phone as string) || ''
      };
  });

  history.forEach((h: Record<string, unknown>) => {
     const price = Number(h.price || 0);
     const date = new Date(h.date as string); 
     
     totalRevenue += price;

     const serviceType = h.service_type as string;
     if (serviceType) {
        if (!serviceCount[serviceType]) serviceCount[serviceType] = { count: 0, total: 0 };
        serviceCount[serviceType].count += 1;
        serviceCount[serviceType].total += price;
     }

     const clientId = h.client_id as number;
     if (clientId && clientStats[clientId]) {
        clientStats[clientId].visits += 1;
        clientStats[clientId].totalSpent += price;
        if ((h.date as string) > clientStats[clientId].lastVisit) {
            clientStats[clientId].lastVisit = h.date as string;
        }
     }

     const dateObj = new Date(h.date as string);
     if (!isNaN(dateObj.getTime())) {
         monthlyRevenue[dateObj.getMonth()] += price;
         dailyCount[dateObj.getDay()] += 1; 
     }
  });

  const topServices = Object.entries(serviceCount)
    .map(([name, data]) => ({ name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const vipClients = Object.values(clientStats)
     .filter(c => c.visits > 0)
     .sort((a, b) => b.visits - a.visits)
     .slice(0, 5)
     .map(c => ({
         name: c.name,
         services: c.visits,
         phone: c.phone,
         pets: Array.from(c.pets)
     }));

  const today = new Date();
  const riskClients = Object.values(clientStats)
     .filter(c => {
         if (c.lastVisit === '2000-01-01') return false; 
         const last = new Date(c.lastVisit);
         const diffDays = Math.ceil(Math.abs(today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)); 
         return diffDays > 30;
     })
     .sort((a, b) => a.lastVisit.localeCompare(b.lastVisit))
     .slice(0, 5)
     .map(c => {
         const last = new Date(c.lastVisit);
         const diffDays = Math.ceil(Math.abs(today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
         return {
             name: c.name,
             days: diffDays,
             phone: c.phone,
             pets: Array.from(c.pets)
         };
     });

  const monthlyHistory = monthNames.map((name, i) => ({ name, value: monthlyRevenue[i] }));
  const dailyDistribution = dayNames.map((name, i) => ({ name, value: dailyCount[i] }));

  const topServicesFinance = Object.entries(serviceCount)
    .map(([name, data]) => ({ name, qtd: data.count, total: data.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const topClientsFinance = Object.values(clientStats)
    .filter(c => c.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map(c => ({
        name: `${c.name} (${Array.from(c.pets).join(', ')})`,
        visits: c.visits,
        total: c.totalSpent
    }));

  return { 
      topServices, 
      vipClients, 
      riskClients,
      finance: {
          totalRevenue,
          totalServices: history.length,
          averageTicket: history.length > 0 ? totalRevenue / history.length : 0,
          dailyAvg: totalRevenue / 30, 
          monthlyHistory,
          dailyDistribution,
          topServicesFinance,
          topClientsFinance
      }
  };
};


// --- ESCRITA (WRITE) ---

export const createClient = async (clientData: ClientFormData): Promise<boolean> => {
  if (!supabase) return false;

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert([{ 
      name: clientData.name, 
      phone: clientData.phone, 
      email: clientData.email, 
      address: clientData.address,
      cpf: clientData.cpf,
      birth_date: clientData.birth_date,
      cep: clientData.cep
    }])
    .select()
    .single();

  if (clientError || !client) {
    console.error('Erro ao criar cliente', clientError);
    return false;
  }

  if (clientData.pets.length > 0) {
    const petsToInsert = clientData.pets.map((p) => ({
      owner_id: client.id,
      name: p.name,
      species: p.type || 'Cão',
      breed: p.breed,
      age: p.age,
      weight: p.weight,
      medical_notes: p.medical,
      behavior_tags: p.behavior,
      obs: p.obs,
      gender: p.gender,
      has_fleas_ticks: p.has_fleas_ticks || false,
      vaccines_up_to_date: p.vaccines_up_to_date || false,
      birth_date: p.birth_date
    }));

    const { error: petError } = await supabase.from('pets').insert(petsToInsert);
    if (petError) console.error('Erro ao criar pets', petError);
  }

  return true;
};

export const updateClient = async (clientId: number, clientData: ClientFormData): Promise<boolean> => {
    if (!supabase) return false;
    
    // 1. Atualizar dados básicos do cliente
    const { error: clientError } = await supabase
        .from('clients')
        .update({
            name: clientData.name,
            phone: clientData.phone,
            email: clientData.email,
            address: clientData.address,
            cpf: clientData.cpf,
            birth_date: clientData.birth_date,
            cep: clientData.cep
        })
        .eq('id', clientId);

    if (clientError) {
        console.error("Erro ao atualizar cliente:", clientError);
        return false;
    }

    // 2. Gerenciar Pets (Adicionar, Atualizar, Remover)
    const { data: currentPets } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', clientId);
    
    const currentPetIds = currentPets ? currentPets.map(p => p.id) : [];
    const formPets = clientData.pets || [];
    
    const formPetIds = formPets
        .filter((p) => typeof p.id === 'number' && currentPetIds.includes(p.id))
        .map((p) => p.id);

    const petsToDelete = currentPetIds.filter(id => !formPetIds.includes(id));
    if (petsToDelete.length > 0) {
        await supabase.from('pets').delete().in('id', petsToDelete);
    }

    for (const p of formPets) {
        const petPayload = {
            owner_id: clientId,
            name: p.name,
            species: p.type || 'Cão',
            breed: p.breed,
            age: p.age,
            weight: p.weight,
            medical_notes: p.medical,
            behavior_tags: p.behavior,
            obs: p.obs,
            gender: p.gender,
            has_fleas_ticks: p.has_fleas_ticks || false,
            vaccines_up_to_date: p.vaccines_up_to_date || false,
            birth_date: p.birth_date
        };

        if (typeof p.id === 'number' && currentPetIds.includes(p.id)) {
            await supabase.from('pets').update(petPayload).eq('id', p.id);
        } else {
            await supabase.from('pets').insert(petPayload);
        }
    }

    return true;
};

export const deleteClient = async (clientId: number): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) {
        console.error("Erro ao excluir cliente:", error);
        return false;
    }
    return true;
};

// --- IMPORTAR CSV DE CLIENTES ---

export const importClientsFromCSV = async (csvText: string): Promise<{success: number, errors: number}> => {
  if (!supabase) return { success: 0, errors: 0 };

  const lines = csvText.split(/\r?\n/);
  let successCount = 0;
  let errorCount = 0;

  // 1. Agrupar pets por cliente (usando telefone como chave principal)
  const clientsMap = new Map<string, any>();
  
  for (let i = 1; i < lines.length; i++) {
     const line = lines[i].trim();
     if (!line) continue;

     const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));

     // Formato da planilha atualizado (17 colunas):
     // 0: telefone
     // 1: nome_tutor
     // 2: cpf
     // 3: email
     // 4: data_nascimento_tutor
     // 5: endereco
     // 6: cep
     // 7: nome_pet
     // 8: especie
     // 9: raca
     // 10: peso
     // 11: sexo
     // 12: data_nascimento_pet
     // 13: comportamento
     // 14: alergias
     // 15: pulgas (TRUE/FALSE ou Sim/Não)
     // 16: vacinas (TRUE/FALSE ou Sim/Não)
     
     const phoneRaw = cols[0] || '';
     const phone = phoneRaw ? phoneRaw.replace(/\D/g, '') : '';
     const tutorName = cols[1] || '';
     const cpf = cols[2] || '';
     const email = cols[3] || '';
     const tutorBirthDate = cols[4] || '';
     const address = cols[5] || '';
     const cep = cols[6] || '';
     
     const petName = cols[7] || '';
     const petSpecies = cols[8] || '';
     const petBreed = cols[9] || '';
     const petWeight = cols[10] || '';
     const petGender = cols[11] || '';
     const petBirthDate = cols[12] || '';
     const behaviorRaw = cols[13] || '';
     const petMedicalNotes = cols[14] || '';
     const petFleasRaw = (cols[15] || '').toLowerCase();
     const petVaccinesRaw = (cols[16] || '').toLowerCase();

     // Se a linha inteira estiver vazia, pula
     if (!tutorName && !phone && !petName) {
         continue;
     }

     const clientKey = phone || tutorName || `unknown_${Math.random()}`; 
     
     const behaviorTags = behaviorRaw ? behaviorRaw.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
     const hasFleas = petFleasRaw === 'true' || petFleasRaw === 'sim' || petFleasRaw === '1';
     const hasVaccines = petVaccinesRaw === 'true' || petVaccinesRaw === 'sim' || petVaccinesRaw === '1';

     if (!clientsMap.has(clientKey)) {
         clientsMap.set(clientKey, {
             name: tutorName,
             phone: phone,
             cpf: cpf,
             email: email,
             birth_date: tutorBirthDate,
             address: address,
             cep: cep,
             pets: []
         });
     }

     // Só adiciona o pet se tiver pelo menos o nome ou a espécie
     if (petName || petSpecies) {
         clientsMap.get(clientKey).pets.push({
             name: petName,
             species: petSpecies,
             breed: petBreed,
             weight: petWeight,
             gender: petGender,
             birth_date: petBirthDate,
             behavior_tags: behaviorTags,
             medical_notes: petMedicalNotes,
             has_fleas_ticks: hasFleas,
             vaccines_up_to_date: hasVaccines
         });
     }
  }

  // 2. Inserir no banco de dados
  const clientsArray = Array.from(clientsMap.values());
  
  for (let i = 0; i < clientsArray.length; i++) {
      const clientData = clientsArray[i];
      try {
          let clientId;
          
          if (clientData.phone) {
              const { data: existing } = await supabase
                  .from('clients')
                  .select('id')
                  .eq('phone', clientData.phone)
                  .maybeSingle();
                  
              if (existing) clientId = existing.id;
          }
          
          if (!clientId) {
              const { data: newClient, error: clientError } = await supabase
                  .from('clients')
                  .insert([{ 
                      name: clientData.name, 
                      phone: clientData.phone, 
                      email: clientData.email, 
                      address: clientData.address,
                      cpf: clientData.cpf,
                      birth_date: clientData.birth_date ? clientData.birth_date : null,
                      cep: clientData.cep
                  }])
                  .select()
                  .single();
                  
              if (clientError || !newClient) {
                  console.error('Erro ao criar cliente:', clientError);
                  throw new Error(`Erro ao criar cliente: ${clientError?.message || 'Desconhecido'}`);
              }
              clientId = newClient.id;
          }
          
          if (clientData.pets.length > 0) {
              for (const p of clientData.pets) {
                  const { error: petsError } = await supabase.from('pets').insert([{
                      owner_id: clientId,
                      name: p.name,
                      species: p.species,
                      breed: p.breed,
                      weight: p.weight,
                      gender: p.gender,
                      birth_date: p.birth_date ? p.birth_date : null,
                      behavior_tags: p.behavior_tags,
                      medical_notes: p.medical_notes,
                      has_fleas_ticks: p.has_fleas_ticks,
                      vaccines_up_to_date: p.vaccines_up_to_date
                  }]);
                  
                  if (petsError) {
                      console.error('Erro ao criar pet:', petsError, 'Dados:', p);
                  }
              }
          }
          
          successCount += clientData.pets.length || 1;

          // Pequeno delay a cada 50 clientes para evitar sobrecarregar a rede (Failed to fetch)
          if (i > 0 && i % 50 === 0) {
              await new Promise(resolve => setTimeout(resolve, 500));
          }

      } catch (err) {
          console.error('Erro ao processar cliente:', clientData.name, err);
          errorCount += clientData.pets.length || 1;
      }
  }

  return { success: successCount, errors: errorCount };
};

// --- IMPORTAR CSV DE SERVIÇOS (CORRIGIDO PARA LOTE) ---

export const importServicesFromCSV = async (csvText: string): Promise<{success: number, errors: number}> => {
  if (!supabase) return { success: 0, errors: 0 };

  const lines = csvText.split(/\r?\n/);
  const productsToInsert = [];
  let errorCount = 0;

  // Formato: Serviço, Unidade, Preço
  // Ex: "BANHO LUXO", "UNIDADE", "R$ 80,00"

  for (let i = 1; i < lines.length; i++) {
     const line = lines[i].trim();
     if (!line) continue;

     // Regex seguro para CSV com aspas e vírgulas internas
     const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));

     if (cols.length < 3) {
       errorCount++;
       continue;
     }

     const name = cols[0];
     // const unitRaw = cols[1]; // Ignorado
     const priceRaw = cols[2]; // "R$ 80,00"

     // Parse Preço Brasileiro
     let price = 0;
     if (priceRaw) {
        // Remove R$, pontos de milhar, substitui virgula por ponto
        const cleanPrice = priceRaw
           .replace('R$', '')
           .replace(/\./g, '') // remove milhar (1.000,00 -> 1000,00)
           .replace(',', '.')  // troca decimal (1000,00 -> 1000.00)
           .trim();
        price = parseFloat(cleanPrice);
     }

     if (isNaN(price)) price = 0;

     // Acumula no array ao invés de inserir um por um
     productsToInsert.push({
         name: name,
         category: 'Serviços', 
         price: price,
         stock: 999,
         available: true
     });
  }

  // Inserção em Lotes (Batch Insert)
  if (productsToInsert.length > 0) {
      // Divide em lotes de 50 para não sobrecarregar
      const batchSize = 50;
      for (let i = 0; i < productsToInsert.length; i += batchSize) {
          const batch = productsToInsert.slice(i, i + batchSize);
          const { error } = await supabase.from('products').insert(batch);
          
          if (error) {
              console.error('Erro ao inserir lote de produtos:', error);
              errorCount += batch.length; // Conta todo o lote como erro se falhar
          }
      }
  }

  return { success: productsToInsert.length - errorCount, errors: errorCount };
};


// --- PRODUTOS CRUD ---

export const createProduct = async (productData: ProductFormData): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase.from('products').insert([{
     name: productData.name,
     category: productData.category,
     price: parseFloat(productData.price),
     stock: parseInt(productData.stock),
     available: productData.available
  }]);
  return !error;
}

export const updateProduct = async (id: number, productData: ProductFormData): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase.from('products').update({
     name: productData.name,
     category: productData.category,
     price: parseFloat(productData.price),
     stock: parseInt(productData.stock),
     available: productData.available
  }).eq('id', id);
  return !error;
}

export const deleteProduct = async (id: number): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase.from('products').delete().eq('id', id);
  return !error;
}

// --- AGENDAMENTOS ---

export const createAppointment = async (apptData: {
  professional: string;
  time: string;
  petName: string;
  tutorName: string;
  service: string;
  date?: string;
  clientId?: number;
  petId?: number;
}): Promise<boolean> => {
  if (!supabase) return false;

  // Busca preço do serviço
  let price = 0;
  const mainService = apptData.service.split(' + ')[0];
  const { data: product } = await supabase
     .from('products')
     .select('price')
     .ilike('name', `%${mainService}%`)
     .single();
  
  if (product) price = product.price;

  const { error } = await supabase.from('appointments').insert([{
    professional_name: apptData.professional,
    time: apptData.time,
    pet_name: apptData.petName,
    tutor_name: apptData.tutorName,
    service_type: apptData.service,
    date: apptData.date || getTodayString(),
    client_id: apptData.clientId || null,
    pet_id: apptData.petId || null,
    status: 'Agendado',
    price: price
  }]);

  if (error) {
    console.error(error);
    return false;
  }
  return true;
};

export const createBlock = async (prof: string, time: string, date: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase.from('appointments').insert([{
    professional_name: prof,
    time: time,
    pet_name: '-',
    tutor_name: '-',
    service_type: 'Bloqueio de Horário',
    date: date,
    status: 'Bloqueado',
    price: 0
  }]);
  return !error;
};

export const updateAppointmentStatus = async (id: string, status: string): Promise<boolean> => {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);
    
  return !error;
};

export const deleteAppointment = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  return !error;
}

// --- UTILITÁRIOS DE SISTEMA ---

export const resetDatabase = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    // Ordem importante: Filho -> Pai para evitar erro de Foreign Key
    
    // 1. Apagar Agendamentos (Tabela filha de Pets e Clientes)
    // Usamos um filtro "id não nulo" que é verdade para tudo, para limpar a tabela
    await supabase.from('appointments').delete().neq('time', 'INVALID_TIME'); // Delete All hack

    // 2. Apagar Pets (Tabela filha de Clientes)
    await supabase.from('pets').delete().gt('id', 0);

    // 3. Apagar Clientes (Tabela pai)
    await supabase.from('clients').delete().gt('id', 0);
    
    return true;
  } catch (error) {
    console.error("Erro ao resetar banco:", error);
    return false;
  }
};