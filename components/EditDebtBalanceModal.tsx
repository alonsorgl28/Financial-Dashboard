
import React, { useState, useEffect } from 'react';
import { Debt } from '../types';

interface EditDebtBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  onConfirm: (debtId: string, newBalance: number, reason: string) => void;
}

const EditDebtBalanceModal: React.FC<EditDebtBalanceModalProps> = ({ isOpen, onClose, debt, onConfirm }) => {
  const [newBalance, setNewBalance] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    if (debt) {
      setNewBalance(debt.currentBalance);
      setReason('');
    }
  }, [debt, isOpen]);

  if (!isOpen || !debt) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBalance < 0 || !reason.trim()) return;
    onConfirm(debt.id, newBalance, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Corregir Saldo</h2>
            <p className="text-sm text-slate-500">Ajuste administrativo para {debt.name}.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-500">Saldo Actual</span>
              <span className="font-bold text-slate-900">S/{debt.currentBalance.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Esta acción no generará una transacción de pago.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nuevo Saldo (S/.)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                required
                value={newBalance}
                onChange={(e) => setNewBalance(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Motivo del ajuste</label>
              <textarea 
                required
                rows={2}
                placeholder="Ejem: Corrección por conciliación / error inicial"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800 leading-relaxed">
            <p className="font-bold mb-1 uppercase tracking-wider">⚠️ Advertencia</p>
            Este ajuste modificará el saldo actual de la deuda. No se registrará como pago ni afectará transacciones pasadas.
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

export default EditDebtBalanceModal;
