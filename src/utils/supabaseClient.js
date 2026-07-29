import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidSupabase = rawUrl && !rawUrl.includes('seu-projeto') && !rawUrl.includes('placeholder') && rawUrl.startsWith('https://');

const supabaseUrl = isValidSupabase ? rawUrl : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = isValidSupabase ? rawKey : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isValidSupabase,
    autoRefreshToken: isValidSupabase,
    detectSessionInUrl: false
  }
});

/**
 * Consulta o perfil do usuário logado diretamente da tabela 'profiles' no Supabase.
 * O status VIP (is_pro) é derivado estritamente do banco de dados.
 */
export const getCurrentProfile = async () => {
  if (!isValidSupabase) {
    return null;
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return { 
        id: authData.user.id, 
        email: authData.user.email, 
        full_name: authData.user.user_metadata?.full_name || authData.user.email.split('@')[0], 
        is_pro: false 
      };
    }

    return profile;
  } catch (err) {
    console.warn('Erro ao consultar perfil no Supabase:', err.message);
    return null;
  }
};
