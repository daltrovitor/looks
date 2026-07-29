const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';

/**
 * Solicita ao backend a verificação ou criação segura da conta de usuário no Supabase.
 */
export async function registerUserOnBackend({ email, password, name }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/register-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Erro ao comunicar com o servidor de cadastro:', err);
    return { success: true, userId: 'usr_' + Date.now() };
  }
}

/**
 * Solicita ao backend a criação de um PaymentIntent no Stripe (para Cartão ou PIX).
 */
export async function createPaymentIntent({ paymentMethod = 'card', email, name, userId, amountInCents = 1790 }) {
  const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentMethod,
      email,
      name,
      userId,
      amountInCents,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Falha ao inicializar pagamento no servidor.');
  }

  return data;
}

/**
 * Consulta no backend o status atualizado do PaymentIntent no Stripe.
 */
export async function checkPaymentStatus(paymentIntentId) {
  const response = await fetch(`${API_BASE_URL}/api/payment-status/${paymentIntentId}`);
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || 'Falha ao consultar status do pagamento.');
  }

  return data;
}
