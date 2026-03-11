import React from 'react';
import { Users, Calendar, Clock, Activity, Star, AlertCircle, PawPrint, User, CheckCircle2 } from 'lucide-react';
import { GroomingSlot, TopService, VipClient, RiskClient } from './types';

interface DashboardProps {
  totalClients: number;
  slots: GroomingSlot[];
  topServices: TopService[];
  vipClients: VipClient[];
  riskClients: RiskClient[];
}

const PetSystemDashboard: React.FC<DashboardProps> = ({ 
  totalClients, 
  slots, 
  topServices, 
  vipClients, 
  riskClients 
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
       {/* Row 1: KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
             <div>
               <span className="text-slate-500 font-bold uppercase text-xs">Total de Clientes</span>
               <div className="text-5xl font-bold text-slate-800 mt-2">{totalClients}</div>
               <span className="text-xs text-slate-400 mt-1 block">Clientes cadastrados</span>
             </div>
             <div className="bg-amber-100 p-4 rounded-xl text-amber-600">
               <Users size={32} />
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
             <div>
               <span className="text-slate-500 font-bold uppercase text-xs">Agendamentos Hoje</span>
               <div className="text-5xl font-bold text-slate-800 mt-2">
                   {slots.filter(s => s.status !== 'Livre' && s.status !== 'Almoço').length}
               </div>
               <span className="text-xs text-slate-400 mt-1 block">Agendados para hoje</span>
             </div>
             <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
               <Calendar size={32} />
             </div>
          </div>
       </div>

       {/* Row 2: Operational */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Próximos Horários */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 border-t-4 border-t-rose-500 p-6 relative overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="font-bold text-slate-800 text-lg">Próximos Horários</h3>
                   <p className="text-xs text-slate-500">Agenda do dia em tempo real</p>
                </div>
                <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                   <Clock size={20}/>
                </div>
             </div>
             
             <div className="space-y-4">
                {slots.filter(s => s.status === 'Agendado' || s.status === 'Confirmado').slice(0,5).map(slot => (
                   <div key={slot.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-l-4 border-l-rose-400 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                         <div className="text-center">
                            <span className="font-bold text-slate-700 text-xl block">{slot.time}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{slot.professional}</span>
                         </div>
                         <div className="w-px h-8 bg-slate-200"></div>
                         <div>
                            <p className="font-bold text-slate-800">{slot.pet}</p>
                            <p className="text-xs text-slate-500 font-medium">{slot.service}</p>
                         </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${slot.status === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{slot.status}</span>
                   </div>
                ))}
                {slots.filter(s => s.status === 'Agendado' || s.status === 'Confirmado').length === 0 && (
                   <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      Nenhum agendamento pendente para hoje.
                   </div>
                )}
             </div>
          </div>
          
          {/* Serviços Mais Vendidos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Serviços Mais Realizados</h3>
              <div className="space-y-3">
                 {topServices.length > 0 ? topServices.map((srv, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                       <div className="flex items-center space-x-3">
                          <span className="text-amber-500 font-bold w-6">#{i+1}</span>
                          <span className="text-sm text-slate-700 font-medium">{srv.name}</span>
                       </div>
                       <span className="text-sm font-bold text-slate-800">{srv.count} <span className="text-xs font-normal text-slate-400">realizados</span></span>
                    </div>
                 )) : (
                    <p className="text-sm text-slate-400 text-center py-4">Aguardando dados de agendamentos...</p>
                 )}
              </div>
          </div>
       </div>

       {/* Row 3: Top Lists */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Top Clients */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center"><Star className="mr-2 text-amber-400 fill-amber-400" size={20}/> Clientes VIP</h3>
                <p className="text-xs text-slate-400">Top 5 clientes com mais serviços realizados</p>
              </div>
              <div className="divide-y divide-slate-50">
                 {vipClients.length > 0 ? vipClients.map((client, i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center space-x-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                            #{i+1}
                         </div>
                         <div>
                            <p className="font-bold text-slate-700 text-sm">{client.name}</p>
                            <p className="text-xs text-rose-500 font-medium flex items-center mt-0.5"><PawPrint size={10} className="mr-1"/> {client.pets.join(', ')}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-amber-50 px-3 py-1 rounded-full text-amber-600 text-xs font-bold inline-block">
                           {client.services} serviços
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{client.phone}</p>
                      </div>
                   </div>
                 )) : (
                    <p className="text-sm text-slate-400 text-center py-8">Nenhum histórico encontrado.</p>
                 )}
              </div>
           </div>

           {/* Risk Clients */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center"><AlertCircle className="mr-2 text-rose-500" size={20}/> Clientes em Risco</h3>
                <p className="text-xs text-slate-400">Sem agendamentos há mais de 30 dias</p>
              </div>
              <div className="divide-y divide-slate-50">
                 {riskClients.length > 0 ? riskClients.map((client, i) => (
                   <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                            <User size={16}/>
                         </div>
                         <div>
                            <p className="font-bold text-slate-700 text-sm">{client.name}</p>
                            <p className="text-xs text-rose-500 font-medium flex items-center mt-0.5"><PawPrint size={10} className="mr-1"/> {client.pets.join(', ')}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-rose-500 text-xs font-bold flex items-center justify-end">
                            {client.days === 'Novo' ? 'Nunca Agendou' : `${client.days} dias`} <span className="text-slate-300 mx-1">•</span> sem agendar
                         </div>
                         <p className="text-[10px] text-slate-400 mt-1">{client.phone}</p>
                      </div>
                   </div>
                 )) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                       <CheckCircle2 className="mb-2 text-emerald-400" />
                       <p className="text-sm">Todos os clientes estão ativos recentemente!</p>
                    </div>
                 )}
              </div>
           </div>
       </div>
    </div>
  );
};

export default PetSystemDashboard;