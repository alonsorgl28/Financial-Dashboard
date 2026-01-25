
import React, { useState, useEffect } from 'react';

interface EditMonthlyIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIncome: number;
  onConfirm: (newIncome: number, reason: string) => void;
}

const EditMonthlyIncomeModal: React.FC<EditMonthlyIncomeModalProps> = ({ isOpen, onClose, currentIncome, onConfirm }) => {
  const [newIncome, setNewIncome] = useState<number>(currentIncome);
  const [reason, setReason] = useState<string>('');
  const currentMonthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date());

  useEffect(() => {
    if (isOpen) {
      setNewIncome(currentIncome);
      setReason('');
    }
  }, [isOpen, currentIncome]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIncome <= 0 || !reason.trim()) return;
    onConfirm(newIncome, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Editar Ingreso del Mes</h2>
            <p className="text-sm text-slate-500 capitalize">{currentMonthName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-500">Ingreso Actual</span>
              <span className="font-bold text-slate-900">S/{currentIncome.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nuevo Ingreso del Mes (S/.)</label>
              <input 
                type="number" 
                step="0.01"
                min="1"
                required
                autoFocus
                value={newIncome}
                onChange={(e) => setNewIncome(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Motivo del ajuste</label>
              <textarea 
                required
                rows={2}
                placeholder="Ejem: Sueldo variable / bono / ajuste manual"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
              />
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-xs text-indigo-800 leading-relaxed">
            <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">💡 Información</p>
            Este cambio actualizará el cálculo de margen y validaciones del mes. No se registrará como transacción en el historial.
          </div>

          <div className="flex space-x-3 pt-2">
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
              Confirmar Ajuste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMonthlyIncomeModal;
