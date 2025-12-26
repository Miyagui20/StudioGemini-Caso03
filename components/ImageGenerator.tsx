
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageStyle, AspectRatio } from '../types';

interface ImageGeneratorProps {
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  onResult: (result: string | null) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onLoading, onError, onResult }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ImageStyle>('ninguna');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onLoading(true);
    onError(null);
    onResult(null);
    try {
      const imageUrl = await generateImage({ prompt, style, aspectRatio });
      onResult(imageUrl);
    } catch (err: any) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setStyle('ninguna');
    setAspectRatio('1:1');
    onError(null);
    onResult(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-[10px] md:text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Descripción Visual</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Un astronauta explorando un bosque de cristales..."
          className="w-full h-24 md:h-32 px-4 py-3 md:px-5 md:py-4 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm text-slate-700 text-sm md:text-base"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-[10px] md:text-sm font-bold text-slate-700 mb-3 uppercase tracking-tight">Estilo Artístico</label>
          <div className="grid grid-cols-3 gap-1.5 md:flex md:flex-wrap md:gap-2">
            {['ninguna', 'Anime', 'Ghibli', 'Realista', 'Oleo'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s as ImageStyle)}
                className={`px-2 py-2 md:px-3 md:py-2 rounded-lg md:rounded-xl border-2 text-[9px] md:text-xs font-bold transition-all ${
                  style === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                }`}
              >
                {s === 'ninguna' ? 'Natural' : s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] md:text-sm font-bold text-slate-700 mb-3 uppercase tracking-tight">Formato (Ratio)</label>
          <div className="grid grid-cols-5 gap-1 md:flex md:flex-wrap md:gap-2">
            {['1:1', '16:9', '9:16', '4:3', '3:4'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setAspectRatio(r as AspectRatio)}
                className={`px-1 py-2 md:px-3 md:py-2 rounded-lg md:rounded-xl border-2 text-[9px] md:text-xs font-bold transition-all ${
                  aspectRatio === r ? 'bg-slate-800 border-slate-800 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 md:gap-3 pt-2">
        <button
          type="submit"
          className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 md:py-4 rounded-xl md:rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.98] text-xs md:text-base"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          GENERAR OBRA
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 md:px-6 bg-slate-100 text-slate-600 font-bold py-3.5 md:py-4 rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </form>
  );
};
