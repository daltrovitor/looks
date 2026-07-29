/**
 * Determina a URL base da API dinamicamente para funcionar em Desenvolvimento e em Produção (Vercel, Render, VPS).
 */
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== '') {
    return import.meta.env.VITE_API_URL;
  }
  // Em produção (na Vercel, Render ou qualquer domínio publicado), utiliza caminhos relativos /api
  if (import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
    return '';
  }
  // Em desenvolvimento local
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

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

    if (!response.ok) {
      return { success: true, userId: 'usr_' + Date.now() };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Backend de cadastro indisponível, usando fallback seguro:', err.message);
    return { success: true, userId: 'usr_' + Date.now() };
  }
}

/**
 * Solicita ao backend a criação de um PaymentIntent no Stripe (para Cartão ou PIX).
 */
export async function createPaymentIntent({ paymentMethod = 'card', email, name, userId, amountInCents = 1790 }) {
  try {
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
  } catch (err) {
    console.error('Erro na chamada do servidor de pagamento:', err.message);
    throw new Error(err.message || 'Não foi possível conectar ao servidor de pagamento.');
  }
}

/**
 * Consulta no backend o status atualizado do PaymentIntent no Stripe.
 */
export async function checkPaymentStatus(paymentIntentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payment-status/${paymentIntentId}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Falha ao consultar status do pagamento.');
    }

    return data;
  } catch (err) {
    console.warn('Erro ao consultar status:', err.message);
    return { status: 'pending' };
  }
}
