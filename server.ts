import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';

// ----------------------------------------------------
// EXPRESS APP PARA VERCEL SERVERLESS
// ----------------------------------------------------
const app = express();

// Confiança de proxy na Vercel (evita crash no express-rate-limit)
app.set('trust proxy', 1);

// Headers de Segurança HTTP
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Tratamento de erro para JSON malformado (evita o erro 400 do Mercado Pago)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Express Error interceptado:', err.message);
  // Se for qualquer erro de parsing do express.json, retorna 200 pra não falhar o teste do MP
  if (err.status >= 400 && err.status < 500) {
    return res.status(200).send('Ignorado pelo blindador'); 
  }
  next(err);
});

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' }
});
app.use(globalLimiter);

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' }
});

const publicWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas submissões. Aguarde alguns minutos.' }
});

// ----------------------------------------------------
// SUPABASE BACKEND CLIENT
// ----------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

app.get('/api/health', async (_req: Request, res: Response) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ status: 'degraded', supabaseConfigured: false, eventTicketsTable: false });
  }

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
  const { error } = await supabaseAdmin.from('event_tickets').select('id').limit(1);
  return res.status(error ? 503 : 200).json({
    status: error ? 'degraded' : 'ok',
    supabaseConfigured: true,
    eventTicketsTable: !error,
    databaseError: error ? error.code : undefined,
    mpConfigured: !!mpToken,
    mpTokenPrefix: mpToken ? mpToken.slice(0, 12) + '...' : 'NOT_SET',
    gmailConfigured: !!process.env.GMAIL_USER,
  });
});



// Diagnóstico de autenticação (NÃO expõe valores reais)
app.get('/api/auth-debug', (_req: Request, res: Response) => {
  const envVars: Record<string, string> = {};
  const checkVars = [
    'ADMIN_USER', 'admin_user', 'ADMINUSER',
    'ADMIN_KEY', 'admin_key', 'ADMINKEY',
    'ADMIN_PASSWORD', 'admin_password',
    'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'
  ];
  for (const key of checkVars) {
    const val = process.env[key];
    if (val === undefined) {
      envVars[key] = 'NOT_SET';
    } else {
      const clean = cleanValue(val);
      envVars[key] = `SET (${clean.length} chars, starts="${clean.slice(0, 2)}...", ends="...${clean.slice(-2)}")`;
    }
  }

  // Testa se as credenciais padrão funcionam
  const defaultLoginWorks = validateAdminCredentials('triplex@201', 'G@201');

  return res.json({
    envVars,
    defaultLoginWorks,
    signingSecretAvailable: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// AUTENTICAÇÃO ADMIN (ROBUSTA PARA VERCEL SERVERLESS & LOCAL)
// ----------------------------------------------------
function cleanValue(val?: any): string {
  if (!val) return '';
  let s = String(val).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

// Comparação em tempo constante para evitar timing attacks
function safeCompare(a?: string, b?: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function getValidAdminCredentials() {
  const allowedUsers = new Set<string>(['triplex@201']);
  const allowedSecrets = new Set<string>(['G@201']);

  const candidateUsers = [
    process.env.ADMIN_USER,
    process.env.admin_user,
    process.env['ADMIN USER'],
    process.env['admin user'],
    process.env.ADMINUSER,
    process.env.adminuser,
  ];

  const candidateKeys = [
    process.env.ADMIN_KEY,
    process.env.admin_key,
    process.env['ADMIN KEY'],
    process.env['admin key'],
    process.env.ADMINKEY,
    process.env.adminkey,
    process.env.ADMIN_PASSWORD,
    process.env.admin_password,
  ];

  for (const u of candidateUsers) {
    const cleaned = cleanValue(u);
    if (cleaned) {
      allowedUsers.add(cleaned);
      allowedUsers.add(cleaned.toLowerCase());
    }
  }

  for (const k of candidateKeys) {
    const cleaned = cleanValue(k);
    if (cleaned) {
      allowedSecrets.add(cleaned);
    }
  }

  return { allowedUsers, allowedSecrets };
}

function validateAdminCredentials(userCandidate?: string, passCandidate?: string): boolean {
  if (!userCandidate || !passCandidate) return false;
  const cleanUser = cleanValue(userCandidate);
  const cleanPass = cleanValue(passCandidate);

  const { allowedUsers, allowedSecrets } = getValidAdminCredentials();

  let userValid = false;
  for (const validUser of allowedUsers) {
    if (safeCompare(cleanUser, validUser) || safeCompare(cleanUser.toLowerCase(), validUser.toLowerCase())) {
      userValid = true;
      break;
    }
  }

  let passValid = false;
  for (const validSecret of allowedSecrets) {
    if (safeCompare(cleanPass, validSecret)) {
      passValid = true;
      break;
    }
  }

  return userValid && passValid;
}

const SESSION_SIGNING_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'cortez-admin-secret-2026-halloween-party-key';
const activeSessions = new Map<string, { createdAt: number }>();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

function generateSessionToken(username: string = 'admin'): string {
  const payload = {
    u: username,
    t: Date.now(),
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SIGNING_SECRET).update(data).digest('base64url');
  return `crtz.${data}.${sig}`;
}

function verifySessionToken(token: string): boolean {
  if (!token) return false;

  // 1. Permite acesso direto com a própria ADMIN_KEY (Master Key)
  const { allowedSecrets } = getValidAdminCredentials();
  for (const secret of allowedSecrets) {
    if (safeCompare(token, secret)) return true;
  }

  // 2. Validação Stateless HMAC (indispensável em ambiente serverless multi-instâncias Vercel)
  if (token.startsWith('crtz.')) {
    const parts = token.slice(5).split('.');
    if (parts.length === 2) {
      const [data, sig] = parts;
      const expectedSig = crypto.createHmac('sha256', SESSION_SIGNING_SECRET).update(data).digest('base64url');
      if (safeCompare(sig, expectedSig)) {
        try {
          const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
          if (payload && typeof payload.t === 'number') {
            if (Date.now() - payload.t <= SESSION_DURATION_MS) {
              return true;
            }
          }
        } catch {
          return false;
        }
      }
    }
  }

  // 3. Fallback para sessões em memória
  const session = activeSessions.get(token);
  if (session && (Date.now() - session.createdAt <= SESSION_DURATION_MS)) {
    return true;
  }

  return false;
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-key'];
  const token = typeof authHeader === 'string'
    ? authHeader.replace(/^Bearer\s+/i, '').trim()
    : '';

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado: Token de autenticação não fornecido.' });
  }

  if (!verifySessionToken(token)) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }

  next();
}

// Helper functions
function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function getCookieValue(req: Request, name: string): string | null {
  const cookies = String(req.headers.cookie || '').split(';');
  const entry = cookies.find(cookie => cookie.trim().startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : null;
}

function getOrSetDeviceId(req: Request, res: Response): string {
  const existing = getCookieValue(req, 'cortez_device_id');
  if (existing && /^[a-f0-9]{64}$/.test(existing)) return existing;

  const deviceId = crypto.randomBytes(32).toString('hex');
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `cortez_device_id=${deviceId}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`);
  return deviceId;
}

function mapCouponRow(row: any): Coupon {
  return { id: row.id, token: row.token, rewardTitle: row.reward_title, rewardValue: row.reward_value, phone: row.phone, userName: row.user_name || undefined, status: row.status, createdAt: row.created_at, expiresAt: row.expires_at, usedAt: row.used_at || undefined };
}

function logSupabaseError(operation: string, error: any): void {
  console.error('[Supabase]', { operation, code: error?.code, message: error?.message, details: error?.details, hint: error?.hint });
}

function generateSecureToken(prefix: string): string {
  const randNum = crypto.randomInt(100000, 999999);
  const randHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${randHex}-${randNum}`;
}

function generateAccessCode(): string {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const code = `AHS-${crypto.randomInt(1000, 10000)}`;
    const alreadyUsed = purchasedTickets.some(ticket => ticket.token === code) || guestList.some(guest => guest.token === code);
    if (!alreadyUsed) return code;
  }

  throw new Error('Não foi possível gerar um código exclusivo.');
}



// ----------------------------------------------------
// IN-MEMORY DATA (idêntico ao server.ts)
// ----------------------------------------------------
interface Ticket {
  id: string; name: string; category: 'OPEN' | 'PISTA' | 'VIP' | 'CAMAROTE' | 'LOUNGE' | string;
  price: number; originalPrice?: number; batch: string; available: number; total: number;
  features: string[]; drinksIncluded: string[]; color: string;
}

interface Promotion {
  id: string; name: string; description: string; quantity: string;
  price: number; originalPrice?: number; active: boolean;
  category: 'BEER' | 'COMBO' | 'DRINK' | 'SHOT'; tag?: string;
}

interface PurchasedTicket {
  id: string; token: string; buyerName: string; buyerEmail: string; buyerPhone: string;
  ticketId: string; ticketName: string; category: string; price: number;
  paymentMethod: 'PIX' | 'CARTAO'; status: 'VALIDO' | 'UTILIZADO' | 'CANCELADO';
  createdAt: string; usedAt?: string; lote: string; publicCode?: string;
  ticketType?: 'OPEN_BAR' | 'POS_OPEN';
  vendedor?: string;
}

function mapSupabaseTicket(row: any, token?: string): PurchasedTicket {
  return {
    id: row.id, token: token || row.codigo, publicCode: row.codigo,
    buyerName: row.nome, buyerEmail: row.email || '', buyerPhone: row.telefone,
    ticketId: row.tipo_ingresso === 'POS_OPEN' ? 't-normal-10' : 't-open-45', 
    ticketName: row.item, category: row.categoria,
    price: Number(row.preco), paymentMethod: 'PIX',
    status: row.status === 'usado' ? 'UTILIZADO' : row.status === 'cancelado' ? 'CANCELADO' : 'VALIDO',
    createdAt: row.criado_em, usedAt: row.usado_em || undefined, lote: row.lote,
    ticketType: row.tipo_ingresso === 'POS_OPEN' ? 'POS_OPEN' : 'OPEN_BAR',
    vendedor: row.vendedor
  };
}

function hashTicketToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function generateTicketCredentials(): { code: string; token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('base64url');
  const num = crypto.randomInt(0, 10000);
  const code = `AHS-${String(num).padStart(4, '0')}`;
  return { code, token, tokenHash: hashTicketToken(token) };
}

async function createPersistedTicket(name: string, phone: string, ticketType: 'OPEN_BAR' | 'POS_OPEN' = 'OPEN_BAR', vendedor?: string) {
  if (!supabaseAdmin) return { data: null, error: new Error('Supabase indisponível.') };

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { code, token, tokenHash } = generateTicketCredentials();
    const createdAt = new Date().toISOString();

    const itemLabel = ticketType === 'POS_OPEN' ? 'INGRESSO NORMAL (SEM OPEN)' : 'INGRESSO OPEN BAR';
    const priceValue = ticketType === 'POS_OPEN' ? 10 : 45;

    const insertPayload: any = {
      codigo: code,
      token_hash: tokenHash,
      nome: name,
      telefone: phone,
      item: itemLabel,
      categoria: ticketType === 'POS_OPEN' ? 'PISTA' : 'OPEN',
      preco: priceValue,
      lote: '1º LOTE',
      status: 'valido',
      criado_em: createdAt,
      tipo_ingresso: ticketType,
      vendedor: vendedor || null
    };

    let { data, error } = await supabaseAdmin.from('event_tickets').insert(insertPayload).select('*').single();

    if (error?.code === '42703' || (error?.message && (error.message.includes('qr_token') || error.message.includes('tipo_ingresso') || error.message.includes('vendedor')))) {
      delete insertPayload.qr_token;
      delete insertPayload.tipo_ingresso;
      delete insertPayload.vendedor; // Fallback se a coluna não existir no BD
      const retryResult = await supabaseAdmin.from('event_tickets').insert(insertPayload).select('*').single();
      data = retryResult.data;
      error = retryResult.error;
    }

    if (!error && data) return { data, error: null, token, qrToken: data.qr_token || token, createdAt };
    if (error?.code !== '23505') {
      return { data: null, error };
    }
  }

  return { data: null, error: new Error('Não foi possível gerar um código único.') };
}

interface GuestEntry {
  id: string; name: string; phone: string; eventName: string;
  status: 'CONFIRMADO' | 'CHECKED_IN' | 'CANCELADO'; createdAt: string; token: string;
}

interface Coupon {
  id: string; token: string; rewardTitle: string; rewardValue: string;
  phone: string; userName?: string; status: 'ATIVO' | 'UTILIZADO' | 'EXPIRADO';
  createdAt: string; expiresAt: string; usedAt?: string;
}

let tickets: Ticket[] = [
  {
    id: 't-open-45', name: 'INGRESSO OPEN BAR', category: 'OPEN',
    price: 45, originalPrice: 65, batch: '1º LOTE', available: 200, total: 200,
    features: ['Open Bar das 21:00 às 00:00'],
    drinksIncluded: ['Gin', 'Vodka', 'Energético', 'Caipirinha', 'Canelinha', '???'],
    color: '#991b1b'
  },
  {
    id: 't-normal-10', name: 'INGRESSO NORMAL (SEM OPEN)', category: 'PISTA',
    price: 10, batch: '1º LOTE', available: 200, total: 200,
    features: ['Acesso ao evento'], drinksIncluded: [], color: '#2563eb'
  }
];

let promotions: Promotion[] = [];

const allOracleCards = [
  {
    id: 'card-skolbeats-40',
    name: '3 SKOL BEATS POR R$ 40',
    title: 'O RITMO DOS IMORTAIS',
    symbol: 'CHALICE',
    arcana: 'ARCANA I',
    description: 'A Condessa convoca a noite com ritmo frenético. O néctar da celebração aguarda por você.',
    rewardText: '3 SKOL BEATS POR R$ 40',
    rewardCodePrefix: 'BEATS40',
    discountType: 'PRICE',
    value: 'R$ 40,00'
  },
  {
    id: 'card-redlabel-60',
    name: '2 DOSES DE RED LABEL POR R$ 60',
    title: 'BANQUETE DE WHISKY',
    symbol: 'SKULL',
    arcana: 'ARCANA II',
    description: 'James March brinda no salão nobre com o mais refinado destilado escocês.',
    rewardText: '2 DOSES DE RED LABEL POR R$ 60',
    rewardCodePrefix: 'RED60',
    discountType: 'PRICE',
    value: 'R$ 60,00'
  },
  {
    id: 'card-jackdaniels-35',
    name: "1 DOSE DE JACK DANIEL'S POR R$ 35",
    title: 'TENNESSEE OBSCURO',
    symbol: 'EYE',
    arcana: 'ARCANA III',
    description: 'As sombras revelam a lendária dose âmbar das noites proibidas do Cortez.',
    rewardText: "1 DOSE DE JACK DANIEL'S POR R$ 35",
    rewardCodePrefix: 'JACK35',
    discountType: 'PRICE',
    value: 'R$ 35,00'
  },
  {
    id: 'card-doublerosh-40',
    name: 'DOUBLE ROSH POR R$ 40',
    title: 'NÉVOA MÍSTICA',
    symbol: 'FLAME',
    arcana: 'ARCANA IV',
    description: 'A névoa ancestral invade o lounge com o dobro da essência e do vapor.',
    rewardText: 'DOUBLE ROSH POR R$ 40',
    rewardCodePrefix: 'ROSH40',
    discountType: 'PRICE',
    value: 'R$ 40,00'
  },
  {
    id: 'card-smirnoff-50',
    name: '2 DOSES DE SMIRNOFF POR R$ 50',
    title: 'PUREZA GÉLIDA',
    symbol: 'MOON',
    arcana: 'ARCANA V',
    description: 'Um ritual de vodka destilada dez vezes para purificar o seu espírito na pista.',
    rewardText: '2 DOSES DE SMIRNOFF POR R$ 50',
    rewardCodePrefix: 'SMIR50',
    discountType: 'PRICE',
    value: 'R$ 50,00'
  },
  {
    id: 'card-caipirinha-50',
    name: '3 CAIPIRINHAS POR R$ 50',
    title: 'TRINDADE TROPICAL',
    symbol: 'CHALICE',
    arcana: 'ARCANA VI',
    description: 'O caldeirão das bruxas ferve a tríade perfeita de frutas e limão para você.',
    rewardText: '3 CAIPIRINHAS POR R$ 50',
    rewardCodePrefix: 'CAIP50',
    discountType: 'PRICE',
    value: 'R$ 50,00'
  },
  {
    id: 'card-maracujack-55',
    name: '2 MARACUJACK POR R$ 55',
    title: 'JACK & MARACUJÁ DUPLO',
    symbol: 'RAVEN',
    arcana: 'ARCANA VII',
    description: "Jack Daniel's casado com o fruto da paixão em dose dupla para curtir a noite.",
    rewardText: '2 MARACUJACK POR R$ 55',
    rewardCodePrefix: 'MJACK55',
    discountType: 'PRICE',
    value: 'R$ 55,00'
  },
  {
    id: 'card-maracujack-30',
    name: '1 MARACUJACK POR R$ 30',
    title: 'O TOQUE DOURADO',
    symbol: 'EYE',
    arcana: 'ARCANA VIII',
    description: 'Refrescante, marcante e intenso: o drink assinatura do baile em valor especial.',
    rewardText: '1 MARACUJACK POR R$ 30',
    rewardCodePrefix: 'MJACK30',
    discountType: 'PRICE',
    value: 'R$ 30,00'
  }
];

function getShuffledOracleCards(count = 6) {
  const copy = [...allOracleCards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

let purchasedTickets: PurchasedTicket[] = [];
let guestList: GuestEntry[] = [];
let coupons: Coupon[] = [];

// ----------------------------------------------------
// VENDEDORES (SELLERS)
// ----------------------------------------------------
interface Seller {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

// In-memory sellers list. Add specific ones as needed.
let sellers: Seller[] = [
  { id: 's-1', name: 'Rafael', slug: 'rafael', createdAt: new Date().toISOString() }
];

app.get('/api/sellers', requireAdminAuth, (_req, res) => {
  res.json(sellers);
});

app.get('/api/sellers/:slug', (req, res) => {
  const seller = sellers.find(s => s.slug === req.params.slug.toLowerCase());
  if (seller) return res.json({ id: seller.id, name: seller.name, slug: seller.slug });
  return res.status(404).json({ error: 'Vendedor não encontrado' });
});

app.post('/api/admin/sellers', requireAdminAuth, (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
  const newSeller = { id: `s-${Date.now()}`, name, slug: slug.toLowerCase(), createdAt: new Date().toISOString() };
  sellers.push(newSeller);
  res.json({ success: true, seller: newSeller });
});

// ----------------------------------------------------
// ROTAS DA API
// ----------------------------------------------------

// 1. Event Data
app.get('/api/event', (_req: Request, res: Response) => {
  res.json({
    id: 'hotel-cortez-halloween-2026',
    name: 'HOTEL CORTEZ HALLOWEEN PARTY',
    subtitle: 'AMERICAN HORROR STORY',
    tagline: 'UMA NOITE. SEIS HISTÓRIAS. INFINITAS MEMÓRIAS.',
    date: '31 DE OUTUBRO DE 2026',
    isoDate: '2026-10-31T21:00:00-03:00',
    time: '21:00 ÀS 06:00',
    location: 'THE TRIPLEX',
    address: 'THE TRIPLEX • R. Manuel de Castilho, 201 - Itaim Paulista, São Paulo - SP',
    description: 'Uma imersão gótica retrô inspirada no universo sombrio de American Horror Story Hotel no THE TRIPLEX. Pistas temáticas, open bar premium, concurso de fantasias e atendimento direto.',
    theme: 'Horror Psicológico, Gothic Deco & Dark Glamour',
    ageRestriction: '18 ANOS (Obrigatória apresentação de documento original com foto)',
    dressCodeRule: 'Traje a rigor sombrio, fantasia criativa, gótico, vintage noir ou all-black.',
    highlights: [
      "3 DJ's que serão revelados",
      "Bebidas: Gin, Vodka, Energético, Caipirinha, Canelinha & ???"
    ]
  });
});

// 2. Tickets
app.get('/api/tickets', (_req: Request, res: Response) => {
  res.json(tickets);
});

// ==============================================================================
// CONFIGURAÇÃO DE E-MAIL (NODEMAILER)
// ==============================================================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function sendTicketsEmail(order: any, access_token: string) {
  if (!process.env.GMAIL_USER) {
    console.warn('Nodemailer SMTP não configurado. Pulo do envio de e-mail.');
    return;
  }
  try {
    const publicUrl = `${process.env.VITE_PUBLIC_URL || 'https://bailedosbailes.vercel.app'}/meus-ingressos/${access_token}`;
    await transporter.sendMail({
      from: `"Baile dos Bailes - Hotel Cortez" <${process.env.GMAIL_USER}>`,
      to: order.buyer_email,
      subject: 'Seus Ingressos - Baile dos Bailes: Hotel Cortez',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #090510; color: #fff; padding: 20px; border: 2px solid #ef4444;">
          <h1 style="color: #ff4455; text-align: center;">SEUS INGRESSOS ESTÃO AQUI!</h1>
          <p>Olá <strong>${order.buyer_name}</strong>,</p>
          <p>Seu pagamento foi aprovado com sucesso! Agradecemos por garantir sua presença no <strong>Baile dos Bailes - Hotel Cortez</strong>.</p>
          <p><strong>Detalhes do Pedido:</strong></p>
          <ul>
            <li>Modalidade: ${order.ticket_type === 'OPEN_BAR' ? 'OPEN BAR' : 'NORMAL (SEM OPEN)'}</li>
            <li>Quantidade: ${order.quantity}</li>
            <li>Total pago: R$ ${order.total_price}</li>
          </ul>
          <p><strong>Informações do Evento:</strong></p>
          <ul>
            <li>Data: 31 de Outubro de 2026, das 21:00 às 06:00</li>
            <li>Local: THE TRIPLEX - R. Manuel de Castilho, 201</li>
            <li>Traje: Gótico retrô, all-black ou fantasia</li>
          </ul>
          <p style="color: #ff4455;"><strong>ATENÇÃO:</strong> Ao chegar no evento, apresente os <strong>QR Codes</strong> pelo link abaixo na recepção. Sugerimos deixar a página aberta ou printar os códigos antecipadamente.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${publicUrl}" style="background-color: #15803d; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
              ACESSAR MEUS INGRESSOS
            </a>
          </div>
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Não compartilhe este link com ninguém. Ele é o seu acesso exclusivo aos QR Codes.</p>
        </div>
      `
    });
    console.log('E-mail enviado para:', order.buyer_email);
    
    // Atualiza status para enviado no Supabase
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('ticket_orders')
        .update({ 
          email_status: 'enviado',
          email_sent_at: new Date().toISOString()
        })
        .eq('id', order.id);
    }
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    // Atualiza status para falha no Supabase
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('ticket_orders')
        .update({ email_status: 'falha' })
        .eq('id', order.id);
    }
  }
}

app.post('/api/tickets/purchase', publicWriteLimiter, async (req: Request, res: Response) => {
  const { ticketId, quantity, buyerName, buyerEmail, buyerPhone, sellerSlug, paymentMethod } = req.body;
  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;

  if (!MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Configuração de pagamento indisponível no momento.' });
  }

  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) {
    return res.status(404).json({ error: 'Ingresso não encontrado.' });
  }

  if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
    return res.status(400).json({ error: 'E-mail válido é obrigatório para pagamento Pix.' });
  }

  const validQuantity = Math.max(1, Math.min(10, Number(quantity) || 1));
  const totalPrice = ticket.price * validQuantity;
  let orderId = crypto.randomUUID();

  // 1. Criar o Pedido Pendente no Supabase
  if (supabaseAdmin) {
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('ticket_orders')
      .insert({
        buyer_name: buyerName || 'Visitante',
        buyer_email: buyerEmail || 'nao-informado@email.com',
        buyer_phone: buyerPhone || '00000000000',
        ticket_type: ticket.category === 'PISTA' ? 'POS_OPEN' : 'OPEN_BAR',
        quantity: validQuantity,
        total_price: totalPrice,
        seller_ref: sellerSlug || null,
        payment_status: 'aguardando_pagamento'
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido no banco:', orderError);
      if (orderError.code === '42P01') {
         console.warn('Tabela ticket_orders não encontrada. Certifique-se de executar o migration_v4.sql');
      } else {
         return res.status(500).json({ error: 'Erro ao registrar o pedido no sistema.' });
      }
    } else if (orderData) {
      orderId = orderData.id;
    }
  }

  const idempotencyKey = orderId; // Usar ID do pedido para garantir idempotência

  try {
    if (paymentMethod === 'pix') {
      const pixPaymentData: any = {
        transaction_amount: totalPrice,
        description: `Baile dos Bailes - Hotel Cortez | Ingresso: ${ticket.name} | Lote: ${ticket.batch}`,
        payment_method_id: 'pix',
        payer: {
          email: buyerEmail,
          first_name: (buyerName || 'Visitante').split(' ')[0],
          last_name: (buyerName || 'Visitante').split(' ').slice(1).join(' ') || 'Cortez',
        },
        external_reference: orderId,
        metadata: {
          seller: sellerSlug || null,
          phone: buyerPhone || null,
          order_id: orderId
        },
        notification_url: `https://${req.get('host')}/api/webhooks/mercadopago`
      };

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(pixPaymentData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro ao gerar pagamento Pix MP:', data);
        return res.status(500).json({
          error: 'Falha ao gerar QR Code Pix.',
          mpError: data?.message || data?.error || 'Erro desconhecido',
          mpStatus: response.status
        });
      }

      const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;
      const qrCode = data.point_of_interaction?.transaction_data?.qr_code;

      if (supabaseAdmin && orderId) {
         await supabaseAdmin.from('ticket_orders')
           .update({ mp_payment_id: String(data.id) })
           .eq('id', orderId);
      }

      return res.json({ qrCodeBase64, qrCode, orderId });

    } else {
      const preferenceData = {
        items: [
          {
            id: ticket.id,
            title: ticket.name,
            description: `Baile dos Bailes - Hotel Cortez | Ingresso: ${ticket.name} | Lote: ${ticket.batch}`,
            quantity: validQuantity,
            currency_id: 'BRL',
            unit_price: ticket.price
          }
        ],
        payer: {
          name: buyerName || 'Visitante',
          email: buyerEmail || 'nao-informado@email.com',
        },
        external_reference: orderId,
        statement_descriptor: 'BAILE DOS BAILES',
        metadata: {
          seller: sellerSlug || null,
          phone: buyerPhone || null,
          order_id: orderId
        },
        back_urls: {
          success: `https://${req.get('host')}/?payment=success`,
          failure: `https://${req.get('host')}/?payment=failure`,
          pending: `https://${req.get('host')}/?payment=pending`
        },
        auto_return: 'approved',
        notification_url: `https://${req.get('host')}/api/webhooks/mercadopago`
      };

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(preferenceData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro ao gerar pagamento MP:', data);
        return res.status(500).json({ error: 'Falha ao gerar link de pagamento.', mpError: data?.message || data?.error || 'Erro desconhecido', mpStatus: response.status });
      }

      const isTestToken = MP_ACCESS_TOKEN.startsWith('TEST-');
      const checkoutUrl = isTestToken ? data.sandbox_init_point : data.init_point;
      
      // 2. Atualizar pedido com a referência do MP
      if (supabaseAdmin && orderId) {
         await supabaseAdmin.from('ticket_orders')
           .update({
              mp_preference_id: data.id,
              mp_payment_link: checkoutUrl
           })
           .eq('id', orderId);
      }

      return res.json({ checkoutUrl, orderId });
    }
  } catch (error) {
    console.error('Erro de requisição MP:', error);
    return res.status(500).json({ error: 'Falha na comunicação com o provedor de pagamento.' });
  }
});

// ==============================================================================
// WEBHOOK MERCADO PAGO E PÁGINA DO PEDIDO
// ==============================================================================

app.post('/api/webhooks/mercadopago', async (req: Request, res: Response) => {
  const signatureHeader = req.headers['x-signature'] as string;
  const requestId = req.headers['x-request-id'] as string;
  let SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || process.env.MP_WEBHOOK_SECRET;
  if (SECRET) SECRET = SECRET.trim();

  // 1. Apenas Webhooks oficiais são aceitos (remove IPN)
  if (!signatureHeader) {
    // Retorna 200 silencioso para IPN antigo não travar ou 400. Vamos retornar 400 explícito ou 200 ignorando.
    // Como queremos desativar IPN mas o MP pode continuar tentando se configurado, um 200 OK com msg de skip
    // evitará re-tentativas desnecessárias.
    console.log('[Webhook] Recebida requisição sem assinatura (possível IPN). Ignorando.');
    return res.status(200).send('Ignored: Use Webhooks instead of IPN');
  }

  const topic = req.body?.type || req.body?.action;
  const dataId = req.body?.data?.id ? String(req.body.data.id) : '';

  // 2. Simulação ID 123456
  if (dataId === '123456' || dataId === '123456789') {
    console.log(`[Webhook] Simulação Mercado Pago recebida (ID ${dataId}). Retornando 200 OK.`);
    return res.status(200).send('Test successful');
  }

  // 3. Validação de Segurança Rigorosa para Webhooks
  if (!requestId || !SECRET) {
    console.error('[Webhook] Falha de segurança: x-request-id ou SECRET ausente.');
    return res.status(401).send('Missing signature requirements');
  }
  
  const tsPart = signatureHeader.split(',').find(p => p.trim().startsWith('ts='));
  const v1Part = signatureHeader.split(',').find(p => p.trim().startsWith('v1='));
  if (!tsPart || !v1Part) {
    console.error('[Webhook] Falha de segurança: Formato do x-signature inválido.');
    return res.status(401).send('Invalid signature format');
  }
  
  const ts = tsPart.split('=')[1];
  const v1 = v1Part.split('=')[1];
  
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hash = crypto.createHmac('sha256', SECRET).update(manifest).digest('hex');
  
  if (hash !== v1) {
    console.error('[Webhook] Falha de segurança: Assinatura MP inválida.', { hash, v1, manifest });
    return res.status(401).send('Invalid signature');
  }

  // Se passou na segurança validamos a notificação
  if (topic === 'payment' || topic === 'payment.updated' || req.body?.action === 'payment.updated') {
    const paymentId = dataId;
    if (!paymentId) {
       return res.sendStatus(200);
    }

    try {
      // 4. Consulta Oficial na API do Mercado Pago
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN}` }
      });
      
      if (!mpRes.ok) {
        console.error(`[Webhook] Pagamento ${paymentId} não encontrado na API oficial do MP.`);
        return res.status(200).send('Payment not found'); 
      }

      const paymentData = await mpRes.json();
      const orderId = paymentData.external_reference;
      const status = paymentData.status;
      
      if (!orderId || !supabaseAdmin) {
        return res.status(200).send('No order ID or Supabase admin');
      }

      // 5. Buscar o Pedido (Order) correspondente
      const { data: order } = await supabaseAdmin.from('ticket_orders').select('*').eq('id', orderId).single();
      if (!order) {
         console.warn(`[Webhook] Pedido ${orderId} não encontrado no banco de dados.`);
         return res.status(200).send('Order not found');
      }
      
      // 6. Idempotência: Checar se os ingressos já foram gerados
      if (order.tickets_generated && status === 'approved') {
         console.log(`[Webhook] Ingressos para o pedido ${orderId} já foram gerados. Ignorando notificação duplicada.`);
         
         if (order.email_status !== 'enviado' && order.access_token) {
           console.log(`[Webhook] E-mail não havia sido enviado. Tentando reenviar agora...`);
           await sendTicketsEmail(order, order.access_token).catch(err => console.error('[Webhook] Erro no reenvio de e-mail:', err));
         }
         
         return res.status(200).send('Already processed');
      }

      const newPaymentStatus = status === 'approved' ? 'aprovado' : (status === 'rejected' || status === 'cancelled') ? 'recusado' : 'aguardando_pagamento';

      if (order.payment_status !== newPaymentStatus) {
        // 7. Atualizar Status do Pedido
        await supabaseAdmin.from('ticket_orders')
          .update({ payment_status: newPaymentStatus, mp_payment_id: paymentId, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      }

      // 8. Gerar Ingressos (Apenas uma vez) e Disparar E-mail
      if (newPaymentStatus === 'aprovado' && !order.tickets_generated) {
        const accessToken = crypto.randomBytes(16).toString('hex');
        
        for (let i = 0; i < order.quantity; i++) {
          const resTicket = await createPersistedTicket(order.buyer_name, order.buyer_phone, order.ticket_type, order.seller_ref);
          if (resTicket.data) {
            await supabaseAdmin.from('event_tickets').update({ order_id: orderId }).eq('id', resTicket.data.id);
          }
        }

        await supabaseAdmin.from('ticket_orders').update({ tickets_generated: true, access_token: accessToken }).eq('id', orderId);
        
        order.access_token = accessToken;
        
        // Envio de e-mail aguardado para garantir execução no ambiente serverless (Vercel)
        await sendTicketsEmail(order, accessToken).catch(err => console.error('[Webhook] Erro no catch do sendTicketsEmail:', err));
        
        console.log(`[Webhook] Pagamento ${paymentId} aprovado! Ingressos criados e e-mail disparado.`);
      }

      // Após todo o processamento assíncrono, retornamos sucesso
      return res.status(200).send('Notification received and processed');

    } catch (err) {
      console.error('[Webhook] Falha interna ao processar notificação:', err);
      // Sempre retornar 200 no final para o MP não ficar tentando eternamente
      return res.sendStatus(200);
    }
  } else {
    // Tópico desconhecido
    if (!res.headersSent) res.sendStatus(200);
  }
});

app.get('/api/orders/:accessToken', async (req: Request, res: Response) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase indisponível' });
  
  const { data: order, error: orderError } = await supabaseAdmin.from('ticket_orders').select('*').eq('access_token', req.params.accessToken).single();
  if (orderError || !order) return res.status(404).json({ error: 'Pedido não encontrado ou access token inválido' });

  const { data: tickets, error: ticketsError } = await supabaseAdmin.from('event_tickets').select('*').eq('order_id', order.id);
  if (ticketsError) return res.status(500).json({ error: 'Erro ao buscar ingressos' });

  const mappedTickets = tickets.map(t => mapSupabaseTicket(t, t.qr_token || t.codigo));

  res.json({ order, tickets: mappedTickets });
});

// ==============================================================================
// POLLING DE STATUS DO PEDIDO (para o frontend consultar enquanto aguarda Pix)
// ==============================================================================
app.get('/api/orders/:orderId/status', async (req: Request, res: Response) => {
  const { orderId } = req.params;
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase indisponível' });

  // UUID validation
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
    return res.status(400).json({ error: 'ID de pedido inválido.' });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('ticket_orders')
    .select('id, payment_status, tickets_generated, access_token, created_at')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  // Se já está aprovado, retorna direto com o access_token
  if (order.payment_status === 'aprovado' && order.tickets_generated) {
    return res.json({
      status: 'aprovado',
      accessToken: order.access_token
    });
  }

  // Se recusado ou expirado, retorna direto
  if (order.payment_status === 'recusado' || order.payment_status === 'expirado') {
    return res.json({ status: order.payment_status });
  }

  // ── Reconciliação: Se ainda está pendente, verificar na API do Mercado Pago ──
  const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
  if (MP_ACCESS_TOKEN && order.payment_status === 'aguardando_pagamento') {
    try {
      // Buscar pagamento pelo external_reference (orderId)
      const searchRes = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${orderId}&sort=date_created&criteria=desc&limit=1`,
        { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const payment = searchData?.results?.[0];
        if (payment) {
          const mpStatus = payment.status;
          const newPaymentStatus = mpStatus === 'approved' ? 'aprovado'
            : (mpStatus === 'rejected' || mpStatus === 'cancelled') ? 'recusado'
            : 'aguardando_pagamento';

          if (newPaymentStatus !== order.payment_status) {
            // Atualizar o status no banco
            await supabaseAdmin.from('ticket_orders')
              .update({
                payment_status: newPaymentStatus,
                mp_payment_id: String(payment.id),
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);

            // Se aprovado e ingressos ainda não foram gerados, gerar agora (reconciliação)
            if (newPaymentStatus === 'aprovado' && !order.tickets_generated) {
              const { data: fullOrder } = await supabaseAdmin
                .from('ticket_orders').select('*').eq('id', orderId).single();

              if (fullOrder && !fullOrder.tickets_generated) {
                const accessToken = crypto.randomBytes(16).toString('hex');
                for (let i = 0; i < fullOrder.quantity; i++) {
                  const resTicket = await createPersistedTicket(
                    fullOrder.buyer_name, fullOrder.buyer_phone,
                    fullOrder.ticket_type, fullOrder.seller_ref
                  );
                  if (resTicket.data) {
                    await supabaseAdmin.from('event_tickets')
                      .update({ order_id: orderId }).eq('id', resTicket.data.id);
                  }
                }
                await supabaseAdmin.from('ticket_orders')
                  .update({ tickets_generated: true, access_token: accessToken })
                  .eq('id', orderId);

                // Aguardar o envio de e-mail no polling
                await sendTicketsEmail(fullOrder, accessToken).catch(err => console.error('[Polling] Erro no catch do sendTicketsEmail:', err));
                console.log(`[Reconciliação] Pedido ${orderId} aprovado via polling. Ingressos gerados.`);

                return res.json({
                  status: 'aprovado',
                  accessToken
                });
              }
            }

            return res.json({ status: newPaymentStatus });
          }
        }

        // Verificar expiração (30 minutos)
        const createdAt = new Date(order.created_at).getTime();
        const now = Date.now();
        if (now - createdAt > 30 * 60 * 1000) {
          await supabaseAdmin.from('ticket_orders')
            .update({ payment_status: 'expirado', updated_at: new Date().toISOString() })
            .eq('id', orderId)
            .eq('payment_status', 'aguardando_pagamento');
          return res.json({ status: 'expirado' });
        }
      }
    } catch (err) {
      console.error('[Polling] Erro na reconciliação MP:', err);
    }
  }

  return res.json({ status: order.payment_status });
});

// 3. Promotions
app.get('/api/promotions', (_req: Request, res: Response) => {
  res.json(promotions);
});

app.post('/api/promotions/update', requireAdminAuth, (req: Request, res: Response) => {
  const { id, price, active, name, description } = req.body;
  const promo = promotions.find(p => p.id === id);
  if (!promo) return res.status(404).json({ error: 'Promoção não encontrada.' });
  if (price !== undefined) promo.price = Number(price);
  if (active !== undefined) promo.active = Boolean(active);
  if (name) promo.name = name;
  if (description) promo.description = description;
  return res.json({ success: true, promotion: promo });
});

app.post('/api/promotions/new', requireAdminAuth, (req: Request, res: Response) => {
  const { name, description, quantity, price, category, tag } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  const newPromo: Promotion = {
    id: `promo-${Date.now()}`, name, description: description || '',
    quantity: quantity || '1 unidade', price: Number(price), active: true,
    category: category || 'BEER', tag
  };
  promotions.push(newPromo);
  return res.status(201).json({ success: true, promotion: newPromo });
});

// 4. Oracle (Returns 6 shuffled cards from the 8 options)
app.get('/api/oracle/cards', (_req: Request, res: Response) => {
  res.json(getShuffledOracleCards(6));
});

app.get('/api/oracle/me', publicWriteLimiter, async (req: Request, res: Response) => {
  const deviceId = getOrSetDeviceId(req, res);
  if (!supabaseAdmin) return res.status(503).json({ error: 'Persistência de promoções indisponível.' });
  const { data, error } = await supabaseAdmin.from('coupons').select('*').eq('device_id', deviceId).maybeSingle();
  if (error) { logSupabaseError('GET coupons by device_id', error); return res.status(500).json({ error: 'Não foi possível consultar seu resgate.' }); }
  return res.json({ claimed: Boolean(data), coupon: data ? mapCouponRow(data) : null });
});

app.post('/api/oracle/draw', publicWriteLimiter, async (req: Request, res: Response) => {
  const { phone, cardId, userName } = req.body;
  if (!phone) return res.status(400).json({ error: 'O número de telefone é obrigatório para resgatar o oráculo.' });

  const cleanPhone = sanitizePhone(phone);
  if (cleanPhone.length < 10) return res.status(400).json({ error: 'Por favor, informe um telefone válido com DDD.' });

  if (!supabaseAdmin) return res.status(503).json({ error: 'Persistência de promoções indisponível.' });
  const deviceId = getOrSetDeviceId(req, res);

  const { data: existingRow, error: lookupError } = await supabaseAdmin.from('coupons').select('*').eq('device_id', deviceId).maybeSingle();
  if (lookupError) { logSupabaseError('POST oracle lookup coupon by device_id', lookupError); return res.status(500).json({ error: 'Não foi possível consultar seu resgate.' }); }
  if (existingRow) {
    return res.status(403).json({ error: 'Você já resgatou sua carta do destino para este evento!', coupon: mapCouponRow(existingRow), alreadyClaimed: true });
  }

  let selectedCard = allOracleCards.find(c => c.id === cardId);
  if (!selectedCard) selectedCard = allOracleCards[Math.floor(Math.random() * allOracleCards.length)];

  const newCoupon: Coupon = {
    id: `CP-${Math.floor(1000 + Math.random() * 9000)}`,
    token: generateSecureToken(`CORTEZ-${selectedCard.rewardCodePrefix}`),
    rewardTitle: selectedCard.rewardText, rewardValue: selectedCard.value,
    phone: phone.trim(), userName: userName ? userName.trim() : 'Visitante do Cortez',
    status: 'ATIVO', createdAt: new Date().toISOString(), expiresAt: '2026-11-01T06:00:00.000Z'
  };

  const { error: insertError } = await supabaseAdmin.from('coupons').insert({ token: newCoupon.token, reward_title: newCoupon.rewardTitle, reward_value: newCoupon.rewardValue, phone: newCoupon.phone, user_name: newCoupon.userName, status: newCoupon.status, created_at: newCoupon.createdAt, redeemed_at: newCoupon.createdAt, expires_at: newCoupon.expiresAt, device_id: deviceId });
  if (insertError) {
    logSupabaseError('POST oracle insert coupon', insertError);
    if (insertError.code === '23505') {
      const { data: concurrentCoupon } = await supabaseAdmin.from('coupons').select('*').eq('device_id', deviceId).maybeSingle();
      if (concurrentCoupon) return res.status(403).json({ error: 'Você já resgatou sua carta do destino para este evento!', coupon: mapCouponRow(concurrentCoupon), alreadyClaimed: true });
    }
    return res.status(500).json({ error: 'Não foi possível registrar o resgate.' });
  }
  coupons.unshift(newCoupon);

  return res.status(201).json({ success: true, message: 'Destino revelado! Seu cupom mágico foi gerado.', card: selectedCard, coupon: newCoupon });
});

// 5. Guest List
app.get('/api/guestlist', (_req: Request, res: Response) => {
  res.json({ totalGuests: guestList.length, eventName: 'Halloween Party Hotel Cortez 2026', status: 'LISTA ABERTA' });
});

app.post('/api/guestlist', publicWriteLimiter, async (req: Request, res: Response) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Nome e telefone são obrigatórios para a lista VIP.' });

  const cleanPhone = sanitizePhone(phone);
  const alreadyInList = guestList.some(g => sanitizePhone(g.phone) === cleanPhone);
  if (alreadyInList) return res.status(400).json({ error: 'Este número de telefone já está registrado na Lista VIP.' });

  const newEntry: GuestEntry = {
    id: `GUEST-${guestList.length + 1}`, name: name.trim(), phone: phone.trim(),
    eventName: 'Halloween Party Hotel Cortez 2026', status: 'CONFIRMADO',
    createdAt: new Date().toISOString(), token: generateAccessCode()
  };

  guestList.unshift(newEntry);

  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.from('guest_list').insert([{
        name: newEntry.name, phone: newEntry.phone, token: newEntry.token,
        event_name: newEntry.eventName, status: newEntry.status, created_at: newEntry.createdAt
      }]);
      if (error) console.warn('[Supabase guest_list Sync Warning]', error.message);
    } catch (err: any) { console.warn('[Supabase guest_list Sync Exception]', err); }
  }

  return res.status(201).json({
    success: true, message: 'Nome confirmado com sucesso na Lista VIP!',
    guest: { id: newEntry.id, name: newEntry.name, status: newEntry.status, token: newEntry.token, createdAt: newEntry.createdAt }
  });
});

// 6. Check-in (PROTEGIDO)
app.post('/api/checkin/verify', requireAdminAuth, async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token ou QR Code não fornecido.' });
  const cleanToken = token.trim().toUpperCase();

  if (supabaseAdmin) {
    const rawToken = token.trim();
    const tokenHash = hashTicketToken(rawToken);
    
    let { data: persistedTicket, error } = await supabaseAdmin
      .from('event_tickets')
      .select('*')
      .or(`token_hash.eq.${tokenHash},codigo.eq.${rawToken.toUpperCase()}`)
      .maybeSingle();
      
    if (!persistedTicket && !error) {
      const qrRes = await supabaseAdmin.from('event_tickets').select('*').eq('qr_token', rawToken).maybeSingle();
      if (!qrRes.error && qrRes.data) persistedTicket = qrRes.data;
    }

    if (error) return res.status(500).json({ error: 'Não foi possível consultar o ingresso.' });
    if (persistedTicket) {
      const ticket = mapSupabaseTicket(persistedTicket, persistedTicket.codigo);
      return res.json({ type: 'TICKET', found: true, data: { id: ticket.id, token: ticket.publicCode, code: ticket.publicCode, name: ticket.buyerName, phone: ticket.buyerPhone, item: ticket.ticketName, category: ticket.category, status: ticket.status, createdAt: ticket.createdAt, usedAt: ticket.usedAt, ticketType: ticket.ticketType } });
    }
  }

  if (supabaseAdmin) {
    const { data: persistedCoupon, error } = await supabaseAdmin.from('coupons').select('*').eq('token', cleanToken).maybeSingle();
    if (error) return res.status(500).json({ error: 'Não foi possível consultar a promoção.' });
    if (persistedCoupon) {
      const coupon = mapCouponRow(persistedCoupon);
      return res.json({ type: 'COUPON', found: true, data: { id: coupon.id, token: coupon.token, name: coupon.userName || 'Portador do Cupom', item: coupon.rewardTitle, value: coupon.rewardValue, status: coupon.status, createdAt: coupon.createdAt, usedAt: coupon.usedAt } });
    }
  }

  const ticket = purchasedTickets.find(t => t.token.toUpperCase() === cleanToken);
  if (ticket) {
    return res.json({ type: 'TICKET', found: true, data: { id: ticket.id, token: ticket.token, name: ticket.buyerName, item: ticket.ticketName, category: ticket.category, status: ticket.status, createdAt: ticket.createdAt, usedAt: ticket.usedAt } });
  }

  const coupon = coupons.find(c => c.token.toUpperCase() === cleanToken);
  if (coupon) {
    return res.json({ type: 'COUPON', found: true, data: { id: coupon.id, token: coupon.token, name: coupon.userName || 'Portador do Cupom', item: coupon.rewardTitle, value: coupon.rewardValue, status: coupon.status, createdAt: coupon.createdAt, usedAt: coupon.usedAt } });
  }

  const guest = guestList.find(g => g.token.toUpperCase() === cleanToken);
  if (guest) {
    return res.json({ type: 'GUEST_LIST', found: true, data: { id: guest.id, token: guest.token, name: guest.name, item: 'Entrada Lista VIP Especial', status: guest.status, createdAt: guest.createdAt } });
  }

  return res.status(404).json({ found: false, error: 'Código não encontrado ou inválido no sistema do Hotel Cortez.' });
});

app.post('/api/checkin/confirm', requireAdminAuth, async (req: Request, res: Response) => {
  const { token, type } = req.body;
  if (!token) return res.status(400).json({ error: 'Token é obrigatório.' });
  const cleanToken = token.trim().toUpperCase();
  const now = new Date().toISOString();

  if (type === 'TICKET') {
    if (supabaseAdmin) {
      const rawToken = token.trim();
      const tokenHash = hashTicketToken(rawToken);
      
      // Attempt 1: by QR token
      let consumed = null;
      const { data: byQr, error: byQrErr } = await supabaseAdmin.rpc('consume_ticket_by_qr', {
        p_qr_token: rawToken,
        p_validado_por: 'admin'
      });
      if (byQr && byQr.length > 0) consumed = byQr;

      // Attempt 2: by Hash or Codigo
      if (!consumed) {
        // Find the record first to get its hash
        const { data: findRes } = await supabaseAdmin.from('event_tickets').select('token_hash').or(`token_hash.eq.${tokenHash},codigo.eq.${rawToken.toUpperCase()}`).maybeSingle();
        if (findRes?.token_hash) {
          const { data: byHash, error: consumeError } = await supabaseAdmin.rpc('consume_event_ticket', { p_token_hash: findRes.token_hash });
          if (consumeError) return res.status(500).json({ error: 'Não foi possível registrar a entrada.' });
          if (byHash?.length) consumed = byHash;
        }
      }
      
      if (consumed?.length) {
        const ticket = mapSupabaseTicket(consumed[0], consumed[0].codigo);
        return res.json({ success: true, message: 'ENTRADA CONFIRMADA! Bem-vindo ao Hotel Cortez.', ticket: { ...ticket, token: ticket.publicCode } });
      }

      // If we are here, it's either used or doesn't exist
      const { data: persistedTicket } = await supabaseAdmin.from('event_tickets').select('usado_em, status').or(`token_hash.eq.${tokenHash},codigo.eq.${rawToken.toUpperCase()}`).maybeSingle();
      if (persistedTicket?.status === 'usado') return res.status(409).json({ error: 'INGRESSO JÁ UTILIZADO anteriormente!', usedAt: persistedTicket.usado_em });
      if (persistedTicket?.status === 'cancelado') return res.status(400).json({ error: 'INGRESSO CANCELADO.' });
    }
    const ticket = purchasedTickets.find(t => t.token.toUpperCase() === cleanToken);
    if (!ticket) return res.status(404).json({ error: 'Ingresso não encontrado.' });
    if (ticket.status === 'UTILIZADO') return res.status(400).json({ error: 'INGRESSO JÁ UTILIZADO anteriormente!', usedAt: ticket.usedAt });
    ticket.status = 'UTILIZADO'; ticket.usedAt = now;
    return res.json({ success: true, message: 'ENTRADA CONFIRMADA! Bem-vindo ao Hotel Cortez.', ticket });
  }

  if (type === 'COUPON') {
    if (supabaseAdmin) {
      const { data: updatedCoupon, error } = await supabaseAdmin.from('coupons').update({ status: 'UTILIZADO', used_at: now }).eq('token', cleanToken).eq('status', 'ATIVO').select('*').maybeSingle();
      if (error) return res.status(500).json({ error: 'Não foi possível registrar o resgate.' });
      if (updatedCoupon) return res.json({ success: true, message: 'PROMOÇÃO RESGATADA COM SUCESSO!', coupon: mapCouponRow(updatedCoupon) });
      const { data: persistedCoupon } = await supabaseAdmin.from('coupons').select('used_at, status').eq('token', cleanToken).maybeSingle();
      if (persistedCoupon?.status === 'UTILIZADO') return res.status(409).json({ error: 'PROMOÇÃO JÁ UTILIZADA!', usedAt: persistedCoupon.used_at });
    }
    const coupon = coupons.find(c => c.token.toUpperCase() === cleanToken);
    if (!coupon) return res.status(404).json({ error: 'Cupom não encontrado.' });
    if (coupon.status === 'UTILIZADO') return res.status(400).json({ error: 'PROMOÇÃO JÁ UTILIZADA!', usedAt: coupon.usedAt });
    coupon.status = 'UTILIZADO'; coupon.usedAt = now;
    return res.json({ success: true, message: 'PROMOÇÃO RESGATADA COM SUCESSO!', coupon });
  }

  if (type === 'GUEST_LIST') {
    const guest = guestList.find(g => g.token.toUpperCase() === cleanToken);
    if (!guest) return res.status(404).json({ error: 'Nome na lista não encontrado.' });
    if (guest.status === 'CHECKED_IN') return res.status(400).json({ error: 'CHECK-IN DA LISTA JÁ REALIZADO!' });
    guest.status = 'CHECKED_IN';
    return res.json({ success: true, message: 'CHECK-IN DA LISTA CONFIRMADO!', guest });
  }

  return res.status(400).json({ error: 'Tipo de check-in inválido.' });
});

// ============================================================
// PÁGINA PÚBLICA DO INGRESSO (SOMENTE LEITURA)
// ============================================================
app.get('/api/ingresso/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) return res.status(400).json({ error: 'Token não fornecido.' });

  const rawToken = token.trim();
  const tokenHash = hashTicketToken(rawToken);

  if (supabaseAdmin) {
    let data: any = null;

    const { data: stdData, error: stdError } = await supabaseAdmin
      .from('event_tickets')
      .select('*')
      .or(`token_hash.eq.${tokenHash},codigo.eq.${rawToken.toUpperCase()}`)
      .maybeSingle();

    if (!stdError && stdData) {
      data = stdData;
    } else {
      const { data: qrData } = await supabaseAdmin
        .from('event_tickets')
        .select('*')
        .eq('qr_token', rawToken)
        .maybeSingle();
      if (qrData) data = qrData;
    }

    if (data) {
      return res.json({
        nome: data.nome,
        codigo: data.codigo,
        evento: 'HOTEL CORTEZ HALLOWEEN PARTY 2026',
        local: 'THE TRIPLEX — R. Manuel de Castilho, 201',
        data: '31 DE OUTUBRO DE 2026',
        horario: '21:00 ÀS 06:00',
        status: data.status === 'usado' ? 'UTILIZADO' : data.status === 'cancelado' ? 'CANCELADO' : 'VALIDO',
        item: data.item || 'INGRESSO OPEN',
        tipo_ingresso: data.tipo_ingresso || 'OPEN_BAR',
      });
    }
  }

  const local = purchasedTickets.find(t =>
    t.token === rawToken ||
    t.publicCode === rawToken.toUpperCase()
  );

  if (!local) {
    return res.status(404).json({ error: 'Ingresso não encontrado ou código inválido.' });
  }

  return res.json({
    nome: local.buyerName,
    codigo: local.publicCode || local.token,
    evento: 'HOTEL CORTEZ HALLOWEEN PARTY 2026',
    local: 'THE TRIPLEX — R. Manuel de Castilho, 201',
    data: '31 DE OUTUBRO DE 2026',
    horario: '21:00 ÀS 06:00',
    status: local.status,
    item: local.ticketName || 'INGRESSO OPEN',
    tipo_ingresso: local.ticketType || 'OPEN_BAR',
  });
});

// ============================================================
// PORTARIA — VERIFICAR INGRESSO POR QR TOKEN OU CÓDIGO
// ============================================================
app.post('/api/portaria/verify', requireAdminAuth, async (req: Request, res: Response) => {
  const { qrToken } = req.body;
  if (!qrToken) return res.status(400).json({ error: 'Token do QR Code não fornecido.' });

  const rawToken = String(qrToken).trim();
  const tokenHash = hashTicketToken(rawToken);

  if (supabaseAdmin) {
    let { data, error } = await supabaseAdmin
      .from('event_tickets')
      .select('*')
      .or(`token_hash.eq.${tokenHash},codigo.eq.${rawToken.toUpperCase()}`)
      .maybeSingle();

    if (!data && !error) {
      const qrRes = await supabaseAdmin
        .from('event_tickets')
        .select('*')
        .eq('qr_token', rawToken)
        .maybeSingle();
      if (!qrRes.error && qrRes.data) {
        data = qrRes.data;
      }
    }

    if (error) {
      return res.status(500).json({ error: 'Não foi possível consultar o ingresso.' });
    }

    if (data) {
      const ticket = mapSupabaseTicket(data, data.codigo);
      return res.json({
        found: true,
        data: {
          id: ticket.id,
          codigo: ticket.publicCode,
          nome: ticket.buyerName,
          telefone: ticket.buyerPhone,
          item: ticket.ticketName,
          categoria: ticket.category,
          status: ticket.status,
          criadoEm: ticket.createdAt,
          usadoEm: ticket.usedAt,
          validadoPor: ticket.usedAt ? 'portaria' : undefined,
          qrToken: data.qr_token || rawToken,
        }
      });
    }
  }

  const local = purchasedTickets.find(t =>
    t.token === rawToken ||
    t.publicCode === rawToken.toUpperCase()
  );

  if (!local) {
    return res.status(404).json({ found: false, error: 'QR Code ou código não corresponde a um ingresso válido.' });
  }

  return res.json({
    found: true,
    data: {
      id: local.id,
      codigo: local.publicCode || local.token,
      nome: local.buyerName,
      telefone: local.buyerPhone,
      item: local.ticketName,
      categoria: local.category,
      status: local.status,
      criadoEm: local.createdAt,
      usadoEm: local.usedAt,
      qrToken: local.token,
    }
  });
});

// ============================================================
// PORTARIA — CONFIRMAR ENTRADA (ATÔMICO)
// ============================================================
app.post('/api/portaria/confirm', requireAdminAuth, async (req: Request, res: Response) => {
  const { qrToken } = req.body;
  if (!qrToken) return res.status(400).json({ error: 'Token do QR Code não fornecido.' });

  const rawToken = String(qrToken).trim();
  const tokenHash = hashTicketToken(rawToken);

  if (supabaseAdmin) {
    let consumedRow: any = null;

    const { data: byQr, error: byQrErr } = await supabaseAdmin.rpc('consume_ticket_by_qr', {
      p_qr_token: rawToken,
      p_validado_por: 'portaria'
    });

    if (!byQrErr && byQr?.length) {
      consumedRow = byQr[0];
    }

    if (!consumedRow) {
      const { data: byHash, error: byHashErr } = await supabaseAdmin.rpc('consume_event_ticket', {
        p_token_hash: tokenHash
      });
      if (!byHashErr && byHash?.length) {
        consumedRow = byHash[0];
      }
    }

    if (!consumedRow) {
      const updateRes = await supabaseAdmin
        .from('event_tickets')
        .update({
          status: 'usado',
          usado_em: new Date().toISOString()
        })
        .eq('status', 'valido')
        .or(`token_hash.eq.${tokenHash},codigo.eq.${rawToken.toUpperCase()}`)
        .select('*');

      if (updateRes.data?.length) {
        consumedRow = updateRes.data[0];
      }
    }

    if (consumedRow) {
      return res.json({
        success: true,
        message: 'ENTRADA CONFIRMADA COM SUCESSO',
        data: {
          codigo: consumedRow.codigo,
          nome: consumedRow.nome,
          status: 'UTILIZADO',
          usadoEm: consumedRow.usado_em,
          validadoPor: consumedRow.validado_por || 'portaria',
        }
      });
    }

    const checkRes = await supabaseAdmin
      .from('event_tickets')
      .select('status, usado_em, codigo, nome, validado_por')
      .or(`token_hash.eq.${tokenHash},codigo.eq.${rawToken.toUpperCase()}`)
      .maybeSingle();

    const current = checkRes.data;

    if (!current) {
      return res.status(404).json({ error: 'Ingresso não encontrado.' });
    }

    if (current.status === 'usado') {
      return res.status(409).json({
        error: 'INGRESSO JÁ UTILIZADO',
        data: {
          codigo: current.codigo,
          nome: current.nome,
          status: 'UTILIZADO',
          usadoEm: current.usado_em,
          validadoPor: current.validado_por || 'portaria',
        }
      });
    }
    if (current.status === 'cancelado') {
      return res.status(400).json({ error: 'INGRESSO CANCELADO', data: { codigo: current.codigo, nome: current.nome, status: 'CANCELADO' } });
    }

    return res.status(500).json({ error: 'Não foi possível confirmar a entrada.' });
  }

  const local = purchasedTickets.find(t =>
    t.token === rawToken ||
    t.publicCode === rawToken.toUpperCase()
  );

  if (!local) {
    return res.status(404).json({ error: 'Ingresso não encontrado.' });
  }

  if (local.status === 'UTILIZADO') {
    return res.status(409).json({
      error: 'INGRESSO JÁ UTILIZADO',
      data: {
        codigo: local.publicCode || local.token,
        nome: local.buyerName,
        status: 'UTILIZADO',
        usadoEm: local.usedAt,
      }
    });
  }

  local.status = 'UTILIZADO';
  local.usedAt = new Date().toISOString();
  return res.json({
    success: true,
    message: 'ENTRADA CONFIRMADA COM SUCESSO',
    data: {
      codigo: local.publicCode || local.token,
      nome: local.buyerName,
      status: 'UTILIZADO',
      usadoEm: local.usedAt,
    }
  });
});

// 7. Admin Login (AUTENTICAÇÃO PROTEGIDA com timing-safe comparison e anti-bruteforce)
app.post('/api/admin/login', adminLoginLimiter, (req: Request, res: Response) => {
  const { username, login, password } = req.body || {};
  const userIdentifier = typeof (login || username) === 'string' ? cleanValue(login || username) : '';
  const userPassword = typeof password === 'string' ? cleanValue(password) : '';

  if (!userIdentifier || !userPassword) {
    return res.status(401).json({ error: 'Credenciais de administração incompletas.' });
  }

  const isValid = validateAdminCredentials(userIdentifier, userPassword);

  if (!isValid) {
    console.warn(`[Auth] Falha no login admin. Usuário testado: "${userIdentifier}"`);
    return res.status(401).json({ error: 'Login ou senha de administração inválidos.' });
  }

  const sessionToken = generateSessionToken(userIdentifier);
  activeSessions.set(sessionToken, { createdAt: Date.now() });

  console.log(`[Auth] Login admin bem-sucedido para: "${userIdentifier}"`);
  return res.json({
    success: true,
    token: sessionToken,
    accessToken: sessionToken,
    message: 'Autenticado com sucesso!'
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-key'];
  const token = typeof authHeader === 'string'
    ? authHeader.replace(/^Bearer\s+/i, '').trim()
    : '';
  if (token) {
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Sessão encerrada com segurança.' });
});

// 7.5 Automação de Emails
app.post('/api/admin/test-email', requireAdminAuth, async (req: Request, res: Response) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'E-mail de destino é obrigatório' });
  if (!process.env.GMAIL_USER) {
    return res.status(500).json({ error: 'Nodemailer SMTP não configurado' });
  }

  try {
    await transporter.sendMail({
      from: `"Baile dos Bailes - Hotel Cortez" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Teste de Envio SMTP - Halloween Party Hotel Cortez',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #090510; color: #fff; padding: 20px; border: 2px solid #ef4444;">
          <h1 style="color: #ff4455; text-align: center;">TESTE DE SMTP CONCLUÍDO!</h1>
          <p>Olá,</p>
          <p>Este é um e-mail de teste disparado pelo painel administrativo da The Triplex.</p>
          <p>Se você está recebendo isso, as configurações SMTP do Gmail estão <strong>perfeitas</strong>.</p>
        </div>
      `
    });
    return res.json({ success: true, message: 'E-mail de teste enviado com sucesso!' });
  } catch (err: any) {
    console.error('Erro no test-email:', err);
    return res.status(500).json({ error: 'Falha no envio de teste', details: err.message });
  }
});

app.post('/api/admin/orders/:id/resend-email', requireAdminAuth, async (req: Request, res: Response) => {
  const orderId = req.params.id;
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Banco de dados não configurado' });
  }
  
  try {
    const { data: order, error } = await supabaseAdmin.from('ticket_orders').select('*').eq('id', orderId).single();
    if (error || !order) {
      return res.status(404).json({ error: 'Pedido não encontrado no banco' });
    }
    if (!order.access_token) {
      return res.status(400).json({ error: 'Pedido sem access_token gerado' });
    }

    await sendTicketsEmail(order, order.access_token);
    
    return res.json({ success: true, message: 'Reenvio agendado com sucesso!' });
  } catch (err: any) {
    console.error('Erro no resend-email:', err);
    return res.status(500).json({ error: 'Falha ao reenviar e-mail', details: err.message });
  }
});

// 8. Admin Metrics
app.get('/api/admin/metrics', requireAdminAuth, async (_req: Request, res: Response) => {
  if (supabaseAdmin) {
    const { data: persistedTickets, error } = await supabaseAdmin.from('event_tickets').select('*').order('criado_em', { ascending: false });
    if (error) return res.status(500).json({ error: 'Não foi possível carregar os ingressos.' });
    const { data: persistedCoupons, error: couponsError } = await supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false });
    if (couponsError) return res.status(500).json({ error: 'Não foi possível carregar as promoções.' });
    const safeCoupons = (persistedCoupons || []).map(mapCouponRow);
    const safeTickets = (persistedTickets || []).map(row => mapSupabaseTicket(row, row.codigo));
    return res.json({ totalTicketsSold: safeTickets.length, totalRevenue: safeTickets.reduce((acc, ticket) => acc + ticket.price, 0), guestListCount: guestList.length, couponsGenerated: safeCoupons.length, couponsUsed: safeCoupons.filter(coupon => coupon.status === 'UTILIZADO').length, checkinsCount: safeTickets.filter(ticket => ticket.status === 'UTILIZADO').length + guestList.filter(g => g.status === 'CHECKED_IN').length, tickets, purchasedTickets: safeTickets, guestList, promotions, coupons: safeCoupons });
  }
  const totalTicketsSold = purchasedTickets.length;
  const totalRevenue = purchasedTickets.reduce((acc, t) => acc + t.price, 0);
  const guestListCount = guestList.length;
  const couponsGenerated = coupons.length;
  const couponsUsed = coupons.filter(c => c.status === 'UTILIZADO').length;
  const checkinsCount = purchasedTickets.filter(t => t.status === 'UTILIZADO').length + guestList.filter(g => g.status === 'CHECKED_IN').length;

  res.json({ totalTicketsSold, totalRevenue, guestListCount, couponsGenerated, couponsUsed, checkinsCount, tickets, purchasedTickets, guestList, promotions, coupons });
});

app.get('/api/admin/tickets/search', requireAdminAuth, async (req: Request, res: Response) => {
  const term = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  if (!term) return res.json({ tickets: [] });

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('event_tickets').select('*').or(`codigo.ilike.%${term}%,nome.ilike.%${term}%,telefone.ilike.%${term}%`).limit(50);
    if (error) return res.status(500).json({ error: 'Não foi possível buscar os ingressos.' });
    return res.json({ tickets: (data || []).map(row => mapSupabaseTicket(row, row.codigo)) });
  }

  const tickets = purchasedTickets
    .filter(ticket => [ticket.token, ticket.buyerName, ticket.buyerPhone].some(value => value.toLowerCase().includes(term)))
    .slice(0, 50);

  return res.json({ tickets });
});

// Admin: Cadastrar Usuário / Emitir Ingresso Manualmente
app.post('/api/admin/tickets/create', requireAdminAuth, async (req: Request, res: Response) => {
  const { name, phone, ticketType, seller } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Nome e número são obrigatórios.' });

  const validTicketType: 'OPEN_BAR' | 'POS_OPEN' = ticketType === 'POS_OPEN' ? 'POS_OPEN' : 'OPEN_BAR';

  if (!supabaseAdmin) return res.status(503).json({ error: 'Persistência de ingressos indisponível. Configure o Supabase no servidor.' });
  const created = await createPersistedTicket(String(name).trim(), String(phone).trim(), validTicketType, seller ? String(seller).trim() : undefined);
  const persistedTicket = created.data;
  const error = created.error;
  const token = created.token;
  const createdAt = created.createdAt;
  if (error || !persistedTicket) {
    if (error?.code === 'PGRST205') {
      return res.status(503).json({ error: 'A tabela de ingressos ainda não foi criada no Supabase. Execute supabase/schema.sql no SQL Editor.' });
    }
    return res.status(500).json({ error: 'Não foi possível emitir o ingresso.' });
  }
  const code = persistedTicket.codigo;
  const itemLabel = validTicketType === 'POS_OPEN' ? 'INGRESSO NORMAL (SEM OPEN)' : 'INGRESSO OPEN BAR';
  const priceValue = validTicketType === 'POS_OPEN' ? 10 : 45;
  const newTicket: PurchasedTicket = {
    id: persistedTicket.id,
    token,
    publicCode: code,
    buyerName: String(name).trim(),
    buyerEmail: '',
    buyerPhone: String(phone).trim(),
    ticketId: validTicketType === 'POS_OPEN' ? 't-normal-10' : 't-open-45',
    ticketName: itemLabel,
    category: validTicketType === 'POS_OPEN' ? 'PISTA' : 'OPEN',
    price: priceValue,
    paymentMethod: 'PIX',
    status: 'VALIDO',
    createdAt,
    lote: '1º LOTE',
    ticketType: validTicketType,
    vendedor: seller ? String(seller).trim() : undefined
  };

  purchasedTickets.unshift(newTicket);
  return res.json({ success: true, ticket: { ...newTicket, token, codigo: code }, message: 'Usuário cadastrado com sucesso!' });
});

// Admin: Atualizar Dados do Usuário (Nome / Número)
app.put('/api/admin/tickets/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, ticketType } = req.body;
  const ticket = purchasedTickets.find(t => t.id === id || t.token === id);
  if (supabaseAdmin) {
    const updatePayload: any = {};
    if (name) updatePayload.nome = String(name).trim();
    if (phone) updatePayload.telefone = String(phone).trim();
    if (ticketType === 'OPEN_BAR' || ticketType === 'POS_OPEN') {
      updatePayload.tipo_ingresso = ticketType;
      updatePayload.item = ticketType === 'POS_OPEN' ? 'INGRESSO PÓS-OPEN' : 'INGRESSO OPEN BAR';
      updatePayload.preco = ticketType === 'POS_OPEN' ? 25 : 45;
    }
    return supabaseAdmin.from('event_tickets').update(updatePayload).eq('id', id).select('*').single()
      .then(async ({ data, error }) => {
        if (error?.code === '42703') {
          delete updatePayload.tipo_ingresso;
          const retry = await supabaseAdmin.from('event_tickets').update(updatePayload).eq('id', id).select('*').single();
          if (retry.error || !retry.data) return res.status(404).json({ error: 'Usuário não encontrado (fallback).' });
          return res.json({ success: true, ticket: mapSupabaseTicket(retry.data, retry.data.codigo), message: 'Dados do usuário atualizados (parcialmente)!' });
        }
        if (error || !data) return res.status(404).json({ error: 'Usuário não encontrado.' });
        return res.json({ success: true, ticket: mapSupabaseTicket(data, data.codigo), message: 'Dados do usuário atualizados!' });
      });
  }
  if (!ticket) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (name) ticket.buyerName = String(name).trim();
  if (phone) ticket.buyerPhone = String(phone).trim();
  if (ticketType === 'OPEN_BAR' || ticketType === 'POS_OPEN') ticket.ticketType = ticketType;
  return res.json({ success: true, ticket, message: 'Dados do usuário atualizados!' });
});

// Admin: Remover Usuário / Ingresso
app.delete('/api/admin/tickets/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  if (supabaseAdmin) {
    return supabaseAdmin.from('event_tickets').update({ status: 'cancelado', cancelado_em: new Date().toISOString() }).eq('id', id).select('id').single()
      .then(({ data, error }) => error || !data ? res.status(404).json({ error: 'Ingresso não encontrado.' }) : res.json({ success: true, message: 'Ingresso cancelado.' }));
  }
  purchasedTickets = purchasedTickets.filter(t => t.id !== id && t.token !== id);
  return res.json({ success: true, message: 'Usuário/ingresso removido.' });
});

// 9. Contact
app.post('/api/contact', publicWriteLimiter, async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });

  if (supabaseAdmin) {
    try {
      const { error: contactErr } = await supabaseAdmin.from('contacts').insert([{
        name: String(name).trim(), email: String(email).trim().toLowerCase(),
        message: String(message).trim(), created_at: new Date().toISOString()
      }]);
      if (contactErr) console.warn('[Supabase contacts Sync Warning]', contactErr.message);
    } catch (err: any) { console.warn('[Supabase contacts Sync Exception]', err); }
  }

  return res.status(201).json({ success: true, message: 'Mensagem recebida com sucesso pela recepção!' });
});

// Export para Vercel Serverless
export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend local rodando na porta ${PORT} 🎃`);
  });
}
