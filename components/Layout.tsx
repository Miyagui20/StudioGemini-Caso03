
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base md:text-lg">G</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">Studio <span className="text-indigo-600">Gemini</span></h1>
          </div>
        </div>
      </header>
      
      <main className="flex-grow py-6 md:py-12 px-3 md:px-4">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 md:py-6 text-center text-slate-400 text-[10px] md:text-sm">
        <p>&copy; {new Date().getFullYear()} ScriPic IA Studio. Potenciado por Gemini.</p>
      </footer>
    </div>
  );
};
