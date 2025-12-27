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
      <div key={index} className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-10 shadow-sm text-slate-700 mb-8 last:mb-0">
        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 md:mb-6 pb-2 border-b border-slate-50 leading-tight">
          {title}
        </h3>
        <div className="space-y-3 mb-6 md:mb-8">
          {content.map((line, i) => {
            if (line.trim().startsWith('-')) {
              return (
                <div key={i} className="flex gap-3 md:gap-4 items-start text-slate-600 leading-relaxed text-sm md:text-base">
                  <span className="text-indigo-500 font-bold mt-1">•</span>
                  <span>{line.trim().substring(1).trim()}</span>
                </div>
              );
            }
            return <p key={i} className="text-slate-600 leading-relaxed text-sm md:text-base">{line}</p>;
          })}
        </div>
        <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] md:text-xs font-medium text-slate-400 italic">
          <span className="font-bold text-slate-300">Fuente:</span> {source}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!state.result) return null;

    if (state.workflow === WorkflowType.IMAGE_GENERATION) {
      return (
        <div className="mt-8 md:mt-10 animate-in zoom-in-95 duration-500">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-4 md:border-8 border-white group relative max-w-2xl mx-auto">
            <img src={state.result as string} alt="IA Generated" className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a href={state.result as string} download="art.png" className="bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-full font-bold shadow-2xl text-sm md:text-base">Descargar</a>
            </div>
          </div>
        </div>
      );
    }

    if (state.workflow === WorkflowType.SEARCH_GROUNDING) {
      const searchRes = state.result as SearchResult;
      const blocks = searchRes.text.split('---').filter(b => b.trim().length > 0);
      
      return (
        <div className="mt-8 md:mt-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            {blocks.map((block, idx) => renderSearchItem(block, idx))}
          </div>

          {searchRes.sources.length > 0 && (
            <div className="mt-8 md:mt-12 bg-slate-50/50 rounded-2xl p-4 md:p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Referencias</h4>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Google Search</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                {searchRes.sources.map((src, i) => (
                  <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 md:p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition-all hover:shadow-md group">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px] md:text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{i+1}</div>
                    <span className="text-xs md:text-sm font-medium text-slate-600 truncate group-hover:text-indigo-700">{src.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mt-8 md:mt-10 bg-slate-900 text-slate-100 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl relative group overflow-hidden">
        <div className="relative z-10 whitespace-pre-wrap text-base md:text-lg italic leading-relaxed">{state.result as string}</div>
        <button 
          onClick={() => navigator.clipboard.writeText(state.result as string)} 
          className="mt-6 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Copiar resultado
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block px-3 py-1 mb-3 rounded-full bg-indigo-50 text-indigo-600 text-[9px] md:text-xs font-black uppercase tracking-widest animate-pulse">
            IA Generativa Avanzada
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 tracking-tight">Scri<span className="text-indigo-600">Pic</span></h2>
          
          <div className="grid grid-cols-3 gap-1 md:flex md:justify-center md:gap-4 mb-2 max-w-sm mx-auto md:max-w-none">
            {[
              { id: WorkflowType.IMAGE_GENERATION, label: 'Imagen', icon: '🎨' },
              { id: WorkflowType.TEXT_EDITING, label: 'Texto', icon: '✍️' },
              { id: WorkflowType.SEARCH_GROUNDING, label: 'Investigar', icon: '🌐' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleWorkflowChange(tab.id)}
                className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-1 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold transition-all border ${
                  state.workflow === tab.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg md:scale-105 z-10' 
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'
                }`}
              >
                <span className="text-base md:text-lg">{tab.icon}</span>
                <span className="text-[9px] md:text-sm tracking-tighter md:tracking-normal">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-12 shadow-2xl shadow-slate-200/50">
          {state.workflow === WorkflowType.IMAGE_GENERATION && <ImageGenerator onLoading={handleLoading} onError={handleError} onResult={handleResult} />}
          {state.workflow === WorkflowType.TEXT_EDITING && <TextEditor onLoading={handleLoading} onError={handleError} onResult={handleResult} />}
          {state.workflow === WorkflowType.SEARCH_GROUNDING && <SearchGrounding onLoading={handleLoading} onError={handleError} onResult={handleResult} />}

          {state.isLoading && (
            <div className="py-16 md:py-20 flex flex-col items-center">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] md:text-sm animate-pulse text-center px-4">Procesando datos...</p>
            </div>
          )}

          {state.error && (
            <div className="mt-6 md:mt-8 bg-rose-50 border-2 border-rose-100 p-4 md:p-6 rounded-xl md:rounded-2xl text-rose-700 flex items-center gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-sm">⚠️</div>
              <p className="font-bold text-xs md:text-base">{state.error}</p>
            </div>
          )}

          {renderResult()}
        </div>
      </div>
    </Layout>
  );
};

export default App;