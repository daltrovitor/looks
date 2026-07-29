import { stripe } from '../config/stripe.js';

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
    console.log('[STRIPE SERVICE] Card intent error:', err.message);
    throw new Error(`Erro na Stripe ao processar cartão: ${err.message}`);
  }
}

/**
 * Cria um PaymentIntent oficial para PIX diretamente na API da Stripe.
 * Não utiliza nenhuma chave PIX pessoal ou estática.
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
      description: 'LooksNow VIP Vitalício - Pagamento PIX Oficial Stripe',
      metadata: {
        userId: userId || '',
        email: email || '',
        plan: 'LOOKSNOW_VIP_VITALICIO'
      }
    });

    const pixInfo = paymentIntent.next_action?.pix_display_qr_code;

    if (pixInfo) {
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        qrCodeUrl: pixInfo?.image_url_png || pixInfo?.hosted_instructions_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixInfo?.data || '')}`,
        pixPayload: pixInfo?.data || '',
        expiresAt: pixInfo?.expires_at || null
      };
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      qrCodeUrl: '',
      pixPayload: '',
      expiresAt: null
    };

  } catch (err) {
    console.error('[STRIPE PIX ERROR]:', err.message);
    
    if (err.message?.includes('pix') || err.message?.includes('invalid')) {
      throw new Error('Para utilizar o PIX oficial da Stripe, ative o método PIX em seu painel Stripe (dashboard.stripe.com/account/payments/settings -> PIX -> Ativar).');
    }

    throw new Error(`Erro na API da Stripe: ${err.message}`);
  }
}

/**
 * Consulta o status atual de um PaymentIntent no Stripe.
 */
export async function getPaymentStatus(paymentIntentId) {
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
      status: 'pending',
      amount: 1790,
      currency: 'brl',
      metadata: {}
    };
  }
}
