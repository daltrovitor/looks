import React, { useState, useEffect } from 'react';
import { Crown, Shield, Sparkles, Check, ArrowRight, Play, Lock, FileText, Zap, Star, ChevronDown, CheckCircle2, Bot, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { modulesData } from '../data/modulesData';

export default function LandingPage({ onOpenCheckout, onOpenAuth, onOpenIaChat }) {
  const [openFaq, setOpenFaq] = useState(null);

  // Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    mins: 42,
    secs: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const faqs = [
    {
      q: 'Qual o valor total do LooksNow e o que está incluso?',
      a: 'O acesso completo custa apenas R$ 17,90 em pagamento único (sem mensalidades). Inclui os 8 Ebooks Ilustrados em PDF, plataforma estilo streaming, IA Advisor 24/7 e simulação de diagnóstico facial.'
    },
    {
      q: 'Como funciona a IA de Suporte & Avaliação Facial por Foto?',
      a: 'Nossa IA LooksNow Advisor responde a mais de 100 dúvidas sobre os ebooks em tempo real e analisa fotos enviadas gerando um relatório sintético de harmonia e potencial estético.'
    },
    {
      q: 'Como recebo o acesso aos manuais e à área de membros?',
      a: 'Imediatamente após a confirmação do pagamento de R$ 17,90. Os dados de login são enviados para o seu e-mail e a plataforma libera o leitor de ebooks na hora.'
    },
    {
      q: 'Posso fazer o download dos arquivos em PDF?',
      a: 'Sim! Todos os 8 manuais possuem um gerador exclusivo de PDF integrado. Você pode ler na plataforma ou baixar o arquivo completo para ler onde quiser.'
    },
    {
      q: 'Existe alguma garantia de satisfação?',
      a: 'Sim. Você possui 7 dias de garantia incondicional. Se não aprovar o material, devolvemos 100% dos seus R$ 17,90 sem burocracia.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
      
      {/* 1. EDITORIAL ASYMMETRIC HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-[#09090c]">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: BRAND STORY & HERO HEADING (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121216] border border-white/10 text-zinc-300 text-[11px] font-mono-tech uppercase tracking-wider">
                <img src="/logo.png" alt="LooksNow Crest" className="w-3.5 h-3.5 object-contain" />
                <span>SISTEMA DEFINITIVO DE ELEVAÇÃO MASCULINA</span>
              </div>

              <h1 className="font-serif-title text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                A Ciência da Harmonia & Masculinidade de Alto Padrão.
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl font-light">
                Domine os pilares de <span className="text-zinc-100 font-medium">Looksmaxxing, Visagismo, Estudo de Altura, Físico V-Taper e Skincare</span>. 8 manuais ilustrados com suporte guiado por Inteligência Artificial.
              </p>

              {/* INTEGRATED COUNTDOWN WIDGET CARD */}
              <div className="p-4 rounded-2xl bg-[#0e0e12] border border-white/10 space-y-3 shadow-xl max-w-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-semibold text-zinc-200">Turma Exclusiva Aberta</span>
                  </div>

                  {/* Countdown Numbers */}
                  <div className="flex items-center gap-3 font-mono-tech text-center">
                    <div>
                      <span className="text-base sm:text-lg font-bold text-amber-400">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="text-[9px] text-zinc-500 uppercase block">Horas</span>
                    </div>
                    <span className="text-zinc-600 font-bold">:</span>
                    <div>
                      <span className="text-base sm:text-lg font-bold text-amber-400">{String(timeLeft.mins).padStart(2, '0')}</span>
                      <span className="text-[9px] text-zinc-500 uppercase block">Mins</span>
                    </div>
                    <span className="text-zinc-600 font-bold">:</span>
                    <div>
                      <span className="text-base sm:text-lg font-bold text-amber-400">{String(timeLeft.secs).padStart(2, '0')}</span>
                      <span className="text-[9px] text-zinc-500 uppercase block">Segs</span>
                    </div>
                  </div>

                </div>

                <div className="text-[11px] text-zinc-400 border-t border-white/5 pt-2 flex items-center justify-between font-mono-tech">
                  <span>Valor Promocional: <strong className="text-emerald-400">R$ 17,90</strong></span>
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> Acesso Vitalício
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenCheckout}
                  className="yellow-cta-btn py-4 px-8 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Garantir Vaga por R$ 17,90</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </motion.button>

                <button
                  onClick={onOpenAuth}
                  className="btn-dark-secondary py-4 px-6 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Já é Aluno? Faça Login</span>
                </button>
              </div>

              {/* 2 INTERACTIVE IA QUESTION PROMPTS */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-mono-tech flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Pergunte à IA agora:
                </span>
                <button
                  onClick={() => onOpenIaChat('Como fazer Mewing correto?')}
                  className="px-3 py-1.5 rounded-full bg-[#0e0e12] border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <span>Como fazer Mewing correto?</span>
                </button>
                <button
                  onClick={() => onOpenIaChat('Rotina de Skincare para Acne')}
                  className="px-3 py-1.5 rounded-full bg-[#0e0e12] border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1"
                >
                  <span>Rotina de Skincare para Acne</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1 font-mono-tech">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 7 Dias de Garantia
                </span>
                <span>•</span>
                <span>Download em PDF Imediato</span>
              </div>

            </div>

            {/* RIGHT COLUMN: HIGH-RES EDITORIAL MEDIA CONTAINER (5 COLS) */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] max-h-[500px] mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0e0e12] group">
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80" 
                  alt="LooksNow Masterclass Portrait"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent opacity-80"></div>

                {/* Crest Badge */}
                <div className="absolute top-5 right-5 w-11 h-11 p-1 rounded-2xl bg-[#070709]/90 backdrop-blur-md border border-white/10 shadow-xl flex items-center justify-center">
                  <img src="/logo.png" alt="LooksNow Crest" className="w-full h-full object-contain" />
                </div>

                {/* Testar IA Overlay Pill Button */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenIaChat}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full bg-[#0e0e12]/95 backdrop-blur-xl border border-amber-500/40 hover:border-amber-400 text-zinc-100 text-xs font-bold flex items-center gap-2.5 shadow-2xl transition-all cursor-pointer"
                >
                  <img src="/logo.png" alt="IA" className="w-4 h-4 object-contain" />
                  <span>Testar IA Advisor</span>
                  <Bot className="w-4 h-4 text-amber-400 stroke-[2]" />
                </motion.button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. THE 3-STEP METHODOLOGY SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#070709]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <span className="text-[11px] font-mono-tech font-semibold text-amber-400 uppercase tracking-widest block mb-1">
                METODOLOGIA DE ALTO PADRÃO
              </span>
              <h2 className="font-serif-title text-2xl sm:text-4xl font-bold text-white">
                Os 3 Passos da Transformação
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed font-light">
              Estrutura simples, profunda e acelerada para evoluir sua imagem estética, saúde hormonal e presença social.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* STEP 1: APRENDA */}
            <div className="p-6 rounded-3xl bg-[#0e0e12] border border-white/5 space-y-4 hover:border-amber-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-tech text-amber-400 font-bold">01 / APRENDA</span>
                <Compass className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              </div>
              
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80" 
                  alt="Aprenda" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                />
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                8 Ebooks Ilustrados em PDF
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Manuais diretos ao ponto cobrindo Mewing, Hunter Eyes, Visagismo, Treino V-Taper, Skincare e Nutrição Óssea.
              </p>
            </div>

            {/* STEP 2: AVALIE */}
            <div className="p-6 rounded-3xl bg-[#0e0e12] border border-white/5 space-y-4 hover:border-amber-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-tech text-amber-400 font-bold">02 / AVALIE</span>
                <Bot className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              </div>

              <div 
                onClick={onOpenIaChat}
                className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black cursor-pointer"
              >
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80" 
                  alt="Avalie com IA" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#070709]/90 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase flex items-center gap-1.5 backdrop-blur-md shadow-lg">
                  <Bot className="w-3.5 h-3.5 text-amber-400" /> Testar IA
                </div>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Avaliação Facial & IA Advisor
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Envie fotos para simular o diagnóstico de potencial estético sintético e tire dúvidas sobre os ebooks em tempo real.
              </p>
            </div>

            {/* STEP 3: EVOLUA */}
            <div className="p-6 rounded-3xl bg-[#0e0e12] border border-white/5 space-y-4 hover:border-amber-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-tech text-amber-400 font-bold">03 / EVOLUA</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              </div>

              <div 
                onClick={onOpenCheckout}
                className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black cursor-pointer"
              >
                <img 
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=700&q=80" 
                  alt="Evolua" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                />
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Streaming & Download PDF
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                Leitor interativo de alta velocidade com rastreamento de progresso por capítulo e arquivos PDF completos.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. CATALOG GRID SHOWCASE */}
      <section className="py-20 bg-[#09090c] border-y border-white/5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-widest block">
              CONTEÚDO COMPLETO INCLUSO
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-white">
              8 Módulos Práticos & Ilustrados
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light">
              Tudo o que você precisa por apenas R$ 17,90 em pagamento único.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modulesData.map((mod) => (
              <div 
                key={mod.id} 
                className="bg-[#0e0e12] border border-white/5 rounded-2xl p-4 space-y-3 hover:border-amber-500/40 transition-all duration-300 group cursor-pointer shadow-lg flex flex-col justify-between"
                onClick={onOpenCheckout}
              >
                <div className="space-y-3">
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black">
                    <img src={mod.bannerUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" />
                    <span className="absolute top-2.5 left-2.5 bg-[#070709]/90 border border-white/10 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono-tech">
                      {mod.badge}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-tech text-zinc-400 uppercase tracking-wider block">{mod.category}</span>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{mod.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">{mod.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-mono-tech">
                  <span>{mod.totalPages} Páginas</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Play className="w-3 h-3 fill-amber-400" /> Acessar
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. LUXURY PRICING CARD (R$ 17,90) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-[#0e0e12] border border-amber-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 relative overflow-hidden">
          
          <div className="w-14 h-14 mx-auto p-1.5 rounded-2xl bg-[#070709] border border-white/10 shadow-xl flex items-center justify-center">
            <img src="/logo.png" alt="LooksNow Crest" className="w-full h-full object-contain" />
          </div>

          <span className="text-xs font-mono-tech font-bold text-amber-400 uppercase tracking-widest block">ACESSO VITALÍCIO IMEDIATO</span>

          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-white">
            Garanta o LooksNow por R$ 17,90
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto font-light">
            Acesso aos 8 Ebooks em PDF, leitor streaming interativo, IA Advisor 24/7 e avaliação por foto por um valor único promocional.
          </p>

          <div className="py-2">
            <div className="text-zinc-500 line-through text-xs font-mono-tech">De R$ 197,00</div>
            <div className="text-5xl font-black text-white font-mono-tech my-1">
              R$ 17<span className="text-2xl text-zinc-400">,90</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium">Pagamento Único • Sem Mensalidades</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCheckout}
            className="yellow-cta-btn w-full py-4 px-8 rounded-2xl text-base font-extrabold shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>GARANTIR MINHA VAGA POR R$ 17,90</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </motion.button>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-zinc-400 font-mono-tech">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> 7 Dias de Garantia
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" /> Ambiente Criptografado
            </span>
          </div>

        </div>
      </section>

      {/* 5. FAQ ACCORDION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-[#0e0e12] border border-white/5 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left text-sm font-bold text-zinc-200 flex items-center justify-between gap-4 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-amber-400' : ''}`} />
              </button>

              {openFaq === idx && (
                <div className="p-5 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-white/5 font-light">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
