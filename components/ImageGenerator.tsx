
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageStyle } from '../types';

interface ImageGeneratorProps {
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  onResult: (result: string | null) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onLoading, onError, onResult }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ImageStyle>('ninguna');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onLoading(true);
    onError(null);
    onResult(null);

    try {
      const imageUrl = await generateImage({ prompt, style });
      onResult(imageUrl);
    } catch (err: any) {
      onError(err.message || "Error al generar la imagen.");
    } finally {
      onLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setStyle('ninguna');
    onError(null);
    onResult(null);
  };

  const styles: { label: string; value: ImageStyle }[] = [
    { label: 'Ninguno', value: 'ninguna' },
    { label: 'Anime', value: 'Anime' },
    { label: 'Studio Ghibli', value: 'Ghibli' },
    { label: 'Realista', value: 'Realista' },
    { label: 'Óleo', value: 'Oleo' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción de la imagen (Prompt)</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Un paisaje futurista con cascadas de luz..."
          className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Estilo de Imagen</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {styles.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle(s.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                style === s.value
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="flex-grow bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-slate-300 transition-all flex items-center justify-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Generar con IA Flash
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-8 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpiar
        </button>
      </div>
    </form>
  );
};
