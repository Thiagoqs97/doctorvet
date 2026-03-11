import { GroomingSlot, PetClient } from './types';

// Doctor Vet Data (Hospital)
export const initialPatients = [
  { id: 1, pet: 'Thor', species: 'Cão', tutor: 'Ana Clara', status: 'Internado' },
  { id: 2, pet: 'Luna', species: 'Gato', tutor: 'Roberto B.', status: 'Alta' },
];

export const initialInternments = [
  { bed: '01', patient: 'Thor', species: 'Cão', status: 'Ocupado', reason: 'Pós-Op' },
  { bed: '02', patient: null, species: null, status: 'Livre', reason: null },
];

// Doctor Pet Data (Boutique)
export const professionals = ['Luiza', 'Raila', 'Assis'];
export const workHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export const generateDailySlots = (): GroomingSlot[] => {
  const slots: GroomingSlot[] = [];

  professionals.forEach(prof => {
    workHours.forEach(time => {
      const isLunch = time === '12:00' || time === '13:00';
      
      let status: GroomingSlot['status'] = isLunch ? 'Almoço' : 'Livre';
      let pet, tutor, service, phone;

      if (!isLunch) {
        if (prof === 'Luiza' && time === '09:00') {
           status = 'Finalizado'; pet = 'Belinha'; tutor = 'Carla'; service = 'Banho + Tosa'; phone = '(11) 9999-9999';
        }
        if (prof === 'Raila' && time === '10:00') {
           status = 'Confirmado'; pet = 'Paçoca'; tutor = 'Pedro'; service = 'Banho Simples'; phone = '(11) 8888-8888';
        }
        if (prof === 'Assis' && time === '15:00') {
           status = 'Agendado'; pet = 'Zeus'; tutor = 'Marcos'; service = 'Tosa Higiênica'; phone = '(11) 7777-7777';
        }
      }

      slots.push({
        id: `${prof}-${time}`,
        time,
        professional: prof,
        status,
        pet,
        tutor,
        service,
        phone
      });
    });
  });
  return slots;
};

export const initialGroomingSlots = generateDailySlots();

export const products = [
  { id: 1, name: 'Banho Simples (P/M)', category: 'Serviços', stock: 999, price: 45.00, available: true },
  { id: 2, name: 'Tosa Higiênica', category: 'Serviços', stock: 999, price: 35.00, available: true },
  { id: 3, name: 'Ração Premium 15kg', category: 'Alimentos', stock: 12, price: 189.90, available: true },
  { id: 4, name: 'Coleira Anti-pulgas', category: 'Farmácia', stock: 45, price: 89.90, available: true },
  { id: 5, name: 'Brinquedo Mordedor', category: 'Acessórios', stock: 8, price: 29.90, available: false },
  { id: 6, name: 'Shampoo Hipoalergênico', category: 'Cosméticos', stock: 20, price: 42.50, available: true },
];

export const availableServicesList = [
  'Banho Simples',
  'Banho + Tosa',
  'Tosa Higiênica',
  'Hidratação',
  'Corte de Unhas',
  'Escovação de Dentes',
  'Taxi Dog',
  'Hospedagem'
];

export const topClients = [
  { id: 1, name: 'Samara', services: 11, phone: '8681137457', pets: ['Pipoca'] },
  { id: 2, name: 'Ricardo Oi', services: 7, phone: '8694265599', pets: ['Thor', 'Mel'] },
  { id: 3, name: 'Sirius', services: 7, phone: '8681280384', pets: ['Black'] },
  { id: 4, name: 'Mércia Martins', services: 6, phone: '8695482608', pets: ['Luna'] },
  { id: 5, name: 'Marina', services: 6, phone: '8698010784', pets: ['Bob'] },
];

export const riskClients = [
  { id: 1, name: 'Juliana', days: 33, phone: '8699914991', pets: ['Belinha'] },
  { id: 2, name: 'Juniorr', days: 35, phone: '8694781387', pets: ['Scooby'] },
  { id: 3, name: 'Mariana', days: 35, phone: '8694527360', pets: ['Fred'] },
  { id: 4, name: 'Adriana', days: 35, phone: '8694296918', pets: ['Dudinha'] },
  { id: 5, name: 'Anyele Sousa', days: 35, phone: '8698183347', pets: ['Spike'] },
];

export const topServices = [
  { id: 1, name: 'Banho Simples', count: 154 },
  { id: 2, name: 'Tosa Higiênica', count: 98 },
  { id: 3, name: 'Hidratação Profunda', count: 45 },
  { id: 4, name: 'Corte de Unhas', count: 32 },
  { id: 5, name: 'Banho + Tosa', count: 28 },
];

export const initialPetClients: PetClient[] = [
  { 
    id: 1, 
    name: 'Gabriel William', 
    phone: '(47) 98810-9816', 
    email: 'gabriel@email.com',
    address: 'Rua das Palmeiras, 45',
    pets: [
      { id: 101, name: 'Thor', breed: 'Golden Retriever', type: 'Cão', age: '3 anos', weight: '32kg' },
      { id: 102, name: 'Nina', breed: 'SRD', type: 'Gato', age: '1 ano', weight: '4kg' }
    ],
    history: [
      { date: '10/05/2024', service: 'Banho + Tosa', value: 'R$ 85,00', pet: 'Thor' },
      { date: '15/04/2024', service: 'Compra: Ração 15kg', value: 'R$ 180,00', pet: '-' }
    ]
  },
  { 
    id: 2, 
    name: 'Felipe', 
    phone: '(47) 99815-1041', 
    email: 'felipe@email.com',
    address: 'Av. Central, 1000',
    pets: [
      { id: 103, name: 'Rex', breed: 'Bulldog', type: 'Cão', age: '5 anos', weight: '22kg' }
    ],
    history: [
      { date: '12/05/2024', service: 'Tosa Higiênica', value: 'R$ 60,00', pet: 'Rex' }
    ]
  },
  { 
    id: 3, 
    name: 'Eliana', 
    phone: '(47) 98982-6485', 
    email: 'eliana@email.com',
    address: 'Rua XV de Novembro, 200',
    pets: [
      { id: 104, name: 'Mel', breed: 'Poodle', type: 'Cão', age: '8 anos', weight: '7kg' }
    ],
    history: [
      { date: '05/05/2024', service: 'Hidratação', value: 'R$ 45,00', pet: 'Mel' }
    ]
  },
  { 
    id: 4, 
    name: 'Ana Luiza', 
    phone: '(47) 98884-5835', 
    email: 'ana@email.com',
    address: 'Travessa da Paz, 30',
    pets: [
      { id: 105, name: 'Garfield', breed: 'Persa', type: 'Gato', age: '2 anos', weight: '5kg' }
    ],
    history: []
  },
  { 
    id: 5, 
    name: 'Yasmin', 
    phone: '(47) 98681-6464', 
    email: 'yasmin@email.com',
    address: 'R. Clodoaldo Freitas, 1777',
    pets: [
      { id: 106, name: 'Luna', breed: 'Shih Tzu', type: 'Cão', age: '4 anos', weight: '6kg' }
    ],
    history: [
       { date: '01/05/2024', service: 'Banho Simples', value: 'R$ 50,00', pet: 'Luna' }
    ]
  },
];

export const homeVisits = [
  { id: 1, time: '08:30', address: 'Rua das Flores, 123', tutor: 'Carla', pet: 'Mel', type: 'Vacinação', status: 'Pendente' },
  { id: 2, time: '10:00', address: 'Av. Paulista, 2000', tutor: 'Marcos', pet: 'Bob', type: 'Consulta', status: 'Confirmado' },
];

export const monthlyFinanceData = [
    { name: 'Jan', value: 18000 },
    { name: 'Fev', value: 19500 },
    { name: 'Mar', value: 17000 },
    { name: 'Abr', value: 22000 },
    { name: 'Mai', value: 21000 },
    { name: 'Jun', value: 24500 },
    { name: 'Jul', value: 23000 },
    { name: 'Ago', value: 25000 },
    { name: 'Set', value: 26500 },
    { name: 'Out', value: 24000 },
    { name: 'Nov', value: 28000 },
    { name: 'Dez', value: 31000 },
];

export const dailyDistributionData = [
    { name: 'Seg', value: 3200 },
    { name: 'Ter', value: 2800 },
    { name: 'Qua', value: 3500 },
    { name: 'Qui', value: 3100 },
    { name: 'Sex', value: 4800 },
    { name: 'Sáb', value: 6500 },
    { name: 'Dom', value: 1500 },
];

export const topServicesFinance = [
    { name: 'Banho Simples', qtd: 154, total: 6930 },
    { name: 'Tosa Higiênica', qtd: 98, total: 3430 },
    { name: 'Banho + Tosa', qtd: 65, total: 5525 },
    { name: 'Hidratação', qtd: 45, total: 2250 },
    { name: 'Corte de Unhas', qtd: 32, total: 480 },
    { name: 'Hospedagem', qtd: 12, total: 2400 },
    { name: 'Taxi Dog', qtd: 28, total: 840 },
    { name: 'Day Care', qtd: 15, total: 1200 },
    { name: 'Consulta Vet', qtd: 8, total: 1200 },
    { name: 'Vacinação', qtd: 10, total: 950 },
];

export const topClientsFinance = [
    { name: 'Samara (Pipoca)', total: 1850.00, visits: 12 },
    { name: 'Ricardo (Thor)', total: 1620.00, visits: 9 },
    { name: 'Sirius (Black)', total: 1450.00, visits: 8 },
    { name: 'Mércia (Luna)', total: 1200.00, visits: 7 },
    { name: 'Marina (Bob)', total: 1100.00, visits: 6 },
    { name: 'João (Rex)', total: 980.00, visits: 5 },
    { name: 'Ana (Mel)', total: 950.00, visits: 5 },
    { name: 'Carlos (Zeus)', total: 900.00, visits: 4 },
    { name: 'Beatriz (Lola)', total: 850.00, visits: 4 },
    { name: 'Felipe (Max)', total: 800.00, visits: 4 },
];
