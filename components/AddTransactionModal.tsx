
import React, { useEffect, useState } from 'react';
import { Transaction, TransactionCategory } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: Transaction | null;
  categories: string[];
  onRequestNewCategory: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  categories,
  onRequestNewCategory
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: TransactionCategory.VARIABLE as string,
    isWeekend: false,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description,
        amount: initialData.amount.toString(),
        category: initialData.category,
        isWeekend: initialData.isWeekend,
        date: initialData.date
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        category: TransactionCategory.VARIABLE,
        isWeekend: false,
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const result = Object.fromEntries(data);
    onSave(result);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      onRequestNewCategory();
    } else {
      setFormData({...formData, category: val});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-6">
          {initialData ? 'Editar Transacción' : 'Registrar Transacción'}
        </h2>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <input 
              name="description" 
              required 
              minLength={3}
              placeholder="Ejem: Uber, Supermercado..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input 
              name="date" 
              type="date" 
              required 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto (S/.)</label>
              <input 
                name="amount" 
                type="number" 
                step="0.01" 
                min="0.01"
                required 
                placeholder="0.00" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select 
                name="category" 
                required
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none bg-white font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__new__" className="font-bold text-indigo-600">+ Nueva categoría</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 py-2">
            <input 
              name="isWeekend" 
              type="checkbox" 
              id="weekend" 
              checked={formData.isWeekend}
              onChange={(e) => setFormData({...formData, isWeekend: e.target.checked})}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
            />
            <label htmlFor="weekend" className="text-sm font-medium text-slate-600">Gasto de Fin de Semana</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
