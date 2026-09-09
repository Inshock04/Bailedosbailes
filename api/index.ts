import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// ----------------------------------------------------
// EXPRESS APP PARA VERCEL SERVERLESS
// ----------------------------------------------------
const app = express();

// Headers de Segurança HTTP
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '1mb' }));

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
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
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

// ----------------------------------------------------
// AUTENTICAÇÃO ADMIN
// ----------------------------------------------------
const ADMIN_USER = process.env.ADMIN_USER || 'triplex@201';
const ADMIN_SECRET = process.env.ADMIN_KEY || 'G@201';

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

const activeSessions = new Map<string, { createdAt: number }>();
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000;

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-key'];
  const token = typeof authHeader === 'string'
    ? authHeader.replace(/^Bearer\s+/i, '').trim()
    : '';

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado: Token de autenticação não fornecido.' });
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }

  if (Date.now() - session.createdAt > SESSION_DURATION_MS) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
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

function hashTicketToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function generateTicketCredentials(): { code: string; token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('base64url');
  const code = `AHS-${crypto.randomInt(1000, 10000)}`;
  return { code, token, tokenHash: hashTicketToken(token) };
}

async function createPersistedTicket(name: string, phone: string) {
  if (!supabaseAdmin) return { data: null, error: new Error('Supabase indisponível.') };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { code, token, tokenHash } = generateTicketCredentials();
    const createdAt = new Date().toISOString();
    const { data, error } = await supabaseAdmin.from('event_tickets').insert({ codigo: code, token_hash: tokenHash, nome: name, telefone: phone, item: 'INGRESSO OPEN', categoria: 'GERAL', preco: 45, lote: 'UNICO', status: 'valido', criado_em: createdAt }).select('*').single();
    if (!error && data) return { data, error: null, token, createdAt };
    if (error?.code !== '23505') {
      logSupabaseError('create event ticket', error);
      return { data: null, error };
    }
  }

  return { data: null, error: new Error('Não foi possível gerar um código único.') };
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
}

function mapSupabaseTicket(row: any, token?: string): PurchasedTicket {
  return {
    id: row.id, token: token || row.codigo, publicCode: row.codigo,
    buyerName: row.nome, buyerEmail: row.email || '', buyerPhone: row.telefone,
    ticketId: 't-open-45', ticketName: row.item, category: row.categoria,
    price: Number(row.preco), paymentMethod: 'PIX',
    status: row.status === 'usado' ? 'UTILIZADO' : row.status === 'cancelado' ? 'CANCELADO' : 'VALIDO',
    createdAt: row.criado_em, usedAt: row.usado_em || undefined, lote: row.lote
  };
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
    id: 't-open-45', name: 'INGRESSO OPEN', category: 'OPEN',
    price: 45, originalPrice: 65, batch: '1º LOTE', available: 200, total: 200,
    features: ['Open Bar das 21:00 às 00:00'],
    drinksIncluded: ['Gin', 'Vodka', 'Energético', 'Caipirinha', 'Canelinha', '???'],
    color: '#991b1b'
  }
];

let promotions: Promotion[] = [
  { id: 'promo-1', name: 'BALDE DE HEINEKEN (6 UNID)', description: 'Balde de gelo com 6 long necks 330ml ultra geladas.', quantity: '6 unidades', price: 60, originalPrice: 84, active: true, category: 'BEER', tag: 'MAIS VENDIDO' },
  { id: 'promo-2', name: 'COMBO SKOL BEATS SENSES (6 UNID)', description: 'Pack com 6 latinhas de Beats geladinhas para esquentar a noite.', quantity: '6 unidades', price: 70, originalPrice: 90, active: true, category: 'BEER', tag: 'POPULAR' },
  { id: 'promo-3', name: 'COMBO GIN TANQUERAY + 5 RED BULLS', description: '1 Garrafa de Gin Tanqueray London Dry 750ml + 5 latas de Red Bull Tropical ou Tradicional + Gelo com especiarias.', quantity: '1 Garrafa + 5 Latas', price: 210, originalPrice: 280, active: true, category: 'COMBO', tag: 'COMBO VIP' },
  { id: 'promo-4', name: 'SHOT SANGUE DA CONDESSA (DOSE DUPLA)', description: 'Receita secreta do Hotel Cortez com Tequila Silver, licor de cassis, xarope de romã e borda de açúcar de pimenta.', quantity: '2 shots 50ml', price: 25, originalPrice: 40, active: true, category: 'SHOT', tag: 'EXCLUSIVO' },
  { id: 'promo-5', name: 'COMBO JACK DANIEL\u2019S + 4 COCA-COLAS', description: '1 Garrafa Jack Daniel\u2019s Old No. 7 1L + 4 latas de Coca-Cola + Balde de Gelo.', quantity: '1 Garrafa + 4 Latas', price: 240, originalPrice: 310, active: true, category: 'COMBO' }
];

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
    address: 'THE TRIPLEX • Rua Manoel Castilho, 201 - Itaim Paulista, São Paulo - SP',
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

app.post('/api/tickets/purchase', publicWriteLimiter, (_req: Request, res: Response) => {
  return res.status(400).json({
    error: 'Para adquirir seu ingresso oficial e confirmação imediata, fale diretamente com a organização no WhatsApp: https://wa.me/5511943963952 (+55 11 94396-3952).',
    whatsappUrl: 'https://wa.me/5511943963952'
  });
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

app.post('/api/guestlist', publicWriteLimiter, (req: Request, res: Response) => {
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
    supabaseAdmin.from('guest_list').insert([{
      name: newEntry.name, phone: newEntry.phone, token: newEntry.token,
      event_name: newEntry.eventName, status: newEntry.status, created_at: newEntry.createdAt
    }]).then(({ error }: any) => {
      if (error) console.warn('[Supabase guest_list Sync Warning]', error.message);
    }).catch((err: any) => console.warn('[Supabase guest_list Sync Exception]', err));
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
    const { data: persistedTicket, error } = await supabaseAdmin.from('event_tickets').select('*').eq('token_hash', hashTicketToken(token.trim())).maybeSingle();
    if (error) return res.status(500).json({ error: 'Não foi possível consultar o ingresso.' });
    if (persistedTicket) {
      const ticket = mapSupabaseTicket(persistedTicket);
      return res.json({ type: 'TICKET', found: true, data: { id: ticket.id, token: ticket.publicCode, code: ticket.publicCode, name: ticket.buyerName, phone: ticket.buyerPhone, item: ticket.ticketName, category: ticket.category, status: ticket.status, createdAt: ticket.createdAt, usedAt: ticket.usedAt } });
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
      const tokenHash = hashTicketToken(token.trim());
      const { data: consumed, error: consumeError } = await supabaseAdmin.rpc('consume_event_ticket', { p_token_hash: tokenHash });
      if (consumeError) return res.status(500).json({ error: 'Não foi possível registrar a entrada.' });
      if (consumed?.length) {
        const ticket = mapSupabaseTicket(consumed[0], token.trim());
        return res.json({ success: true, message: 'ENTRADA CONFIRMADA! Bem-vindo ao Hotel Cortez.', ticket: { ...ticket, token: ticket.publicCode } });
      }
      const { data: persistedTicket } = await supabaseAdmin.from('event_tickets').select('usado_em, status').eq('token_hash', tokenHash).maybeSingle();
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

  return res.status(400).json({ error: 'Tipo de validação inválido.' });
});

// 7. Admin Login (AUTENTICAÇÃO PROTEGIDA com timing-safe comparison e anti-bruteforce)
app.post('/api/admin/login', adminLoginLimiter, (req: Request, res: Response) => {
  const { username, login, password } = req.body || {};
  const userIdentifier = typeof (login || username) === 'string' ? (login || username).trim() : '';
  const userPassword = typeof password === 'string' ? password.trim() : '';

  if (!userIdentifier || !userPassword) {
    return res.status(401).json({ error: 'Credenciais de administração incompletas.' });
  }

  const isUserValid = safeCompare(userIdentifier, ADMIN_USER);
  const isPassValid = safeCompare(userPassword, ADMIN_SECRET);

  if (!isUserValid || !isPassValid) {
    return res.status(401).json({ error: 'Login ou senha de administração inválidos.' });
  }

  const sessionToken = generateSessionToken();
  activeSessions.set(sessionToken, { createdAt: Date.now() });
  return res.json({ success: true, token: sessionToken, message: 'Autenticado com sucesso!' });
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
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Nome e número são obrigatórios.' });

  if (!supabaseAdmin) return res.status(503).json({ error: 'Persistência de ingressos indisponível. Configure o Supabase no servidor.' });
  const created = await createPersistedTicket(String(name).trim(), String(phone).trim());
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
  const newTicket: PurchasedTicket = {
    id: persistedTicket.id,
    token,
    publicCode: code,
    buyerName: String(name).trim(),
    buyerEmail: '',
    buyerPhone: String(phone).trim(),
    ticketId: 't-open-45',
    ticketName: 'INGRESSO',
    category: 'GERAL',
    price: 45,
    paymentMethod: 'PIX',
    status: 'VALIDO',
    createdAt,
    lote: 'ÚNICO'
  };

  purchasedTickets.unshift(newTicket);
  return res.json({ success: true, ticket: { ...newTicket, token, codigo: code }, message: 'Usuário cadastrado com sucesso!' });
});

// Admin: Atualizar Dados do Usuário (Nome / Número)
app.put('/api/admin/tickets/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone } = req.body;
  const ticket = purchasedTickets.find(t => t.id === id || t.token === id);
  if (supabaseAdmin) {
    return supabaseAdmin.from('event_tickets').update({ nome: name ? String(name).trim() : undefined, telefone: phone ? String(phone).trim() : undefined }).eq('id', id).select('*').single()
      .then(({ data, error }) => error || !data ? res.status(404).json({ error: 'Usuário não encontrado.' }) : res.json({ success: true, ticket: mapSupabaseTicket(data, data.codigo), message: 'Dados do usuário atualizados!' }));
  }
  if (!ticket) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (name) ticket.buyerName = String(name).trim();
  if (phone) ticket.buyerPhone = String(phone).trim();
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
app.post('/api/contact', publicWriteLimiter, (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });

  if (supabaseAdmin) {
    supabaseAdmin.from('contacts').insert([{
      name: String(name).trim(), email: String(email).trim().toLowerCase(),
      message: String(message).trim(), created_at: new Date().toISOString()
    }]).then(({ error }: any) => {
      if (error) console.warn('[Supabase contacts Sync Warning]', error.message);
    }).catch((err: any) => console.warn('[Supabase contacts Sync Exception]', err));
  }

  return res.status(201).json({ success: true, message: 'Mensagem recebida com sucesso pela recepção!' });
});

// Export para Vercel Serverless
export default app;
