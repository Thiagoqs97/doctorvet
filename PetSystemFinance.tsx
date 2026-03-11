import React, { useState } from 'react';
import { CalendarRange, DollarSign, ShoppingBag, CreditCard, CalendarDays, TrendingUp, Calendar, Scissors, Star } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { FinanceMetrics, ServiceFinance, ClientFinance } from './types';

interface FinanceViewProps {
  financeMetrics: FinanceMetrics;
}

const PetSystemFinance: React.FC<FinanceViewProps> = ({ financeMetrics }) => {
  const [dateFilter, setDateFilter] = useState('Este Ano');

  return (
    <div className="space-y-6 animate-fadeIn">
       {/* Date Filters */}
       <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex flex-wrap gap-2">
             {['Hoje', 'Esta Semana', 'Este Mês', 'Últimos 30 dias', 'Este Ano'].map(filter => (
                <button 
                   key={filter}
                   onClick={() => setDateFilter(filter)}
                   className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      dateFilter === filter 
                        ? 'bg-amber-400 text-slate-900 font-bold shadow-md shadow-amber-100' 
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                   }`}
                >
                   {filter}
                </button>
             ))}
          </div>
          <div className="flex items-center justify-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium w-full md:w-auto md:ml-auto">
             <CalendarRange size={16} />
             <span>Período Geral</span>
          </div>
       </div>

       {/* KPIs Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-slate-500 uppercase font-bold">Faturamento Total</p>
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><DollarSign size={20}/></div>
             </div>
             <h3 className="text-3xl font-bold text-slate-800 mb-1">R$ {financeMetrics.totalRevenue.toFixed(2)}</h3>
             <p className="text-xs text-slate-400 font-bold flex items-center">Acumulado Geral</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-slate-500 uppercase font-bold">Qtd. Serviços</p>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag size={20}/></div>
             </div>
             <h3 className="text-3xl font-bold text-slate-800 mb-1">{financeMetrics.totalServices}</h3>
             <p className="text-xs text-slate-400 font-bold flex items-center">Total realizado</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-slate-500 uppercase font-bold">Ticket Médio</p>
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CreditCard size={20}/></div>
             </div>
             <h3 className="text-3xl font-bold text-slate-800 mb-1">R$ {financeMetrics.averageTicket.toFixed(2)}</h3>
             <p className="text-xs text-slate-400 font-bold flex items-center">Por atendimento</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-slate-500 uppercase font-bold">Fat. Médio Diário</p>
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><CalendarDays size={20}/></div>
             </div>
             <h3 className="text-3xl font-bold text-slate-800 mb-1">R$ {financeMetrics.dailyAvg.toFixed(2)}</h3>
             <p className="text-xs text-slate-400 font-bold flex items-center">Estimado</p>
          </div>
       </div>

       {/* Charts Row 1: Monthly Evolution */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center"><TrendingUp size={20} className="mr-2 text-amber-500"/> Evolução do Faturamento Mensal</h4>
          <div className="h-72 w-full min-w-0">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financeMetrics.monthlyHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10}/>
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `R$${value}`}/>
                   <Tooltip 
                     contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                     formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                   />
                   <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* Charts Row 2: Distribution & Top Lists */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Daily Distribution */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-w-0">
               <h4 className="font-bold text-slate-800 mb-6 flex items-center"><Calendar size={20} className="mr-2 text-blue-500"/> Volume por Dia da Semana</h4>
               <div className="h-64 w-full min-w-0">
                 <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={financeMetrics.dailyDistribution}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10}/>
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                       <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}/>
                     </BarChart>
                 </ResponsiveContainer>
               </div>
           </div>

           {/* Top 10 Services List */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
               <h4 className="font-bold text-slate-800 mb-4 flex items-center"><Scissors size={20} className="mr-2 text-rose-500"/> Top Serviços (Faturamento)</h4>
               <div className="flex-1 overflow-y-auto pr-2 max-h-[250px]">
                   <div className="space-y-3">
                       {financeMetrics.topServicesFinance.length > 0 ? financeMetrics.topServicesFinance.map((service: ServiceFinance, index: number) => (
                         <div key={index} className="flex items-center justify-between text-sm">
                             <div className="flex items-center space-x-3 w-1/2">
                                 <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                     {index + 1}
                                 </span>
                                 <span className="font-medium text-slate-700 truncate" title={service.name}>{service.name}</span>
                             </div>
                             <div className="text-right w-1/4">
                                 <span className="block font-bold text-slate-800">{service.qtd}</span>
                                 <span className="text-[10px] text-slate-400">qtd</span>
                             </div>
                             <div className="text-right w-1/4">
                                 <span className="block font-bold text-emerald-600">R$ {service.total.toFixed(0)}</span>
                                 <span className="text-[10px] text-slate-400">total</span>
                             </div>
                         </div>
                       )) : (
                          <p className="text-sm text-slate-400 text-center py-4">Sem dados financeiros.</p>
                       )}
                   </div>
               </div>
           </div>
       </div>
       
       {/* Top 10 Clients Table */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h4 className="font-bold text-slate-800 mb-4 flex items-center"><Star size={20} className="mr-2 text-amber-500 fill-amber-500"/> Top Clientes (Faturamento)</h4>
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                   <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                       <tr>
                           <th className="px-4 py-3">Rank</th>
                           <th className="px-4 py-3">Cliente (Pet)</th>
                           <th className="px-4 py-3 text-center">Visitas</th>
                           <th className="px-4 py-3 text-right">Total Gasto</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                       {financeMetrics.topClientsFinance.length > 0 ? financeMetrics.topClientsFinance.map((client: ClientFinance, index: number) => (
                           <tr key={index} className="hover:bg-slate-50 transition-colors">
                               <td className="px-4 py-3 font-bold text-slate-400">#{index + 1}</td>
                               <td className="px-4 py-3 font-bold text-slate-700">{client.name}</td>
                               <td className="px-4 py-3 text-center">
                                   <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{client.visits}</span>
                               </td>
                               <td className="px-4 py-3 text-right font-bold text-emerald-600">R$ {client.total.toFixed(2)}</td>
                           </tr>
                       )) : (
                           <tr><td colSpan={4} className="p-4 text-center text-slate-400">Nenhum cliente com histórico financeiro.</td></tr>
                       )}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
};

export default PetSystemFinance;