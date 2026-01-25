
import React, { useState, useMemo, useEffect } from 'react';
import { Debt, DashboardStats } from '../types';

interface SimulateExtraPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: Debt[];
  stats: DashboardStats;
  onApply: (debt: Debt, amount: number) => void;
  initialDebtId?: string;
}

const SimulateExtraPaymentModal: React.FC<SimulateExtraPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  debts, 
  stats, 
  onApply,
  initialDebtId 
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [selectedDebtId, setSelectedDebtId] = useState<string>(initialDebtId || debts[0]?.id || '');

  // Reset selected debt when modal opens if an initialDebtId is provided
  useEffect(() => {
    if (isOpen) {
      setSelectedDebtId(initialDebtId || debts[0]?.id || '');
      setAmount(0);
    }
  }, [isOpen, initialDebtId, debts]);

  // Solo deudas P1 y P2 son simulables según el SOP
  const simulableDebts = useMemo(() => debts.filter(d => d.priority <= 2), [debts]);
  const selectedDebt = useMemo(() => simulableDebts.find(d => d.id === selectedDebtId), [simulableDebts, selectedDebtId]);

  const simulation = useMemo(() => {
    if (!selectedDebt || amount <= 0) return null;

    const currentBalance = selectedDebt.currentBalance;
    const newBalance = Math.max(0, currentBalance - amount);
    
    // Cálculo simple de meses ahorrados basado en el pago mínimo actual
    const currentMonths = Math.ceil(currentBalance / selectedDebt.monthlyMinimum);
    const newMonths = Math.ceil(newBalance / selectedDebt.monthlyMinimum);
    const monthsSaved = currentMonths - newMonths;

    const isDeficit = amount > stats.availableCash;
    const isRisky = amount > stats.availableCash * 0.7; // Alerta si usa más del 70% del cash

    let status: 'valid' | 'warning' | 'invalid' = 'valid';
    if (isDeficit) status = 'invalid';
    else if (isRisky) status = 'warning';

    return {
      newBalance,
      monthsSaved,
      percentagePaid: ((1 - (newBalance / selectedDebt.initialBalance)) * 100).toFixed(1),
      status,
      deficitValue: amount - stats.availableCash
    };
  }, [selectedDebt, amount, stats.availableCash]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Simular Pago Extra</h2>
            <p className="text-sm text-slate-500">Proyecta el impacto de una amortización acelerada.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Deuda Objetivo</label>
              <select 
                value={selectedDebtId}
                onChange={(e) => setSelectedDebtId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {simulableDebts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Monto a Simular (S/.)</label>
              <input 
                type="number" 
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-wider">Disponible actual: S/{stats.availableCash.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center">
            {simulation ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase">Nuevo Saldo</span>
                  <span className="text-xl font-black text-slate-900">S/{simulation.newBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase">Meses Ahorrados</span>
                  <span className="text-xl font-black text-emerald-600">-{simulation.monthsSaved} meses</span>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className={`flex items-center space-x-2 text-sm font-bold ${
                    simulation.status === 'valid' ? 'text-emerald-600' : 
                    simulation.status === 'warning' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {simulation.status === 'valid' && (
                      <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      <span>Pago viable sin déficit.</span></>
                    )}
                    {simulation.status === 'warning' && (
                      <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span>Riesgo: Margen mensual bajo.</span></>
                    )}
                    {simulation.status === 'invalid' && (
                      <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      <span>No permitido: Genera déficit.</span></>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2 py-4">
                <svg className="w-10 h-10 text-slate-200 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2-2v14a2 2 0 002 2z" /></svg>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Esperando valores</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
          >
            Cerrar Simulación
          </button>
          <button 
            disabled={!simulation || simulation.status === 'invalid'}
            onClick={() => selectedDebt && onApply(selectedDebt, amount)}
            className={`flex-1 px-6 py-3 font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${
              !simulation || simulation.status === 'invalid' 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
            }`}
          >
            Aplicar este pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulateExtraPaymentModal;
