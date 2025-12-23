
import React, { useState } from 'react';
import { editContent } from '../services/geminiService';

interface TextEditorProps {
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  onResult: (result: string | null) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ onLoading, onError, onResult }) => {
  const [text, setText] = useState('');
  const [instruction, setInstruction] = useState('');

  const commonInstructions = [
    "Corregir gramática y ortografía",
    "Resumir de forma concisa",
    "Cambiar a un tono más profesional",
    "Traducir al Inglés",
    "Reescribir de forma creativa"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !instruction.trim()) return;

    onLoading(true);
    onError(null);
    onResult(null);

    try {
      const editedText = await editContent({ text, instruction });
      onResult(editedText);
    } catch (err: any) {
      onError(err.message || "Ocurrió un error al procesar el texto.");
    } finally {
      onLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setInstruction('');
    onError(null);
    onResult(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Tu texto original</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pega aquí el contenido que deseas mejorar..."
          className="w-full h-48 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">¿Qué deseas hacer?</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonInstructions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setInstruction(item)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                instruction === item 
                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="O escribe tu propia instrucción personalizada..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="flex-grow bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-slate-300 transition-all flex items-center justify-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Procesar Texto Inteligente
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
