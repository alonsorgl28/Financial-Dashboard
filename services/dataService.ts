
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
