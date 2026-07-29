import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, Check, Crown, User, Mail, Key, Copy, CheckCircle2, RefreshCw, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../utils/supabaseClient';
import { createPaymentIntent, checkPaymentStatus, registerUserOnBackend } from '../services/api';

const fallbackPublishableKey = 'pk_test_51SL6pD3Z13ACzFAyVCPBYFWeHUjczuqK89LEfJXQg6dAQQSgEKqsJZTElf7FI9chmV8s2hEHn01mtWD5flS9EgWT00L4Z31QBv';
const rawPublishable = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const PUBLISHABLE_KEY = (rawPublishable && rawPublishable.startsWith('pk_test_')) ? rawPublishable : fallbackPublishableKey;
const stripePromise = loadStripe(PUBLISHABLE_KEY);

/**
 * Subcomponente de formulário de cartão utilizando Stripe Elements.
 */
function CardCheckoutForm({ onPaymentSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    onError('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required'
      });

      if (error) {
        throw new Error(error.message || 'Ocorreu um erro no processamento do cartão.');
      }

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        await onPaymentSuccess();
      } else {
        throw new Error('O pagamento não pôde ser concluído.');
      }
    } catch (err) {
      console.error('Erro na confirmação do pagamento:', err);
      onError(err.message || 'Falha ao confirmar pagamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="p-3 bg-[#070709] border border-white/10 rounded-xl">
        <PaymentElement 
          options={{
            layout: 'tabs',
            wallets: {
              applePay: 'never',
              googlePay: 'never',
              link: 'never',
            },
          }}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={!stripe || submitting}
        className="yellow-cta-btn w-full py-3.5 px-4 font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Confirmando Pagamento Seguro...</span>
          </span>
        ) : (
          <>
            <span>Pagar R$ 17,90 (Acesso Vitalício)</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </>
        )}
      </motion.button>
    </form>
  );
}

/**
 * Componente Principal do Checkout Modal
 */
export default function CheckoutModal({ isOpen, onClose, onCheckoutSuccess, onUserAuthenticated, user }) {
  const [step, setStep] = useState(1);

  // User Account Details (Step 1)
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [currentUserId, setCurrentUserId] = useState(user?.id || '');

  // Payment State (Step 2)
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'pix'
  const [cardClientSecret, setCardClientSecret] = useState('');
  const [pixData, setPixData] = useState(null);

  const [loadingIntent, setLoadingIntent] = useState(false);
  const [loadingStep1, setLoadingStep1] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pixPolling, setPixPolling] = useState(false);

  // Reset e Prefill ao abrir modal
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFullName(user.full_name || '');
        setEmail(user.email || '');
        setCurrentUserId(user.id || '');
        setStep(2); // Se o usuário já está logado, avança para o pagamento
      } else {
        setStep(1);
      }
      setCardClientSecret('');
      setPixData(null);
      setErrorMsg('');
    }
  }, [isOpen, user]);

  // Inicializa o PaymentIntent quando o usuário atinge o Passo 2 ou alterna a forma de pagamento
  useEffect(() => {
    let active = true;

    const initPayment = async () => {
      if (step !== 2 || !email) return;
      setErrorMsg('');
      setLoadingIntent(true);

      try {
        const intentRes = await createPaymentIntent({
          paymentMethod,
          email: email.trim(),
          name: fullName.trim(),
          userId: currentUserId,
          amountInCents: 1790
        });

        if (!active) return;

        if (paymentMethod === 'card') {
          setCardClientSecret(intentRes.clientSecret);
        } else if (paymentMethod === 'pix') {
          setPixData(intentRes);
        }
      } catch (err) {
        if (active) {
          setErrorMsg(err.message || 'Não foi possível se comunicar com o servidor de pagamento.');
        }
      } finally {
        if (active) setLoadingIntent(false);
      }
    };

    initPayment();

    return () => {
      active = false;
    };
  }, [step, paymentMethod, email]);

  const handlePaymentCompleted = async () => {
    const cleanEmail = email.trim();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0];

    onCheckoutSuccess({
      id: currentUserId || 'user_' + Date.now(),
      email: cleanEmail,
      full_name: cleanName,
      is_pro: true
    });
    onClose();
  };

  // Polling para checagem do status do pagamento PIX
  useEffect(() => {
    let intervalId;

    if (step === 2 && paymentMethod === 'pix' && pixData?.paymentIntentId && pixPolling) {
      intervalId = setInterval(async () => {
        try {
          const statusRes = await checkPaymentStatus(pixData.paymentIntentId);
          if (statusRes.status === 'succeeded') {
            clearInterval(intervalId);
            setPixPolling(false);
            await handlePaymentCompleted();
          }
        } catch {
          // Polling silencioso
        }
      }, 3500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step, paymentMethod, pixData, pixPolling]);

  if (!isOpen) return null;

  const handleStep1Next = async (e) => {
    e.preventDefault();
    if (loadingStep1) return;
    setErrorMsg('');

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail) {
      setErrorMsg('Por favor, preencha nome e e-mail.');
      return;
    }

    if (!user && !cleanPassword) {
      setErrorMsg('Por favor, crie uma senha de acesso.');
      return;
    }

    setLoadingStep1(true);

    try {
      if (!user) {
        // Registra ou verifica o usuário no backend via Service Role Key (evita erros 429 de IP e 400 no browser)
        const regRes = await registerUserOnBackend({
          email: cleanEmail,
          password: cleanPassword,
          name: cleanName
        });

        const activeUserId = regRes?.userId || currentUserId || 'usr_' + Date.now();
        setCurrentUserId(activeUserId);

        if (onUserAuthenticated) {
          onUserAuthenticated({
            id: activeUserId,
            email: cleanEmail,
            full_name: cleanName,
            is_pro: false
          });
        }
      }

      setStep(2);
    } finally {
      setLoadingStep1(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.pixPayload) {
      navigator.clipboard.writeText(pixData.pixPayload);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0e0e12] border border-white/10 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-5">
        
        {/* LADO ESQUERDO: RESUMO DO PLANO */}
        <div className="md:col-span-2 bg-[#070709] p-6 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0e0e12] border border-white/10 p-1 flex items-center justify-center shadow-lg mb-4">
              <img src="/logo.png" alt="LooksNow" className="w-full h-full object-contain" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold tracking-wider mb-2 font-mono-tech">
              <Crown className="w-3 h-3 text-amber-400" /> PASSO {step} DE 2
            </div>
            
            <div className="flex items-center gap-1">
              <h3 className="text-xl font-extrabold text-white font-mono-tech tracking-tight">Looks</h3>
              <h3 className="text-xl font-extrabold text-amber-400 font-mono-tech tracking-tight">Now</h3>
            </div>
            
            <p className="text-xs text-zinc-400 mt-1 font-light">8 Ebooks Ilustrados + IA Advisor + Download PDF</p>

            <div className="my-6">
              <div className="text-3xl font-black text-white font-mono-tech">
                R$ 17<span className="text-sm font-normal text-zinc-400">,90</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold mt-1">Pagamento Único • Sem Mensalidades</p>
            </div>

            <ul className="space-y-2.5 text-xs text-zinc-300 font-light">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[2.5]" />
                <span>8 Ebooks Ilustrados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[2.5]" />
                <span>IA Avaliação Facial por Foto</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[2.5]" />
                <span>Download em PDF ilimitado</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-zinc-500 flex items-center gap-2 font-mono-tech">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Garantia Incondicional de 7 Dias</span>
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO DO CHECKOUT */}
        <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-between bg-[#0e0e12]">
          <div>
            
            {/* CABEÇALHO DO MODAL */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>{step === 1 ? 'Passo 1: Criar Sua Conta' : 'Passo 2: Pagamento Seguro'}</span>
              </div>
              <button 
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            {/* PASSO 1: DADOS DA CONTA */}
            {step === 1 ? (
              <form onSubmit={handleStep1Next} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#070709] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">E-mail de Acesso</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#070709] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {!user && (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Criar Senha de Acesso</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        required
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#070709] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loadingStep1}
                  className="yellow-cta-btn w-full py-3.5 px-4 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  {loadingStep1 ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processando...</span>
                    </span>
                  ) : (
                    <>
                      <span>Avançar para Pagamento (R$ 17,90)</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </motion.button>
              </form>
            ) : (

              /* PASSO 2: SELEÇÃO E PROCESSAMENTO DO PAGAMENTO */
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-mono-tech">
                  <span className="text-zinc-400">Conta: <strong className="text-white">{email}</strong></span>
                  {!user && (
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-amber-400 hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Editar Dados
                    </button>
                  )}
                </div>

                {/* BOTÕES DE SELEÇÃO DE MÉTODO DE PAGAMENTO */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('card'); setPixPolling(false); }}
                    className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card' 
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                        : 'border-white/10 bg-[#070709] text-zinc-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" /> Cartão Crédito/Débito
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('pix'); setPixPolling(true); }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'pix' 
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400' 
                        : 'border-white/10 bg-[#070709] text-zinc-400'
                    }`}
                  >
                    <span>PIX</span>
                  </button>
                </div>

                {loadingIntent ? (
                  <div className="p-8 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400 font-mono-tech">Conectando ao serviço de pagamento seguro do Stripe...</p>
                  </div>
                ) : paymentMethod === 'card' ? (
                  
                  /* CHECKOUT COM CARTÃO (STRIPE ELEMENTS EXCLUSIVO CARTÃO) */
                  cardClientSecret && stripePromise ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: cardClientSecret,
                        appearance: {
                          theme: 'night',
                          variables: {
                            colorPrimary: '#f59e0b',
                            colorBackground: '#070709',
                            colorText: '#ffffff',
                            colorDanger: '#ef4444',
                            fontFamily: 'sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '12px',
                          }
                        }
                      }}
                    >
                      <CardCheckoutForm 
                        onPaymentSuccess={handlePaymentCompleted}
                        onError={(msg) => setErrorMsg(msg)}
                      />
                    </Elements>
                  ) : (
                    <p className="text-xs text-zinc-400 text-center py-4">Aguardando inicialização do formulário...</p>
                  )

                ) : (

                  /* CHECKOUT PIX OFICIAL DO STRIPE */
                  <div className="p-4 bg-[#070709] border border-amber-500/30 rounded-xl text-center space-y-3">
                    <p className="text-xs font-bold text-zinc-200">Escaneie o QR Code PIX (R$ 17,90)</p>
                    
                    {pixData?.qrCodeUrl ? (
                      <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-lg flex items-center justify-center border border-amber-500/40">
                        <img src={pixData.qrCodeUrl} alt="QR Code PIX Oficial Stripe" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-36 h-36 mx-auto bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                        <RefreshCw className="w-6 h-6 text-zinc-600 animate-spin" />
                      </div>
                    )}

                    {pixData?.pixPayload && (
                      <div className="p-2.5 bg-[#121216] border border-white/10 rounded-lg text-[10px] font-mono-tech text-zinc-400 truncate select-all">
                        {pixData.pixPayload}
                      </div>
                    )}

                    {pixData?.pixPayload && (
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {copiedPix ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Chave PIX Copiada com Sucesso!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar Código Copia e Cola Oficial</span>
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-mono-tech pt-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Aguardando confirmação bancária do Stripe em tempo real...</span>
                    </div>
                  </div>

                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

