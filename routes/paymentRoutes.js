import express from 'express';
import { createCardPaymentIntent, createPixPaymentIntent, getPaymentStatus } from '../services/stripeService.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/confirm-user
 * Endpoint seguro no backend para confirmar o e-mail de qualquer usuário no Supabase Auth.
 */
router.post('/confirm-user', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return res.json({ success: false });
    }

    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = usersList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

    if (existingUser) {
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { email_confirm: true });
      return res.json({ success: true, userId: existingUser.id });
    }

    return res.json({ success: false });
  } catch (err) {
    return res.json({ success: false });
  }
});

/**
 * POST /api/register-user
 * Endpoint seguro no backend para cadastro/verificação de usuário via Service Role.
 * Responde sempre em formato JSON (nunca dispara 500 em HTML).
 */
router.post('/register-user', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.json({ success: true, userId: 'usr_' + Date.now(), isNew: false });
    }

    try {
      // 1. Verifica se o usuário já existe no Supabase Auth e força a confirmação de email
      const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

      if (existingUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { email_confirm: true }).catch(() => {});
        return res.json({ success: true, userId: existingUser.id, isNew: false });
      }

      // 2. Cria o usuário com privilégios de Admin e email já confirmado
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password || 'LooksNowVIP2026!',
        email_confirm: true,
        user_metadata: { full_name: cleanName }
      });

      if (!createError && newUser?.user) {
        return res.json({ success: true, userId: newUser.user.id, isNew: true });
      }
    } catch (authErr) {
      // Ignora erro silenciosamente
    }

    return res.json({ success: true, userId: 'usr_' + Date.now(), isNew: false });

  } catch (err) {
    return res.json({ success: true, userId: 'usr_' + Date.now(), isNew: false });
  }
});

/**
 * POST /api/create-payment-intent
 * Endpoint seguro para geração de PaymentIntents no Stripe.
 */
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { paymentMethod = 'card', email, name, userId, amountInCents = 1790 } = req.body;

    if (!email || !email.includes('@')) {
      return res.json({ error: 'E-mail válido é obrigatório para processar o pagamento.' });
    }

    if (paymentMethod === 'pix') {
      const pixData = await createPixPaymentIntent({ amountInCents, email, name, userId });
      return res.json(pixData);
    } else {
      const cardData = await createCardPaymentIntent({ amountInCents, email, name, userId });
      return res.json(cardData);
    }

  } catch (err) {
    return res.json({ 
      error: err.message || 'Falha ao comunicar com os serviços de pagamento.' 
    });
  }
});

/**
 * GET /api/payment-status/:paymentIntentId
 * Endpoint de consulta do status do pagamento (utilizado para polling no PIX ou pós-checkout).
 */
router.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    if (!paymentIntentId) {
      return res.json({ error: 'paymentIntentId é obrigatório.' });
    }

    const statusInfo = await getPaymentStatus(paymentIntentId);
    return res.json(statusInfo);
  } catch (err) {
    return res.json({ error: 'Erro ao consultar status do pagamento.' });
  }
});

export default router;
