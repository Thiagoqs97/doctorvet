import React from 'react';
import { MoreHorizontal, GripVertical, Scissors, User, Clock, Activity, CheckCircle2, Check } from 'lucide-react';
import { GroomingSlot } from './types';

interface KanbanViewProps {
  slots: GroomingSlot[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onStatusChange: (id: string, status: GroomingSlot['status']) => void;
}

const PetSystemKanban: React.FC<KanbanViewProps> = ({
  slots,
  selectedDate,
  setSelectedDate,
  onStatusChange
}) => {
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatusGroup: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    
    let newStatus: GroomingSlot['status'] = 'Agendado'; 
    if (targetStatusGroup === 'Aguardando') newStatus = 'Confirmado';
    if (targetStatusGroup === 'Em Andamento') newStatus = 'Em Andamento';
    if (targetStatusGroup === 'Pronto') newStatus = 'Finalizado';

    onStatusChange(id, newStatus);
  };

  return (
   <div className="h-full flex flex-col animate-fadeIn">
      {/* Date Filter Toolbar for Kanban */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 rounded-xl border border-slate-100">
         <span className="font-bold text-slate-600 text-sm">Visualizando Kanban de:</span>
         <input 
           type="date" 
           value={selectedDate} 
           onChange={(e) => setSelectedDate(e.target.value)}
           className="w-full sm:w-auto border border-slate-300 rounded-lg p-2 text-sm text-slate-700 font-bold outline-none focus:border-rose-500"
         />
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="h-full flex gap-6 min-w-[1000px] pb-4">
              
              {/* Column 1: Aguardando (Agendado ou Confirmado) */}
              <div 
                className="flex-1 bg-slate-100 rounded-xl flex flex-col border border-slate-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'Aguardando')}
              >
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                      <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                          <h3 className="font-bold text-slate-700">Aguardando</h3>
                          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {slots.filter(s => s.status === 'Agendado' || s.status === 'Confirmado').length}
                          </span>
                      </div>
                      <MoreHorizontal size={16} className="text-slate-400 cursor-pointer"/>
                  </div>
                  <div className="p-4 space-y-3 overflow-y-auto flex-1">
                      {slots.filter(s => s.status === 'Agendado' || s.status === 'Confirmado').map(slot => (
                          <div 
                            key={slot.id} 
                            draggable 
                            onDragStart={(e) => handleDragStart(e, slot.id)}
                            className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-move hover:shadow-md transition-all group relative ${slot.status === 'Confirmado' ? 'border-l-4 border-l-emerald-400' : 'border-l-4 border-l-amber-300'}`}
                          >
                              <div className="absolute top-4 right-4 text-slate-300 group-hover:text-amber-400">
                                  <GripVertical size={16}/>
                              </div>
                              <div className="flex items-start mb-3">
                                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold mr-3 border border-amber-200">
                                      {slot.pet ? slot.pet.substring(0,2).toUpperCase() : '??'}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">{slot.pet}</h4>
                                      <p className="text-xs text-slate-500">{slot.status}</p>
                                  </div>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                                  <div className="flex items-center text-xs font-bold text-slate-600 mb-1">
                                      <Scissors size={12} className="mr-1 text-slate-400"/> {slot.service}
                                  </div>
                                  <div className="flex items-center text-xs text-slate-500">
                                      <User size={12} className="mr-1"/> {slot.tutor}
                                  </div>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-slate-400 flex items-center bg-slate-100 px-2 py-1 rounded">
                                      <Clock size={12} className="mr-1"/> {slot.time} • {slot.professional}
                                  </span>
                              </div>
                          </div>
                      ))}
                      {slots.filter(s => s.status === 'Agendado' || s.status === 'Confirmado').length === 0 && (
                        <p className="text-center text-slate-400 text-sm mt-4">Nenhum agendamento pendente.</p>
                      )}
                  </div>
              </div>

              {/* Column 2: Em Andamento */}
              <div 
                className="flex-1 bg-slate-100 rounded-xl flex flex-col border border-slate-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'Em Andamento')}
              >
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                      <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                          <h3 className="font-bold text-slate-700">Em Andamento</h3>
                          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {slots.filter(s => s.status === 'Em Andamento').length}
                          </span>
                      </div>
                      <MoreHorizontal size={16} className="text-slate-400 cursor-pointer"/>
                  </div>
                  <div className="p-4 space-y-3 overflow-y-auto flex-1">
                      {slots.filter(s => s.status === 'Em Andamento').map(slot => (
                          <div 
                            key={slot.id} 
                            draggable 
                            onDragStart={(e) => handleDragStart(e, slot.id)}
                            className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-blue-500 border-y border-r border-slate-200 cursor-move hover:shadow-md transition-all group relative"
                          >
                              <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-400">
                                  <GripVertical size={16}/>
                              </div>
                              <div className="flex items-start mb-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 border border-blue-200">
                                      {slot.pet ? slot.pet.substring(0,2).toUpperCase() : '??'}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800">{slot.pet}</h4>
                                      <p className="text-xs text-slate-500">{slot.tutor}</p>
                                  </div>
                              </div>
                              <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 mb-3">
                                  <div className="flex items-center text-xs font-bold text-blue-800 mb-1">
                                      <Scissors size={12} className="mr-1 text-blue-400"/> {slot.service}
                                  </div>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-blue-600 flex items-center bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                      <Activity size={12} className="mr-1 animate-spin-slow"/> Banho/Tosa
                                  </span>
                                  <span className="text-xs text-slate-400 font-bold">{slot.time} • {slot.professional}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Column 3: Finalizado */}
              <div 
                className="flex-1 bg-slate-100 rounded-xl flex flex-col border border-slate-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'Pronto')}
              >
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                      <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <h3 className="font-bold text-slate-700">Finalizado</h3>
                          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {slots.filter(s => s.status === 'Finalizado').length}
                          </span>
                      </div>
                      <MoreHorizontal size={16} className="text-slate-400 cursor-pointer"/>
                  </div>
                  <div className="p-4 space-y-3 overflow-y-auto flex-1">
                      {slots.filter(s => s.status === 'Finalizado').map(slot => (
                          <div 
                            key={slot.id} 
                            draggable 
                            onDragStart={(e) => handleDragStart(e, slot.id)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-move hover:shadow-md hover:border-emerald-300 transition-all group relative opacity-80 hover:opacity-100"
                          >
                              <div className="absolute top-4 right-4 text-slate-300 group-hover:text-emerald-400">
                                  <CheckCircle2 size={16}/>
                              </div>
                              <div className="flex items-start mb-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold mr-3 border border-emerald-200">
                                      {slot.pet ? slot.pet.substring(0,2).toUpperCase() : '??'}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800 line-through decoration-slate-300 decoration-2">{slot.pet}</h4>
                                      <p className="text-xs text-slate-500">{slot.tutor}</p>
                                  </div>
                              </div>
                              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 mb-3">
                                  <div className="flex items-center text-xs font-bold text-emerald-800 mb-1">
                                      <Check size={12} className="mr-1"/> {slot.service}
                                  </div>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-2 py-1 rounded">
                                      Concluído
                                  </span>
                                  <span className="text-xs text-slate-400 font-bold">{slot.time} • {slot.professional}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
   </div>
  );
};

export default PetSystemKanban;