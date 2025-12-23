
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ImageGenerator } from './components/ImageGenerator';
import { TextEditor } from './components/TextEditor';
import { WorkflowType, AppState } from './types';

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

  const handleLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading, error: null }));
  };

  const handleError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const handleResult = (result: string | null) => {
    setState(prev => ({ ...prev, result }));
  };

  return (
    <Layout>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          Crea y transforma con <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">IA Generativa</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Experimenta con los últimos modelos de la familia Gemini Flash de forma gratuita y creativa.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-12">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Modo de Generación</label>
          <div className="relative inline-block w-full md:w-64">
            <select
              value={state.workflow}
              onChange={(e) => handleWorkflowChange(e.target.value as WorkflowType)}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-800 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium shadow-sm"
            >
              <option value={WorkflowType.IMAGE_GENERATION}>Generar imagen</option>
              <option value={WorkflowType.TEXT_EDITING}>Edición de Texto</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {state.workflow === WorkflowType.IMAGE_GENERATION ? (
            <ImageGenerator 
              onLoading={handleLoading} 
              onError={handleError} 
              onResult={handleResult} 
            />
          ) : (
            <TextEditor 
              onLoading={handleLoading} 
              onError={handleError} 
              onResult={handleResult} 
            />
          )}

          {state.isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center py-12 animate-pulse">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-indigo-600 font-medium">Procesando tu solicitud...</p>
            </div>
          )}

          {state.error && (
            <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-red-700">
                <p className="font-bold">Aviso</p>
                <p>{state.error}</p>
              </div>
            </div>
          )}

          {state.result && (
            <div className="mt-10 animate-in zoom-in-95 duration-500">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                Resultado Final
              </h3>
              
              {state.workflow === WorkflowType.IMAGE_GENERATION ? (
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group relative max-w-2xl mx-auto">
                  <img 
                    src={state.result} 
                    alt="Resultado generado por IA" 
                    className="w-full h-auto object-cover bg-slate-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <a 
                      href={state.result} 
                      download="gemini-art.png"
                      className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-slate-100 transition-colors"
                    >
                      Guardar Imagen
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 whitespace-pre-wrap leading-relaxed text-slate-700 relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigator.clipboard.writeText(state.result || '')}
                      className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 shadow-sm"
                      title="Copiar al portapapeles"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                  {state.result}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Gemini Flash", desc: "Generación ultrarrápida optimizada para el uso diario.", icon: "⚡" },
          { title: "Estilos Predefinidos", desc: "Aplica filtros visuales artísticos con un solo clic.", icon: "🎨" },
          { title: "Sin Configuración", desc: "Acceso directo a las herramientas sin pasos adicionales.", icon: "🚀" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white/60 backdrop-blur-sm border border-slate-200 p-6 rounded-2xl">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h4 className="font-bold text-slate-800 mb-2">{item.title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default App;
