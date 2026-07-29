import React, { useState } from 'react';
import { Play, Sparkles, BookOpen, Flame, Shield, Trophy, CheckCircle, Search, Filter, Bot, Crown, ArrowRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import ModuleCard from '../components/ModuleCard';
import { modulesData } from '../data/modulesData';

export default function Dashboard({ user, progressState, onOpenReader, searchQuery, setSearchQuery, onOpenIaChat }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Estética Facial', 'Estrutura Óssea', 'Visagismo & Cabelo', 'Físico & Treino', 'Nutrição & Hormônios', 'Mindset & Disciplina', 'Estilo & Imagem', 'Conquista & Atração'];

  const filteredModules = modulesData.filter((mod) => {
    const matchesSearch = 
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'Todos' || mod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredModule = modulesData[0];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pb-20">
      
      {/* STREAMING HERO FEATURE BANNER */}
      <div className="relative w-full aspect-[21/9] min-h-[380px] max-h-[480px] overflow-hidden bg-black border-b border-white/5">
        <img 
          src={featuredModule.bannerUrl}
          alt=""
          className="w-full h-full object-cover opacity-35 scale-105"
        />
        <div className="absolute inset-0 bg-[#070709]/80"></div>

        {/* LOGO EMBLEM WATERMARK BACKGROUND */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-80 h-80 opacity-10 pointer-events-none hidden lg:block">
          <img src="/logo.png" alt="" className="w-full h-full object-contain" />
        </div>

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          <div className="max-w-2xl space-y-4 relative z-10">
            
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono-tech flex items-center gap-1 shadow-md">
                <Crown className="w-3 h-3 text-slate-950" /> DESTAQUE LOOKSNOW
              </span>
              <span className="text-xs font-mono-tech text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Módulo Mais Acessado
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-serif-title">
              {featuredModule.fullTitle}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed font-light">
              {featuredModule.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenReader(featuredModule)}
                className="yellow-cta-btn py-3 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Iniciar Leitura do Ebook</span>
              </motion.button>

              <button
                onClick={onOpenIaChat}
                className="btn-dark-secondary py-3 px-5 rounded-xl text-amber-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Avaliação Facial por Foto (IA)</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-mono-tech">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{featuredModule.totalPages} Páginas de Conteúdo</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* WELCOME BAR & MEMBER STATS */}
        <div className="p-6 rounded-2xl bg-[#0e0e12] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#070709] border border-white/10 p-1 flex items-center justify-center shadow-lg">
              <img src="/logo.png" alt="LooksNow Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Bem-vindo de volta, {user?.full_name || 'Membro VIP'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 font-mono-tech">VIP ELITE</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-light">Seu painel de streaming de ebooks LooksNow está sincronizado.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenIaChat}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span>IA Advisor Online</span>
            </button>
            <div className="w-px h-8 bg-zinc-800"></div>
            <div className="text-center font-mono-tech">
              <span className="text-xl font-bold text-amber-400">{modulesData.length}</span>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Ebooks Disponíveis</p>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'yellow-cta-btn shadow-md'
                  : 'bg-[#0e0e12] border border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* MODULES GRID */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Catálogo de Ebooks de Alta Performance</span>
            </h3>
            <span className="text-xs text-zinc-400 font-mono-tech">Exibindo {filteredModules.length} módulos</span>
          </div>

          {filteredModules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredModules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  moduleData={mod}
                  progress={progressState[mod.id]?.progress || 0}
                  onOpenReader={onOpenReader}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0e0e12] border border-white/5 rounded-2xl">
              <Search className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-300">Nenhum ebook encontrado para sua busca.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
                className="mt-3 text-xs text-amber-400 hover:underline font-mono-tech cursor-pointer"
              >
                Limpar filtros de pesquisa
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
