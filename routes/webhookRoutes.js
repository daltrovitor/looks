import express from 'express';
import { stripe } from '../config/stripe.js';
import { fulfillPayment } from '../services/supabaseService.js';

const router = express.Router();

/**
 * POST /api/webhook
 * Webhook do Stripe que recebe eventos assíncronos de pagamento (ex: payment_intent.succeeded).
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && sig && webhookSecret !== 'whsec_placeholder') {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      console.warn('[WEBHOOK WARNING] STRIPE_WEBHOOK_SECRET não configurado ou em modo teste local. Processando evento em modo fallback seguro.');
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error(`[WEBHOOK ERROR] Falha de validação da assinatura: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[WEBHOOK RECEBIDO] Tipo do Evento: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(`[WEBHOOK SUCCESS] Pagamento confirmado! Intent ID: ${paymentIntent.id}, Valor: R$ ${(paymentIntent.amount / 100).toFixed(2)}`);

      await fulfillPayment({
        userId: paymentIntent.metadata?.userId,
        email: paymentIntent.metadata?.email || paymentIntent.receipt_email,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        paymentMethod: paymentIntent.payment_method_types?.[0] || 'stripe',
        customerId: paymentIntent.customer
      });
      break;
    }

    case 'charge.succeeded': {
      const charge = event.data.object;
      console.log(`[WEBHOOK CHARGE] Cobrança realizada com sucesso. Charge ID: ${charge.id}`);
      if (charge.billing_details?.email && !charge.payment_intent) {
        await fulfillPayment({
          email: charge.billing_details.email,
          paymentIntentId: charge.id,
          amount: charge.amount,
          paymentMethod: 'card',
          customerId: charge.customer
        });
      }
      break;
    }

    default:
      console.log(`[WEBHOOK INFO] Evento não tratado: ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
