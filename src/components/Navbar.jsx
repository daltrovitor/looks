import React from 'react';
import { Crown, Tv, User, LogOut, Lock, Search, Sparkles, BookOpen, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onOpenCheckout, 
  onOpenIaChat,
  currentView, 
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 bg-[#070709]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* LOGO WITH LOGO.PNG & REFINED TYPOGRAPHY */}
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[#0e0e12] border border-white/10 p-1 group-hover:border-amber-500/40 transition-all duration-300 shadow-md">
            <img 
              src="/logo.png" 
              alt="LooksNow Crest" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1 leading-none">
              <span className="font-extrabold text-lg tracking-tight text-white">Looks</span>
              <span className="font-extrabold text-lg tracking-tight text-amber-400">Now</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-mono-tech tracking-wider uppercase mt-0.5">
              PLATAFORMA & IA ESTÉTICA
            </span>
          </div>
        </div>

        {/* SEARCH & IA QUICK BUTTON (IF IN DASHBOARD) */}
        {currentView === 'dashboard' && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6 gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por módulo, técnica ou assunto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0e0e12] border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-mono-tech px-1.5 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50">
                ⌘K
              </span>
            </div>
          </div>
        )}

        {/* NAVIGATION ACTIONS */}
        <div className="flex items-center gap-2.5">
          
          {/* IA LOOKSNOW ADVISOR BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenIaChat}
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-400 transition-all cursor-pointer"
            title="IA Suporte & Avaliação por Foto"
          >
            <Bot className="w-4 h-4 text-amber-400 stroke-[1.75]" />
            <span className="hidden sm:inline">IA Advisor</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </motion.button>

          {user ? (
            <>
              <button
                onClick={() => setCurrentView(currentView === 'dashboard' ? 'landing' : 'dashboard')}
                className="flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-[#0e0e12] text-zinc-300 transition-all cursor-pointer"
              >
                {currentView === 'dashboard' ? (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 stroke-[1.75]" />
                    <span className="hidden sm:inline">Página Inicial</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-3.5 h-3.5 text-amber-400 stroke-[1.75]" />
                    <span>Área de Membros</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800/80">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-zinc-200">{user.full_name || 'Membro VIP'}</span>
                  <span className="text-[9px] text-amber-400 font-mono-tech flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> VIP ELITE
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sair da Conta"
                  className="p-2 rounded-xl border border-white/5 bg-[#0e0e12] hover:bg-red-500/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-[#0e0e12] text-zinc-200 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-zinc-400 stroke-[1.75]" />
                <span>Entrar</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenCheckout}
                className="yellow-cta-btn flex items-center gap-2 text-xs font-extrabold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 stroke-[2]" />
                <span>Garantir vaga (R$ 17,90)</span>
              </motion.button>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
