-- ========================================================
-- ESQUEMA DO SUPABASE COM ROW LEVEL SECURITY (RLS) - AURA PRO
-- ========================================================

-- 1. TABELA DE PERFIS DE USUÁRIO (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    is_pro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITA RLS RIGOROSO NA TABELA PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE RLS PARA PROFILES
CREATE POLICY "Usuários podem visualizar apenas seu próprio perfil" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Sistema pode inserir perfil na criação de conta" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);


-- 2. TABELA DE COMPRAS E ASSINATURAS (USER_PURCHASES)
CREATE TABLE IF NOT EXISTS public.user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT,
    stripe_session_id TEXT,
    amount_paid NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'brl',
    status TEXT DEFAULT 'completed',
    plan_type TEXT DEFAULT 'lifetime_access',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- HABILITA RLS RIGOROSO NA TABELA USER_PURCHASES
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE RLS PARA USER_PURCHASES
CREATE POLICY "Usuários podem visualizar apenas suas próprias compras" 
    ON public.user_purchases FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem registrar suas compras" 
    ON public.user_purchases FOR INSERT 
    WITH CHECK (auth.uid() = user_id);


-- 3. TABELA DE PROGRESSO DE LEITURA (USER_PROGRESS)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    module_id TEXT NOT NULL,
    progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    last_read_chapter INT DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, module_id)
);

-- HABILITA RLS RIGOROSO NA TABELA USER_PROGRESS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE RLS PARA USER_PROGRESS
CREATE POLICY "Usuários podem ler seu próprio progresso" 
    ON public.user_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso" 
    ON public.user_progress FOR ALL 
    USING (auth.uid() = user_id);


-- 4. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE AO REGISTRAR NO AUTH DO SUPABASE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, is_pro)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ACIONADOR DA TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
