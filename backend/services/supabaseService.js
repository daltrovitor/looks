import { supabaseAdmin } from '../config/supabase.js';

/**
 * Libera o acesso VIP e registra a transação no Supabase após confirmação de pagamento pelo Stripe Webhook.
 */
export async function fulfillPayment({ userId, email, paymentIntentId, amount, paymentMethod, customerId }) {
  console.log(`[SUPABASE SERVICE] Processando liberação VIP para: email=${email}, userId=${userId}, paymentIntentId=${paymentIntentId}`);

  try {
    let targetUserId = userId;

    // Se o userId não for fornecido diretamente, busca o perfil pelo e-mail
    if (!targetUserId && email) {
      const { data: userByEmail } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userByEmail?.id) {
        targetUserId = userByEmail.id;
      }
    }

    // 1. Atualiza o status do perfil para is_pro = true
    if (targetUserId) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          is_pro: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId);

      if (profileError) {
        console.error('[SUPABASE SERVICE] Erro ao atualizar perfil para is_pro:', profileError);
      } else {
        console.log(`[SUPABASE SERVICE] Sucesso: Perfil ${targetUserId} promovido a VIP (is_pro = true).`);
      }

      // 2. Insere o registro em user_purchases
      const { error: purchaseError } = await supabaseAdmin
        .from('user_purchases')
        .insert({
          user_id: targetUserId,
          stripe_customer_id: customerId || null,
          stripe_payment_intent: paymentIntentId || null,
          amount_paid: amount ? (amount / 100) : 17.90,
          currency: 'brl',
          status: 'completed',
          plan_type: 'lifetime_access',
          payment_method: paymentMethod || 'stripe'
        });

      if (purchaseError) {
        console.error('[SUPABASE SERVICE] Erro ao registrar user_purchases:', purchaseError);
      } else {
        console.log(`[SUPABASE SERVICE] Sucesso: Registro de compra salvo na tabela user_purchases.`);
      }
    } else {
      console.warn(`[SUPABASE SERVICE] Usuário não encontrado no Supabase para o e-mail: ${email}. O acesso VIP será sincronizado no primeiro login.`);
    }
  } catch (err) {
    console.error('[SUPABASE SERVICE] Exceção durante atendimento do pagamento:', err);
  }
}
