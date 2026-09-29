-- ============================================================
-- MIGRATION V6: Tabela de Vendedores (Sellers / Links de Referência)
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Criar tabela de vendedores
CREATE TABLE IF NOT EXISTS sellers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índice para busca rápida por slug (usado na validação do link)
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON sellers (slug);

-- 3. Índice para busca por vendedor na tabela de ingressos
-- (a coluna 'vendedor' já deve existir em event_tickets, adicionada em migrations anteriores)
CREATE INDEX IF NOT EXISTS idx_event_tickets_vendedor ON event_tickets (vendedor);

-- 4. Inserir vendedor padrão (se ainda não existir)
INSERT INTO sellers (id, name, slug, created_at)
VALUES ('s-1', 'Rafael', 'rafael', now())
ON CONFLICT (id) DO NOTHING;

-- 5. Se a coluna 'vendedor' não existir em event_tickets, adicionar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'event_tickets' AND column_name = 'vendedor'
  ) THEN
    ALTER TABLE event_tickets ADD COLUMN vendedor TEXT;
  END IF;
END $$;

-- 6. Se a coluna 'seller_ref' não existir em ticket_orders, adicionar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_orders' AND column_name = 'seller_ref'
  ) THEN
    ALTER TABLE ticket_orders ADD COLUMN seller_ref TEXT;
  END IF;
END $$;
