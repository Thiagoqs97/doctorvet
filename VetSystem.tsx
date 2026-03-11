import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BedDouble, Stethoscope, Activity, 
  Syringe, Plus, Navigation 
} from 'lucide-react';
import { SidebarItem, StatCard } from './components';
import { initialInternments } from './mockData';

const VetSystem = ({ onLogout }: { onLogout: () => void }) => {
  const [view, setView] = useState('dashboard');
  
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white"><Stethoscope /></div>
          <div><h1 className="font-bold text-slate-800">Doctor Vet</h1><p className="text-xs text-brand-600 uppercase font-bold">Hospital 24h</p></div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} colorClass="bg-brand-600" />
          <SidebarItem icon={Users} label="Pacientes" active={view === 'patients'} onClick={() => setView('patients')} colorClass="bg-brand-600" />
          <SidebarItem icon={BedDouble} label="Internação" active={view === 'internment'} onClick={() => setView('internment')} colorClass="bg-brand-600" />
        </nav>
        <div className="p-4 border-t border-slate-100">
           <button onClick={onLogout} className="w-full flex items-center text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition"><Navigation size={18} className="mr-2 rotate-180"/> Trocar Módulo</button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8 flex justify-between">
           <h2 className="text-2xl font-bold text-slate-800 capitalize">{view === 'dashboard' ? 'Visão Geral Hospitalar' : view}</h2>
           <button className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold flex items-center hover:bg-brand-700"><Plus size={18} className="mr-2"/> Novo Plantão</button>
        </header>
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Internados" value="5/10" sub="50% Ocupação" icon={BedDouble} colorClass="text-brand-600" />
              <StatCard title="Cirurgias Hoje" value="3" sub="2 Confirmadas" icon={Activity} colorClass="text-blue-600" />
              <StatCard title="Emergências" value="12" sub="Últimas 24h" icon={Syringe} colorClass="text-rose-600" />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold mb-4 text-slate-700">Ocupação de Leitos</h3>
              <div className="grid grid-cols-4 gap-4">
                 {initialInternments.map((bed, i) => (
                   <div key={i} className={`p-4 rounded-xl border ${bed.status === 'Ocupado' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">{bed.bed}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${bed.status === 'Ocupado' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'}`}>{bed.status}</span>
                      </div>
                      <p className="text-sm font-medium">{bed.patient || 'Disponível'}</p>
                   </div>
                 ))}
                 <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                    + 8 Leitos
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VetSystem;