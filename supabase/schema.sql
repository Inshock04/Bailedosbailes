-- ==============================================================================
-- SCHEMA SUPABASE: HOTEL CORTEZ HALLOWEEN 2026 (THE TRIPLEX)
-- PROJETO ID: upijucscuvnxeqdetrhm
-- ==============================================================================

-- 1. Tabela: guest_list (Lista VIP de Convidados RSVP)
CREATE TABLE IF NOT EXISTS public.guest_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    token TEXT UNIQUE,
    event_name TEXT DEFAULT 'Halloween Party Hotel Cortez 2026',
    status TEXT DEFAULT 'CONFIRMADO',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_guest_list_phone ON public.guest_list(phone);
CREATE INDEX IF NOT EXISTS idx_guest_list_token ON public.guest_list(token);

-- 2. Tabela: contacts (Mensagens e Dúvidas enviadas pelo site)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela: coupons (Cupons de Promoção do Oráculo de Cartas)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    reward_title TEXT NOT NULL,
    reward_value TEXT NOT NULL,
    phone TEXT NOT NULL,
    user_name TEXT DEFAULT 'Visitante do Cortez',
    status TEXT DEFAULT 'ATIVO',
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_coupons_phone ON public.coupons(phone);
CREATE INDEX IF NOT EXISTS idx_coupons_token ON public.coupons(token);

-- ==============================================================================
-- 4. Habilitar Row Level Security (RLS) em TODAS as tabelas
-- ==============================================================================
ALTER TABLE public.guest_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. POLÍTICAS DE SEGURANÇA RESTRITIVAS
--    - Apenas a service_role (backend) pode INSERIR e LER dados.
--    - Requisições anônimas (anon key) NÃO podem acessar dados diretamente.
--    - Todo acesso passa obrigatoriamente pelo backend (server.ts).
-- ==============================================================================

-- Drop políticas antigas permissivas (se existirem)
DROP POLICY IF EXISTS "Permitir inserção anônima na lista VIP" ON public.guest_list;
DROP POLICY IF EXISTS "Permitir leitura da lista VIP para service role" ON public.guest_list;
DROP POLICY IF EXISTS "Permitir envio anônimo de mensagens de contato" ON public.contacts;
DROP POLICY IF EXISTS "Permitir leitura de contatos para service role" ON public.contacts;
DROP POLICY IF EXISTS "Permitir inserção e leitura de cupons" ON public.coupons;

-- Guest List: Apenas service_role pode inserir e ler
CREATE POLICY "service_role_insert_guest_list"
ON public.guest_list FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "service_role_select_guest_list"
ON public.guest_list FOR SELECT
TO service_role
USING (true);

-- Contacts: Apenas service_role pode inserir e ler
CREATE POLICY "service_role_insert_contacts"
ON public.contacts FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "service_role_select_contacts"
ON public.contacts FOR SELECT
TO service_role
USING (true);

-- Coupons: Apenas service_role pode inserir, ler e atualizar
CREATE POLICY "service_role_all_coupons"
ON public.coupons FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
