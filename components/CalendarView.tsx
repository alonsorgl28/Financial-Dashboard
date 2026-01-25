
import React, { useState, useMemo } from 'react';
import { ScheduledPayment, ScheduledPaymentStatus } from '../types';

interface CalendarViewProps {
  payments: ScheduledPayment[];
  onAddPayment: () => void;
  onEditPayment: (payment: ScheduledPayment) => void;
}

const DEFAULT_YEAR = 2026;

const CalendarView: React.FC<CalendarViewProps> = ({ payments, onAddPayment, onEditPayment }) => {
  const [currentDate, setCurrentDate] = useState(new Date(DEFAULT_YEAR, 3, 1)); // Default to April 2026
  const [selectedDate, setSelectedDate] = useState<string>(new Date(DEFAULT_YEAR, 3, 1).toISOString().split('T')[0]);
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Sorted payments by date
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [payments]);

  // Payments for selected date
  const selectedDatePayments = useMemo(() => {
    return payments.filter(p => p.date === selectedDate);
  }, [payments, selectedDate]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calendar generation logic
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const days = [];
    // Padding for empty start of month
    const startPadding = firstDayOfMonth.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i).toISOString().split('T')[0]);
    }
    return days;
  }, [currentMonth, currentYear]);

  const getStatusStyle = (status: ScheduledPaymentStatus) => {
    switch (status) {
      case 'pagado': return 'bg-emerald-100 text-emerald-700';
      case 'vencido': return 'bg-rose-100 text-rose-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(currentDate);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Pagos y Calendario</h2>
          <p className="text-slate-500 mt-1">Visualiza próximos pagos críticos y tu calendario financiero.</p>
        </div>
        <button 
          onClick={onAddPayment}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Agregar pago programado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximos Pagos Críticos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Próximos Pagos Críticos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Concepto</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedPayments.slice(0, 10).map((p) => {
                    const daysDiff = getDaysDiff(p.date);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{p.date}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{p.concept}</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">S/{p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-slate-200 text-slate-500">{p.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${getStatusStyle(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onEditPayment(p)}
                            className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"
                            aria-label="Editar pago programado"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Listado del día seleccionado */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Pagos del {selectedDate}</span>
            </h3>
            {selectedDatePayments.length > 0 ? (
              <div className="space-y-4">
                {selectedDatePayments.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 group">
                    <div>
                      <p className="font-bold">{p.concept}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">{p.type}</p>
                    </div>
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <p className="font-black text-indigo-400 text-lg">S/{p.amount.toLocaleString()}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-500">{p.status}</p>
                      </div>
                      <button 
                        onClick={() => onEditPayment(p)}
                        className="p-2 text-white/20 group-hover:text-white/60 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                <p className="text-slate-500 font-medium">No hay pagos programados para este día.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Calendario y SOP */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex justify-between items-center">
              <span className="capitalize">{monthName} {currentYear}</span>
              <div className="flex space-x-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(d => (
                <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i}></div>;
                const hasPayments = payments.some(p => p.date === day);
                const isSelected = selectedDate === day;
                const dateNum = new Date(day + 'T00:00:00').getDate();
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`h-9 rounded-lg text-xs font-semibold relative transition-all ${
                      isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {dateNum}
                    {hasPayments && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 tracking-tight">Ritual SOP: Cumplimiento</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Semanal (Dom/Lun)</p>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 group cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-indigo-500" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Revisar gasto fin de semana vs cap</span>
                  </label>
                  <label className="flex items-center space-x-3 group cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-indigo-500" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Definir extra a Scheu (P1)</span>
                  </label>
                  <label className="flex items-center space-x-3 group cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-indigo-500" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Confirmar no déficit semanal</span>
                  </label>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Mensual (Cierre)</p>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 group cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-indigo-500" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Medir progreso real P1 + P2</span>
                  </label>
                  <label className="flex items-center space-x-3 group cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-indigo-500" />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Evaluar habilitación BTC (HODL)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
