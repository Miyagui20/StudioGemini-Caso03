
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ImageGenerator } from './components/ImageGenerator';
import { TextEditor } from './components/TextEditor';
import { SearchGrounding } from './components/SearchGrounding';
import { WorkflowType, AppState, SearchResult } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    workflow: WorkflowType.IMAGE_GENERATION,
    isLoading: false,
    error: null,
    result: null
  });

  const handleWorkflowChange = (newWorkflow: WorkflowType) => {
    setState({
      workflow: newWorkflow,
      isLoading: false,
      error: null,
      result: null
    });
  };

  const handleLoading = (loading: boolean) => setState(prev => ({ ...prev, isLoading: loading, error: null }));
  const handleError = (error: string | null) => setState(prev => ({ ...prev, error }));
  const handleResult = (result: any) => setState(prev => ({ ...prev, result }));

  const renderSearchItem = (blockText: string, index: number) => {
    const lines = blockText.trim().split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) return null;

    const title = lines[0];
    const source = lines[lines.length - 1];
    const content = lines.slice(1, lines.length - 1);

    return (
      <div key={index} className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-10 shadow-sm text-slate-700 mb-8 last:mb-0">
        <h3 className="text-2xl font-black text-slate-900 mb-6 pb-2 border-b border-slate-50 leading-tight">
          {title}
        </h3>
        <div className="space-y-3 mb-8">
          {content.map((line, i) => {
            if (line.trim().startsWith('-')) {
              return (
                <div key={i} className="flex gap-4 items-start text-slate-600 leading-relaxed">
                  <span className="text-indigo-500 font-bold mt-1">•</span>
                  <span>{line.trim().substring(1).trim()}</span>
                </div>
              );
            }
            return <p key={i} className="text-slate-600 leading-relaxed">{line}</p>;
          })}
        </div>
        <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-xs font-medium text-slate-400 italic">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.803a4 4 0 015.656 0l4 4a4 4 0 11-5.656 5.656l-1.1-1.1" /></svg>
          {source}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!state.result) return null;

    if (state.workflow === WorkflowType.IMAGE_GENERATION) {
      return (
        <div className="mt-10 animate-in zoom-in-95 duration-500">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white group relative max-w-2xl mx-auto">
            <img src={state.result as string} alt="IA Generated" className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a href={state.result as string} download="art.png" className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-2xl">Descargar</a>
            </div>
          </div>
        </div>
      );
    }

    if (state.workflow === WorkflowType.SEARCH_GROUNDING) {
      const searchRes = state.result as SearchResult;
      // Dividimos el texto en bloques usando el delimitador ---
      const blocks = searchRes.text.split('---').filter(b => b.trim().length > 0);
      
      return (
        <div className="mt-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            {blocks.map((block, idx) => renderSearchItem(block, idx))}
          </div>

          {searchRes.sources.length > 0 && (
            <div className="mt-12 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Referencias Directas</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Google Search</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchRes.sources.map((src, i) => (
                  <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition-all hover:shadow-md group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{i+1}</div>
                    <span className="text-sm font-medium text-slate-600 truncate group-hover:text-indigo-700">{src.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mt-10 bg-slate-900 text-slate-100 rounded-3xl p-8 shadow-2xl relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-30">
          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </div>
        <div className="relative z-10 whitespace-pre-wrap text-lg italic leading-relaxed">{state.result as string}</div>
        <button 
          onClick={() => navigator.clipboard.writeText(state.result as string)} 
          className="mt-6 text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Copiar resultado
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest animate-pulse">
            IA Generativa Avanzada
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Scri<span className="text-indigo-600">Pic</span></h2>
          <div className="flex flex-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: WorkflowType.IMAGE_GENERATION, label: 'Imagen', icon: '🎨' },
              { id: WorkflowType.TEXT_EDITING, label: 'Texto', icon: '✍️' },
              { id: WorkflowType.SEARCH_GROUNDING, label: 'Investigar', icon: '🌐' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleWorkflowChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shrink-0 border ${
                  state.workflow === tab.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' 
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50">
          {state.workflow === WorkflowType.IMAGE_GENERATION && <ImageGenerator onLoading={handleLoading} onError={handleError} onResult={handleResult} />}
          {state.workflow === WorkflowType.TEXT_EDITING && <TextEditor onLoading={handleLoading} onError={handleError} onResult={handleResult} />}
          {state.workflow === WorkflowType.SEARCH_GROUNDING && <SearchGrounding onLoading={handleLoading} onError={handleError} onResult={handleResult} />}

          {state.isLoading && (
            <div className="py-20 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-sm animate-pulse text-center">Analizando datos en tiempo real...</p>
            </div>
          )}

          {state.error && (
            <div className="mt-8 bg-rose-50 border-2 border-rose-100 p-6 rounded-2xl text-rose-700 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">⚠️</div>
              <p className="font-bold">{state.error}</p>
            </div>
          )}

          {renderResult()}
        </div>
      </div>
    </Layout>
  );
};

export default App;
