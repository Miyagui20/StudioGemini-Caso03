
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Studio <span className="text-indigo-600">Gemini</span></h1>
          </div>
        </div>
      </header>
      
      <main className="flex-grow py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Gemini Multi-Flow Studio. Potenciado por Gemini 3 Preview.</p>
      </footer>
    </div>
  );
};
