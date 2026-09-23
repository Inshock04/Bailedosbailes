import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server'; // Express App
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Define secrets that might not exist in local .env
process.env.MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || 'test_secret';

// Mock do Supabase para não sujar o banco de produção
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: () => ({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn((cb) => cb({ data: { id: 'mocked-id' }, error: null })),
      })),
    }),
  };
});

describe('Baile dos Bailes - QA Test Suite', () => {
  describe('1. Autenticação Admin', () => {
    it('Deve rejeitar login com credenciais inválidas (Cenário Negativo)', async () => {
      const res = await request(app).post('/api/admin/login').send({
        login: 'wronguser',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('Deve aceitar login com credenciais válidas e retornar JWT (Cenário Positivo)', async () => {
      const res = await request(app).post('/api/admin/login').send({
        login: process.env.ADMIN_USER || 'admin',
        password: process.env.ADMIN_KEY || 'cortez2026',
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('2. Validação da Portaria', () => {
    it('Deve retornar erro se o token estiver ausente (Cenário Negativo)', async () => {
      // Como o endpoint é protegido por Admin Auth, devemos passar o header
      const loginRes = await request(app).post('/api/admin/login').send({
        login: process.env.ADMIN_USER || 'admin',
        password: process.env.ADMIN_KEY || 'cortez2026',
      });
      const token = loginRes.body.token;

      const res = await request(app)
        .post('/api/checkin/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      // O código de erro pode variar, mas não deve ser 200 sucesso
      expect(res.status).not.toBe(200);
    });

    it('Deve tentar validar um ticket simulado', async () => {
      const loginRes = await request(app).post('/api/admin/login').send({
        login: process.env.ADMIN_USER || 'admin',
        password: process.env.ADMIN_KEY || 'cortez2026',
      });
      const token = loginRes.body.token;

      const res = await request(app)
        .post('/api/checkin/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'FAKE-QR-DATA' });
      
      // Retornará erro 400/404 pois a base em memória do server.ts está vazia/ou código inválido
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('3. Webhook Mercado Pago (Segurança)', () => {
    it('Deve rejeitar notificação sem assinatura X-Signature', async () => {
      const res = await request(app).post('/api/webhooks/mercadopago').send({
        type: 'payment',
        data: { id: '12345' },
      });
      // A proteção do webhook precisa bloquear (Unauthorized ou Bad Request)
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('Deve validar a assinatura e processar (Simulação)', async () => {
      const ts = Date.now();
      const secret = process.env.MP_WEBHOOK_SECRET || 'test_secret';
      const manifest = `id:12345;request-id:test-req;ts:${ts};`;
      const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
      const signature = `ts=${ts},v1=${hmac}`;

      // Envia evento genérico. Como o Supabase e fetch estão mockados/bloqueados no ambiente de teste,
      // devemos ver como o server reage.
      const res = await request(app)
        .post('/api/webhooks/mercadopago')
        .set('x-signature', signature)
        .set('x-request-id', 'test-req')
        .send({
          type: 'payment',
          data: { id: '12345' },
        });

      // No modo teste, o fetch para a API do MP falhará e retornará erro de verificação,
      // o que é um cenário negativo excelente!
      expect(res.status).toBe(200); // O webhook aceita a notificação (ack)
    });
  });
});
