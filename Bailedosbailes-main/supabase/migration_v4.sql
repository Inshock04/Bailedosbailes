-- ==============================================================================
-- MIGRATION V4: Tabela de Pedidos (Orders)
-- Executar no SQL Editor do Supabase APÓS migration_v3.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    ticket_type TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    seller_ref TEXT,
    payment_status TEXT NOT NULL DEFAULT 'aguardando_pagamento',
    mp_preference_id TEXT,
    mp_payment_id TEXT,
    mp_payment_link TEXT,
    access_token TEXT UNIQUE,
    tickets_generated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar chaves estrangeiras e coluna vendedor aos ingressos
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.ticket_orders(id);
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS vendedor TEXT;

-- Habilitar RLS
ALTER TABLE public.ticket_orders ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso: apenas o service_role (backend) acessa.
DROP POLICY IF EXISTS "service_role_all_ticket_orders" ON public.ticket_orders;
CREATE POLICY "service_role_all_ticket_orders"
ON public.ticket_orders FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
