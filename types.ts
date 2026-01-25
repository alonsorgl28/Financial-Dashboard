
export enum TransactionCategory {
  ESSENTIAL = 'Esencial',
  VARIABLE = 'Variable',
  WEEKEND = 'Fin de Semana',
  DEBT = 'Pago de Deuda',
  INCOME = 'Ingreso'
}

export enum DebtPriority {
  P1 = 1,
  P2 = 2,
  P3 = 3
}

export type ScheduledPaymentStatus = 'pendiente' | 'pagado' | 'vencido';
export type ScheduledPaymentType = 'mínimo' | 'extra';

export interface ScheduledPayment {
  id: string;
  date: string;
  concept: string;
  amount: number;
  type: ScheduledPaymentType;
  status: ScheduledPaymentStatus;
  notes?: string;
}

export interface BtcContribution {
  id: string;
  date: string;
  amount: number; // in S/.
  btcAmount?: number; // accumulated BTC if available
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  isWeekend: boolean;
  status: 'categorized' | 'pending';
}

export interface Debt {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  monthlyMinimum: number;
  realPayment: number;
  priority: DebtPriority;
  dueDate: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface DashboardStats {
  availableCash: number;
  totalDebt: number;
  weekendSpent: number;
  weekendCap: number;
  savingsProgress: number;
  monthlyIncome: number;
  btcTargetMonthly: number;
  btcTotalContributed: number;
  btcAccumulated: number;
}
