
import React, { useState, useEffect } from 'react';

interface CreatePaymentConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  existingConcepts: string[];
}

const CreatePaymentConceptModal: React.FC<CreatePaymentConceptModalProps> = ({ isOpen, onClose, onConfirm, existingConcepts }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (existingConcepts.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('Este concepto ya existe.');
      return;
    }

    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-slate-900">Crear Nuevo Concepto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del concepto</label>
            <input 
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 transition-all ${
                error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'
              }`}
              placeholder="Ej: Suscripción Streaming, Seguro..."
            />
            {error && <p className="text-rose-600 text-[10px] mt-1 font-bold uppercase tracking-tight">{error}</p>}
          </div>

          <div className="flex space-x-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaymentConceptModal;
