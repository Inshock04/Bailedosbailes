-- ==============================================================================
-- MIGRATION V3: Tipo de Ingresso (OPEN BAR / PÓS-OPEN)
-- Executar no SQL Editor do Supabase APÓS migration_v2.sql
-- ==============================================================================

-- 1. Adicionar coluna tipo_ingresso (default OPEN_BAR para retrocompatibilidade)
ALTER TABLE public.event_tickets
  ADD COLUMN IF NOT EXISTS tipo_ingresso TEXT NOT NULL DEFAULT 'OPEN_BAR';

-- 2. Constraint CHECK para garantir apenas valores válidos
ALTER TABLE public.event_tickets DROP CONSTRAINT IF EXISTS event_tickets_tipo_ingresso_check;
ALTER TABLE public.event_tickets ADD CONSTRAINT event_tickets_tipo_ingresso_check
  CHECK (tipo_ingresso IN ('OPEN_BAR', 'POS_OPEN'));

-- 3. Atualizar função atômica consume_event_ticket para incluir tipo_ingresso no retorno
CREATE OR REPLACE FUNCTION public.consume_event_ticket(p_token_hash TEXT, p_validado_por TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    codigo TEXT,
    qr_token TEXT,
    nome TEXT,
    telefone TEXT,
    email TEXT,
    item TEXT,
    categoria TEXT,
    preco NUMERIC,
    lote TEXT,
    status TEXT,
    criado_em TIMESTAMPTZ,
    usado_em TIMESTAMPTZ,
    validado_por TEXT,
    tipo_ingresso TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.event_tickets
       SET status = 'usado',
           usado_em = now(),
           validado_por = COALESCE(p_validado_por, 'portaria')
     WHERE token_hash = p_token_hash
       AND status = 'valido'
    RETURNING id, codigo, qr_token, nome, telefone, email, item, categoria, preco, lote,
              status, criado_em, usado_em, validado_por, tipo_ingresso;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_event_ticket(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_event_ticket(TEXT, TEXT) TO service_role;

-- 4. Atualizar função consume_ticket_by_qr para incluir tipo_ingresso
CREATE OR REPLACE FUNCTION public.consume_ticket_by_qr(p_qr_token TEXT, p_validado_por TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    codigo TEXT,
    qr_token TEXT,
    nome TEXT,
    telefone TEXT,
    email TEXT,
    item TEXT,
    categoria TEXT,
    preco NUMERIC,
    lote TEXT,
    status TEXT,
    criado_em TIMESTAMPTZ,
    usado_em TIMESTAMPTZ,
    validado_por TEXT,
    tipo_ingresso TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.event_tickets
       SET status = 'usado',
           usado_em = now(),
           validado_por = COALESCE(p_validado_por, 'portaria')
     WHERE qr_token = p_qr_token
       AND status = 'valido'
    RETURNING id, codigo, qr_token, nome, telefone, email, item, categoria, preco, lote,
              status, criado_em, usado_em, validado_por, tipo_ingresso;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_ticket_by_qr(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ticket_by_qr(TEXT, TEXT) TO service_role;
