import * as crypto from 'crypto';

export interface MpSignatureValidationParams {
  xSignatureHeader?: string;
  xRequestIdHeader?: string;
  dataId: string;
  webhookSecret: string;
}

export interface MpSignatureResult {
  isValid: boolean;
  reason?: string;
  extractedTs?: string;
  expectedHash?: string;
  receivedHash?: string;
}

/**
 * Validação rigorosa de assinatura HMAC-SHA256 do Mercado Pago Webhooks.
 *
 * Formato do header x-signature:
 * ts=1710000000,v1=a1b2c3d4e5f6...
 *
 * Manifest gerado para hashing:
 * id:{data.id};request-id:{x-request-id};ts:{ts};
 */
export function validateMercadoPagoSignature(
  params: MpSignatureValidationParams,
): MpSignatureResult {
  const { xSignatureHeader, xRequestIdHeader, dataId, webhookSecret } = params;

  if (!xSignatureHeader) {
    return { isValid: false, reason: 'Header x-signature ausente' };
  }

  if (!webhookSecret || webhookSecret === 'TEST_WEBHOOK_SECRET_PLACEHOLDER') {
    // Quando em ambiente de desenvolvimento sem segredo configurado, avisa mas não quebra se for simulação local
    return {
      isValid: true,
      reason: 'Aviso: MP_WEBHOOK_SECRET não configurado ou em modo placeholder de desenvolvimento.',
    };
  }

  // Extrai ts e v1
  let ts: string | undefined;
  let receivedHash: string | undefined;

  const parts = xSignatureHeader.split(',');
  for (const part of parts) {
    const [key, value] = part.trim().split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') receivedHash = value;
  }

  if (!ts || !receivedHash) {
    return { isValid: false, reason: 'Header x-signature inválido (ts ou v1 ausentes)' };
  }

  // Monta a string no formato exato da documentação do Mercado Pago:
  // "id:{data.id};request-id:{x-request-id};ts:{ts};"
  const manifest = `id:${dataId};request-id:${xRequestIdHeader || ''};ts:${ts};`;

  const expectedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex');

  // Comparação em tempo constante para evitar timing attacks
  const receivedBuffer = Buffer.from(receivedHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return {
      isValid: false,
      reason: 'Assinatura x-signature não confere com o cálculo HMAC',
      extractedTs: ts,
      expectedHash,
      receivedHash,
    };
  }

  const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);

  return {
    isValid,
    reason: isValid ? undefined : 'Assinatura x-signature não confere com o cálculo HMAC',
    extractedTs: ts,
    expectedHash,
    receivedHash,
  };
}
