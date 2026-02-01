
import React, { useMemo, useState } from 'react';
import { CategoryBudget, DashboardStats, Debt, Transaction } from '../types';

interface BudgetViewProps {
  stats: DashboardStats;
  budgets: CategoryBudget[];
  debts: Debt[];
  categories: string[];
  transactions: Transaction[];
  onEditIncome: () => void;
  onEditWeekendCap: () => void;
  onSaveBudget: (category: string, limit: number) => void;
}

const BudgetView: React.FC<BudgetViewProps> = ({ stats, budgets, debts, categories, transactions, onEditIncome, onEditWeekendCap, onSaveBudget }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  // 1. Calculate REAL spent per category from transactions (Current Month)
  const categorySpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Map: Category -> Amount
    const spendingMap: Record<string, number> = {};

    transactions.forEach(tx => {
      const [y, m] = tx.date.split('-').map(Number);
      // 'm' is 1-indexed from string date, getMonth() is 0-indexed
      if (y === currentYear && (m - 1) === currentMonth) {
        spendingMap[tx.category] = (spendingMap[tx.category] || 0) + tx.amount;
      }
    });
    return spendingMap;
  }, [transactions]);

  // 2. Merge budgets with categories and INJECT calculated spending
  const finalBudgets = useMemo(() => {
    return categories.map(cat => {
      const existing = budgets.find(b => b.category === cat);
      const realSpent = categorySpending[cat] || 0;

      if (existing) {
        return { ...existing, spent: realSpent };
      }

      // Virtual budget for missing category
      return {
        id: `virtual-${cat}`,
        category: cat,
        limit: 0,
        spent: realSpent
      } as CategoryBudget;
    }).sort((a, b) => b.spent - a.spent);
  }, [categories, budgets, categorySpending]);

  const totalSpent = useMemo(() => finalBudgets.reduce((acc, b) => acc + b.spent, 0), [finalBudgets]);
  const totalLimit = useMemo(() => finalBudgets.reduce((acc, b) => acc + b.limit, 0), [finalBudgets]);

  const totalDebtPayments = useMemo(() => debts.reduce((acc, d) => acc + d.monthlyMinimum, 0), [debts]);

  // Margen mensual restante logic
  const monthlyMargin = stats.monthlyIncome - totalSpent - totalDebtPayments;
  const marginStatus = monthlyMargin > 1000 ? 'healthy' : monthlyMargin >= 0 ? 'tight' : 'deficit';

  const budgetUsagePercent = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;

  const weekendStatus = stats.weekendSpent > stats.weekendCap ? 'exceeded' : 'ok';

  // Update weekend spent based on transactions too for consistency? 
  // currently passing stats.weekendSpent which comes from App.tsx (which is dynamically calculated correctly now).

  const alerts = useMemo(() => {
    const list = [];
    if (stats.weekendCap > 0 && stats.weekendSpent / stats.weekendCap >= 0.9) {
      list.push(`Fin de semana al ${Math.round((stats.weekendSpent / stats.weekendCap) * 100)}% del cap`);
    }
    finalBudgets.forEach(b => {
      if (b.limit > 0) {
        const p = (b.spent / b.limit) * 100;
        if (p >= 80) {
          list.push(`${b.category} alcanzó el ${Math.round(p)}% del límite`);
        }
      }
    });
    if (marginStatus === 'tight') list.push('Margen mensual en zona amarilla');
    if (marginStatus === 'deficit') list.push('ALERTA: Déficit proyectado detectado');
    return list;
  }, [stats, weekendStatus, finalBudgets, marginStatus]);

  const startEditing = (b: CategoryBudget) => {
    setEditingCategory(b.category);
    setEditAmount(b.limit.toString());
  };

  const saveEdit = () => {
    if (editingCategory) {
      const amount = parseFloat(editAmount);
      if (!isNaN(amount)) {
        onSaveBudget(editingCategory, amount);
      }
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Presupuesto</h2>
          <p className="text-slate-500 mt-1">Define límites por categoría y controla desviaciones antes de que generen déficit.</p>
        </div>
      </div>

      {/* Resumen del mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Margen mensual restante</p>
          <div className="flex items-center justify-between">
            <h3 className={`text-2xl font-black ${marginStatus === 'healthy' ? 'text-emerald-600' :
              marginStatus === 'tight' ? 'text-amber-600' : 'text-rose-600'
              }`}>
              S/{monthlyMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${marginStatus === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
              marginStatus === 'tight' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
              {marginStatus === 'healthy' ? 'Saludable' : marginStatus === 'tight' ? 'Ajustado' : 'Déficit'}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-medium">Basado en ingreso: <span className="text-slate-600 font-bold">S/{stats.monthlyIncome.toLocaleString()}</span></p>
            <button
              onClick={onEditIncome}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-tight"
            >
              Editar ingreso
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">% de presupuesto usado</p>
          <div className="flex items-end justify-between mb-2">
            <h3 className="text-2xl font-black text-slate-900">{Math.round(budgetUsagePercent)}%</h3>
            <span className="text-xs text-slate-400 font-medium">S/{totalSpent.toLocaleString()} / S/{totalLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${budgetUsagePercent > 90 ? 'bg-rose-500' : budgetUsagePercent > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
              style={{ width: `${budgetUsagePercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estado de fin de semana</p>
          <div className="flex items-center justify-between h-full pb-4">
            <h3 className={`text-2xl font-black ${weekendStatus === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {weekendStatus === 'ok' ? 'Dentro del cap' : 'Excedido'}
            </h3>
            <div className={`p-2 rounded-xl ${weekendStatus === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {weekendStatus === 'ok' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla de Presupuesto */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Desglose por Categoría</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Límite Mensual</th>
                  <th className="px-6 py-4">Gastado</th>
                  <th className="px-6 py-4">%</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finalBudgets.map((b) => {
                  const percent = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
                  const status = percent >= 100 ? 'over' : percent >= 80 ? 'near' : 'ok';
                  const isEditing = editingCategory === b.category;
                  const isZeroLimit = b.limit === 0;

                  return (
                    <tr key={b.category} className={`hover:bg-slate-50/50 transition-colors group ${isZeroLimit ? 'bg-slate-50/30' : ''}`}>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {b.category}
                        {isZeroLimit && <span className="ml-2 text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">Sin límite</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">S/</span>
                            <input
                              type="number"
                              className="w-20 px-2 py-1 border border-indigo-500 rounded text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-100"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span onClick={() => startEditing(b)} className="cursor-pointer hover:text-indigo-600 hover:underline decoration-dashed decoration-slate-300 underline-offset-4">
                            S/{b.limit.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-bold">S/{b.spent.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${status === 'over' ? 'bg-rose-500' : status === 'near' ? 'bg-amber-500' : 'bg-indigo-600'}`}
                              style={{ width: `${Math.min(100, percent)}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{Math.round(percent)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${status === 'over' ? 'bg-rose-500 shadow-sm shadow-rose-200' :
                          status === 'near' ? 'bg-amber-500 shadow-sm shadow-amber-200' :
                            'bg-emerald-500 shadow-sm shadow-emerald-200'
                          }`}></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <button onClick={saveEdit} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors font-bold text-xs uppercase">
                            Guardar
                          </button>
                        ) : (
                          <button onClick={() => startEditing(b)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Control de fin de semana */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900">Fines de Semana</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onEditWeekendCap}
                  className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
                  aria-label="Editar cap de fin de semana"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <div className={`w-3 h-3 rounded-full ${weekendStatus === 'ok' ? 'bg-emerald-500' : 'bg-rose-500 shadow-lg shadow-rose-200'}`}></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-400 uppercase">Cap Mensual</span>
                <span className="text-sm font-black text-slate-900">S/{stats.weekendCap.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-400 uppercase">Usado</span>
                <span className={`text-sm font-black ${weekendStatus === 'ok' ? 'text-slate-900' : 'text-rose-600'}`}>S/{stats.weekendSpent.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${weekendStatus === 'ok' ? 'bg-indigo-600' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, (stats.weekendSpent / stats.weekendCap) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic leading-tight mt-2">
                "El gasto de fin de semana es la principal fuente de desvío mensual."
              </p>
            </div>
          </div>

          {/* Alertas */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Alertas Recientes</h3>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                    <span className="text-xs font-semibold text-slate-600 leading-tight">{alert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No hay alertas críticas en este momento.</p>
            )}
          </div>

          {/* Reglas del sistema (SOP) */}
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
            <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Reglas del Sistema (SOP)</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-rose-400 font-bold shrink-0">❌</span>
                <span className="text-xs font-bold text-slate-300">No déficit mensual bajo ninguna circunstancia.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-emerald-400 font-bold shrink-0">✅</span>
                <span className="text-xs font-bold text-slate-300">Deuda antes que inversión (BTC solo si plan de prioridad en verde).</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                <span className="text-xs font-bold text-slate-300">Fin de semana bajo control = mes sano y predecible.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetView;
