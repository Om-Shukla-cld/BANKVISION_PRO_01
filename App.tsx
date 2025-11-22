import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { AnalysisResult } from './types';
import { analyzeStatement } from './services/geminiService';
import { DEMO_DATA } from './services/demoData';
import { Loader2, AlertCircle, CheckCircle2, PieChart } from 'lucide-react';

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeStatement(file);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleUseDemo = useCallback(() => {
    setIsAnalyzing(true);
    setError(null);
    // Simulate a short loading delay for better UX
    setTimeout(() => {
      setAnalysisResult(DEMO_DATA);
      setIsAnalyzing(false);
    }, 1500);
  }, []);

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary-100 selection:text-primary-900">
      <Header onReset={handleReset} showReset={!!analysisResult} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold">Analysis Failed</h3>
              <p className="text-sm mt-1 opacity-90">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-sm font-medium hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary-500 opacity-20 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                 <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Analyzing Your Finances</h2>
            <p className="mt-3 text-slate-500 text-center max-w-md leading-relaxed">
              Processing data, identifying categories, and generating insights...
            </p>
            
            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
              <div className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
            </div>
          </div>
        )}

        {/* Empty State / Upload */}
        {!isAnalyzing && !analysisResult && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                Analyze Your Finances <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                  In Seconds
                </span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
                Upload your bank statement to instantly unlock spending insights, categorized breakdowns, and visual trends powered by Google AI.
              </p>
            </div>
            
            <FileUpload onFileSelect={handleFileSelect} onUseDemo={handleUseDemo} />

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center px-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transform transition-transform hover:scale-110 duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">OCR Extraction</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Converts messy PDF & Image statements into clean, structured data automatically.
                </p>
              </div>
              <div className="text-center px-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transform transition-transform hover:scale-110 duration-300">
                  <PieChart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Smart Analytics</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Visualize daily spending trends and category breakdowns instantly.
                </p>
              </div>
              <div className="text-center px-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transform transition-transform hover:scale-110 duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Privacy First</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Your data is processed securely using enterprise-grade Gemini Flash models.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard State */}
        {!isAnalyzing && analysisResult && (
          <Dashboard data={analysisResult} />
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Powered by <span className="text-slate-600">Gemini 2.5 Flash</span> • BankVision AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;