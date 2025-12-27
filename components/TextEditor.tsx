
import React, { useState } from 'react';
import { editContent } from '../services/geminiService';

interface TextEditorProps {
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  onResult: (result: string | null) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ onLoading, onError, onResult }) => {
  const [text, setText] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([]);

  const commonInstructions = [
    "Corregir gramática y ortografía",
    "Resumir de forma concisa",
    "Cambiar a un tono más profesional",
    "Traducir al Inglés",
    "Reescribir de forma creativa"
  ];

  const toggleInstruction = (item: string) => {
    setSelectedInstructions(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const combinedInstructions = [
      ...selectedInstructions,
      ...(customInstruction.trim() ? [customInstruction.trim()] : [])
    ].join(", ");

    if (!text.trim() || !combinedInstructions) {
      onError("Por favor, introduce un texto y al menos una instrucción.");
      return;
    }

    onLoading(true);
    onError(null);
    onResult(null);

    try {
      const editedText = await editContent({ text, instruction: combinedInstructions });
      onResult(editedText);
    } catch (err: any) {
      onError(err.message || "Ocurrió un error al procesar el texto.");
    } finally {
      onLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setCustomInstruction('');
    setSelectedInstructions([]);
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          ¿Qué deseas hacer? <span className="text-xs font-normal text-slate-400">(Selección múltiple permitida)</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonInstructions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleInstruction(item)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                selectedInstructions.includes(item) 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {selectedInstructions.includes(item) && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {item}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={customInstruction}
          onChange={(e) => setCustomInstruction(e.target.value)}
          placeholder="O añade otra instrucción personalizada aquí..."
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="flex-grow bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-slate-300 transition-all flex items-center justify-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
