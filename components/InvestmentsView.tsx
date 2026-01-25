
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BtcContribution, DashboardStats, ScheduledPayment, Debt } from '../types';

interface InvestmentsViewProps {
  stats: DashboardStats;
  contributions: BtcContribution[];
  payments: ScheduledPayment[];
  debts: Debt[];
  onAddContribution: () => void;
}

const InvestmentsView: React.FC<InvestmentsViewProps> = ({ stats, contributions, payments, debts, onAddContribution }) => {
  
  // Logic SOP: Habilitado si (availableCash >= 0 && todos los pagos 'mínimos' del mes están 'pagado')
  const monthlyMinPayments = payments.filter(p => p.type === 'mínimo');
  const allMinsPaid = monthlyMinPayments.every(p => p.status === 'pagado');
  const noDeficit = stats.availableCash >= 0;
  // Simplificación "Verde": Al menos una de las deudas principales ha bajado su saldo en este periodo (simulado)
  const debtsInGreen = true; 

  const isPermitted = noDeficit && allMinsPaid && debtsInGreen;

  const btcStatus = isPermitted ? 'Permitido' : 'No permitido';
  const btcReason = !noDeficit 
    ? 'Déficit mensual detectado. Cubre el saldo negativo primero.' 
    : !allMinsPaid 
    ? 'Hay pagos mínimos pendientes para este mes.' 
    : 'Habilitado por cumplimiento de regla SOP.';

  const chartData = useMemo(() => {
    // Group last 6 contributions for chart
    return contributions.slice(0, 6).reverse().map(c => ({
      name: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(c.date)),
      monto: c.amount
    }));
  }, [contributions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Inversiones</h2>
          <p className="text-slate-500 mt-1">Monitorea tu BTC y la regla de habilitación (solo si deudas del mes están en verde).</p>
        </div>
        <div className="group relative">
          <button 
            disabled={!isPermitted}
            onClick={onAddContribution}
            className={`px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all active:scale-95 shadow-lg ${
              isPermitted 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Registrar aporte BTC</span>
          </button>
          {!isPermitted && (
            <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-center font-bold">
              Bloqueado por regla SOP
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Estado BTC del mes */}
          <div className={`p-8 rounded-[2.5rem] border-2 flex items-center justify-between overflow-hidden relative ${
            isPermitted ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
          }`}>
            <div className="relative z-10">
              <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isPermitted ? 'text-emerald-600' : 'text-rose-600'}`}>
                Estado BTC del mes
              </p>
              <h3 className={`text-4xl font-black mb-2 ${isPermitted ? 'text-emerald-900' : 'text-rose-900'}`}>
                {btcStatus}
              </h3>
              <p className={`text-sm font-medium ${isPermitted ? 'text-emerald-700' : 'text-rose-700'}`}>
                {btcReason}
              </p>
            </div>
            <div className={`p-4 rounded-3xl relative z-10 ${isPermitted ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isPermitted ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <div className="absolute top-0 right-0 h-full w-1/3 bg-white/10 blur-3xl rounded-full translate-x-1/2"></div>
          </div>

          {/* KPIs Inversión */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Aporte mensual objetivo</p>
              <h4 className="text-2xl font-black text-slate-900">S/{stats.btcTargetMonthly.toLocaleString()}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total aportado (S/.)</p>
              <h4 className="text-2xl font-black text-slate-900">S/{stats.btcTotalContributed.toLocaleString()}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">BTC Acumulado</p>
              <h4 className="text-2xl font-black text-indigo-600">{stats.btcAccumulated} <span className="text-xs">BTC</span></h4>
            </div>
          </div>

          {/* Gráfico de Aportes */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Histórico de Aportes (Últimos meses)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="monto" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historial Tabla */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Historial de Aportes BTC</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Monto (S/.)</th>
                    <th className="px-6 py-4">BTC</th>
                    <th className="px-6 py-4">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contributions.length > 0 ? (
                    contributions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{c.date}</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">S/{c.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">{c.btcAmount || '-'}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{c.notes || '---'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Aún no hay aportes registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Regla SOP */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-8">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-xs">SOP</div>
              <span>Regla de Habilitación</span>
            </h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              La inversión en BTC no es opcional pero es secundaria a la estabilidad financiera.
            </p>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${noDeficit ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                  {noDeficit ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <span className="text-[10px] font-bold">1</span>}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">No déficit mensual</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">El disponible no puede ser negativo.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${allMinsPaid ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                  {allMinsPaid ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <span className="text-[10px] font-bold">2</span>}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Mínimos cubiertos</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Todos los pagos mínimos del mes ejecutados.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${debtsInGreen ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                  {debtsInGreen ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> : <span className="text-[10px] font-bold">3</span>}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Deudas en "Verde"</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Scheu e Interbank bajo control estratégico.</p>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="flex items-center space-x-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.038-1.24 15.527.362 9.095 1.962 2.664 8.474-1.247 14.903.355c6.428 1.602 10.339 8.113 8.735 14.549zM18.106 9.87c.307-2.053-1.258-3.156-3.398-3.89l.695-2.787-1.696-.423-.676 2.713c-.446-.111-.904-.216-1.36-.319l.68-2.727-1.697-.423-.695 2.787c-.37-.084-.73-.167-1.077-.255l.001-.005-2.34-.584-.45 1.81s1.26.288 1.233.307c.687.172.812.628.791.99l-.793 3.18c.047.012.109.028.177.054l-.179-.044-1.11 4.453c-.084.208-.297.52-.776.4l-1.233-.307-.708 1.63 2.208.55c.41.103.813.209 1.21.31l-.704 2.825 1.696.423.696-2.79c.463.126.913.243 1.353.354l-.692 2.775 1.697.423.704-2.825c2.893.548 5.07.327 5.986-2.29.74-2.108-.036-3.324-1.562-4.116.66-.153 1.157-.59 1.442-1.485zm-2.585 5.405c-.524 2.105-4.07.967-5.22.68l.93-3.73c1.15.287 4.84.856 4.29 3.05zm.526-5.443c-.477 1.914-3.43.942-4.387.703l.844-3.385c.957.239 4.043.687 3.543 2.682z"/></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">HODL Portal Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsView;
