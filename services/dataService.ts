
import { Transaction, TransactionCategory, Debt, DebtPriority, DashboardStats, CategoryBudget, ScheduledPayment, BtcContribution } from '../types';

const MOCK_DEBTS: Debt[] = [
  {
    id: 'd1',
    name: 'Scheu Dental (P1)',
    initialBalance: 15000,
    currentBalance: 9600,
    monthlyMinimum: 1500,
    realPayment: 1500,
    priority: DebtPriority.P1,
    dueDate: '2026-04-29',
  },
  {
    id: 'd2',
    name: 'Interbank (P2)',
    initialBalance: 12000,
    currentBalance: 8400,
    monthlyMinimum: 380,
    realPayment: 380,
    priority: DebtPriority.P2,
    dueDate: '2026-05-15',
  },
  {
    id: 'd3',
    name: 'Reactiva (P3)',
    initialBalance: 20000,
    currentBalance: 15500,
    monthlyMinimum: 500,
    realPayment: 500,
    priority: DebtPriority.P3,
    dueDate: '2026-05-20',
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-04-20', description: 'Tambo Weekend', amount: 54, category: TransactionCategory.WEEKEND, isWeekend: true, status: 'categorized' },
  { id: 't2', date: '2026-04-15', description: 'Interbank Mínimo', amount: 380, category: TransactionCategory.DEBT, isWeekend: false, status: 'categorized' },
  { id: 't3', date: '2026-04-13', description: 'Uber Trip', amount: 22, category: TransactionCategory.VARIABLE, isWeekend: false, status: 'categorized' },
  { id: 't4', date: '2026-03-29', description: 'Scheu Dental Payment', amount: 1500, category: TransactionCategory.DEBT, isWeekend: false, status: 'categorized' },
  { id: 't5', date: '2026-04-22', description: 'Mercado Semanal', amount: 210, category: TransactionCategory.ESSENTIAL, isWeekend: false, status: 'categorized' },
];

const MOCK_BUDGETS: CategoryBudget[] = [
  { id: 'b1', category: 'Alimentación', limit: 1200, spent: 980 },
  { id: 'b2', category: 'Transporte', limit: 400, spent: 150 },
  { id: 'b3', category: 'Servicios', limit: 600, spent: 580 },
  { id: 'b4', category: 'Ocio', limit: 300, spent: 285 },
  { id: 'b5', category: 'Otros', limit: 500, spent: 120 },
];

const MOCK_SCHEDULED_PAYMENTS: ScheduledPayment[] = [
  { id: 'p1', date: '2026-04-29', concept: 'Scheu Dental (P1)', amount: 1500, type: 'mínimo', status: 'pendiente' },
  { id: 'p2', date: '2026-05-15', concept: 'Interbank (P2)', amount: 380, type: 'mínimo', status: 'pendiente' },
  { id: 'p3', date: '2026-05-20', concept: 'Reactiva (P3)', amount: 500, type: 'mínimo', status: 'pendiente' },
  { id: 'p4', date: '2026-04-25', concept: 'Extra Scheu (P1)', amount: 500, type: 'extra', status: 'pendiente' },
  { id: 'p5', date: '2026-04-10', concept: 'Alquiler', amount: 1200, type: 'mínimo', status: 'pagado' },
];

const MOCK_BTC_CONTRIBUTIONS: BtcContribution[] = [
  { id: 'btc1', date: '2026-03-01', amount: 800, btcAmount: 0.0024, notes: 'Aporte mensual Marzo' },
  { id: 'btc2', date: '2026-02-01', amount: 800, btcAmount: 0.0026, notes: 'Aporte mensual Febrero' },
  { id: 'btc3', date: '2026-01-01', amount: 1200, btcAmount: 0.0041, notes: 'Bono Enero' },
];

let dynamicCategories: string[] = Object.values(TransactionCategory);
let dynamicPaymentConcepts: string[] = ['Scheu Dental (P1)', 'Interbank (P2)', 'Reactiva (P3)', 'Alquiler', 'Servicios'];
let currentScheduledPayments = [...MOCK_SCHEDULED_PAYMENTS];
let currentBtcContributions = [...MOCK_BTC_CONTRIBUTIONS];

export const getDashboardStats = (): DashboardStats => ({
  availableCash: 7450,
  totalDebt: 33500,
  weekendSpent: 420,
  weekendCap: 600,
  savingsProgress: 12,
  monthlyIncome: 12000,
  btcTargetMonthly: 800,
  btcTotalContributed: 10500,
  btcAccumulated: 0.0452,
});

export const getDebts = (): Debt[] => MOCK_DEBTS;
export const getTransactions = (): Transaction[] => MOCK_TRANSACTIONS;
export const getBudgets = (): CategoryBudget[] => MOCK_BUDGETS;
export const getScheduledPayments = (): ScheduledPayment[] => currentScheduledPayments;
export const getBtcContributions = (): BtcContribution[] => currentBtcContributions;
export const getCategories = (): string[] => dynamicCategories;
export const getPaymentConcepts = (): string[] => dynamicPaymentConcepts;

export const addCategory = (name: string): string[] => {
  const normalized = name.trim();
  if (!dynamicCategories.find(c => c.toLowerCase() === normalized.toLowerCase())) {
    dynamicCategories = [...dynamicCategories, normalized];
  }
  return dynamicCategories;
};

export const addPaymentConcept = (name: string): string[] => {
  const normalized = name.trim();
  if (normalized.length >= 3 && !dynamicPaymentConcepts.find(c => c.toLowerCase() === normalized.toLowerCase())) {
    dynamicPaymentConcepts = [...dynamicPaymentConcepts, normalized];
  }
  return dynamicPaymentConcepts;
};

export const addScheduledPayment = (payment: Omit<ScheduledPayment, 'id'>): ScheduledPayment => {
  const newPayment = { ...payment, id: Math.random().toString(36).substr(2, 9) };
  currentScheduledPayments.push(newPayment);
  return newPayment;
};

export const updateScheduledPayment = (id: string, patch: Partial<ScheduledPayment>): ScheduledPayment | null => {
  const idx = currentScheduledPayments.findIndex(p => p.id === id);
  if (idx === -1) return null;
  currentScheduledPayments[idx] = { ...currentScheduledPayments[idx], ...patch };
  return currentScheduledPayments[idx];
};

export const deleteScheduledPayment = (id: string): boolean => {
  const initialLen = currentScheduledPayments.length;
  currentScheduledPayments = currentScheduledPayments.filter(p => p.id !== id);
  return currentScheduledPayments.length < initialLen;
};

export const addBtcContribution = (contribution: Omit<BtcContribution, 'id'>): BtcContribution => {
  const newContribution = { ...contribution, id: Math.random().toString(36).substr(2, 9) };
  currentBtcContributions = [newContribution, ...currentBtcContributions];
  return newContribution;
};
