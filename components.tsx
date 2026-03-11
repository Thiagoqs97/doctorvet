import React from 'react';
import { X } from 'lucide-react';
import { SidebarItemProps, StatCardProps } from './types';

export const SidebarItem = ({ icon: Icon, label, active, onClick, colorClass = "bg-brand-600" }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 transition-all rounded-xl mb-2 group ${
      active 
        ? `${colorClass} text-white shadow-lg` 
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export const StatCard = ({ title, value, sub, icon: Icon, colorClass, trend }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      <div className="flex items-center mt-2 space-x-2">
        {trend && (
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
        <p className={`text-xs ${colorClass} opacity-80`}>{sub}</p>
      </div>
    </div>
    <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '50').replace('700', '50').replace('500', '50')}`}>
      <Icon className={colorClass} size={24} />
    </div>
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors p-1 rounded-full hover:bg-rose-50">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};