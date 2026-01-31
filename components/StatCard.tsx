
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon?: React.ReactNode;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, trend, icon, onAction, actionIcon }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-center space-x-2">
          {onAction && (
            <button
              onClick={onAction}
              className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              aria-label={`Editar ${label}`}
            >
              {actionIcon || (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </button>
          )}
          {icon && <div className="text-indigo-600">{icon}</div>}
        </div>
      </div>
      <div className="flex flex-col">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subValue && <span className="text-xs text-slate-400 mt-1">{subValue}</span>}
        {trend && (
          <div className={`flex items-center mt-3 text-xs font-semibold ${trend.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            <svg className={`w-3 h-3 mr-1 ${!trend.isUp && 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {trend.value} que el mes pasado
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
