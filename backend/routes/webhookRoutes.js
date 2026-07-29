import express from 'express';
import { stripe } from '../config/stripe.js';
import { fulfillPayment } from '../services/supabaseService.js';

const router = express.Router();

/**
 * POST /api/webhook
 * Recebe e valida eventos enviados oficialmente pelo Stripe Webhooks.
 * NUNCA confia em dados do frontend.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && webhookSecret !== 'whsec_placeholder') {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      console.warn('[WEBHOOK] STRIPE_WEBHOOK_SECRET não configurado ou em modo placeholder. Processando payload para desenvolvimento local.');
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('[WEBHOOK ERROR] Falha na validação da assinatura do Webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[WEBHOOK EVENT] Recebido evento: ${event.type} (ID: ${event.id})`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`[WEBHOOK SUCCESS] PaymentIntent APROVADO: ${paymentIntent.id}`);
        
        await fulfillPayment({
          userId: paymentIntent.metadata?.userId,
          email: paymentIntent.metadata?.email || paymentIntent.receipt_email,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
          customerId: paymentIntent.customer
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.warn(`[WEBHOOK FAILED] Pagamento RECUSADO para PaymentIntent: ${paymentIntent.id}. Motivo: ${paymentIntent.last_payment_error?.message}`);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`[WEBHOOK SUCCESS] Checkout Session COMPLETA: ${session.id}`);

        await fulfillPayment({
          userId: session.metadata?.userId,
          email: session.customer_details?.email || session.metadata?.email,
          paymentIntentId: session.payment_intent,
          amount: session.amount_total,
          paymentMethod: 'checkout_session',
          customerId: session.customer
        });
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        console.log(`[WEBHOOK EXPIRED] Checkout Session expirada: ${session.id}`);
        break;
      }

      default:
        console.log(`[WEBHOOK INFO] Evento não tratado explicitamente: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('[WEBHOOK ERROR] Erro durante o processamento do evento:', err);
    return res.status(500).send('Erro interno ao processar Webhook.');
  }
});

export default router;
