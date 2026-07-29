import React, { useState } from 'react';
import { Play, Download, BookOpen, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { generateModulePDF } from '../utils/pdfGenerator';

export default function ModuleCard({ moduleData, progress = 0, onOpenReader }) {
  const [imageError, setImageError] = useState(false);

  const handleDownloadPDF = (e) => {
    e.stopPropagation();
    generateModulePDF(moduleData);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';

  return (
    <div 
      onClick={() => onOpenReader(moduleData)}
      className="group relative bg-[#0e0e12] border border-amber-500/20 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      
      {/* CARD BANNER IMAGE */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black flex items-center justify-center">
        {!imageError ? (
          <img 
            src={moduleData.bannerUrl} 
            alt=""
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <img 
            src={fallbackImage} 
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
          />
        )}

        {/* TOP BADGE */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">
            {moduleData.badge}
          </span>
          <span className="bg-[#050507]/90 text-zinc-300 text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 border border-zinc-700">
            <FileText className="w-3 h-3 text-amber-400" />
            <span>{moduleData.totalPages} Páginas</span>
          </span>
        </div>

        {/* PLAY HOVER OVERLAY */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
          <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* CARD CONTENT BODY */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1 font-mono">
            {moduleData.category}
          </span>
          <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
            {moduleData.title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed font-light">
            {moduleData.description}
          </p>
        </div>

        {/* PROGRESS BAR & ACTIONS */}
        <div className="pt-3 border-t border-zinc-800">
          
          {/* Reading Progress */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" /> {moduleData.readingTime}
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {progress > 0 ? `${progress}% lido` : 'Não iniciado'}
            </span>
          </div>

          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenReader(moduleData)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#141419] hover:bg-[#1f1f26] text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Ler Ebook</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              title="Baixar Ebook Completo em PDF"
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
