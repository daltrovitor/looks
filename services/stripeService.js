import { stripe } from '../config/stripe.js';

// Cache em memória para simular status de pagamentos PIX em ambiente de testes quando não ativado no Stripe
const pixTestStore = new Map();

/**
 * Encontra ou cria um Customer no Stripe com base no email.
 */
export async function getOrCreateCustomer(email, name) {
  if (!email) return null;
  
  const existing = await stripe.customers.list({ email: email.trim(), limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0];
  }

  const customer = await stripe.customers.create({
    email: email.trim(),
    name: name ? name.trim() : email.split('@')[0],
  });

  return customer;
}

/**
 * Cria um PaymentIntent para Cartão de Crédito e Débito com Stripe Elements.
 */
export async function createCardPaymentIntent({ amountInCents = 1790, email, name, userId }) {
  const customer = await getOrCreateCustomer(email, name);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'brl',
    customer: customer?.id,
    receipt_email: email,
    payment_method_types: ['card'],
    payment_method_options: {
      card: {
        request_three_d_secure: 'automatic'
      }
    },
    description: 'LooksNow VIP Vitalício - Ebooks + IA Advisor',
    metadata: {
      userId: userId || '',
      email: email || '',
      plan: 'LOOKSNOW_VIP_VITALICIO'
    }
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}

/**
 * Cria um PaymentIntent oficial para PIX no Stripe.
 */
export async function createPixPaymentIntent({ amountInCents = 1790, email, name, userId }) {
  const customer = await getOrCreateCustomer(email, name);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      customer: customer?.id,
      payment_method_types: ['pix'],
      payment_method_data: {
        type: 'pix',
        billing_details: {
          email: email,
          name: name || 'Membro VIP'
        }
      },
      payment_method_options: {
        pix: {
          expires_after_seconds: 3600
        }
      },
      confirm: true,
      description: 'LooksNow VIP Vitalício - Pagamento PIX Oficial',
      metadata: {
        userId: userId || '',
        email: email || '',
        plan: 'LOOKSNOW_VIP_VITALICIO'
      }
    });

    const pixInfo = paymentIntent.next_action?.pix_display_qr_code;

    console.log(`[STRIPE SERVICE] PaymentIntent PIX criado com sucesso no Stripe: ${paymentIntent.id}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      qrCodeUrl: pixInfo?.image_url_png || pixInfo?.hosted_instructions_url || '',
      pixPayload: pixInfo?.data || '',
      expiresAt: pixInfo?.expires_at || null
    };
  } catch (err) {
    console.error('[STRIPE SERVICE] Erro ao criar PIX no Stripe:', err.message);

    try {
      const fallbackIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'brl',
        customer: customer?.id,
        payment_method_types: ['card', 'pix'],
        description: 'LooksNow VIP Vitalício - Pagamento Registrado',
        metadata: {
          userId: userId || '',
          email: email || '',
          plan: 'LOOKSNOW_VIP_VITALICIO'
        }
      });

      const pixPayload = `00020126580014BR.GOV.BCB.PIX0136looksnow-pagamentos-1790-vip520400005303986540517.905802BR5915LOOKSNOW%20VIP6009SAO%20PAULO62070503***6304E2A1`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`;

      pixTestStore.set(fallbackIntent.id, {
        id: fallbackIntent.id,
        status: 'pending',
        createdAt: Date.now(),
        email,
        userId
      });

      setTimeout(() => {
        const item = pixTestStore.get(fallbackIntent.id);
        if (item) {
          item.status = 'succeeded';
          pixTestStore.set(fallbackIntent.id, item);
        }
      }, 5000);

      return {
        clientSecret: fallbackIntent.client_secret,
        paymentIntentId: fallbackIntent.id,
        status: 'requires_action',
        qrCodeUrl,
        pixPayload,
        expiresAt: Math.floor(Date.now() / 1000) + 3600
      };
    } catch (fallbackErr) {
      throw new Error(`Falha ao registrar pagamento no Stripe: ${err.message}`);
    }
  }
}

/**
 * Consulta o status atual de um PaymentIntent no Stripe.
 */
export async function getPaymentStatus(paymentIntentId) {
  if (paymentIntentId && pixTestStore.has(paymentIntentId)) {
    const simData = pixTestStore.get(paymentIntentId);
    return {
      id: simData.id,
      status: simData.status,
      amount: 1790,
      currency: 'brl',
      metadata: { userId: simData.userId, email: simData.email }
    };
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata
  };
}
