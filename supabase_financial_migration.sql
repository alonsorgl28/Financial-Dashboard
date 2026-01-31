-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Dashboard Stats
create table if not exists dashboard_stats (
  id int primary key generated always as identity,
  available_cash numeric not null,
  total_debt numeric not null,
  weekend_spent numeric not null,
  weekend_cap numeric not null,
  savings_progress numeric not null,
  monthly_income numeric not null,
  btc_target_monthly numeric not null,
  btc_total_contributed numeric not null,
  btc_accumulated numeric not null,
  updated_at timestamptz default now()
);

-- 2. Debts
create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initial_balance numeric not null,
  current_balance numeric not null,
  monthly_minimum numeric not null,
  real_payment numeric not null,
  priority int not null,
  due_date text not null,
  created_at timestamptz default now()
);

-- 3. Transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  description text not null,
  amount numeric not null,
  category text not null,
  is_weekend boolean default false,
  status text check (status in ('categorized', 'pending')) default 'categorized',
  created_at timestamptz default now()
);

-- 4. Budgets
create table if not exists category_budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  "limit" numeric not null,
  spent numeric not null,
  created_at timestamptz default now()
);

-- 5. Scheduled Payments
create table if not exists scheduled_payments (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  concept text not null,
  amount numeric not null,
  type text check (type in ('mínimo', 'extra')) not null,
  status text check (status in ('pendiente', 'pagado', 'vencido')) default 'pendiente',
  notes text,
  created_at timestamptz default now()
);

-- 6. BTC Contributions
create table if not exists btc_contributions (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  amount numeric not null,
  btc_amount numeric,
  notes text,
  created_at timestamptz default now()
);

-- 7. Categories & Concepts (Dynamic Lists)
create table if not exists app_config (
  key text primary key,
  value text[] not null
);

-- SEED DATA

-- Stats
insert into dashboard_stats (available_cash, total_debt, weekend_spent, weekend_cap, savings_progress, monthly_income, btc_target_monthly, btc_total_contributed, btc_accumulated)
values (7450, 33500, 420, 600, 12, 12000, 800, 10500, 0.0452);

-- Debts
insert into debts (name, initial_balance, current_balance, monthly_minimum, real_payment, priority, due_date) values
('Scheu Dental (P1)', 15000, 9600, 1500, 1500, 1, '2026-04-29'),
('Interbank (P2)', 12000, 8400, 380, 380, 2, '2026-05-15'),
('Reactiva (P3)', 20000, 15500, 500, 500, 3, '2026-05-20');

-- Transactions
insert into transactions (date, description, amount, category, is_weekend, status) values
('2026-04-20', 'Tambo Weekend', 54, 'Fin de Semana', true, 'categorized'),
('2026-04-15', 'Interbank Mínimo', 380, 'Pago de Deuda', false, 'categorized'),
('2026-04-13', 'Uber Trip', 22, 'Variable', false, 'categorized'),
('2026-03-29', 'Scheu Dental Payment', 1500, 'Pago de Deuda', false, 'categorized'),
('2026-04-22', 'Mercado Semanal', 210, 'Esencial', false, 'categorized');

-- Budgets
insert into category_budgets (category, "limit", spent) values
('Alimentación', 1200, 980),
('Transporte', 400, 150),
('Servicios', 600, 580),
('Ocio', 300, 285),
('Otros', 500, 120);

-- Scheduled Payments
insert into scheduled_payments (date, concept, amount, type, status) values
('2026-04-29', 'Scheu Dental (P1)', 1500, 'mínimo', 'pendiente'),
('2026-05-15', 'Interbank (P2)', 380, 'mínimo', 'pendiente'),
('2026-05-20', 'Reactiva (P3)', 500, 'mínimo', 'pendiente'),
('2026-04-25', 'Extra Scheu (P1)', 500, 'extra', 'pendiente'),
('2026-04-10', 'Alquiler', 1200, 'mínimo', 'pagado');

-- BTC Contributions
insert into btc_contributions (date, amount, btc_amount, notes) values
('2026-03-01', 800, 0.0024, 'Aporte mensual Marzo'),
('2026-02-01', 800, 0.0026, 'Aporte mensual Febrero'),
('2026-01-01', 1200, 0.0041, 'Bono Enero');

-- App Config (Lists)
insert into app_config (key, value) values
('transaction_categories', ARRAY['Esencial', 'Variable', 'Fin de Semana', 'Pago de Deuda', 'Ingreso']),
('payment_concepts', ARRAY['Scheu Dental (P1)', 'Interbank (P2)', 'Reactiva (P3)', 'Alquiler', 'Servicios']);
