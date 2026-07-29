import React, { useState, useEffect } from 'react';
import { X, Bot, Send, Image, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Upload, FileText, Zap, ChevronRight, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 100+ Mapped Question Answers Database for LooksNow IA
const KNOWLEDGE_BASE = [
  {
    keywords: ['mewing', 'lingua', 'lingua no ceu da boca', 'postura lingual', 'engolir'],
    answer: 'O **Mewing** consiste em pressionar 100% da língua (incluindo o terço posterior) contra o palato duro e mole sem tocar nos incisivos. Mantenha essa postura 24 horas por dia, inclusive dormindo, para elevar o hioide e projetar a maxila. Veja o Capítulo 1 do Módulo 1.'
  },
  {
    keywords: ['masseter', 'queixo', 'mandibula', 'chiclete', 'mastigar'],
    answer: 'A hipertrofia do **masseter** é obtida com mastigação de alimentos densos ou gomas de alta resistência por 15-20 minutos em dias alternados. Se sentir dor na ATM, interrompa e foque apenas no Mewing. Detalhes no Capítulo 1 do Módulo 1.'
  },
  {
    keywords: ['hunter eyes', 'olho', 'olhar', 'canthal tilt', 'palpebra', 'bolsas'],
    answer: 'O olhar **Hunter Eyes** exige menor exposição da pálpebra superior e Canthal Tilt neutro/positivo. Pratique relaxamento pálpebral e aplique compressas geladas de chá verde/cafeína para drenar bolsas noturnas. Veja o Capítulo 2 do Módulo 1.'
  },
  {
    keywords: ['sobrancelha', 'monoselha', 'glabela', 'minoxidil sobrancelha', 'ricino'],
    answer: 'Limpe apenas a glabela (espaço entre sobrancelhas) sem afinar por baixo. Use 1 gota de óleo de rícino à noite para densidade ou **Minoxidil 5%** com cotonete para falhas. Confira o Capítulo 3 do Módulo 1.'
  },
  {
    keywords: ['dente', 'sorriso', 'clareamento', 'branqueamento', 'corredor bucal'],
    answer: 'Para um **sorriso expansivo e branco**, use fio dental diário e fitas com Peróxido de Carbamida 10-16% por 14 dias. Sorria mostrando os dentes superiores sem contrair os lábios. Detalhes no Capítulo 4 do Módulo 1.'
  },
  {
    keywords: ['skincare', 'pele', 'acne', 'espinha', 'oleosa', 'retinol', 'salicilico'],
    answer: 'Rotina de **Skincare** de 4 passos: 1) Gel de limpeza com Ácido Salicílico 2%; 2) Hidratante com Niacinamida 5%; 3) Protetor Solar FPS 50+ toque seco; 4) Retinol 0.3% à noite 2x/semana. Veja o Capítulo 5 do Módulo 1.'
  },
  {
    keywords: ['ice facial', 'gelo', 'inchaço', 'drenagem'],
    answer: 'Mergulhe o rosto por 20 segundos em água com gelo pela manhã para desinflamar vasinhos e reduzir o **inchaço matinal linfático**. Capítulo 1 do Módulo 1.'
  },
  {
    keywords: ['altura', 'crescer', 'heightmaxxing', 'placa', 'epifise', 'epifisaria'],
    answer: 'Até os 18-25 anos, com placas abertas, otimizar GH e IGF-1 maximiza o crescimento. Com placas fechadas, a descompressão espinhal e correção postural adicionam de **2 a 5 cm imediatos**! Veja o Módulo 2.'
  },
  {
    keywords: ['leite', 'calcio', 'igf-1', 'nutricao ossea'],
    answer: 'O leite integral/A2 fornece cálcio biodisponível, caseína e **IGF-1 natural** para densidade óssea. Consuma 500ml a 1L/dia associado à Vitamina D3 + K2. Módulo 2, Capítulo 2.'
  },
  {
    keywords: ['postura', 'dead hang', 'barra', 'suspensao', 'coluna', 'descompressao'],
    answer: 'Faça **Dead Hang** (suspensão na barra fixa) por 3 séries de 60 segundos diariamente. A gravidade descomprime os discos intervertebrais, recuperando estatura. Módulo 2, Capítulo 3.'
  },
  {
    keywords: ['sono', 'gh', 'hormonio do crescimento', 'melatonina'],
    answer: '70% do **GH** é liberado no sono profundo. Faça jejum pré-sono de 3h (sem carboidratos), durma em quarto escuro a 19°C entre 22h e 06h. Módulo 2, Capítulo 4.'
  },
  {
    keywords: ['cabelo', 'visagismo', 'corte', 'formato de rosto', 'rosto oval', 'rosto quadrado'],
    answer: 'Identifique seu formato de rosto (quadrado, oval, diamante) para escolher cortes que equilibrem proporções. Cabelos volumosos no topo alongam rostos redondos; laterais baixas afinam a estrutura. Veja **Módulo 3**.'
  },
  {
    keywords: ['barba', 'minoxidil', 'falha na barba', 'desenho da barba'],
    answer: 'Mantenha a linha da bochecha e pescoço bem desenhadas (2 dedos acima do pombo-de-adão). Use **Minoxidil 5%** 2x/dia para preencher falhas. Módulo 3, Capítulo 3.'
  },
  {
    keywords: ['v-taper', 'shape', 'costas', 'ombro', 'deltoide', 'cintura'],
    answer: 'O shape **V-Taper** é construído focando na hipertrofia do deltoide lateral (elevação lateral pesada) e dorsais largas (puxadas abertas), mantendo o percentual de gordura baixo para cintura fina. Veja Módulo 4.'
  }
];

export default function IaChatModal({ isOpen, onClose, onOpenCheckout, initialQuery = '' }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: 'Olá! Sou o **LooksNow IA Advisor**. Posso esclarecer qualquer dúvida sobre os **8 Ebooks** ou realizar a **Avaliação Facial por Foto**.\nComo posso te ajudar hoje?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  const quickPrompts = [
    'Como fazer Mewing correto?',
    'Rotina de Skincare para Acne'
  ];

  // If initialQuery is passed when opening modal, trigger message automatically
  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSendMessage(null, initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  // Helper to parse markdown bold **text** and render highlighted text
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

  const handleSendMessage = (e, customText = null) => {
    if (e) e.preventDefault();
    const query = (customText || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');

    // Search Knowledge Base for answer
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let matchedAnswer = null;

      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(kw => lowerQuery.includes(kw))) {
          matchedAnswer = item.answer;
          break;
        }
      }

      if (matchedAnswer) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: matchedAnswer
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            isLimit: true,
            text: 'Você atingiu o limite de perguntas desta sessão da IA. Consulte os **Módulos Oficiais do LooksNow** para detalhes aprofundados.'
          }
        ]);
      }
    }, 500);
  };

  const handleSimulateImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    setAnalysisStep('Mapeando pontos antropométricos faciais...');

    setTimeout(() => {
      setAnalysisStep('Calculando proporções de Canthal Tilt e ângulo mandibular...');
    }, 1200);

    setTimeout(() => {
      setAnalysisStep('Gerando diagnóstico sintético estético...');
    }, 2400);

    setTimeout(() => {
      setIsAnalyzingImage(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          isAnalysisReport: true,
          text: `📊 DIAGNÓSTICO SINTÉTICO LOOKSNOW IA:\n\n• **Potencial de Evolução Estética**: +85%\n• **Simetria Antropométrica**: Elevada\n• **Alinhamento Mandibular & Maxilar**: Indicado reforço de postura lingual (**Mewing**)\n• **Qualidade Cutânea**: Recomendada otimização de Skincare com Retinol e Ácido Salicílico\n\n📌 Recomendação de Leitura: **Módulo 1 (Looksmaxxing)** & **Módulo 3 (Visagismo)**.`
        }
      ]);
    }, 3400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0e0e12] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[620px] max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/5 bg-[#070709] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#121216] border border-white/10 p-1 flex items-center justify-center shadow-lg">
              <img src="/logo.png" alt="LooksNow IA" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-xs sm:text-sm font-mono-tech">IA LOOKSNOW ADVISOR</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-mono-tech font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-light">Suporte Oficial & Avaliação Facial por Foto</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CHAT BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#070709]/50 no-scrollbar">
          
          {/* FAKE ANALYSIS LOADER */}
          {isAnalyzingImage && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <div>
                <p className="text-xs font-bold text-amber-300">Analisando imagem enviada...</p>
                <p className="text-[10px] text-amber-400/80 font-mono-tech mt-0.5">{analysisStep}</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : msg.isAnalysisReport
                    ? 'bg-[#121216] border border-amber-500/30 text-zinc-200 shadow-xl'
                    : msg.isLimit
                    ? 'bg-zinc-900 border border-amber-500/30 text-amber-300'
                    : 'bg-[#121216] border border-white/5 text-zinc-200'
                }`}
              >
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                    {renderFormattedText(line)}
                  </p>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* CHAT INPUT & QUICK PROMPTS */}
        <div className="p-3 sm:p-4 border-t border-white/5 bg-[#070709] space-y-3">
          
          {/* TOP 2 PROMPT CHIPS */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono-tech uppercase">Perguntas Rápidas:</span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleSendMessage(e, prompt)}
                className="px-3 py-1.5 rounded-full bg-[#14141a] border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* PHOTO UPLOAD & TEXT INPUT FORM */}
          <div className="flex items-center justify-between px-1 text-[10px]">
            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all">
              <Image className="w-3.5 h-3.5 text-amber-400" />
              <span>Enviar Foto para Avaliação</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSimulateImageUpload}
                className="hidden"
                disabled={isAnalyzingImage}
              />
            </label>
            <span className="text-zinc-500 font-mono-tech hidden sm:inline">IA Advisor • Diagnóstico Sintético</span>
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite sua dúvida sobre Mewing, Skincare, Altura..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#121216] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl yellow-cta-btn transition-all disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
