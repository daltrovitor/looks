import React, { useState, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight, BookOpen, CheckCircle, FileText, Share2, Sparkles, Menu, Crown } from 'lucide-react';
import { generateModulePDF } from '../utils/pdfGenerator';

export default function EbookReaderModal({ moduleData, isOpen, onClose, onUpdateProgress, progressState }) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Restore saved chapter index for this specific ebook, matching percentage, chapterNum, or lastChapterIndex
  useEffect(() => {
    if (isOpen && moduleData) {
      const saved = progressState?.[moduleData.id];
      const totalChaps = moduleData.chapters?.length || 1;

      if (saved !== undefined && saved !== null) {
        if (typeof saved.lastChapterIndex === 'number' && saved.lastChapterIndex >= 0) {
          setActiveChapterIndex(Math.min(saved.lastChapterIndex, totalChaps - 1));
        } else if (typeof saved.chapterNum === 'number' && saved.chapterNum > 0) {
          setActiveChapterIndex(Math.min(saved.chapterNum - 1, totalChaps - 1));
        } else if (typeof saved.progress === 'number' || typeof saved === 'number') {
          const rawPct = typeof saved === 'number' ? saved : saved.progress;
          if (rawPct > 0) {
            const calculatedChapter = Math.min(
              totalChaps - 1,
              Math.max(0, Math.floor((rawPct / 100) * totalChaps))
            );
            setActiveChapterIndex(calculatedChapter);
          } else {
            setActiveChapterIndex(0);
          }
        } else {
          setActiveChapterIndex(0);
        }
      } else {
        setActiveChapterIndex(0);
      }
    }
  }, [isOpen, moduleData?.id]);

  if (!isOpen || !moduleData) return null;

  const currentChapter = moduleData.chapters[activeChapterIndex] || moduleData.chapters[0];
  const totalChapters = moduleData.chapters.length;
  const progressPercent = Math.round(((activeChapterIndex + 1) / totalChapters) * 100);

  const handleNextChapter = () => {
    if (activeChapterIndex < totalChapters - 1) {
      const nextIdx = activeChapterIndex + 1;
      setActiveChapterIndex(nextIdx);
      const nextProgress = Math.round(((nextIdx + 1) / totalChapters) * 100);
      onUpdateProgress(moduleData.id, nextProgress, nextIdx + 1);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      const prevIdx = activeChapterIndex - 1;
      setActiveChapterIndex(prevIdx);
      const prevProgress = Math.round(((prevIdx + 1) / totalChapters) * 100);
      onUpdateProgress(moduleData.id, prevProgress, prevIdx + 1);
    }
  };

  const handleSelectChapter = (idx) => {
    setActiveChapterIndex(idx);
    const newProgress = Math.round(((idx + 1) / totalChapters) * 100);
    onUpdateProgress(moduleData.id, newProgress, idx + 1);
  };

  const handleDownload = () => {
    generateModulePDF(moduleData);
  };

  // Helper to render markdown bold **text** in golden bold highlight
  const renderFormattedText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-amber-400">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070709] flex flex-col animate-fadeIn">
      
      {/* READER HEADER (LOOKSNOW OBSIDIAN & GOLD THEME) */}
      <header className="h-16 border-b border-white/10 bg-[#09090c]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-[#121216] border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Alternar Sumário"
          >
            <Menu className="w-4 h-4 text-amber-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#121216] border border-white/10 p-1 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="LooksNow" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-widest block">
                {moduleData.title}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white line-clamp-1 font-mono-tech">
                Capítulo {activeChapterIndex + 1}: {currentChapter.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#121216] border border-white/10">
            <span className="text-xs font-mono-tech text-zinc-400">Progresso</span>
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 transition-all duration-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-amber-400 font-mono-tech">{progressPercent}%</span>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar PDF Completo</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#121216] border border-white/10 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

      </header>

      {/* READER MAIN BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR TABLE OF CONTENTS */}
        <aside className={`w-72 sm:w-80 bg-[#09090c] border-r border-white/10 flex flex-col shrink-0 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full absolute z-20 h-full'
        }`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono-tech">
              <BookOpen className="w-4 h-4 text-amber-400" /> Índice do Ebook
            </h3>
            <span className="text-[10px] font-mono-tech text-zinc-400">{totalChapters} Capítulos</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
            {moduleData.chapters.map((chap, idx) => {
              const isActive = idx === activeChapterIndex;
              return (
                <button
                  key={chap.id}
                  onClick={() => handleSelectChapter(idx)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all flex items-start gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold shadow-md'
                      : 'hover:bg-[#121216] text-zinc-400 hover:text-zinc-200 border border-transparent'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono-tech shrink-0 ${
                    isActive ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="line-clamp-2 leading-relaxed flex-1">{chap.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* EBOOK CONTENT VIEWPORT */}
        <main className="flex-1 overflow-y-auto bg-[#070709] p-6 sm:p-12 lg:p-16 flex justify-center no-scrollbar">
          <article className="w-full max-w-3xl space-y-6">
            
            {/* Chapter Header Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#121216] via-[#121216] to-amber-950/20 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono-tech font-bold text-amber-400 uppercase tracking-widest">
                  PÁGINA {currentChapter.pageNumber} DE {moduleData.totalPages}
                </span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono-tech">
                  <FileText className="w-3 h-3 text-amber-400" /> LOOKSNOW OFFICIAL EBOOK
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono-tech">
                {currentChapter.title}
              </h1>
            </div>

            {/* CHAPTER IMAGE CARD */}
            {currentChapter.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">
                <img
                  src={currentChapter.imageUrl}
                  alt={currentChapter.title}
                  className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono-tech text-zinc-300">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#070709]/90 border border-amber-500/30 text-amber-300 font-bold">
                    Ilustração Prática • Cap. {activeChapterIndex + 1}
                  </span>
                  <span className="text-zinc-400">Guia de Execução Visual</span>
                </div>
              </div>
            )}

            {/* Markdown Chapter Body Rendering */}
            <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
              {currentChapter.content.split('\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('# ')) {
                  return null; // Skip main title duplicate
                }

                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-base font-bold text-amber-400 pt-4 pb-1 border-b border-white/10 flex items-center gap-2 font-mono-tech">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }

                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-lg font-bold text-white pt-6 pb-2 font-mono-tech">
                      {trimmed.replace('## ', '')}
                    </h2>
                  );
                }

                if (trimmed.startsWith('- ')) {
                  return (
                    <div key={index} className="flex items-start gap-2.5 pl-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></div>
                      <span>{renderFormattedText(trimmed.replace('- ', ''))}</span>
                    </div>
                  );
                }

                if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ')) {
                  return (
                    <div key={index} className="p-3.5 bg-[#121216] border border-white/10 rounded-xl my-2">
                      <span className="font-bold text-amber-400">{trimmed.split(' ')[0]}</span>
                      <span> {renderFormattedText(trimmed.substring(trimmed.indexOf(' ') + 1))}</span>
                    </div>
                  );
                }

                return (
                  <p key={index} className="text-zinc-300 leading-relaxed">
                    {renderFormattedText(trimmed)}
                  </p>
                );
              })}
            </div>

            {/* CHAPTER FOOTER NAVIGATION */}
            <div className="pt-8 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handlePrevChapter}
                disabled={activeChapterIndex === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121216] border border-white/10 hover:border-amber-500/30 text-zinc-300 disabled:opacity-30 text-xs font-bold transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Capítulo Anterior</span>
              </button>

              <button
                onClick={handleNextChapter}
                disabled={activeChapterIndex === totalChapters - 1}
                className="yellow-cta-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-950 text-xs font-extrabold shadow-lg disabled:opacity-30 transition-all cursor-pointer"
              >
                <span>Próximo Capítulo</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </article>
        </main>

      </div>

    </div>
  );
}
