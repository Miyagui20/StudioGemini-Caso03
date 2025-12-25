
import React, { useState } from 'react';
import { performSearch } from '../services/geminiService';
import { SearchResult } from '../types';

interface SearchGroundingProps {
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  onResult: (result: SearchResult | null) => void;
}

export const SearchGrounding: React.FC<SearchGroundingProps> = ({ onLoading, onError, onResult }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    onLoading(true);
    onError(null);
    onResult(null);

    try {
      const data = await performSearch(query);
      onResult(data);
    } catch (err: any) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-[10px] md:text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Consulta en Tiempo Real</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué hay de nuevo hoy en tecnología?"
            className="w-full px-4 md:px-6 py-3.5 md:py-4 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm pr-11 md:pr-16 text-sm md:text-base text-slate-700 placeholder:text-slate-400"
            required
          />
          <div className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <p className="mt-2 text-[10px] md:text-xs text-slate-400 leading-tight">Usa Google Search para obtener datos verificados y actuales.</p>
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-xs md:text-base uppercase tracking-wider"
      >
        INVESTIGAR AHORA
      </button>
    </form>
  );
};
