
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  category: string;
  amount: number;
  date: string;
  type?: 'expense' | 'income'; // Optional as per current DB schema
}

interface CashFlowChartProps {
  transactions: Transaction[];
  monthlyIncome: number;
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions, monthlyIncome }) => {
  const [timeRange, setTimeRange] = useState<'6months' | '2026'>('2026');

  const chartData = useMemo(() => {
    // 1. Initialize empty months structure for 2026
    const monthlyData: Record<string, { name: string; income: number; expense: number; debt: number; monthIndex: number }> = {};

    // Initialize all months of 2026 to ensure continuity in the chart
    MONTH_NAMES.forEach((name, index) => {
      const key = `2026-${index}`; // Simple key
      monthlyData[key] = {
        name,
        monthIndex: index,
        income: 0,
        expense: 0,
        debt: 0
      };
    });

    console.log('--- Processing Transactions for CashFlow ---');

    // 2. Process Transactions STRICTLY
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11

      // STRICT FILTER: Ignore anything before 2026
      if (year < 2026) return;

      const key = `${year}-${month}`;

      // Initialize if year > 2026 (future usage)
      if (!monthlyData[key]) {
        monthlyData[key] = {
          name: MONTH_NAMES[month],
          monthIndex: month,
          income: 0,
          expense: 0,
          debt: 0
        };
      }

      // STRICT CATEGORIZATION RULES
      // "Pago de Deuda" -> debt_payment
      // "Ingreso" -> income
      // REST -> expense

      if (tx.category === 'Pago de Deuda') {
        monthlyData[key].debt += tx.amount;
      } else if (tx.category === 'Ingreso') {
        monthlyData[key].income += tx.amount;
      } else {
        // All other categories (Esencial, Variable, etc.) are expenses
        monthlyData[key].expense += tx.amount;
      }
    });

    console.log('--- Aggregated Data ---', monthlyData);

    // 3. Apply Default Income Logic & Sort
    let result = Object.values(monthlyData).sort((a, b) => a.monthIndex - b.monthIndex);

    // Hybrid Logic: If income is 0, use default monthlyIncome
    result = result.map(item => ({
      ...item,
      income: item.income === 0 ? monthlyIncome : item.income
    }));


    // 4. Filter based on selected range
    const currentMonthIndex = new Date().getMonth();

    if (timeRange === '6months') {
      // Show current month and previous 5 (but not before Jan 2026)
      const startMonth = Math.max(0, currentMonthIndex - 5);
      result = result.filter(d => d.monthIndex >= startMonth && d.monthIndex <= currentMonthIndex);
    } else {
      // Show all months up to current (or fully year if desired, user asked for "Año 2026")
      // To avoid empty massive chart, let's show up to current month + 1 as buffer or just the whole year if data exists
      // User requested "Año 2026", so usually that means Jan-Dec placeholders are fine,
      // but let's filter zero-activity months at the end to keep it clean?
      // No, standard is to show the timeline. Let's keep Jan->Current+1
      const maxVisibleMonth = currentMonthIndex + 1; // Show one month ahead for breathing room
      result = result.filter(d => d.monthIndex <= 11); // Ensure strict 2026 bound
    }

    return result;
  }, [transactions, timeRange]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Flujo de Caja</h3>
          <p className="text-sm text-slate-500">Relación ingresos vs gastos vs amortización</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="text-sm border-slate-200 rounded-lg bg-slate-50 px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="2026">Año 2026</option>
          <option value="6months">Últimos 6 meses</option>
        </select>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value, name) => [`S/ ${value}`, name]}
            />
            <Area type="monotone" dataKey="income" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="transparent" name="Gastos" />
            <Area type="monotone" dataKey="debt" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Pago Deuda" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowChart;
