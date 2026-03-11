import React, { useRef } from 'react';
import { Package, Search, Edit, Trash2, CheckCircle2, XCircle, Tag, Upload } from 'lucide-react';
import { Product } from './types';

interface ProductsViewProps {
  products: Product[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onImportCSV: (file: File) => void;
}

const PetSystemProducts: React.FC<ProductsViewProps> = ({
  products,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
  onImportCSV
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Bar & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center flex-1">
          <Search className="text-slate-400 ml-3 mr-3" size={20} />
          <input 
            type="text" 
            placeholder="Buscar produto por nome ou categoria..." 
            className="flex-1 outline-none text-slate-700 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Import Button */}
        <div>
          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept=".csv"
             onChange={handleFileChange}
          />
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="w-full sm:w-auto h-full px-4 py-2 sm:py-0 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition flex items-center justify-center shadow-sm"
             title="Importar CSV (Serviço, Unidade, Preço)"
          >
             <Upload size={18} className="mr-2 text-amber-600"/> Importar
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                 <tr>
                    <th className="px-6 py-4">Produto / Serviço</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4 text-center">Preço</th>
                    {/* Alterado de Estoque para Unidade */}
                    <th className="px-6 py-4 text-center">Unidade</th>
                    <th className="px-6 py-4 text-center">Disponível</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-700">
                          {product.name}
                       </td>
                       <td className="px-6 py-4">
                          <span className="flex items-center text-slate-500">
                             <Tag size={14} className="mr-2"/> {product.category}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-center font-bold text-emerald-600">
                          R$ {product.price.toFixed(2)}
                       </td>
                       <td className="px-6 py-4 text-center">
                          {product.category === 'Serviços' ? (
                             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">UN</span>
                          ) : (
                             <span className={`px-2 py-1 rounded font-bold text-xs ${product.stock < 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                                {product.stock} un
                             </span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-center">
                          {product.available ? (
                             <span className="text-emerald-500 flex justify-center"><CheckCircle2 size={18}/></span>
                          ) : (
                             <span className="text-rose-400 flex justify-center"><XCircle size={18}/></span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                             <button 
                                onClick={() => onEdit(product)}
                                className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-amber-100 hover:text-amber-600 transition"
                                title="Editar"
                             >
                                <Edit size={16}/>
                             </button>
                             <button 
                                onClick={() => {
                                   if(window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
                                      onDelete(product.id);
                                   }
                                }}
                                className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-rose-100 hover:text-rose-600 transition"
                                title="Excluir"
                             >
                                <Trash2 size={16}/>
                             </button>
                          </div>
                       </td>
                    </tr>
                 )) : (
                    <tr>
                       <td colSpan={6} className="text-center py-12 text-slate-400">
                          <Package size={48} className="mx-auto mb-4 opacity-30"/>
                          <p>Nenhum produto encontrado.</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default PetSystemProducts;