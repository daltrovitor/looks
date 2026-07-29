import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, ArrowRight, Crown } from 'lucide-react';
import { supabase, getCurrentProfile } from '../utils/supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim();
    const userFullName = fullName.trim() || cleanEmail.split('@')[0];

    try {
      if (isSignUp) {
        // REGISTRO OFICIAL NO SUPABASE
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: { full_name: userFullName }
          }
        });

        if (error) {
          const isAlreadyRegisteredOrRateLimited = 
            error.message?.toLowerCase().includes('already registered') || 
            error.status === 429 || 
            error.message?.toLowerCase().includes('rate limit');

          if (isAlreadyRegisteredOrRateLimited) {
            // Tenta fazer login automático com as credenciais
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: password
            });

            if (!signInError && signInData?.user) {
              const profile = await getCurrentProfile();
              onAuthSuccess(profile || {
                id: signInData.user.id,
                email: cleanEmail,
                full_name: userFullName,
                is_pro: false
              });
              onClose();
              return;
            } else if (error.status === 429) {
              throw new Error('Muitas requisições enviadas ao servidor. Se você já tem conta, utilize o formulário de Login.');
            }
          }
          throw new Error(error.message || 'Falha ao criar conta.');
        }

        setSuccessMsg('Conta criada com sucesso!');
        
        // Busca o perfil criado
        const profile = await getCurrentProfile();
        onAuthSuccess(profile || {
          id: data.user?.id || 'user_' + Date.now(),
          email: cleanEmail,
          full_name: userFullName,
          is_pro: false
        });
        onClose();

      } else {
        // LOGIN OFICIAL NO SUPABASE
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });

        if (error) {
          throw new Error(error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        }

        // Busca o perfil atualizado do banco de dados
        const profile = await getCurrentProfile();
        onAuthSuccess(profile);
        onClose();
      }

    } catch (err) {
      console.error('Erro na autenticação:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0e0e12] border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* BOTÃO FECHAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CABEÇALHO */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#050507] border border-amber-500/40 p-1 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <img src="/logo.png" alt="LooksNow Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center justify-center gap-1">
            <h3 className="text-xl font-extrabold text-white font-mono-tech">
              {isSignUp ? 'Criar Conta' : 'Acessar Conta'}
            </h3>
            <h3 className="text-xl font-extrabold text-amber-400 font-mono-tech">
              LooksNow
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            Plataforma de Ebooks & IA Advisor
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORMULÁRIO DE AUTENTICAÇÃO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#050507] border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050507] border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050507] border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="yellow-cta-btn w-full py-3.5 px-4 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Criar Minha Conta' : 'Entrar na Área de Membros'}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-zinc-800 border-t text-center">
          <p className="text-[11px] text-zinc-400">
            {isSignUp ? 'Já possui uma conta?' : 'Ainda não tem conta?'}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
              className="text-amber-400 font-bold hover:underline cursor-pointer"
            >
              {isSignUp ? 'Fazer Login' : 'Cadastre-se'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
