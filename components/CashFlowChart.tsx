
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const data = [
  { name: 'Jan', ingresos: 8000, gastos: 6000, deuda: 2000 },
  { name: 'Feb', ingresos: 8200, gastos: 5800, deuda: 2400 },
  { name: 'Mar', ingresos: 8000, gastos: 6500, deuda: 1500 },
  { name: 'Apr', ingresos: 9000, gastos: 6200, deuda: 2800 },
  { name: 'May', ingresos: 8500, gastos: 6000, deuda: 2500 },
  { name: 'Jun', ingresos: 8700, gastos: 5500, deuda: 3200 },
];

const CashFlowChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Flujo de Caja</h3>
          <p className="text-sm text-slate-500">Relación ingresos vs gastos vs amortización</p>
        </div>
        <select className="text-sm border-slate-200 rounded-lg bg-slate-50 px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Últimos 6 meses</option>
          <option>Año 2024</option>
        </select>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="ingresos" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
            <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} fill="transparent" />
            <Area type="monotone" dataKey="deuda" stroke="#10b981" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowChart;
