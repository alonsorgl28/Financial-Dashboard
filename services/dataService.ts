
import { supabase } from '../src/lib/supabase';
import { Transaction, TransactionCategory, Debt, DashboardStats, CategoryBudget, ScheduledPayment, BtcContribution } from '../types';

// Helper to convert DB snake_case to camelCase if needed,
// but for now we will try to match the types or map them manually.

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching stats:', error);
    // Return fallback zero keys
    return {
      availableCash: 0,
      totalDebt: 0,
      weekendSpent: 0,
      weekendCap: 0,
      savingsProgress: 0,
      monthlyIncome: 0,
      btcTargetMonthly: 0,
      btcTotalContributed: 0,
      btcAccumulated: 0,
    };
  }

  return {
    availableCash: Number(data.available_cash),
    totalDebt: Number(data.total_debt),
    weekendSpent: Number(data.weekend_spent),
    weekendCap: Number(data.weekend_cap),
    savingsProgress: Number(data.savings_progress),
    monthlyIncome: Number(data.monthly_income),
    btcTargetMonthly: Number(data.btc_target_monthly),
    btcTotalContributed: Number(data.btc_total_contributed),
    btcAccumulated: Number(data.btc_accumulated),
  };
};

export const getDebts = async (): Promise<Debt[]> => {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .order('priority', { ascending: true });

  if (error) {
    console.error('Error fetching debts:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    initialBalance: Number(d.initial_balance),
    currentBalance: Number(d.current_balance),
    monthlyMinimum: Number(d.monthly_minimum),
    realPayment: Number(d.real_payment),
    priority: d.priority,
    dueDate: d.due_date,
  }));
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data.map((t: any) => ({
    id: t.id,
    date: t.date,
    description: t.description,
    amount: Number(t.amount),
    category: t.category,
    isWeekend: t.is_weekend,
    status: t.status,
  }));
};

export const getBudgets = async (): Promise<CategoryBudget[]> => {
  const { data, error } = await supabase
    .from('category_budgets')
    .select('*');

  if (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }

  return data.map((b: any) => ({
    id: b.id,
    category: b.category,
    limit: Number(b.limit),
    spent: Number(b.spent),
  }));
};

export const getScheduledPayments = async (): Promise<ScheduledPayment[]> => {
  const { data, error } = await supabase
    .from('scheduled_payments')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching scheduled payments:', error);
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    date: p.date,
    concept: p.concept,
    amount: Number(p.amount),
    type: p.type,
    status: p.status,
    notes: p.notes,
  }));
};

export const getBtcContributions = async (): Promise<BtcContribution[]> => {
  const { data, error } = await supabase
    .from('btc_contributions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching BTC contributions:', error);
    return [];
  }

  return data.map((c: any) => ({
    id: c.id,
    date: c.date,
    amount: Number(c.amount),
    btcAmount: Number(c.btc_amount),
    notes: c.notes,
  }));
};

export const getCategories = async (): Promise<string[]> => {
  const { data } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'transaction_categories')
    .single();

  if (data) return data.value;
  // Fallback
  return Object.values(TransactionCategory);
};

export const getPaymentConcepts = async (): Promise<string[]> => {
  const { data } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'payment_concepts')
    .single();

  if (data) return data.value;
  return [];
};

// --- Mutations ---

export const addCategory = async (name: string): Promise<string[]> => {
  const current = await getCategories();
  const normalized = name.trim();
  if (!current.find(c => c.toLowerCase() === normalized.toLowerCase())) {
    const updated = [...current, normalized];
    await supabase.from('app_config').upsert({ key: 'transaction_categories', value: updated });
    return updated;
  }
  return current;
};

export const addPaymentConcept = async (name: string): Promise<string[]> => {
  const current = await getPaymentConcepts();
  const normalized = name.trim();
  if (!current.find(c => c.toLowerCase() === normalized.toLowerCase())) {
    const updated = [...current, normalized];
    await supabase.from('app_config').upsert({ key: 'payment_concepts', value: updated });
    return updated;
  }
  return current;
};

export const addScheduledPayment = async (payment: Omit<ScheduledPayment, 'id'>): Promise<ScheduledPayment | null> => {
  const { data, error } = await supabase
    .from('scheduled_payments')
    .insert([{
      date: payment.date,
      concept: payment.concept,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      notes: payment.notes
    }])
    .select()
    .single();

  if (error || !data) {
    console.error('Error adding scheduled payment:', error);
    return null;
  }
  return {
    id: data.id,
    date: data.date,
    concept: data.concept,
    amount: Number(data.amount),
    type: data.type,
    status: data.status,
    notes: data.notes
  };
};

export const updateScheduledPayment = async (id: string, patch: Partial<ScheduledPayment>): Promise<ScheduledPayment | null> => {
  // Map snake_case for DB
  const dbPatch: any = {};
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.date !== undefined) dbPatch.date = patch.date;
  if (patch.concept !== undefined) dbPatch.concept = patch.concept;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;

  const { data, error } = await supabase
    .from('scheduled_payments')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    date: data.date,
    concept: data.concept,
    amount: Number(data.amount),
    type: data.type,
    status: data.status,
    notes: data.notes
  };
};

export const addBtcContribution = async (contribution: Omit<BtcContribution, 'id'>): Promise<BtcContribution | null> => {
  const { data, error } = await supabase
    .from('btc_contributions')
    .insert([{
      date: contribution.date,
      amount: contribution.amount,
      btc_amount: contribution.btcAmount,
      notes: contribution.notes
    }])
    .select()
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    date: data.date,
    amount: Number(data.amount),
    btcAmount: Number(data.btc_amount),
    notes: data.notes
  };
};

// Add Transaction (missing in original service but used in App)
export const addTransaction = async (tx: Omit<Transaction, 'id' | 'status'>): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      category: tx.category,
      is_weekend: tx.isWeekend,
      status: 'categorized'
    }])
    .select()
    .single();

  if (error || !data) {
    console.error('Error adding transaction', error);
    return null;
  }
  return {
    id: data.id,
    date: data.date,
    description: data.description,
    amount: Number(data.amount),
    category: data.category,
    isWeekend: data.is_weekend,
    status: data.status
  };
};

// Update Transaction
export const updateTransaction = async (id: string, patch: Partial<Transaction>): Promise<Transaction | null> => {
  const dbPatch: any = {};
  if (patch.date !== undefined) dbPatch.date = patch.date;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.isWeekend !== undefined) dbPatch.is_weekend = patch.isWeekend;
  if (patch.status !== undefined) dbPatch.status = patch.status;

  const { data, error } = await supabase
    .from('transactions')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating transaction:', error);
    return null;
  }
  return {
    id: data.id,
    date: data.date,
    description: data.description,
    amount: Number(data.amount),
    category: data.category,
    isWeekend: data.is_weekend,
    status: data.status
  };
};

// Delete Transaction
export const deleteTransaction = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
  return true;
};

// Add Debt
export const addDebt = async (debt: Omit<Debt, 'id'>): Promise<Debt | null> => {
  const { data, error } = await supabase
    .from('debts')
    .insert([{
      name: debt.name,
      initial_balance: debt.initialBalance,
      current_balance: debt.currentBalance,
      monthly_minimum: debt.monthlyMinimum,
      real_payment: debt.realPayment,
      priority: debt.priority,
      due_date: debt.dueDate
    }])
    .select()
    .single();

  if (error || !data) {
    console.error('Error adding debt:', error);
    return null;
  }
  return {
    id: data.id,
    name: data.name,
    initialBalance: Number(data.initial_balance),
    currentBalance: Number(data.current_balance),
    monthlyMinimum: Number(data.monthly_minimum),
    realPayment: Number(data.real_payment),
    priority: data.priority,
    dueDate: data.due_date
  };
};

// Update Debt
export const updateDebt = async (id: string, patch: Partial<Debt>): Promise<Debt | null> => {
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.initialBalance !== undefined) dbPatch.initial_balance = patch.initialBalance;
  if (patch.currentBalance !== undefined) dbPatch.current_balance = patch.currentBalance;
  if (patch.monthlyMinimum !== undefined) dbPatch.monthly_minimum = patch.monthlyMinimum;
  if (patch.realPayment !== undefined) dbPatch.real_payment = patch.realPayment;
  if (patch.priority !== undefined) dbPatch.priority = patch.priority;
  if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate;

  const { data, error } = await supabase
    .from('debts')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating debt:', error);
    return null;
  }
  return {
    id: data.id,
    name: data.name,
    initialBalance: Number(data.initial_balance),
    currentBalance: Number(data.current_balance),
    monthlyMinimum: Number(data.monthly_minimum),
    realPayment: Number(data.real_payment),
    priority: data.priority,
    dueDate: data.due_date
  };
};

// Delete Debt
export const deleteDebt = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting debt:', error);
    return false;
  }
  return true;
};

// Update Dashboard Stats
export const updateDashboardStats = async (patch: Partial<DashboardStats>): Promise<DashboardStats | null> => {
  const dbPatch: any = {};
  if (patch.availableCash !== undefined) dbPatch.available_cash = patch.availableCash;
  if (patch.totalDebt !== undefined) dbPatch.total_debt = patch.totalDebt;
  if (patch.weekendSpent !== undefined) dbPatch.weekend_spent = patch.weekendSpent;
  if (patch.weekendCap !== undefined) dbPatch.weekend_cap = patch.weekendCap;
  if (patch.savingsProgress !== undefined) dbPatch.savings_progress = patch.savingsProgress;
  if (patch.monthlyIncome !== undefined) dbPatch.monthly_income = patch.monthlyIncome;
  if (patch.btcTargetMonthly !== undefined) dbPatch.btc_target_monthly = patch.btcTargetMonthly;
  if (patch.btcTotalContributed !== undefined) dbPatch.btc_total_contributed = patch.btcTotalContributed;
  if (patch.btcAccumulated !== undefined) dbPatch.btc_accumulated = patch.btcAccumulated;

  const { data, error } = await supabase
    .from('dashboard_stats')
    .update(dbPatch)
    .eq('id', 1) // Assuming single row with id=1
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating dashboard stats:', error);
    return null;
  }
  return {
    availableCash: Number(data.available_cash),
    totalDebt: Number(data.total_debt),
    weekendSpent: Number(data.weekend_spent),
    weekendCap: Number(data.weekend_cap),
    savingsProgress: Number(data.savings_progress),
    monthlyIncome: Number(data.monthly_income),
    btcTargetMonthly: Number(data.btc_target_monthly),
    btcTotalContributed: Number(data.btc_total_contributed),
    btcAccumulated: Number(data.btc_accumulated)
  };
};

// Update Budget
export const updateBudget = async (id: string, patch: Partial<CategoryBudget>): Promise<CategoryBudget | null> => {
  const dbPatch: any = {};
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.limit !== undefined) dbPatch.limit = patch.limit;
  if (patch.spent !== undefined) dbPatch.spent = patch.spent;

  const { data, error } = await supabase
    .from('category_budgets')
    .update(dbPatch)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating budget:', error);
    return null;
  }
  return {
    id: data.id,
    category: data.category,
    limit: Number(data.limit),
    spent: Number(data.spent)
  };
};

// Add Budget (for new categories)
export const addBudget = async (budget: Omit<CategoryBudget, 'id' | 'spent'>): Promise<CategoryBudget | null> => {
  const { data, error } = await supabase
    .from('category_budgets')
    .insert([{
      category: budget.category,
      limit: budget.limit,
      spent: 0
    }])
    .select()
    .single();

  if (error || !data) {
    console.error('Error adding budget:', error);
    return null;
  }
  return {
    id: data.id,
    category: data.category,
    limit: Number(data.limit),
    spent: Number(data.spent)
  };
};

// Delete Scheduled Payment
export const deleteScheduledPayment = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('scheduled_payments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting scheduled payment:', error);
    return false;
  }
  return true;
};
