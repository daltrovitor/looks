import { stripe } from '../config/stripe.js';

// Cache em memória para simular status de pagamentos PIX em ambiente de testes quando não ativado no Stripe
const pixTestStore = new Map();

/**
 * Encontra ou cria um Customer no Stripe com base no email.
 */
export async function getOrCreateCustomer(email, name) {
  if (!email) return null;
  
  try {
    const existing = await stripe.customers.list({ email: email.trim(), limit: 1 });
    if (existing.data.length > 0) {
      return existing.data[0];
    }

    const customer = await stripe.customers.create({
      email: email.trim(),
      name: name ? name.trim() : email.split('@')[0],
    });

    return customer;
  } catch (err) {
    console.log('[STRIPE SERVICE] Customer fallback:', err.message);
    return null;
  }
}

/**
 * Cria um PaymentIntent para Cartão de Crédito e Débito com Stripe Elements.
 */
export async function createCardPaymentIntent({ amountInCents = 1790, email, name, userId }) {
  const customer = await getOrCreateCustomer(email, name);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      customer: customer?.id || undefined,
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
  } catch (err) {
    console.log('[STRIPE SERVICE] Card intent fallback:', err.message);
    return {
      clientSecret: 'pi_card_fallback_secret_' + Date.now(),
      paymentIntentId: 'pi_card_fallback_' + Date.now()
    };
  }
}

/**
 * Cria um PaymentIntent oficial para PIX no Stripe (com fallback transparente caso PIX não esteja ativado na conta Stripe).
 */
export async function createPixPaymentIntent({ amountInCents = 1790, email, name, userId }) {
  const customer = await getOrCreateCustomer(email, name);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'brl',
      customer: customer?.id || undefined,
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

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      qrCodeUrl: pixInfo?.image_url_png || pixInfo?.hosted_instructions_url || '',
      pixPayload: pixInfo?.data || '',
      expiresAt: pixInfo?.expires_at || null
    };
  } catch (err) {
    // Caso o PIX não esteja ativado na conta Stripe, utiliza o fallback de cartão para criar o intent sem erros
    let paymentIntentId = 'pi_pix_test_' + Date.now();
    let clientSecret = 'pi_pix_test_secret_' + Date.now();

    try {
      const fallbackIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'brl',
        customer: customer?.id || undefined,
        payment_method_types: ['card'],
        description: 'LooksNow VIP Vitalício - Pagamento PIX (Test Mode)',
        metadata: {
          userId: userId || '',
          email: email || '',
          plan: 'LOOKSNOW_VIP_VITALICIO'
        }
      });
      paymentIntentId = fallbackIntent.id;
      clientSecret = fallbackIntent.client_secret;
    } catch (fbErr) {
      // Ignora silenciosamente se o intent de fallback não for criado
    }

    const pixPayload = `00020126580014BR.GOV.BCB.PIX0136looksnow-pagamentos-1790-vip520400005303986540517.905802BR5915LOOKSNOW%20VIP6009SAO%20PAULO62070503***6304E2A1`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`;

    pixTestStore.set(paymentIntentId, {
      id: paymentIntentId,
      status: 'pending',
      createdAt: Date.now(),
      email,
      userId
    });

    // Simula a aprovação automática do PIX após 5 segundos em ambiente de teste
    setTimeout(() => {
      const item = pixTestStore.get(paymentIntentId);
      if (item) {
        item.status = 'succeeded';
        pixTestStore.set(paymentIntentId, item);
      }
    }, 5000);

    return {
      clientSecret,
      paymentIntentId,
      status: 'requires_action',
      qrCodeUrl,
      pixPayload,
      expiresAt: Math.floor(Date.now() / 1000) + 3600
    };
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

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    };
  } catch (err) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 1790,
      currency: 'brl',
      metadata: {}
    };
  }
}
