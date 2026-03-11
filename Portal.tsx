import React from 'react';
import { 
  Plus, Stethoscope, ChevronRight as ChevronRightIcon, 
  Bone, Car 
} from 'lucide-react';

const Portal = ({ onSelectSystem }: { onSelectSystem: (sys: string) => void }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-200">
               <Plus size={40} strokeWidth={4} />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Grupo Doctor<span className="text-brand-600">Vet</span></h1>
          <p className="text-slate-500 text-lg">Selecione o módulo de gestão para acessar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Module 1: Vet */}
          <button onClick={() => onSelectSystem('vet')} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-brand-200 transition-all group text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-brand-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="relative z-10">
               <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                 <Stethoscope size={28} />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 mb-2">Doctor Vet</h3>
               <p className="text-slate-500 text-sm mb-6">Gestão hospitalar, internação e agenda clínica.</p>
               <span className="text-brand-600 font-bold text-sm flex items-center">Acessar Sistema <ChevronRightIcon size={16} className="ml-1"/></span>
             </div>
          </button>

          {/* Module 2: Pet */}
          <button onClick={() => onSelectSystem('pet')} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-rose-200 transition-all group text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-rose-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="relative z-10">
               <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                 <Bone size={28} />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 mb-2">Doctor Pet</h3>
               <p className="text-slate-500 text-sm mb-6">Boutique, banho e tosa, farmácia e acessórios.</p>
               <span className="text-rose-500 font-bold text-sm flex items-center">Acessar Loja <ChevronRightIcon size={16} className="ml-1"/></span>
             </div>
          </button>

          {/* Module 3: Home */}
          <button onClick={() => onSelectSystem('home')} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all group text-left relative overflow-hidden">
             <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="relative z-10">
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                 <Car size={28} />
               </div>
               <h3 className="text-2xl font-bold text-slate-800 mb-2">Doctor Home</h3>
               <p className="text-slate-500 text-sm mb-6">Atendimento domiciliar, gestão de frota e visitas.</p>
               <span className="text-indigo-600 font-bold text-sm flex items-center">Acessar Rotas <ChevronRightIcon size={16} className="ml-1"/></span>
             </div>
          </button>
        </div>
        
        <div className="mt-12 text-center text-slate-400 text-sm">
          © 2024 Grupo DoctorVet Systems. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Portal;