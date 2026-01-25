
import React, { useState, useEffect } from 'react';
import { BtcContribution } from '../types';

interface AddBtcContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (contribution: Omit<BtcContribution, 'id'>) => void;
}

const AddBtcContributionModal: React.FC<AddBtcContributionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [formData, setFormData] = useState<Omit<BtcContribution, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    btcAmount: 0,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        btcAmount: 0,
        notes: ''
      });
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      setError('El monto en S/. debe ser mayor a 0.');
      return;
    }
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-slate-900">Registrar Aporte BTC</h2>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1">Monto (S/.)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">BTC Recibido (Opc.)</label>
              <input 
                type="number" 
                step="0.00000001"
                value={formData.btcAmount || ''}
                onChange={(e) => setFormData({...formData, btcAmount: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                placeholder="0.0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notas</label>
            <textarea 
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
              placeholder="Ejem: Aporte mensual / bono..."
            />
          </div>

          {error && (
            <p className="text-rose-600 text-[10px] font-bold uppercase tracking-tight">{error}</p>
          )}

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs text-emerald-800 leading-relaxed">
            <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">✅ Confirmación SOP</p>
            Al registrar este aporte, confirmas que has cumplido con los pagos mínimos de deudas y que no se genera déficit mensual.
          </div>

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
              Registrar Aporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBtcContributionModal;
