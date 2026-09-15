-- ==============================================================================
-- MIGRATION V2: Sistema de Ingressos + QR Code + Portaria
-- Executar no SQL Editor do Supabase APÓS o schema.sql original
-- ==============================================================================

-- 1. Adicionar coluna qr_token (token público legível para QR Code)
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS qr_token TEXT;

-- Criar índice único para qr_token (ignora NULLs de registros antigos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_tickets_qr_token_unique
ON public.event_tickets(qr_token)
WHERE qr_token IS NOT NULL;

-- 2. Adicionar coluna validado_por (quem confirmou a entrada)
ALTER TABLE public.event_tickets ADD COLUMN IF NOT EXISTS validado_por TEXT;

-- 3. Expandir status CHECK constraint para incluir 'bloqueado'
ALTER TABLE public.event_tickets DROP CONSTRAINT IF EXISTS event_tickets_status_check;
ALTER TABLE public.event_tickets ADD CONSTRAINT event_tickets_status_check
  CHECK (status IN ('valido', 'usado', 'cancelado', 'bloqueado'));

-- 4. Atualizar função atômica consume_event_ticket para incluir validado_por
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
    validado_por TEXT
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
              status, criado_em, usado_em, validado_por;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_event_ticket(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_event_ticket(TEXT, TEXT) TO service_role;

-- 5. Função atômica alternativa: consumir por qr_token diretamente
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
    validado_por TEXT
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
              status, criado_em, usado_em, validado_por;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_ticket_by_qr(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ticket_by_qr(TEXT, TEXT) TO service_role;

-- 6. Policy: permitir leitura pública limitada por qr_token (para /ingresso/{token})
CREATE POLICY "anon_select_by_qr_token"
ON public.event_tickets FOR SELECT
TO anon
USING (qr_token IS NOT NULL);
