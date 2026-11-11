-- ==============================================================================
-- MIGRATION V5: Automação de E-mails
-- Executar no SQL Editor do Supabase APÓS migration_v4.sql
-- ==============================================================================

-- 1. Adicionar colunas para rastreamento de e-mails em ticket_orders
ALTER TABLE public.ticket_orders 
  ADD COLUMN IF NOT EXISTS email_status TEXT NOT NULL DEFAULT 'pendente' 
  CHECK (email_status IN ('pendente', 'enviado', 'falha'));

ALTER TABLE public.ticket_orders 
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;

-- 2. Índices de performance para relatórios do admin
CREATE INDEX IF NOT EXISTS idx_ticket_orders_email_status ON public.ticket_orders(email_status);
