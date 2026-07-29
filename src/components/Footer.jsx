import React from 'react';
import { Crown, Lock, CheckCircle2, Bot } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-amber-500/20 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0d0d11] border border-amber-500/30 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <img src="/logo.png" alt="LooksNow" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg text-white font-mono tracking-wider">Looks</span>
              <span className="font-extrabold text-lg gold-metallic-text font-mono tracking-wider">Now</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Plataforma de streaming de ebooks ilustrados, IA de avaliação facial por foto e suporte 24/7 para desenvolvimento masculino de alta performance.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest mb-4">Pilares de Conteúdo</h4>
          <ul className="space-y-2 text-xs">
            <li><span className="hover:text-amber-400 cursor-pointer transition-colors">Looksmaxxing & Mandíbula</span></li>
            <li><span className="hover:text-amber-400 cursor-pointer transition-colors">Heightmaxxing & Densidade</span></li>
            <li><span className="hover:text-amber-400 cursor-pointer transition-colors">Visagismo & Estilo Capilar</span></li>
            <li><span className="hover:text-amber-400 cursor-pointer transition-colors">Shape V-Taper & Nutrição</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest mb-4">Tecnologia & Segurança</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Bot className="w-3.5 h-3.5 text-amber-400" /> IA Advisor & Diagnóstico por Foto
            </li>
            <li className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Acesso Instantâneo Liberado
            </li>
            <li className="flex items-center gap-1.5 text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Ambiente Criptografado Seguro
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-widest mb-4">Aviso Legal</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Este material possui finalidade estritamente educacional de desenvolvimento pessoal. Consulte profissionais de saúde antes de alterações nutricionais ou de treinos.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p>© 2026 LOOKSNOW. Todos os direitos reservados.</p>
        <p className="font-mono text-[10px] text-amber-400/80 flex items-center gap-1">
          <Crown className="w-3 h-3 text-amber-400" /> LOOKSNOW OFFICIAL SYSTEM
        </p>
      </div>
    </footer>
  );
}
