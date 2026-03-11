import React from 'react';
import { Coffee, User, Phone, Check, Activity, CheckCircle2, Ban, Trash2 } from 'lucide-react';
import { GroomingSlot } from './types';
import { professionals } from './mockData';

interface GroomingViewProps {
  slots: GroomingSlot[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedGroomer: string;
  setSelectedGroomer: (groomer: string) => void;
  onStatusChange: (id: string, status: GroomingSlot['status']) => void;
  onManualAppointment: (professional: string, time: string) => void;
  onBlock: (professional: string, time: string) => void;
  onDelete: (id: string) => void;
}

const PetSystemGrooming: React.FC<GroomingViewProps> = ({
  slots,
  selectedDate,
  setSelectedDate,
  selectedGroomer,
  setSelectedGroomer,
  onStatusChange,
  onManualAppointment,
  onBlock,
  onDelete
}) => {
  const filteredSlots = slots.filter(slot => selectedGroomer === 'Todos' || slot.professional === selectedGroomer);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Left Column: Agenda Timeline */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* DATE PICKER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
           <div className="flex space-x-2 overflow-x-auto pb-2 flex-1">
              <button 
                 onClick={() => setSelectedGroomer('Todos')}
                 className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    selectedGroomer === 'Todos' ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                 }`}
              >
                 Todos
              </button>
              {professionals.map(prof => (
                 <button 
                    key={prof}
                    onClick={() => setSelectedGroomer(prof)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                       selectedGroomer === prof ? 'bg-rose-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                 >
                    {prof}
                 </button>
              ))}
           </div>
           
           <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="outline-none text-sm font-bold text-slate-700 bg-transparent px-2 py-1"
              />
           </div>
        </div>

        {filteredSlots.length === 0 ? (
           <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-slate-400">Nenhum horário encontrado para o filtro selecionado.</p>
           </div>
        ) : (
           filteredSlots.map((slot) => (
            <div key={slot.id} className={`relative flex rounded-xl border transition-all hover:shadow-sm ${
              slot.status === 'Livre' 
                ? 'bg-slate-50 border-slate-200 border-dashed opacity-75 hover:opacity-100' 
                : slot.status === 'Agendado' 
                  ? 'bg-white border-amber-200 border-l-4 border-l-amber-400'
                  : slot.status === 'Confirmado'
                    ? 'bg-white border-emerald-200 border-l-4 border-l-emerald-500'
                    : slot.status === 'Em Andamento'
                      ? 'bg-white border-blue-200 border-l-4 border-l-blue-500'
                        : slot.status === 'Bloqueado'
                          ? 'bg-slate-50 border-slate-300 opacity-60'
                      : slot.status === 'Almoço'
                        ? 'bg-slate-100 border-slate-200 opacity-60'
                        : 'bg-slate-50 border-slate-200 border-l-4 border-l-slate-400'
            }`}>
              {/* Time Column */}
              <div className="w-24 border-r border-slate-100 flex flex-col items-center justify-center p-4">
                <span className="text-xl font-bold text-slate-700">{slot.time}</span>
                <span className={`text-[10px] uppercase font-bold mt-1 px-1.5 py-0.5 rounded ${
                  slot.status === 'Livre' ? 'bg-emerald-100 text-emerald-700' : 
                  slot.status === 'Bloqueado' ? 'bg-slate-200 text-slate-500' : 'text-slate-400'
                }`}>
                  {slot.status === 'Livre' ? 'Disponível' : slot.status === 'Bloqueado' ? 'Bloqueado' : slot.status}
                </span>
              </div>

              {/* Content Column */}
              <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center">
                {slot.status === 'Almoço' ? (
                   <div className="flex items-center justify-center w-full text-slate-400 italic">
                      <Coffee size={18} className="mr-2"/> Intervalo de Almoço
                   </div>
                ) : slot.status === 'Livre' ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-0">
                    <div className="flex items-center text-slate-400">
                       <span className="bg-rose-50 text-rose-500 text-xs font-bold px-2 py-1 rounded mr-3">{slot.professional}</span>
                       <span className="text-sm italic">Horário livre</span>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button 
                         onClick={() => onBlock(slot.professional, slot.time)}
                         className="text-xs font-bold text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                      >
                         Bloquear
                      </button>
                      <button 
                         onClick={() => onManualAppointment(slot.professional, slot.time)}
                         className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex-1 sm:flex-none text-center"
                      >
                        + Agendar
                      </button>
                    </div>
                  </div>
                ) : slot.status === 'Bloqueado' ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-0">
                     <span className="text-slate-500 text-sm font-medium italic animate-pulse">Horário bloqueado</span>
                     <button onClick={() => onDelete(slot.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition" title="Desbloquear">
                       <Ban size={18} />
                     </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                     <div className="w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                           <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{slot.professional}</span>
                           <h4 className="font-bold text-slate-800 text-lg">{slot.pet}</h4>
                           <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">{slot.service}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                           <span className="flex items-center"><User size={14} className="mr-1"/> {slot.tutor}</span>
                           <span className="flex items-center"><Phone size={14} className="mr-1"/> {slot.phone}</span>
                        </div>
                     </div>
                     
                     {/* Actions */}
                     {slot.status !== 'Finalizado' && (
                       <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          {slot.status === 'Agendado' && (
                            <button onClick={() => onStatusChange(slot.id, 'Confirmado')} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition" title="Confirmar Presença">
                              <Check size={18} />
                            </button>
                          )}
                          {slot.status === 'Confirmado' && (
                             <button onClick={() => onStatusChange(slot.id, 'Em Andamento')} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition" title="Iniciar Banho">
                               <Activity size={18} />
                             </button>
                           )}
                          <button onClick={() => onStatusChange(slot.id, 'Finalizado')} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition" title="Finalizar Serviço">
                            <CheckCircle2 size={18} />
                          </button>
                          
                          {/* Botão de Cancelar/Liberar (Status = Livre) */}
                          <button onClick={() => onStatusChange(slot.id, 'Livre')} className="p-2 bg-amber-50 text-amber-500 rounded-lg hover:bg-amber-100 transition" title="Cancelar (Liberar horário)">
                            <Ban size={18} />
                          </button>

                           {/* Botão de Excluir (Hard Delete do BD) */}
                          <button onClick={() => onDelete(slot.id)} className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition" title="Excluir Agendamento">
                            <Trash2 size={18} />
                          </button>
                       </div>
                     )}
                     {slot.status === 'Finalizado' && (
                       <span className="px-3 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-full">Concluído</span>
                     )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right Column: Summary & Quick Info */}
      <div className="space-y-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Activity size={18} className="mr-2 text-rose-500"/> Resumo do Dia ({selectedDate.split('-').reverse().join('/')})</h3>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Horários Totais</span>
                  <span className="font-bold">{slots.length}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Disponíveis</span>
                  <span className="font-bold text-emerald-600">{slots.filter(s => s.status === 'Livre').length}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Ocupados</span>
                  <span className="font-bold text-rose-500">{slots.filter(s => s.status !== 'Livre' && s.status !== 'Almoço').length}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PetSystemGrooming;