import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Este script simula requisições para o Webhook do Mercado Pago localmente (ou no servidor).
const WEBHOOK_URL = process.env.TEST_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/mercadopago';
const SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SECRET || 'test_secret';

async function sendWebhook(body: any, headers: any = {}, query: string = '') {
  const url = `${WEBHOOK_URL}${query ? '?' + query : ''}`;
  console.log(`\n[Teste] Enviando requisição para: ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    console.log(`[Resultado] HTTP ${res.status}: ${text}`);
    return res.status;
  } catch (err: any) {
    console.error(`[Erro] Falha ao enviar requisição: ${err.message}`);
    return 500;
  }
}

function generateSignature(dataId: string, requestId: string, ts: string) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  return crypto.createHmac('sha256', SECRET).update(manifest).digest('hex');
}

async function runTests() {
  console.log('--- INICIANDO TESTES DO WEBHOOK ---');
  console.log(`Usando SECRET: ${SECRET.substring(0, 5)}...`);

  // 1. Simulação IPN (Deve ser ignorada com 200 OK silencioso)
  await sendWebhook({}, {}, 'topic=payment&id=999999999');

  // 2. Simulação ID 123456 (Webhook de teste padrão do painel MP)
  const tsSim = Math.floor(Date.now() / 1000).toString();
  const requestIdSim = 'req-sim';
  const v1Sim = generateSignature('123456', requestIdSim, tsSim);
  await sendWebhook(
    { type: 'payment', data: { id: '123456' } },
    { 'x-signature': `ts=${tsSim},v1=${v1Sim}`, 'x-request-id': requestIdSim }
  );

  // 3. Webhook com Assinatura Inválida
  await sendWebhook(
    { type: 'payment', data: { id: '777777777' } }, 
    { 'x-signature': 'ts=123,v1=badhash', 'x-request-id': 'req-1' }
  );

  // 4. Webhook com Assinatura Válida (Mas ID que não existe na API vai dar Payment not found)
  const ts = Math.floor(Date.now() / 1000).toString();
  const requestId = 'req-valid';
  const dataId = '888888888';
  const v1 = generateSignature(dataId, requestId, ts);
  await sendWebhook(
    { type: 'payment', data: { id: dataId } },
    { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId }
  );

  console.log('\n--- TESTES CONCLUÍDOS ---');
}

runTests();
