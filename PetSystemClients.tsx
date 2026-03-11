import React, { useRef, useState, useEffect } from 'react';
import { Search, Users, Edit, Calendar, Phone, PawPrint, Trash2, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { PetClient } from './types';

interface ClientsViewProps {
  clients: PetClient[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectClient: (client: PetClient) => void;
  onEditClient: (client: PetClient) => void;
  onDeleteClient: (id: number) => void;
  onNewAppointment: (client: PetClient) => void;
  onImportCSV: (file: File) => void;
  // Paginação
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const PetSystemClients: React.FC<ClientsViewProps> = ({
  clients,
  searchTerm,
  setSearchTerm,
  onSelectClient,
  onEditClient,
  onDeleteClient,
  onNewAppointment,
  onImportCSV,
  currentPage,
  totalCount,
  pageSize,
  onPageChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Debounce: só dispara a busca no servidor após 500ms sem digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
      onPageChange(0); // Volta para página 0 ao pesquisar
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const showingFrom = totalCount === 0 ? 0 : currentPage * pageSize + 1;
  const showingTo = Math.min((currentPage + 1) * pageSize, totalCount);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center flex-1">
          <Search className="text-slate-400 ml-3 mr-3" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou telefone..." 
            className="flex-1 outline-none text-slate-700 py-2"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        
        {/* Import Button */}
        <div>
          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept=".csv"
             onChange={handleFileChange}
          />
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="h-full px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition flex items-center shadow-sm"
             title="Importar CSV"
          >
             <Upload size={18} className="mr-2 text-brand-600"/> Importar
          </button>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-slate-500 font-medium">
        {totalCount > 0 ? (
          <span>Mostrando <strong>{showingFrom}</strong> a <strong>{showingTo}</strong> de <strong>{totalCount}</strong> clientes</span>
        ) : (
          <span>Nenhum cliente encontrado.</span>
        )}
      </div>
      
      {clients.length === 0 ? (
         <div className="text-center py-12 text-slate-400">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum cliente encontrado.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map(client => (
              <div key={client.id} 
                   onClick={() => onSelectClient(client)}
                   className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                 
                 <div className="flex justify-between items-start mb-4 gap-2">
                     <div className="flex items-center space-x-3 overflow-hidden">
                         <div className="w-12 h-12 shrink-0 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-lg">
                           {client.name ? client.name.substring(0,2).toUpperCase() : '??'}
                         </div>
                         <div className="min-w-0 flex-1">
                           <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-amber-600 transition-colors line-clamp-2" title={client.name}>{client.name}</h3>
                           <div className="flex items-center text-slate-500 text-sm mt-1">
                             <Phone size={12} className="mr-1 shrink-0" />
                             <span className="truncate">{client.phone}</span>
                           </div>
                         </div>
                     </div>

                     <div className="flex space-x-1 shrink-0">
                       <button 
                         onClick={(e) => { e.stopPropagation(); onEditClient(client); }}
                         className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-amber-100 hover:text-amber-600 transition"
                         title="Editar"
                       >
                          <Edit size={16} />
                       </button>
                       <button 
                         onClick={(e) => { 
                            e.stopPropagation();
                            if(window.confirm(`Excluir o cliente ${client.name} e todo o seu histórico?`)) {
                               onDeleteClient(client.id);
                            }
                         }}
                         className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-rose-100 hover:text-rose-600 transition"
                         title="Excluir"
                       >
                          <Trash2 size={16} />
                       </button>
                       <button 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           onNewAppointment(client);
                         }}
                         className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 hover:text-rose-600 transition"
                         title="Novo Agendamento"
                       >
                          <Calendar size={16} />
                       </button>
                     </div>
                 </div>

                 <div className="space-y-2">
                     {client.pets && client.pets.map((pet, idx) => (
                       <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                           <div className="flex items-center space-x-2">
                             <PawPrint size={14} className="text-amber-500"/>
                             <span className="font-medium text-slate-700 text-sm">{pet.name}</span>
                           </div>
                           <span className="text-xs text-slate-400">{pet.breed}</span>
                       </div>
                     ))}
                 </div>
              </div>
            ))}
         </div>
      )}

      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-6 pb-4">
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            className={`flex items-center px-4 py-2 rounded-lg font-bold text-sm transition ${
              currentPage === 0
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <ChevronLeft size={16} className="mr-1" /> Anterior
          </button>
          
          <span className="text-sm font-bold text-slate-600">
            Página {currentPage + 1} de {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
            className={`flex items-center px-4 py-2 rounded-lg font-bold text-sm transition ${
              currentPage >= totalPages - 1
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
            }`}
          >
            Próximo <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PetSystemClients;