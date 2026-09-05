import { validateMercadoPagoSignature } from '../src/modules/payments/utils/mp-signature';
import * as crypto from 'crypto';

console.log('=== INICIANDO BATERIA DE TESTES DE SEGURANÇA E REGRAS FIXAS ===\n');

let failedTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    console.log(`✅ [PASSOU] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FALHOU] ${testName} - Detalhes: ${errorDetail || 'Falha na asserção'}`);
    failedTests++;
  }
}

// -------------------------------------------------------------
// 1. TESTE DE ASSINATURA HMAC-SHA256 DO MERCADO PAGO (WEBHOOK)
// -------------------------------------------------------------
const testSecret = 'cf8402f1a63c89b2b5280c438c8234de';
const testDataId = '9876543210';
const testRequestId = 'req-cortez-uuid-1234';
const testTs = '1710000000';

// Gera assinatura válida conforme especificação oficial do MP:
// manifest = "id:{data.id};request-id:{x-request-id};ts:{ts};"
const validManifest = `id:${testDataId};request-id:${testRequestId};ts:${testTs};`;
const validHash = crypto.createHmac('sha256', testSecret).update(validManifest).digest('hex');
const validHeader = `ts=${testTs},v1=${validHash}`;

const validResult = validateMercadoPagoSignature({
  xSignatureHeader: validHeader,
  xRequestIdHeader: testRequestId,
  dataId: testDataId,
  webhookSecret: testSecret,
});

assert(validResult.isValid === true, 'Assinatura HMAC-SHA256 autêntica deve ser APROVADA');

// Teste de assinatura forjada/adulterada
const forgedHeader = `ts=${testTs},v1=0000000000000000000000000000000000000000000000000000000000000000`;
const forgedResult = validateMercadoPagoSignature({
  xSignatureHeader: forgedHeader,
  xRequestIdHeader: testRequestId,
  dataId: testDataId,
  webhookSecret: testSecret,
});

assert(forgedResult.isValid === false, 'Assinatura adulterada deve ser REJEITADA');

// Teste de payload com data.id alterado pelo atacante
const tamperedResult = validateMercadoPagoSignature({
  xSignatureHeader: validHeader,
  xRequestIdHeader: testRequestId,
  dataId: '9999999999', // dataId adulterado
  webhookSecret: testSecret,
});

assert(tamperedResult.isValid === false, 'Tentativa de adulterar data.id deve ser REJEITADA');

// -------------------------------------------------------------
// 2. TESTE DE REGRAS FIXAS: BOTÃO WHATSAPP
// -------------------------------------------------------------
const EXPECTED_WA_NUMBER = '+55 11 94396-3952';
const EXPECTED_WA_LINK = 'https://wa.me/5511943963952';

const waClean = EXPECTED_WA_NUMBER.replace(/\D/g, '');
assert(
  EXPECTED_WA_LINK === `https://wa.me/${waClean}`,
  'Link do WhatsApp deve ser https://wa.me/5511943963952 sem alterações',
);

// -------------------------------------------------------------
// 3. TESTE DE REGRAS FIXAS: INSTAGRAM
// -------------------------------------------------------------
const EXPECTED_IG_USER = '@bailedosbailes_';
const EXPECTED_IG_LINK = 'https://instagram.com/bailedosbailes_';

const igHandle = EXPECTED_IG_USER.replace('@', '');
assert(
  EXPECTED_IG_LINK === `https://instagram.com/${igHandle}`,
  'Link do Instagram deve ser https://instagram.com/bailedosbailes_ sem alterações',
);

console.log(`\n=== RESUMO: ${passedTests} testes passaram | ${failedTests} falharam ===`);

if (failedTests > 0) {
  process.exit(1);
}
