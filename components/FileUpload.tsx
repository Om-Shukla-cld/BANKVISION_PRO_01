import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, ScanLine, Sparkles } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUseDemo?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onUseDemo }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={`relative group w-full h-80 rounded-3xl border-[3px] border-dashed transition-all duration-300 ease-out flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden
          ${dragActive 
            ? "border-primary-500 bg-primary-50/50 scale-[1.01] shadow-xl shadow-primary-500/10" 
            : "border-slate-200 bg-white hover:border-primary-400 hover:bg-slate-50/50 shadow-sm hover:shadow-md"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={false}
          onChange={handleChange}
          accept=".pdf,image/png,image/jpeg,image/webp"
        />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className={`relative z-10 w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragActive ? "bg-white text-primary-600 shadow-md" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-primary-600 group-hover:shadow-md"}`}>
          {dragActive ? <ScanLine className="w-10 h-10 animate-pulse" /> : <UploadCloud className="w-10 h-10" />}
        </div>

        <h3 className="relative z-10 text-xl font-bold text-slate-900 mb-2">
          {dragActive ? "Drop your statement here" : "Upload Bank Statement"}
        </h3>
        
        <p className="relative z-10 text-slate-500 mb-8 max-w-sm text-sm leading-relaxed">
          Drag & drop your PDF or image file here, or click to browse your files.
          <br/>We support <span className="font-medium text-slate-700">PDF, PNG, JPG</span>.
        </p>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onButtonClick(); }}
            className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20 shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5"
          >
            Choose File
          </button>
          
          {onUseDemo && (
            <button
              onClick={(e) => { e.stopPropagation(); onUseDemo(); }}
              className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              Try Demo
            </button>
          )}
        </div>

        <div className="absolute bottom-6 flex gap-6 text-xs font-medium text-slate-400/80 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> Secure Extraction</span>
          <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5"/> Auto-Categorization</span>
        </div>
      </div>
    </div>
  );
};