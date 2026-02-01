
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StatCard from './components/StatCard';
import CashFlowChart from './components/CashFlowChart';
import AddTransactionModal from './components/AddTransactionModal';
import SimulateExtraPaymentModal from './components/SimulateExtraPaymentModal';
import EditDebtBalanceModal from './components/EditDebtBalanceModal';
import EditMonthlyIncomeModal from './components/EditMonthlyIncomeModal';
import EditWeekendCapModal from './components/EditWeekendCapModal';
import CreateCategoryModal from './components/CreateCategoryModal';
import EditScheduledPaymentModal from './components/EditScheduledPaymentModal';
import CreatePaymentConceptModal from './components/CreatePaymentConceptModal';
import AddBtcContributionModal from './components/AddBtcContributionModal';
import BudgetView from './components/BudgetView';
import CalendarView from './components/CalendarView';
import InvestmentsView from './components/InvestmentsView';
import {
  getDashboardStats,
  getDebts,
  getTransactions,
  getBudgets,
  getCategories,
  addCategory,
  getScheduledPayments,
  addScheduledPayment,
  updateScheduledPayment,
  getPaymentConcepts,
  addPaymentConcept,
  getBtcContributions,
  addBtcContribution,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addDebt,
  updateDebt,
  deleteDebt,
  updateDashboardStats,
  updateBudget,
  addBudget,
  deleteScheduledPayment
} from './services/dataService';
import { Transaction, TransactionCategory, Debt, CategoryBudget, ScheduledPayment, BtcContribution, DashboardStats } from './types';
import { ICONS } from './constants';

interface SectionPlaceholderProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
  isLoading?: boolean;
}

const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({ title, subtitle, ctaLabel, onCta, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-96 bg-slate-100 rounded"></div>
        <div className="bg-slate-100 rounded-[2.5rem] h-64"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium max-w-xs mb-8">Aún no hay registros para esta sección.</p>
        <button
          onClick={onCta}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isEditBalanceModalOpen, setIsEditBalanceModalOpen] = useState(false);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [isEditWeekendCapModalOpen, setIsEditWeekendCapModalOpen] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isEditScheduledPaymentModalOpen, setIsEditScheduledPaymentModalOpen] = useState(false);
  const [isCreatePaymentConceptModalOpen, setIsCreatePaymentConceptModalOpen] = useState(false);
  const [isAddBtcContributionModalOpen, setIsAddBtcContributionModalOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [editingScheduledPayment, setEditingScheduledPayment] = useState<ScheduledPayment | null>(null);
  const [selectedDebtIdForSim, setSelectedDebtIdForSim] = useState<string | undefined>(undefined);

  // Initial states are now null/empty, populated by useEffect
  const [stats, setStats] = useState<DashboardStats>({
    availableCash: 0, totalDebt: 0, weekendSpent: 0, weekendCap: 0, savingsProgress: 0,
    monthlyIncome: 0, btcTargetMonthly: 0, btcTotalContributed: 0, btcAccumulated: 0
  });
  const [debts, setDebts] = useState<Debt[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [paymentConcepts, setPaymentConcepts] = useState<string[]>([]);
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [btcContributions, setBtcContributions] = useState<BtcContribution[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Data Effect
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [
          fetchedStats,
          fetchedDebts,
          fetchedTxs,
          fetchedBudgets,
          fetchedCats,
          fetchedConcepts,
          fetchedPayments,
          fetchedBtc
        ] = await Promise.all([
          getDashboardStats(),
          getDebts(),
          getTransactions(),
          getBudgets(),
          getCategories(),
          getPaymentConcepts(),
          getScheduledPayments(),
          getBtcContributions()
        ]);

        setStats(fetchedStats);
        setDebts(fetchedDebts);
        setTransactions(fetchedTxs);
        setBudgets(fetchedBudgets);
        setCategories(fetchedCats);
        setPaymentConcepts(fetchedConcepts);
        setScheduledPayments(fetchedPayments);
        setBtcContributions(fetchedBtc);
      } catch (error) {
        console.error("Error loading initial data", error);
        setToast({ message: 'Error cargando datos', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Recalculate total debt locally when debts change (for UI consistency)
  useEffect(() => {
    if (debts.length > 0) {
      const newTotalDebt = debts.reduce((acc, d) => acc + d.currentBalance, 0);
      setStats(prev => ({ ...prev, totalDebt: newTotalDebt }));
    }
  }, [debts]);

  // AUTOMATIC BALANCE CALCULATION logic
  // "Available Cash" = "Monthly Income" - "Sum of ALL transactions"
  // (Simplified to match user expectation: what you see in list subtracts from wallet)
  useEffect(() => {
    // Sum ALL transactions regardless of date
    const totalExpenses = transactions.reduce((sum, tx) => {
      // Exclude 'Income' type if it exists, otherwise assume all are expenses
      return sum + tx.amount;
    }, 0);

    // Calculate strictly derived balance
    const derivedAvailableCash = stats.monthlyIncome - totalExpenses;

    // Update state only if changed to avoid loops
    if (stats.availableCash !== derivedAvailableCash) {
      setStats(prev => ({
        ...prev,
        availableCash: derivedAvailableCash
      }));
    }
  }, [transactions, stats.monthlyIncome, stats.availableCash]);

  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleOpenSimulate = (debt?: Debt) => {
    if (debt && debt.priority <= 2) {
      setSelectedDebtIdForSim(debt.id);
    } else {
      const scheu = debts.find(d => d.priority === 1);
      setSelectedDebtIdForSim(scheu?.id);
    }
    setIsSimulateModalOpen(true);
  };

  const handleOpenEditBalance = (debt: Debt) => {
    setEditingDebt(debt);
    setIsEditBalanceModalOpen(true);
  };

  const handleConfirmIncomeAdjustment = async (newIncome: number, reason: string) => {
    const diff = newIncome - stats.monthlyIncome;
    const updatedStats = await updateDashboardStats({
      monthlyIncome: newIncome,
      availableCash: stats.availableCash + diff
    });

    if (updatedStats) {
      setStats(updatedStats);
      setToast({ message: 'Ingreso del mes actualizado correctamente', type: 'success' });
    } else {
      setToast({ message: 'Error al actualizar ingreso', type: 'error' });
    }
    setIsEditIncomeModalOpen(false);
  };

  const handleConfirmWeekendCapAdjustment = async (newCap: number, reason: string) => {
    const updatedStats = await updateDashboardStats({ weekendCap: newCap });

    if (updatedStats) {
      setStats(updatedStats);
      setToast({ message: 'Cap de fin de semana actualizado correctamente', type: 'success' });
    } else {
      setToast({ message: 'Error al actualizar cap', type: 'error' });
    }
    setIsEditWeekendCapModalOpen(false);
  };

  const handleApplySimulation = (debt: Debt, amount: number) => {
    setIsSimulateModalOpen(false);
    const preFilledTx: Partial<Transaction> = {
      description: `Pago Extra - ${debt.name}`,
      amount: amount,
      category: TransactionCategory.DEBT,
      date: new Date().toISOString().split('T')[0],
      isWeekend: false
    };
    setEditingTransaction(preFilledTx as Transaction);
    setIsModalOpen(true);
  };

  const handleConfirmBalanceAdjustment = async (debtId: string, newBalance: number, reason: string) => {
    const updated = await updateDebt(debtId, { currentBalance: newBalance });

    if (updated) {
      setDebts(prev => prev.map(d => d.id === debtId ? updated : d));
      setToast({ message: 'Saldo de la deuda actualizado correctamente', type: 'success' });
    } else {
      setToast({ message: 'Error al actualizar saldo', type: 'error' });
    }
    setIsEditBalanceModalOpen(false);
    setEditingDebt(null);
  };

  const handleConfirmNewCategory = async (name: string) => {
    const updated = await addCategory(name);
    setCategories(updated);
    setIsCreateCategoryModalOpen(false);
    setToast({ message: 'Categoría creada correctamente', type: 'success' });

    if (isModalOpen) {
      setEditingTransaction(prev => ({
        ...(prev || { id: '', date: '', description: '', amount: 0, isWeekend: false, status: 'categorized' }),
        category: name
      }));
    }
  };

  const handleSaveBudget = async (category: string, limit: number) => {
    const existing = budgets.find(b => b.category === category);
    if (existing) {
      const updated = await updateBudget(existing.id, { limit });
      if (updated) {
        setBudgets(prev => prev.map(b => b.id === updated.id ? updated : b));
        setToast({ message: 'Límite actualizado', type: 'success' });
      }
    } else {
      const created = await addBudget({ category, limit });
      if (created) {
        setBudgets(prev => [...prev, created]);
        setToast({ message: 'Presupuesto creado con éxito', type: 'success' });
      }
    }
  };

  const handleConfirmNewPaymentConcept = async (name: string) => {
    const updated = await addPaymentConcept(name);
    setPaymentConcepts(updated);
    setIsCreatePaymentConceptModalOpen(false);
    setToast({ message: 'Concepto creado correctamente', type: 'success' });

    if (isEditScheduledPaymentModalOpen) {
      setEditingScheduledPayment(prev => ({
        ...(prev || { id: '', date: '', concept: '', amount: 0, type: 'mínimo', status: 'pendiente' }),
        concept: name
      }));
    }
  };

  const handleOpenAddScheduledPayment = () => {
    setEditingScheduledPayment(null);
    setIsEditScheduledPaymentModalOpen(true);
  };

  const handleOpenEditScheduledPayment = (payment: ScheduledPayment) => {
    setEditingScheduledPayment(payment);
    setIsEditScheduledPaymentModalOpen(true);
  };

  const handleConfirmScheduledPayment = async (data: Partial<ScheduledPayment>) => {
    if (editingScheduledPayment) {
      const updated = await updateScheduledPayment(editingScheduledPayment.id, data);
      if (updated) {
        // Refresh list
        const latest = await getScheduledPayments();
        setScheduledPayments(latest);
        setToast({ message: 'Pago programado actualizado correctamente', type: 'success' });
      }
    } else {
      const created = await addScheduledPayment(data as Omit<ScheduledPayment, 'id'>);
      if (created) {
        // Refresh list cleanly
        const latest = await getScheduledPayments();
        setScheduledPayments(latest);
        setToast({ message: 'Pago programado creado correctamente', type: 'success' });
      }
    }
    setIsEditScheduledPaymentModalOpen(false);
    setEditingScheduledPayment(null);
  };

  const handleConfirmBtcContribution = async (contribution: Omit<BtcContribution, 'id'>) => {
    const created = await addBtcContribution(contribution);
    if (!created) return;

    setBtcContributions(prev => [created, ...prev]);

    setStats(prev => ({
      ...prev,
      btcTotalContributed: prev.btcTotalContributed + created.amount,
      btcAccumulated: prev.btcAccumulated + (created.btcAmount || 0),
      availableCash: prev.availableCash - created.amount
    }));

    // Register transaction automatically
    const btcTxData = {
      date: created.date,
      description: `Inversión BTC: ${created.notes || 'Aporte'}`,
      amount: created.amount,
      category: 'Inversión',
      isWeekend: false,
    };

    const newTx = await addTransaction(btcTxData);
    if (newTx) {
      setTransactions(prev => [newTx, ...prev]);
    }

    setIsAddBtcContributionModalOpen(false);
    setToast({ message: 'Aporte BTC registrado correctamente', type: 'success' });
  };

  const handleSaveTransaction = async (data: any) => {
    if (editingTransaction && editingTransaction.id) {
      // Handle Edit - Update in Supabase
      const updateData: Partial<Transaction> = {
        date: data.date || editingTransaction.date,
        description: data.description,
        amount: parseFloat(data.amount),
        category: data.category as string,
        isWeekend: !!data.isWeekend,
      };

      const updated = await updateTransaction(editingTransaction.id, updateData);

      if (updated) {
        setTransactions(prev => prev.map(tx => tx.id === updated.id ? updated : tx));
        setToast({ message: 'Transacción actualizada con éxito', type: 'success' });

        // Recalculate stats if needed
        const allTxs = await getTransactions();
        setTransactions(allTxs);
        const freshStats = await getDashboardStats();
        setStats(freshStats);
      } else {
        setToast({ message: 'Error al actualizar transacción', type: 'error' });
      }
    } else {
      const newTxData = {
        date: data.date || new Date().toISOString().split('T')[0],
        description: data.description,
        amount: parseFloat(data.amount),
        category: data.category as string,
        isWeekend: !!data.isWeekend,
      };

      const savedTx = await addTransaction(newTxData);

      if (savedTx) {
        setTransactions(prev => [savedTx, ...prev]);
        setToast({ message: 'Transacción registrada con éxito', type: 'success' });

        // Update stats
        setStats(prev => ({
          ...prev,
          availableCash: prev.availableCash - savedTx.amount,
          weekendSpent: savedTx.isWeekend ? prev.weekendSpent + savedTx.amount : prev.weekendSpent
        }));

        // Update Debts if applicable
        if (savedTx.category === TransactionCategory.DEBT) {
          setDebts(prevDebts => prevDebts.map(d => {
            if (savedTx.description.includes(d.name) || (d.priority === 1 && savedTx.description.toLowerCase().includes('scheu'))) {
              return { ...d, currentBalance: d.currentBalance - savedTx.amount };
            }
            return d;
          }));
        }
      }
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const renderDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Hola, Alonso 👋</h2>
            <p className="text-slate-500 mt-1">Aquí está tu resumen financiero al día de hoy.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Saldo Disponible"
            value={`S/${stats.availableCash.toLocaleString()}`}
            trend={{ value: '8%', isUp: true }}
            onAction={() => setIsEditIncomeModalOpen(true)}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            label="Deuda Total"
            value={`S/${stats.totalDebt.toLocaleString()}`}
            trend={{ value: '12%', isUp: false }}
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <StatCard
            label="Scheu Dental (P1)"
            value="36%"
            subValue="faltan 2 pagos más"
            icon={<div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">P1</div>}
          />
          <StatCard
            label="Interbank (P2)"
            value="62%"
            subValue="faltan 4 pagos más"
            icon={<div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">P2</div>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <CashFlowChart transactions={transactions} />
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Distribución de Gastos</h3>
                {/* Placeholder logic for pie chart can remain or be updated later */}
                <div className="flex items-center justify-center h-[300px] text-slate-400">
                  Próximamente: Gráfico de Dona
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Transacciones Recientes</h3>
                <button onClick={() => setActiveTab('transacciones')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Ver todo</button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3">Descripción</th>
                    <th className="px-6 py-3">Categoría</th>
                    <th className="px-6 py-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{tx.date}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tx.category === TransactionCategory.WEEKEND ? 'bg-amber-100 text-amber-700' :
                          tx.category === TransactionCategory.DEBT ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">S/{tx.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">Cap Fin de Semana</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stats.weekendSpent > stats.weekendCap ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  S/{stats.weekendCap} límite
                </span>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-black text-slate-900">S/{stats.weekendSpent}</span>
                <span className="text-sm text-slate-400 font-medium">gastado</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${stats.weekendSpent > stats.weekendCap ? 'bg-rose-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min((stats.weekendSpent / stats.weekendCap) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quedan <span className="font-bold text-slate-700">S/{Math.max(stats.weekendCap - stats.weekendSpent, 0)}</span> para el resto del mes. Mantén la disciplina.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6">Próximos Pagos Críticos</h3>
              <div className="space-y-4">
                {debts.slice(0, 2).map(debt => (
                  <div key={debt.id} className="group p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-slate-900">{debt.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-indigo-600 border border-indigo-100 uppercase tracking-tight">Vence en 4d</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-indigo-600">S/{debt.monthlyMinimum}</span>
                      <button onClick={() => setActiveTab('deudas')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-tighter transition-colors">Pagar Ahora →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-200 text-white relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.038-1.24 15.527.362 9.095 1.962 2.664 8.474-1.247 14.903.355c6.428 1.602 10.339 8.113 8.735 14.549zM18.106 9.87c.307-2.053-1.258-3.156-3.398-3.89l.695-2.787-1.696-.423-.676 2.713c-.446-.111-.904-.216-1.36-.319l.68-2.727-1.697-.423-.695 2.787c-.37-.084-.73-.167-1.077-.255l.001-.005-2.34-.584-.45 1.81s1.26.288 1.233.307c.687.172.812.628.791.99l-.793 3.18c.047.012.109.028.177.054l-.179-.044-1.11 4.453c-.084.208-.297.52-.776.4l-1.233-.307-.708 1.63 2.208.55c.41.103.813.209 1.21.31l-.704 2.825 1.696.423.696-2.79c.463.126.913.243 1.353.354l-.692 2.775 1.697.423.704-2.825c2.893.548 5.07.327 5.986-2.29.74-2.108-.036-3.324-1.562-4.116.66-.153 1.157-.59 1.442-1.485zm-2.585 5.405c-.524 2.105-4.07.967-5.22.68l.93-3.73c1.15.287 4.84.856 4.29 3.05zm.526-5.443c-.477 1.914-3.43.942-4.387.703l.844-3.385c.957.239 4.043.687 3.543 2.682z" /></svg>
                  </div>
                  <span className="font-bold text-sm tracking-tight">HODL Portal</span>
                </div>
                <h4 className="text-2xl font-black mb-1">S/10,500</h4>
                <p className="text-xs text-indigo-100 font-medium italic">Habilitado: Cumplimiento 100% Scheu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'deudas' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Estrategia de Deuda</h2>
              <p className="text-slate-500 mt-1">Método Avalancha: Scheu Dental es prioridad #1.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {debts.map((debt, idx) => {
              const isP1 = debt.priority === 1;
              const isP2 = debt.priority === 2;
              const isP3 = debt.priority === 3;
              const cardStyles = isP1
                ? 'bg-white border-indigo-500 ring-4 ring-indigo-50 shadow-sm'
                : isP2
                  ? 'bg-white border-emerald-500 ring-4 ring-emerald-50 shadow-sm'
                  : 'bg-slate-50 border-slate-200 border-dashed shadow-none';
              return (
                <div key={debt.id} className={`${cardStyles} rounded-3xl p-8 border relative overflow-hidden transition-all hover:translate-y-[-4px]`}>
                  <button
                    onClick={() => handleOpenEditBalance(debt)}
                    className="absolute top-4 left-4 p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                    aria-label="Editar saldo"
                  >
                    <ICONS.Edit className="w-4 h-4" />
                  </button>
                  {isP1 && <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Priority 1</div>}
                  {isP2 && <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Priority 2</div>}
                  {isP3 && <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Buffer</div>}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 mt-4">{debt.name}</h3>
                  <div className="space-y-6 mt-8">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Actual</span>
                      <p className="text-4xl font-black text-slate-900 mt-1">S/{debt.currentBalance.toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={`${isP1 ? 'bg-indigo-600' : isP2 ? 'bg-emerald-600' : 'bg-slate-400'} h-2 rounded-full transition-all duration-1000`} style={{ width: `${Math.max(0, Math.min(100, (1 - (debt.currentBalance / debt.initialBalance)) * 100))}%` }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Mínimo</span>
                        <p className="text-sm font-bold text-slate-700">S/{debt.monthlyMinimum}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vence el</span>
                        <p className="text-sm font-bold text-slate-700">{debt.dueDate}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenSimulate(debt)}
                      aria-label="Simular pago extra"
                      className={`w-full py-3 mt-2 rounded-xl font-bold text-sm transition-all border ${isP1 ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 hover:bg-indigo-700' :
                        isP2 ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100 hover:bg-emerald-700' :
                          'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}>
                      Simular pago extra
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {activeTab === 'transacciones' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {transactions.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Historial de Transacciones</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Controla cada movimiento con precisión.</p>
                </div>
                <div className="flex space-x-3">
                  <div className="flex space-x-2 mr-4 border-r pr-4 border-slate-200">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Filtrar</button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Exportar</button>
                  </div>
                  <button
                    onClick={handleOpenCreate}
                    aria-label="Registrar gasto"
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold flex items-center space-x-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Registrar gasto</span>
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Descripción</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-slate-500">{tx.date}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.description}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${tx.category === TransactionCategory.WEEKEND ? 'bg-amber-100 text-amber-700' :
                            tx.category === TransactionCategory.DEBT ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">S/{tx.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            aria-label="Editar transacción"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <ICONS.Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <SectionPlaceholder
              title="Historial de Transacciones"
              subtitle="Controla cada movimiento con precisión."
              ctaLabel="Registrar gasto"
              onCta={handleOpenCreate}
            />
          )}
        </div>
      )}

      {activeTab === 'presupuesto' && (
        <BudgetView
          stats={stats}
          budgets={budgets}
          debts={debts}
          categories={categories}
          transactions={transactions}
          onEditIncome={() => setIsEditIncomeModalOpen(true)}
          onEditWeekendCap={() => setIsEditWeekendCapModalOpen(true)}
          onSaveBudget={handleSaveBudget}
        />
      )}
      {activeTab === 'calendario' && (
        <CalendarView
          payments={scheduledPayments}
          onAddPayment={handleOpenAddScheduledPayment}
          onEditPayment={handleOpenEditScheduledPayment}
        />
      )}
      {activeTab === 'inversiones' && (
        <InvestmentsView
          stats={stats}
          contributions={btcContributions}
          payments={scheduledPayments}
          debts={debts}
          onAddContribution={() => setIsAddBtcContributionModalOpen(true)}
        />
      )}

      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-full ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        categories={categories}
        onRequestNewCategory={() => setIsCreateCategoryModalOpen(true)}
      />

      <SimulateExtraPaymentModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        debts={debts}
        stats={stats}
        onApply={handleApplySimulation}
        initialDebtId={selectedDebtIdForSim}
      />

      <EditDebtBalanceModal
        isOpen={isEditBalanceModalOpen}
        onClose={() => setIsEditBalanceModalOpen(false)}
        debt={editingDebt}
        onConfirm={handleConfirmBalanceAdjustment}
      />

      <EditMonthlyIncomeModal
        isOpen={isEditIncomeModalOpen}
        onClose={() => setIsEditIncomeModalOpen(false)}
        currentIncome={stats.monthlyIncome}
        onConfirm={handleConfirmIncomeAdjustment}
      />

      <EditWeekendCapModal
        isOpen={isEditWeekendCapModalOpen}
        onClose={() => setIsEditWeekendCapModalOpen(false)}
        currentCap={stats.weekendCap}
        onConfirm={handleConfirmWeekendCapAdjustment}
      />

      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onConfirm={handleConfirmNewCategory}
        existingCategories={categories}
      />

      <EditScheduledPaymentModal
        isOpen={isEditScheduledPaymentModalOpen}
        onClose={() => setIsEditScheduledPaymentModalOpen(false)}
        onConfirm={handleConfirmScheduledPayment}
        mode={editingScheduledPayment ? 'edit' : 'create'}
        initialData={editingScheduledPayment}
        concepts={paymentConcepts}
        onRequestNewConcept={() => setIsCreatePaymentConceptModalOpen(true)}
      />

      <CreatePaymentConceptModal
        isOpen={isCreatePaymentConceptModalOpen}
        onClose={() => setIsCreatePaymentConceptModalOpen(false)}
        onConfirm={handleConfirmNewPaymentConcept}
        existingConcepts={paymentConcepts}
      />

      <AddBtcContributionModal
        isOpen={isAddBtcContributionModalOpen}
        onClose={() => setIsAddBtcContributionModalOpen(false)}
        onConfirm={handleConfirmBtcContribution}
      />
    </Layout>
  );
};

export default App;
