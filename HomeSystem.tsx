import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, MapPin, Car, DollarSign, 
  Navigation, Plus 
} from 'lucide-react';
import { SidebarItem, StatCard } from './components';
import { homeVisits } from './mockData';

const HomeSystem = ({ onLogout }: { onLogout: () => void }) => {
  const [view, setView] = useState('dashboard');

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><Car /></div>
          <div><h1 className="font-bold text-slate-800">Doctor Home</h1><p className="text-xs text-indigo-600 uppercase font-bold">Atendimento Móvel</p></div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} colorClass="bg-indigo-600" />
          <SidebarItem icon={MapPin} label="Roteiro / Rotas" active={view === 'routes'} onClick={() => setView('routes')} colorClass="bg-indigo-600" />
          <SidebarItem icon={Users} label="Pacientes" active={view === 'patients'} onClick={() => setView('patients')} colorClass="bg-indigo-600" />
        </nav>
        <div className="p-4 border-t border-slate-100">
           <button onClick={onLogout} className="w-full flex items-center text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"><Navigation size={18} className="mr-2 rotate-180"/> Trocar Módulo</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8 flex justify-between">
           <h2 className="text-2xl font-bold text-slate-800 capitalize">{view === 'dashboard' ? 'Gestão de Frotas & Visitas' : 'Roteiro do Dia'}</h2>
           <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-indigo-700"><Plus size={18} className="mr-2"/> Nova Visita</button>
        </header>

        {view === 'dashboard' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Visitas Hoje" value="8" sub="2 Pendentes" icon={MapPin} colorClass="text-indigo-600" />
                <StatCard title="Km Rodados" value="45km" sub="Frota 1" icon={Car} colorClass="text-slate-600" />
                <StatCard title="Faturamento Móvel" value="R$ 850" sub="Hoje" icon={DollarSign} colorClass="text-emerald-600" />
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Próximas Visitas</h3>
                <div className="space-y-4">
                  {homeVisits.map(visit => (
                    <div key={visit.id} className="flex items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                       <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs mr-4">
                         {visit.time}
                       </div>
                       <div className="flex-1">
                         <h4 className="font-bold text-slate-800">{visit.tutor} - {visit.pet}</h4>
                         <p className="text-sm text-slate-500 flex items-center"><MapPin size={14} className="mr-1"/> {visit.address}</p>
                       </div>
                       <div className="text-right">
                         <span className="block text-sm font-bold text-indigo-600">{visit.type}</span>
                         <span className="text-xs text-slate-400">{visit.status}</span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
           </div>
        )}

        {view === 'routes' && (
          <div className="bg-slate-200 rounded-2xl h-96 flex items-center justify-center text-slate-500 flex-col">
             <MapPin size={48} className="mb-4 text-slate-400"/>
             <p>Integração com Google Maps API</p>
             <p className="text-sm">Visualização de rota otimizada</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomeSystem;