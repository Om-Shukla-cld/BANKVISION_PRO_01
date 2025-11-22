import React from 'react';
import { Landmark, RefreshCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  showReset: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/20">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
              Bank<span className="text-primary-600">Vision</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              AI Statement Analyzer
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {showReset && (
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-200 shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze New File</span>
            </button>
          )}
          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="hidden sm:inline">Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>
    </header>
  );
};