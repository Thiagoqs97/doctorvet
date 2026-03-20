import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, DollarSign, CheckCircle2, Scissors, 
  BookOpen, Settings, Navigation, Plus, MessageCircle, 
  Bone, Scale, History, FileText, Save, AlertCircle, 
  Trash2, Mail, MapPin, User, Camera, Database,
  Phone, PawPrint, Calendar, Loader2, Menu, X
} from 'lucide-react';
import { SidebarItem, Modal } from './components';
import { 
  professionals, 
  availableServicesList
} from './mockData';
import { GroomingSlot, PetClient, Product, TopService, VipClient, RiskClient, FinanceMetrics, ClientFormData, PetFormData, ProductFormData } from './types';
import { checkDbConnection } from './supabaseClient';
import * as Services from './services';

// Import View Components
import PetSystemDashboard from './PetSystemDashboard';
import PetSystemClients from './PetSystemClients';
import PetSystemGrooming from './PetSystemGrooming';
import PetSystemKanban from './PetSystemKanban';
import PetSystemFinance from './PetSystemFinance';
import PetSystemProducts from './PetSystemProducts';
import ClientAutocomplete from './ClientAutocomplete';

const PetSystem = ({ onLogout }: { onLogout: () => void }) => {
  const [view, setView] = useState('dashboard');
  
  // DATE FILTER (Agenda e Kanban)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // ESTADO DE DADOS
  const [slots, setSlots] = useState<GroomingSlot[]>([]);
  const [clients, setClients] = useState<PetClient[]>([]);
  const [clientTotalCount, setClientTotalCount] = useState(0);
  const [clientPage, setClientPage] = useState(0);
  const CLIENT_PAGE_SIZE = 50;
  const [dashboardClientCount, setDashboardClientCount] = useState(0);
  const [productsList, setProductsList] = useState<Product[]>([]);
  
  // Dashboard & Finance Stats
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [vipClients, setVipClients] = useState<VipClient[]>([]);
  const [riskClients, setRiskClients] = useState<RiskClient[]>([]);
  const [financeMetrics, setFinanceMetrics] = useState<FinanceMetrics>({
     totalRevenue: 0,
     totalServices: 0,
     averageTicket: 0,
     dailyAvg: 0,
     monthlyHistory: [],
     dailyDistribution: [],
     topServicesFinance: [],
     topClientsFinance: []
  });
  
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedGroomer, setSelectedGroomer] = useState<string>('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- FUNÇÕES DE CARREGAMENTO SEPARADAS ---

  // Carrega APENAS agenda do dia + dashboard (leve, sem clientes)
  const loadAgendaAndDashboard = async () => {
    try {
        const [fetchedSlots, fetchedProducts, dashboardStats, clientCount] = await Promise.all([
            Services.getDailySlots(selectedDate),
            Services.getProducts(),
            Services.getDashboardMetrics(),
            Services.getClientCount()
        ]);
        setSlots(fetchedSlots);
        setProductsList(fetchedProducts);
        setDashboardClientCount(clientCount);
        
        setTopServices(dashboardStats.topServices);
        setVipClients(dashboardStats.vipClients);
        setRiskClients(dashboardStats.riskClients);
        setFinanceMetrics(dashboardStats.finance);
    } catch (error) {
        console.error("Erro ao carregar agenda/dashboard", error);
    }
  };

  // Carrega APENAS clientes (paginado, 50 por vez)
  const loadClients = async (page: number = 0, search: string = '') => {
    try {
        const result = await Services.getClients(page, CLIENT_PAGE_SIZE, search);
        setClients(result.clients);
        setClientTotalCount(result.totalCount);
    } catch (error) {
        console.error("Erro ao carregar clientes", error);
    }
  };

  // Carrega APENAS agenda (quando muda a data)
  const loadAgenda = async () => {
    try {
        const fetchedSlots = await Services.getDailySlots(selectedDate);
        setSlots(fetchedSlots);
    } catch (error) {
        console.error("Erro ao carregar agenda", error);
    }
  };

  // Check connection on load (apenas 1 vez)
  useEffect(() => {
    checkDbConnection().then(async (connected) => {
        if (connected) {
            setIsLoading(true);
            await loadAgendaAndDashboard();
            setIsLoading(false);
        } else {
             console.log("Não conectado ao Supabase.");
        }
    });
  }, []);

  // Recarrega agenda quando a data muda
  useEffect(() => {
    // Assuming connection is established if initial load succeeded or we are in demo mode
    loadAgenda();
  }, [selectedDate]);

  // Carrega clientes quando entra na aba de clientes ou muda página/busca
  useEffect(() => {
    if (view === 'clients') { // Assuming connection is established
      loadClients(clientPage, clientSearchTerm);
    }
  }, [view, clientPage, clientSearchTerm]);


  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<PetClient | null>(null);

  // General Appointment Form (Manual)
  const [manualSelectedClient, setManualSelectedClient] = useState<PetClient | null>(null);
  const [manualAppointmentData, setManualAppointmentData] = useState({
    professional: 'Luiza',
    time: '',
    tutor: '',
    pet: '',
    service: 'Banho Simples'
  });

  // New Client Appointment State
  const [isClientAppointmentModalOpen, setIsClientAppointmentModalOpen] = useState(false);
  const [clientAppointmentData, setClientAppointmentData] = useState({
     petIndex: 0,
     professional: 'Luiza',
     time: '',
     services: [] as string[]
  });

  // Add Client Form State
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newClient, setNewClient] = useState<ClientFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    cpf: '',
    birth_date: '',
    cep: '',
    pets: [
      { id: Date.now(), name: '', type: 'Cão', breed: '', age: '', weight: '', gender: 'Macho', has_fleas_ticks: false, vaccines_up_to_date: false, birth_date: '', behavior: [] as string[], medical: '', obs: '', image: null as string | null }
    ]
  });

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>({
     name: '',
     category: 'Serviços',
     price: '',
     stock: '',
     available: true
  });

  // --- ACTIONS ---

  const handleStatusChange = async (id: string, newStatus: GroomingSlot['status'] | 'Em Andamento') => {
    // Atualiza UI Otimista
    setSlots(slots.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
    // Atualiza Banco
    await Services.updateAppointmentStatus(id, newStatus);
    // Recarrega para garantir sincronia
    loadAgenda();
  };

  const handleBlockSlot = async (prof: string, time: string) => {
     if(window.confirm(`Deseja realmente bloquear o horário das ${time} para ${prof}?`)) {
        await Services.createBlock(prof, time, selectedDate);
        loadAgenda();
     }
  };

  // Appointment Validation Helper
  const isSlotOccupied = (professional: string, time: string) => {
     return slots.some(s => s.professional === professional && s.time === time && s.status !== 'Livre');
  };

  const handleDeleteClient = async (id: number) => {
      const success = await Services.deleteClient(id);
      if(success) {
         alert('Cliente excluído.');
         loadClients(clientPage, clientSearchTerm);
      } else {
         alert('Erro ao excluir cliente.');
      }
  };

  const handleImportCSV = async (file: File) => {
     setIsLoading(true);
     const text = await file.text();
     const { success, errors } = await Services.importClientsFromCSV(text);
     alert(`Importação concluída!\nSucessos: ${success}\nErros: ${errors}`);
     setClientPage(0);
     loadClients(0, clientSearchTerm);
     setIsLoading(false);
  };

  const handleImportServicesCSV = async (file: File) => {
     setIsLoading(true);
     try {
         const text = await file.text();
         const { success, errors } = await Services.importServicesFromCSV(text);
         alert(`Importação de Serviços concluída!\nSucessos: ${success}\nErros: ${errors}`);
         const prods = await Services.getProducts();
         setProductsList(prods);
     } catch (e) {
         alert("Erro ao ler arquivo.");
     } finally {
         setIsLoading(false);
     }
  };

  const handleDeleteAppointment = async (id: string) => {
     if(window.confirm('Tem certeza que deseja apagar este agendamento do histórico?')) {
        const success = await Services.deleteAppointment(id);
        if(success) {
           loadAgenda();
        } else {
           alert('Erro ao excluir agendamento (pode ser um slot virtual).');
        }
     }
  };

  // --- PRODUCT HANDLERS ---
  
  const handleSaveProduct = async () => {
     const payload = {
        ...productForm,
        stock: productForm.stock || '0',
        price: productForm.price || '0'
     };

     if (editingProductId) {
        await Services.updateProduct(editingProductId, payload);
     } else {
        await Services.createProduct(payload);
     }
     setIsProductModalOpen(false);
     setEditingProductId(null);
     setProductForm({ name: '', category: 'Serviços', price: '', stock: '', available: true });
     const prods = await Services.getProducts();
     setProductsList(prods);
  };

  const handleEditProduct = (prod: Product) => {
      setEditingProductId(prod.id);
      setProductForm({
          name: prod.name,
          category: prod.category,
          price: prod.price.toString(),
          stock: prod.stock.toString(),
          available: prod.available
      });
      setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
      await Services.deleteProduct(id);
      const prods = await Services.getProducts();
      setProductsList(prods);
  };


  const confirmClientAppointment = async () => {
    if (!selectedClient || !clientAppointmentData.time || clientAppointmentData.services.length === 0) {
       alert('Por favor, selecione um horário e pelo menos um serviço.');
       return;
    }
    
    // Validação UI antes do Server
    if (isSlotOccupied(clientAppointmentData.professional, clientAppointmentData.time)) {
       alert('Este horário já está ocupado nesta data!');
       return;
    }

    const selectedPet = selectedClient.pets[clientAppointmentData.petIndex];
    
    // Salvar no Banco
    const success = await Services.createAppointment({
        professional: clientAppointmentData.professional,
        time: clientAppointmentData.time,
        petName: selectedPet.name,
        tutorName: selectedClient.name,
        service: clientAppointmentData.services.join(' + '),
        clientId: selectedClient.id,
        petId: Number(selectedPet.id),
        date: selectedDate // Usa a data do picker
    });

    if (success) {
        alert('Agendamento salvo no banco!');
        loadAgenda(); // Recarrega agenda
        setIsClientAppointmentModalOpen(false);
    } 
    // Se falhar (ex: race condition no server), o alert vem do service
  };

  const confirmManualAppointment = async () => {
     const tutorName = manualSelectedClient ? manualSelectedClient.name : manualAppointmentData.tutor;
     const petName = manualAppointmentData.pet;

     if(!manualAppointmentData.time || !tutorName || !petName) {
        alert('Preencha todos os campos obrigatórios.');
        return;
     }

     if (isSlotOccupied(manualAppointmentData.professional, manualAppointmentData.time)) {
       alert('Este horário já está ocupado nesta data!');
       return;
     }

     const petId = manualSelectedClient?.pets.find(p => p.name === petName)?.id;

     const success = await Services.createAppointment({
         professional: manualAppointmentData.professional,
         time: manualAppointmentData.time,
         tutorName: tutorName,
         petName: petName,
         service: manualAppointmentData.service,
         date: selectedDate, // Usa a data do picker
         clientId: manualSelectedClient?.id, // Envia ID se existir
         petId: typeof petId === 'number' ? petId : undefined
     });

     if (success) {
         alert('Agendamento realizado!');
         loadAgenda();
         setIsModalOpen(false);
         setManualSelectedClient(null); // Limpar seleção
     }
  }

  // --- CLIENT MODAL HANDLERS ---
  const toggleServiceSelection = (service: string) => {
    setClientAppointmentData(prev => {
       const exists = prev.services.includes(service);
       if(exists) return { ...prev, services: prev.services.filter(s => s !== service) };
       else return { ...prev, services: [...prev.services, service] };
    });
  };

  const addPetToForm = () => {
    setNewClient({
      ...newClient,
      pets: [...newClient.pets, { id: Date.now(), name: '', type: 'Cão', breed: '', age: '', weight: '', gender: 'Macho', has_fleas_ticks: false, vaccines_up_to_date: false, birth_date: '', behavior: [], medical: '', obs: '', image: null }]
    });
  };

  const removePetFromForm = (index: number) => {
    const updatedPets = newClient.pets.filter((_, i) => i !== index);
    setNewClient({...newClient, pets: updatedPets});
  };

  const updatePetField = (index: number, field: string, value: any) => {
    const updatedPets = [...newClient.pets];
    updatedPets[index] = { ...updatedPets[index], [field]: value };
    setNewClient({ ...newClient, pets: updatedPets });
  };

  const toggleBehavior = (index: number, tag: string) => {
    // Mantido apenas para compatibilidade, substituiremos por updatePetField direto
  };

  const handleSaveClient = async () => {
     if (editingId) {
        await Services.updateClient(editingId, newClient);
        alert('Cliente atualizado!');
     } else {
        const success = await Services.createClient(newClient);
        if (success) alert('Cliente cadastrado com sucesso!');
        else alert('Erro ao cadastrar.');
     }
     loadClients(clientPage, clientSearchTerm);
     setIsAddClientModalOpen(false);
     setEditingId(null);
     setNewClient({ name: '', phone: '', email: '', address: '', cpf: '', birth_date: '', cep: '', pets: [{ id: Date.now(), name: '', type: 'Cão', breed: '', age: '', weight: '', gender: 'Macho', has_fleas_ticks: false, vaccines_up_to_date: false, birth_date: '', behavior: [], medical: '', obs: '', image: null }]});
  };

  const handleEditClient = (client: PetClient) => {
      setEditingId(client.id);
      setNewClient({
          name: client.name,
          phone: client.phone,
          email: client.email,
          address: client.address,
          cpf: client.cpf || '',
          birth_date: client.birth_date || '',
          cep: client.cep || '',
          pets: client.pets.map((p, idx) => ({
              id: typeof p.id === 'number' ? p.id : Date.now() + idx,
              name: p.name,
              type: p.type || 'Cão',
              breed: p.breed,
              age: p.age,
              weight: p.weight || '',
              gender: p.gender || 'Macho',
              has_fleas_ticks: p.has_fleas_ticks || false,
              vaccines_up_to_date: p.vaccines_up_to_date || false,
              birth_date: p.birth_date || '',
              behavior: p.behavior || [], 
              medical: p.medical_notes || '',
              obs: p.obs || '',
              image: p.image || null
          }))
      });
      setIsAddClientModalOpen(true);
      setIsClientModalOpen(false);
  };

  const openNewClientModal = () => {
      setEditingId(null);
      setNewClient({ name: '', phone: '', email: '', address: '', cpf: '', birth_date: '', cep: '', pets: [{ id: Date.now(), name: '', type: 'Cão', breed: '', age: '', weight: '', gender: 'Macho', has_fleas_ticks: false, vaccines_up_to_date: false, birth_date: '', behavior: [], medical: '', obs: '', image: null }]});
      setIsAddClientModalOpen(true);
  };

  const openNewProductModal = () => {
     setEditingProductId(null);
     setProductForm({ name: '', category: 'Serviços', price: '', stock: '', available: true });
     setIsProductModalOpen(true);
  }
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white"><Bone /></div>
            <div><h1 className="font-bold text-slate-800">Doctor Pet</h1><p className="text-xs text-rose-500 uppercase font-bold">Boutique & Spa</p></div>
          </div>
          <button 
            className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} colorClass="bg-rose-500" />
          <SidebarItem icon={Users} label="Clientes" active={view === 'clients'} onClick={() => { setView('clients'); setIsMobileMenuOpen(false); }} colorClass="bg-rose-500" />
          <SidebarItem icon={DollarSign} label="Financeiro" active={view === 'finance'} onClick={() => { setView('finance'); setIsMobileMenuOpen(false); }} colorClass="bg-rose-500" />
          <SidebarItem icon={CheckCircle2} label="Gestão de Atendimentos" active={view === 'orders'} onClick={() => { setView('orders'); setIsMobileMenuOpen(false); }} colorClass="bg-rose-500" />
          <SidebarItem icon={Scissors} label="Agenda Banho & Tosa" active={view === 'grooming'} onClick={() => { setView('grooming'); setIsMobileMenuOpen(false); }} colorClass="bg-rose-500" />
          <SidebarItem icon={BookOpen} label="Cardápio / Catálogo" active={view === 'products'} onClick={() => { setView('products'); setIsMobileMenuOpen(false); }} colorClass="bg-rose-500" />
        </nav>
        <div className="p-4 border-t border-slate-100">
           <button onClick={onLogout} className="w-full flex items-center text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"><Navigation size={18} className="mr-2 rotate-180"/> Trocar Módulo</button>
        </div>
        
        {/* Connection Status */}
        <div className="px-6 py-3 text-xs flex justify-center bg-slate-50 border-t border-slate-100">
           {/* Connection status removed as settings are removed */}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE TOPBAR */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white"><Bone size={16} /></div>
            <span className="font-bold text-slate-800">Doctor Pet</span>
          </div>
          <button 
            className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-8 overflow-auto relative">
        {/* LOADING OVERLAY */}
        {isLoading && (
           <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center flex-col">
              <Loader2 className="animate-spin text-rose-500 mb-2" size={48} />
              <p className="font-bold text-slate-600">Carregando dados...</p>
           </div>
        )}

        {/* HEADER */}
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h2 className="text-2xl font-bold text-slate-800 capitalize">
               {view === 'dashboard' ? 'Dashboard' : 
                view === 'grooming' ? 'Agenda de Banho & Tosa' : 
                view === 'clients' ? 'Cadastro de Clientes' : 
                view === 'finance' ? 'Financeiro' : 
                view === 'products' ? 'Catálogo de Serviços e Produtos' :
                view === 'orders' ? 'Gestão de Atendimentos' :
                'Painel'}
             </h2>
             {view === 'grooming' && <p className="text-sm text-slate-500 flex items-center mt-1"><MessageCircle size={14} className="mr-1 text-emerald-500"/> Sincronizado com Agente WhatsApp</p>}
             {view === 'orders' && <p className="text-sm text-slate-500 mt-1">Arraste e solte os cards para atualizar o status.</p>}
           </div>

           <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto">
              {view === 'products' && (
                 <>
                   <button className="text-amber-600 font-bold text-sm px-4 py-2 border border-amber-200 rounded-lg hover:bg-amber-50 transition opacity-0 cursor-default hidden md:block">Importar</button>
                   <button onClick={openNewProductModal} className="bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg hover:bg-amber-500 transition shadow-sm flex items-center w-full md:w-auto justify-center">
                      <Plus size={16} className="mr-2"/> Adicionar Produto
                   </button>
                 </>
              )}
              {view === 'grooming' && (
                 <button onClick={() => {
                    setManualAppointmentData(prev => ({ ...prev, professional: selectedGroomer === 'Todos' ? 'Luiza' : selectedGroomer }));
                    setIsModalOpen(true);
                 }} className="bg-rose-500 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-rose-600 transition shadow-sm flex items-center justify-center shadow-rose-200 w-full md:w-auto">
                    <Plus size={16} className="mr-2"/> Novo Agendamento
                 </button>
              )}
              {view === 'clients' && (
                 <button onClick={openNewClientModal} className="bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg hover:bg-amber-500 transition shadow-sm flex items-center justify-center w-full md:w-auto">
                    <Plus size={16} className="mr-2"/> Adicionar Cliente
                 </button>
              )}
           </div>
        </header>

        {/* SCROLLABLE AREA - VIEW ROUTING */}
        
        {view === 'dashboard' && (
          <PetSystemDashboard 
            totalClients={dashboardClientCount}
            slots={slots}
            topServices={topServices}
            vipClients={vipClients}
            riskClients={riskClients}
          />
        )}

        {view === 'clients' && (
          <PetSystemClients 
             clients={clients}
             searchTerm={clientSearchTerm}
             setSearchTerm={setClientSearchTerm}
             onSelectClient={async (c) => { 
                setSelectedClient(c); 
                setIsClientModalOpen(true); 
                const history = await Services.getClientHistory(c.id);
                setSelectedClient(prev => prev ? { ...prev, history } : null);
             }}
             onEditClient={handleEditClient}
             onDeleteClient={handleDeleteClient}
             onNewAppointment={(c) => { 
                setSelectedClient(c);
                setClientAppointmentData({ petIndex: 0, professional: 'Luiza', time: '', services: [] });
                setIsClientAppointmentModalOpen(true);
             }}
             onImportCSV={handleImportCSV}
             currentPage={clientPage}
             totalCount={clientTotalCount}
             pageSize={CLIENT_PAGE_SIZE}
             onPageChange={setClientPage}
          />
        )}

        {view === 'grooming' && (
          <PetSystemGrooming 
            slots={slots}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedGroomer={selectedGroomer}
            setSelectedGroomer={setSelectedGroomer}
            onStatusChange={handleStatusChange}
            onManualAppointment={(prof, time) => {
               setManualAppointmentData(prev => ({ ...prev, professional: prof, time: time }));
               setIsModalOpen(true);
            }}
            onBlock={handleBlockSlot}
            onDelete={handleDeleteAppointment}
          />
        )}

        {view === 'orders' && (
           <PetSystemKanban 
              slots={slots}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onStatusChange={handleStatusChange}
           />
        )}

        {view === 'finance' && (
           <PetSystemFinance financeMetrics={financeMetrics} />
        )}

        {view === 'products' && (
           <PetSystemProducts 
              products={productsList}
              searchTerm={productSearchTerm}
              setSearchTerm={setProductSearchTerm}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onImportCSV={handleImportServicesCSV}
           />
        )}

        </main>
      </div>

      {/* Manual Appointment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Agendamento (Balcão)">
        {/* ... (Existing Form) ... */}
        <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Profissional</label>
             <select 
               className="w-full border border-slate-300 rounded-lg p-2 outline-none bg-white"
               value={manualAppointmentData.professional}
               onChange={(e) => setManualAppointmentData({...manualAppointmentData, professional: e.target.value})}
             >
                {professionals.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
             <select 
               className="w-full border border-slate-300 rounded-lg p-2 outline-none bg-white"
               value={manualAppointmentData.time}
               onChange={(e) => setManualAppointmentData({...manualAppointmentData, time: e.target.value})}
             >
                <option value="">Selecione...</option>
                {/* Aqui filtramos APENAS horários que parecem livres localmente para ajudar, mas a validação real ocorre no submit */}
                {slots
                  .filter(s => s.status === 'Livre' && s.professional === manualAppointmentData.professional)
                  .map(s => (
                  <option key={s.id} value={s.time}>{s.time}</option>
                ))}
             </select>
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Tutor</label>
             <ClientAutocomplete 
                selectedClient={manualSelectedClient}
                onSelectClient={(client) => {
                   setManualSelectedClient(client);
                   if (client) {
                       setManualAppointmentData({...manualAppointmentData, tutor: client.name, pet: client.pets[0]?.name || ''});
                   } else {
                       setManualAppointmentData({...manualAppointmentData, tutor: '', pet: ''});
                   }
                }}
                placeholder="Busque cliente cadastrado ou digite nome..."
             />
             {!manualSelectedClient && (
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none mt-2" 
                  placeholder="Se for um cliente novo, digite o nome..."
                  value={manualAppointmentData.tutor}
                  onChange={(e) => setManualAppointmentData({...manualAppointmentData, tutor: e.target.value})}
                />
             )}
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Pet</label>
               {manualSelectedClient ? (
                  <select
                     className="w-full border border-slate-300 rounded-lg p-2 outline-none bg-white"
                     value={manualAppointmentData.pet}
                     onChange={(e) => setManualAppointmentData({...manualAppointmentData, pet: e.target.value})}
                  >
                     {manualSelectedClient.pets.length > 0 ? (
                        manualSelectedClient.pets.map(p => <option key={p.id} value={p.name}>{p.name}</option>)
                     ) : (
                        <option value="">Nenhum pet cadastrado</option>
                     )}
                  </select>
               ) : (
                  <input 
                     type="text" 
                     className="w-full border border-slate-300 rounded-lg p-2 outline-none" 
                     placeholder="Nome do pet"
                     value={manualAppointmentData.pet}
                     onChange={(e) => setManualAppointmentData({...manualAppointmentData, pet: e.target.value})}
                  />
               )}
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
               <select 
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                  value={manualAppointmentData.service}
                  onChange={(e) => setManualAppointmentData({...manualAppointmentData, service: e.target.value})}
               >
                  {availableServicesList.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
           </div>
           <button onClick={confirmManualAppointment} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 mt-2">Confirmar Agendamento</button>
        </div>
      </Modal>

      {/* Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={editingProductId ? "Editar Produto" : "Novo Produto"}>
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Item</label>
               <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
               <select 
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none bg-white"
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
               >
                  <option>Serviços</option>
                  <option>Alimentos</option>
                  <option>Farmácia</option>
                  <option>Acessórios</option>
                  <option>Cosméticos</option>
               </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço (R$)</label>
                  <input 
                     type="number" 
                     className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                     value={productForm.price}
                     onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Atual</label>
                  <input 
                     type="number" 
                     className="w-full border border-slate-300 rounded-lg p-2 outline-none"
                     value={productForm.stock}
                     onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                     disabled={productForm.category === 'Serviços'}
                  />
               </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
               <input 
                  type="checkbox" 
                  id="prodAvailable"
                  checked={productForm.available}
                  onChange={(e) => setProductForm({...productForm, available: e.target.checked})}
                  className="w-5 h-5 accent-emerald-500"
               />
               <label htmlFor="prodAvailable" className="text-sm font-bold text-slate-700">Disponível para venda/agendamento</label>
            </div>
            <button onClick={handleSaveProduct} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 mt-2">Salvar Produto</button>
         </div>
      </Modal>

      {/* ... (Other Modals) ... */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Detalhes do Cliente">
        {selectedClient && (
          <div className="space-y-6">
            {/* Header Profile */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-2xl">
                {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedClient.name}</h2>
                <div className="space-y-1 mt-1">
                   <div className="flex items-center text-sm text-slate-600"><Phone size={14} className="mr-2"/> {selectedClient.phone}</div>
                   {selectedClient.cpf && <div className="flex items-center text-sm text-slate-600"><User size={14} className="mr-2"/> CPF: {selectedClient.cpf}</div>}
                   {selectedClient.birth_date && <div className="flex items-center text-sm text-slate-600"><Calendar size={14} className="mr-2"/> Nasc: {selectedClient.birth_date.split('-').reverse().join('/')}</div>}
                   <div className="flex items-center text-sm text-slate-600"><Mail size={14} className="mr-2"/> {selectedClient.email}</div>
                   <div className="flex items-center text-sm text-slate-600"><MapPin size={14} className="mr-2"/> {selectedClient.address} {selectedClient.cep ? ` - CEP: ${selectedClient.cep}` : ''}</div>
                </div>
              </div>
            </div>

            {/* Pets Section */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center"><PawPrint size={18} className="mr-2 text-rose-500"/> Meus Pets</h4>
              <div className="grid grid-cols-2 gap-4">
                 {selectedClient.pets.map((pet, idx) => (
                   <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                           <Bone size={16} className="text-slate-400"/>
                         </div>
                         <div>
                            <p className="font-bold text-slate-800 text-sm">{pet.name}</p>
                            <p className="text-xs text-slate-500">{pet.type} • {pet.breed}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         {pet.gender && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold block mb-1">{pet.gender}</span>}
                         {pet.weight && <span className="text-xs text-emerald-600 font-bold flex items-center justify-end"><Scale size={10} className="mr-1"/>{pet.weight}</span>}
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* History Section */}
            <div>
               <h4 className="font-bold text-slate-800 mb-3 flex items-center"><History size={18} className="mr-2 text-indigo-500"/> Histórico de Serviços</h4>
               {selectedClient.history.length > 0 ? (
                 <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 font-medium">
                         <tr>
                           <th className="p-3">Data</th>
                           <th className="p-3">Serviço</th>
                           <th className="p-3">Pet</th>
                           <th className="p-3 text-right">Valor</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {selectedClient.history.map((h, i) => (
                           <tr key={i} className="hover:bg-slate-50/50">
                             <td className="p-3 text-slate-500">{h.date}</td>
                             <td className="p-3 font-medium text-slate-700">{h.service}</td>
                             <td className="p-3 text-slate-500">{h.pet}</td>
                             <td className="p-3 text-right font-bold text-emerald-600">{h.value}</td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <FileText className="mx-auto text-slate-300 mb-2" size={32}/>
                    <p className="text-slate-400 text-sm">Nenhum serviço registrado ainda.</p>
                 </div>
               )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
               <button onClick={() => handleEditClient(selectedClient)} className="px-4 py-2 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-lg">Editar Cadastro</button>
               <button onClick={() => { 
                  // Initialize new appointment form specific to this client
                  setClientAppointmentData({
                     petIndex: 0,
                     professional: 'Luiza',
                     time: '',
                     services: []
                  });
                  setIsClientModalOpen(false); 
                  setIsClientAppointmentModalOpen(true); 
               }} className="px-4 py-2 bg-rose-500 text-white font-bold text-sm rounded-lg hover:bg-rose-600 shadow-md shadow-rose-200">Novo Agendamento</button>
            </div>
          </div>
        )}
      </Modal>

      {/* NEW CLIENT CONTEXT APPOINTMENT MODAL */}
      <Modal isOpen={isClientAppointmentModalOpen} onClose={() => setIsClientAppointmentModalOpen(false)} title={`Novo Agendamento - ${selectedClient?.name}`}>
         {selectedClient && (
            <div className="space-y-6">
               <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold">
                     {selectedClient.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                     <p className="text-xs font-bold text-amber-800 uppercase">Tutor Responsável</p>
                     <p className="font-bold text-slate-700">{selectedClient.name}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Selecionar Pet</label>
                     <select 
                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-rose-500 bg-white"
                        value={clientAppointmentData.petIndex}
                        onChange={(e) => setClientAppointmentData({...clientAppointmentData, petIndex: parseInt(e.target.value)})}
                     >
                        {selectedClient.pets.map((pet, idx) => (
                           <option key={idx} value={idx}>{pet.name} ({pet.type})</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Profissional</label>
                     <select 
                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-rose-500 bg-white"
                        value={clientAppointmentData.professional}
                        onChange={(e) => setClientAppointmentData({...clientAppointmentData, professional: e.target.value, time: ''})}
                     >
                        {professionals.map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                  </div>
                  <div className="col-span-2">
                     <label className="block text-sm font-bold text-slate-700 mb-2">Horário Disponível ({clientAppointmentData.professional})</label>
                     <select 
                        className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-rose-500 bg-white"
                        value={clientAppointmentData.time}
                        onChange={(e) => setClientAppointmentData({...clientAppointmentData, time: e.target.value})}
                     >
                        <option value="">Selecione...</option>
                        {slots
                           .filter(s => s.status === 'Livre' && s.professional === clientAppointmentData.professional)
                           .map(s => (
                           <option key={s.id} value={s.time}>{s.time}</option>
                        ))}
                     </select>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Serviços (Multi-seleção)</label>
                  <div className="grid grid-cols-2 gap-3">
                     {availableServicesList.map(service => {
                        const isSelected = clientAppointmentData.services.includes(service);
                        return (
                           <button
                              key={service}
                              onClick={() => toggleServiceSelection(service)}
                              className={`p-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-between ${
                                 isSelected 
                                    ? 'bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-200' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:bg-rose-50'
                              }`}
                           >
                              <span>{service}</span>
                               {isSelected && <CheckCircle2 size={16}/>}
                           </button>
                        );
                     })}
                  </div>
               </div>
               
               <div className="pt-4 border-t border-slate-100 flex gap-4">
                  <button onClick={() => setIsClientAppointmentModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancelar</button>
                  <button onClick={confirmClientAppointment} className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200">Confirmar Agendamento</button>
               </div>
            </div>
         )}
      </Modal>

      {/* NEW CLIENT REGISTRATION MODAL */}
      <Modal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} title={editingId ? "Editar Cliente" : "Novo Cadastro de Cliente"}>
         {/* ... (Existing Form) ... */}
         <div className="space-y-6">
            {/* Tutor Section */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
               <h4 className="font-bold text-slate-700 mb-4 flex items-center"><User size={20} className="mr-2 text-amber-500"/> Dados do Tutor</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Maria Silva" 
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="(00) 00000-0000" 
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">CPF</label>
                    <input 
                      type="text" 
                      placeholder="000.000.000-00" 
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                      value={newClient.cpf}
                      onChange={(e) => setNewClient({...newClient, cpf: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Data de Nascimento</label>
                    <input 
                      type="date" 
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                      value={newClient.birth_date}
                      onChange={(e) => setNewClient({...newClient, birth_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email (Opcional)</label>
                    <input 
                      type="email" 
                      placeholder="cliente@email.com" 
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">CEP</label>
                    <input 
                      type="text" 
                      placeholder="00000-000" 
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                      value={newClient.cep}
                      onChange={(e) => setNewClient({...newClient, cep: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Endereço Completo</label>
                    <input 
                      type="text" 
                      placeholder="Rua, Número, Bairro" 
                      className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                      value={newClient.address}
                      onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    />
                  </div>
               </div>
            </div>

            {/* Pets Section */}
            <div className="space-y-4">
               <h4 className="font-bold text-slate-700 flex items-center text-lg"><PawPrint size={20} className="mr-2 text-rose-500"/> Pets ({newClient.pets.length})</h4>
               
               {newClient.pets.map((pet, index) => (
                  <div key={pet.id} className="border-2 border-slate-100 rounded-2xl p-5 relative bg-white shadow-sm">
                     {index > 0 && (
                        <button 
                          onClick={() => removePetFromForm(index)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 p-1.5 rounded-lg" 
                          title="Remover Pet"
                        >
                           <Trash2 size={18}/>
                        </button>
                     )}
                     
                     <div className="flex flex-col md:flex-row gap-6">
                        {/* Photo Upload */}
                        <div className="w-full md:w-32 flex-shrink-0">
                           <div className="w-32 h-32 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 hover:border-amber-300 transition-all group">
                              <Camera size={24} className="text-slate-400 group-hover:text-amber-500 mb-2"/>
                              <span className="text-xs font-bold text-slate-400 group-hover:text-amber-500">Adicionar Foto</span>
                           </div>
                        </div>

                        {/* Pet Fields */}
                        <div className="flex-1 space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Pet</label>
                                 <input 
                                   type="text" 
                                   placeholder="Nome" 
                                   className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-400"
                                   value={pet.name}
                                   onChange={(e) => updatePetField(index, 'name', e.target.value)}
                                 />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Espécie</label>
                                 <select 
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-400 bg-white"
                                    value={pet.type}
                                    onChange={(e) => updatePetField(index, 'type', e.target.value)}
                                 >
                                    <option>Cão</option>
                                    <option>Gato</option>
                                    <option>Outro</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Raça</label>
                                 <input 
                                    type="text" 
                                    placeholder="Ex: Poodle" 
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-400"
                                    value={pet.breed}
                                    onChange={(e) => updatePetField(index, 'breed', e.target.value)}
                                 />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Peso (kg)</label>
                                 <input 
                                    type="text" 
                                    placeholder="Ex: 12.5" 
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-400"
                                    value={pet.weight}
                                    onChange={(e) => updatePetField(index, 'weight', e.target.value)}
                                 />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Sexo</label>
                                 <select 
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-400 bg-white"
                                    value={pet.gender}
                                    onChange={(e) => updatePetField(index, 'gender', e.target.value)}
                                 >
                                    <option>Macho</option>
                                    <option>Fêmea</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Pulgas/Carrapatos?</label>
                                 <select 
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-rose-400 bg-white"
                                    value={pet.has_fleas_ticks ? 'Sim' : 'Não'}
                                    onChange={(e) => updatePetField(index, 'has_fleas_ticks', e.target.value === 'Sim')}
                                 >
                                    <option>Não</option>
                                    <option>Sim</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Vacinas em Dia?</label>
                                 <select 
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-rose-400 bg-white outline-rose-200"
                                    value={pet.vaccines_up_to_date ? 'Sim' : 'Não'}
                                    onChange={(e) => updatePetField(index, 'vaccines_up_to_date', e.target.value === 'Sim')}
                                 >
                                    <option>Não</option>
                                    <option>Sim</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Nascimento</label>
                                 <input 
                                    type="date" 
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-400"
                                    value={pet.birth_date}
                                    onChange={(e) => updatePetField(index, 'birth_date', e.target.value)}
                                 />
                              </div>
                           </div>

                           {/* Behavior Area */}
                           <div>
                              <label className="block text-xs font-bold text-slate-500 mb-2">Comportamento do Pet</label>
                              <textarea 
                                 placeholder="Descreva o comportamento (ex: É reativo com outros cães, medroso com barulho, sociável com gatos...)" 
                                 className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-400 min-h-[60px]"
                                 value={pet.behavior.join(', ')}
                                 onChange={(e) => updatePetField(index, 'behavior', [e.target.value])}
                              ></textarea>
                           </div>

                           {/* Alert & Obs */}
                           <div className="grid grid-cols-1 gap-4">
                              <div>
                                 <label className="block text-xs font-bold text-rose-500 mb-1 flex items-center"><AlertCircle size={12} className="mr-1"/> Alertas Médicos</label>
                                 <textarea 
                                    placeholder="Alergias, cirurgias recentes, problemas crônicos..." 
                                    className="w-full border border-rose-100 bg-rose-50 rounded-lg p-2 text-sm outline-none focus:border-rose-300 min-h-[60px]"
                                    value={pet.medical}
                                    onChange={(e) => updatePetField(index, 'medical', e.target.value)}
                                 ></textarea>
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1">Observações Gerais</label>
                                 <textarea 
                                    placeholder="Preferências, medos (ex: secador), histórico..." 
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-amber-400 min-h-[60px]"
                                    value={pet.obs}
                                    onChange={(e) => updatePetField(index, 'obs', e.target.value)}
                                 ></textarea>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
               
               <button 
                 onClick={addPetToForm} 
                 className="w-full py-3 border-2 border-dashed border-amber-300 bg-amber-50 text-amber-700 rounded-xl font-bold hover:bg-amber-100 transition flex items-center justify-center"
               >
                  <Plus size={20} className="mr-2"/> Adicionar Outro Pet
               </button>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex gap-4">
               <button 
                 onClick={() => setIsAddClientModalOpen(false)}
                 className="flex-1 py-3 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition"
               >
                  Cancelar
               </button>
               <button 
                 onClick={handleSaveClient}
                 className="flex-1 py-3 bg-emerald-500 font-bold text-white rounded-xl hover:bg-emerald-600 transition flex items-center justify-center shadow-lg shadow-emerald-200"
               >
                  <Save size={20} className="mr-2"/> Salvar Cadastro
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default PetSystem;