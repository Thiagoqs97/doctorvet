import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, Phone } from 'lucide-react';
import * as Services from './services';
import { PetClient } from './types';

interface ClientAutocompleteProps {
  onSelectClient: (client: PetClient | null) => void;
  selectedClient: PetClient | null;
  placeholder?: string;
  className?: string;
}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({ 
  onSelectClient, 
  selectedClient,
  placeholder = "Buscar cliente por nome ou telefone...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<PetClient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quando um cliente está selecionado externalmente, reflete no input
  useEffect(() => {
    if (selectedClient) {
      setSearchTerm(selectedClient.name);
    } else {
      setSearchTerm('');
    }
  }, [selectedClient]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Só busca se tiver texto, se o dropdown estiver aberto (evita buscar quando apenas reflete a seleção)
      // e se o texto for diferente do nome do cliente selecionado atualmente
      if (searchTerm.trim().length > 1 && (!selectedClient || searchTerm !== selectedClient.name)) {
        setIsLoading(true);
        try {
          const { clients } = await Services.getClients(0, 5, searchTerm);
          setResults(clients);
          setIsOpen(true);
        } catch (error) {
          console.error("Erro na busca de clientes:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        if (searchTerm.trim().length <= 1) setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedClient]);

  const handleSelect = (client: PetClient) => {
    onSelectClient(client);
    setSearchTerm(client.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectClient(null);
    setSearchTerm('');
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
           {isLoading ? <Loader2 size={16} className="animate-spin text-rose-500" /> : <Search size={16} />}
        </div>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg py-2 pl-10 pr-10 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
             setSearchTerm(e.target.value);
             if (selectedClient) onSelectClient(null); // Desmarca se o usuário começar a digitar de novo
          }}
          onFocus={() => {
             if (results.length > 0) setIsOpen(true);
          }}
        />
        {searchTerm && (
           <button 
             onClick={handleClear}
             className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
             title="Limpar busca"
             type="button"
           >
              ✕
           </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((client) => (
            <div 
              key={client.id}
              onClick={() => handleSelect(client)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex flex-col transition-colors"
            >
              <div className="font-bold text-slate-800 flex items-center text-sm">
                 <User size={14} className="mr-2 text-slate-400" />
                 {client.name}
              </div>
              {client.phone && (
                <div className="text-xs text-slate-500 flex items-center mt-1 ml-5">
                   <Phone size={10} className="mr-1" />
                   {client.phone}
                </div>
              )}
              {client.pets && client.pets.length > 0 && (
                 <div className="text-[10px] text-slate-400 mt-1 ml-5">
                    <strong>Pets:</strong> {client.pets.map(p => p.name).join(', ')}
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {isOpen && searchTerm.trim().length > 1 && results.length === 0 && !isLoading && (
         <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-sm text-slate-500 text-center">
            Nenhum cliente encontrado.
         </div>
      )}
    </div>
  );
};

export default ClientAutocomplete;
