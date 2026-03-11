import { LucideIcon } from 'lucide-react';

export interface Professional {
  id: string;
  name: string;
  role: 'Groomer' | 'Vet' | 'Driver';
  active: boolean;
}

export interface Pet {
  id: number | string;
  name: string;
  species?: string;
  type?: 'Cão' | 'Gato' | string;
  breed: string;
  age: string;
  weight?: string;
  behavior?: string[];
  medical_notes?: string;
  obs?: string;
  image?: string | null;
  gender?: string;
  birth_date?: string;
}

export interface PetClient {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  pets: Pet[];
  history: { date: string; service: string; value: string; pet: string }[];
}

export interface GroomingSlot {
  id: string;
  time: string;
  professional: string;
  pet?: string;
  tutor?: string;
  service?: string;
  status: 'Livre' | 'Agendado' | 'Confirmado' | 'Finalizado' | 'Almoço' | 'Em Andamento' | 'Bloqueado';
  source?: 'WhatsApp IA' | 'Balcão';
  phone?: string;
  date?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  available: boolean;
}

export interface HospitalBed {
  id: number | string;
  label: string; 
  status: 'Livre' | 'Ocupado' | 'Manutenção';
  patient?: string | null;
  species?: string | null;
  reason?: string | null;
}

export interface HomeVisit {
  id: number | string;
  time: string;
  address: string;
  tutor: string;
  pet: string;
  type: string;
  status: string;
}

export interface KanbanOrder {
  id: string;
  pet: string;
  breed: string;
  service: string;
  tutor: string;
  time: string;
  status: string;
  avatar: string;
}

// --- Dashboard & Finance Types ---

export interface TopService {
  name: string;
  count: number;
}

export interface VipClient {
  name: string;
  services: number;
  phone: string;
  pets: string[];
}

export interface RiskClient {
  name: string;
  days: number | string;
  phone: string;
  pets: string[];
}

export interface MonthlyData {
  name: string;
  value: number;
}

export interface DailyData {
  name: string;
  value: number;
}

export interface ServiceFinance {
  name: string;
  qtd: number;
  total: number;
}

export interface ClientFinance {
  name: string;
  visits: number;
  total: number;
}

export interface FinanceMetrics {
  totalRevenue: number;
  totalServices: number;
  averageTicket: number;
  dailyAvg: number;
  monthlyHistory: MonthlyData[];
  dailyDistribution: DailyData[];
  topServicesFinance: ServiceFinance[];
  topClientsFinance: ClientFinance[];
}

export interface DashboardMetrics {
  topServices: TopService[];
  vipClients: VipClient[];
  riskClients: RiskClient[];
  finance: FinanceMetrics;
}

// --- Component Props Types ---

export interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  colorClass?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  colorClass: string;
  trend?: 'up' | 'down';
}

// --- Form Data Types ---

export interface PetFormData {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  birth_date: string;
  behavior: string[];
  medical: string;
  obs: string;
  image: string | null;
}

export interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  pets: PetFormData[];
}

export interface ProductFormData {
  name: string;
  category: string;
  price: string;
  stock: string;
  available: boolean;
}