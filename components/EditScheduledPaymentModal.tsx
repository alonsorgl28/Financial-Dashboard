
import React, { useState, useEffect } from 'react';
import { ScheduledPayment, ScheduledPaymentType, ScheduledPaymentStatus } from '../types';

interface EditScheduledPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payment: Partial<ScheduledPayment>) => void;
  mode: 'create' | 'edit';
  initialData?: ScheduledPayment | null;
  concepts: string[];
  onRequestNewConcept: () => void;
}

const EditScheduledPaymentModal: React.FC<EditScheduledPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  mode, 
  initialData,
  concepts,
  onRequestNewConcept
}) => {
  const [formData, setFormData] = useState<Partial<ScheduledPayment>>({
    date: new Date('2026-04-01').toISOString().split('T')[0],
    concept: '',
    amount: 0,
    type: 'mínimo',
    status: 'pendiente',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          date: new Date('2026-04-01').toISOString().split('T')[0],
          concept: concepts[0] || '',
          amount: 0,
          type: 'mínimo',
          status: 'pendiente',
          notes: ''
        });
      }
      setError(null);
    }
  }, [isOpen, mode, initialData, concepts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.concept || formData.concept === '__new__') {
      setError('El concepto es obligatorio.');
      return;
    }
    if ((formData.amount || 0) <= 0) {
      setError('El monto debe ser mayor a 0.');
      return;
    }

    onConfirm(formData);
  };

  const handleConceptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      onRequestNewConcept();
    } else {
      setFormData({...formData, concept: val});
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'create' ? 'Agregar Pago Programado' : 'Editar Pago Programado'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Concepto</label>
              <select 
                value={formData.concept}
                onChange={handleConceptChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium appearance-none"
              >
                {concepts.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__new__" className="font-bold text-indigo-600">+ Nuevo concepto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Monto (S/.)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo</label>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'mínimo'})}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'mínimo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >Mínimo</button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'extra'})}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.type === 'extra' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >Extra</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
              <select 
                disabled={mode === 'create'}
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as ScheduledPaymentStatus})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notas (Opcional)</label>
            <textarea 
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
              placeholder="Recordatorio o detalles adicionales..."
            />
          </div>

          {error && (
            <p className="text-rose-600 text-[10px] font-bold uppercase tracking-tight">{error}</p>
          )}

          <div className="flex space-x-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              {mode === 'create' ? 'Agregar Pago' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduledPaymentModal;
