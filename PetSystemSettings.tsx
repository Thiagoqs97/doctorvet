import React from 'react';
import { Database, Link, Lock, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { resetDatabase } from './services';

interface SettingsViewProps {
  dbUrl: string;
  setDbUrl: (url: string) => void;
  dbKey: string;
  setDbKey: (key: string) => void;
  isConnected: boolean;
  saveConfig: (url: string, key: string) => void;
  clearConfig: () => void;
}

const PetSystemSettings: React.FC<SettingsViewProps> = ({
  dbUrl,
  setDbUrl,
  dbKey,
  setDbKey,
  isConnected,
  saveConfig,
  clearConfig
}) => {
  
  const handleReset = async () => {
     const confirmText = prompt("Para confirmar, digite 'DELETAR TUDO'. Isso apagará Clientes, Pets e Agendamentos permanentemente.");
     if (confirmText === 'DELETAR TUDO') {
        const success = await resetDatabase();
        if (success) {
           alert("Banco de dados limpo com sucesso! Agora você pode importar a nova planilha.");
           window.location.reload();
        } else {
           alert("Houve um erro ao limpar. Verifique o console ou use o comando SQL sugerido.");
        }
     }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
             <Database className="mr-3 text-brand-600" />
             Conexão com Banco de Dados
          </h3>
          
          <div className="space-y-4">
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 mb-6">
                <p>Para conectar ao seu Supabase, insira as credenciais abaixo.</p>
                <p className="mt-2 font-bold text-slate-800">1. Rode o script `database.sql` no Supabase SQL Editor.</p>
                <p className="font-bold text-slate-800">2. Cole a URL e a Anon Key do seu projeto.</p>
             </div>

             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                   <Link size={16} className="mr-2 text-slate-400"/> Project URL
                </label>
                <input 
                   type="text" 
                   className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all font-mono text-sm"
                   value={dbUrl}
                   onChange={(e) => setDbUrl(e.target.value)}
                />
             </div>

             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                   <Lock size={16} className="mr-2 text-slate-400"/> Anon / Public Key
                </label>
                <input 
                   type="password" 
                   className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all font-mono text-sm"
                   value={dbKey}
                   onChange={(e) => setDbKey(e.target.value)}
                />
             </div>

             <div className="pt-4 flex items-center justify-between">
                 {isConnected ? (
                    <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg">
                       <CheckCircle2 size={18} className="mr-2"/> Conectado com Sucesso
                    </div>
                 ) : (
                    <div className="text-slate-400 text-sm italic">Não conectado (Usando Mock Data)</div>
                 )}

                 <div className="flex space-x-3">
                    {isConnected && (
                       <button 
                          onClick={clearConfig}
                          className="px-6 py-2.5 border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition"
                       >
                          Desconectar
                       </button>
                    )}
                    <button 
                       onClick={() => saveConfig(dbUrl, dbKey)}
                       className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition"
                    >
                       Salvar & Conectar
                    </button>
                 </div>
             </div>
          </div>
       </div>

       {/* DANGER ZONE */}
       {isConnected && (
          <div className="bg-rose-50 p-8 rounded-2xl shadow-sm border border-rose-100">
             <h3 className="text-lg font-bold text-rose-700 mb-2 flex items-center">
                <AlertTriangle className="mr-2" /> Zona de Perigo
             </h3>
             <p className="text-sm text-rose-600 mb-4">
                Ações aqui são irreversíveis. Tenha cuidado.
             </p>
             <button 
                onClick={handleReset}
                className="w-full py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition flex items-center justify-center shadow-sm"
             >
                <Trash2 size={18} className="mr-2"/> Limpar Banco de Dados (Reset Completo)
             </button>
          </div>
       )}
    </div>
  );
};

export default PetSystemSettings;