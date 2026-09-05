import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-Memory Database for the Hotel Cortez Event
interface Ticket {
  id: string;
  name: string;
  category: 'PISTA' | 'VIP' | 'CAMAROTE' | 'LOUNGE';
  price: number;
  originalPrice?: number;
  batch: string;
  available: number;
  total: number;
  features: string[];
  drinksIncluded: string[];
  color: string;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  quantity: string;
  price: number;
  originalPrice?: number;
  active: boolean;
  category: 'BEER' | 'COMBO' | 'DRINK' | 'SHOT';
  tag?: string;
}

interface PurchasedTicket {
  id: string;
  token: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  ticketId: string;
  ticketName: string;
  category: string;
  price: number;
  paymentMethod: 'PIX' | 'CARTAO';
  status: 'VALIDO' | 'UTILIZADO' | 'CANCELADO';
  createdAt: string;
  usedAt?: string;
  lote: string;
}

interface GuestEntry {
  id: string;
  name: string;
  phone: string;
  eventName: string;
  status: 'CONFIRMADO' | 'CHECKED_IN' | 'CANCELADO';
  createdAt: string;
  token: string;
}

interface Coupon {
  id: string;
  token: string;
  rewardTitle: string;
  rewardValue: string;
  phone: string;
  userName?: string;
  status: 'ATIVO' | 'UTILIZADO' | 'EXPIRADO';
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

// Initial Database Data
let tickets: Ticket[] = [
  {
    id: 't-pista',
    name: 'PISTA CORTEZ - OPEN BAR',
    category: 'PISTA',
    price: 50,
    originalPrice: 70,
    batch: '1º LOTE',
    available: 48,
    total: 200,
    features: [
      'Acesso ao Lobby e Salão Principal',
      'Open Bar até 04:00',
      'Copo oficial colecionável Hotel Cortez',
      'Acesso a todas as atrações musicais'
    ],
    drinksIncluded: ['Gin & Tônica', 'Vodka Smirnoff', 'Energético Baly', 'Caipirinha Velho Barreiro'],
    color: '#991b1b'
  },
  {
    id: 't-vip',
    name: 'VIP SUITE 64 - OPEN BAR PREMIUM',
    category: 'VIP',
    price: 110,
    originalPrice: 140,
    batch: '1º LOTE',
    available: 22,
    total: 80,
    features: [
      'Entrada preferencial sem filas',
      'Acesso ao Mezanino VIP Suite 64',
      'Open Bar Premium completo',
      'Barbearia e maquiagem temática cortesia',
      '1 Welcome Shot Sangue da Condessa'
    ],
    drinksIncluded: ['Whisky Red Label', 'Gin Tanqueray', 'Vodka Absolut', 'Cerveja Heineken', 'Energético Monster'],
    color: '#9333ea'
  },
  {
    id: 't-camarote',
    name: 'CAMAROTE COUNTESS - ALL INCLUSIVE',
    category: 'CAMAROTE',
    price: 180,
    originalPrice: 220,
    batch: 'ÚLTIMOS',
    available: 8,
    total: 30,
    features: [
      'Área reservada com visão panorâmica do palco',
      'Garçom exclusivo no camarote',
      'Open Food Finger foods & petiscos gourmet',
      'Open Bar Super Premium',
      'Brinde exclusivo comemorativo AHS'
    ],
    drinksIncluded: ['Gin Hendricks', 'Vodka Ciroc', 'Whisky Black Label', 'Espumante Chandon', 'Drinks Autorais'],
    color: '#d97706'
  },
  {
    id: 't-lounge',
    name: 'LOUNGE PRIVATIVO PARA 10 PESSOAS',
    category: 'LOUNGE',
    price: 1200,
    originalPrice: 1500,
    batch: 'EXCLUSIVO',
    available: 2,
    total: 4,
    features: [
      'Espaço privativo com sofás e segurança',
      '10 Ingressos VIP inclusos',
      '3 Garrafas de Destilados Premium à escolha',
      '12 Red Bulls + 12 Águas',
      'Atendimento de maître particular'
    ],
    drinksIncluded: ['Cardápio All Inclusive Super Premium + Combos de Garrafas'],
    color: '#dc2626'
  }
];

let promotions: Promotion[] = [
  {
    id: 'promo-1',
    name: 'BALDE DE HEINEKEN (6 UNID)',
    description: 'Balde de gelo com 6 long necks 330ml ultra geladas.',
    quantity: '6 unidades',
    price: 60,
    originalPrice: 84,
    active: true,
    category: 'BEER',
    tag: 'MAIS VENDIDO'
  },
  {
    id: 'promo-2',
    name: 'COMBO SKOL BEATS SENSES (6 UNID)',
    description: 'Pack com 6 latinhas de Beats geladinhas para esquentar a noite.',
    quantity: '6 unidades',
    price: 70,
    originalPrice: 90,
    active: true,
    category: 'BEER',
    tag: 'POPULAR'
  },
  {
    id: 'promo-3',
    name: 'COMBO GIN TANQUERAY + 5 RED BULLS',
    description: '1 Garrafa de Gin Tanqueray London Dry 750ml + 5 latas de Red Bull Tropical ou Tradicional + Gelo com especiarias.',
    quantity: '1 Garrafa + 5 Latas',
    price: 210,
    originalPrice: 280,
    active: true,
    category: 'COMBO',
    tag: 'COMBO VIP'
  },
  {
    id: 'promo-4',
    name: 'SHOT SANGUE DA CONDESSA (DOSE DUPLA)',
    description: 'Receita secreta do Hotel Cortez com Tequila Silver, licor de cassis, xarope de romã e borda de açúcar de pimenta.',
    quantity: '2 shots 50ml',
    price: 25,
    originalPrice: 40,
    active: true,
    category: 'SHOT',
    tag: 'EXCLUSIVO'
  },
  {
    id: 'promo-5',
    name: 'COMBO JACK DANIEL’S + 4 COCA-COLAS',
    description: '1 Garrafa Jack Daniel’s Old No. 7 1L + 4 latas de Coca-Cola + Balde de Gelo.',
    quantity: '1 Garrafa + 4 Latas',
    price: 240,
    originalPrice: 310,
    active: true,
    category: 'COMBO'
  }
];

const oracleCards = [
  {
    id: 'card-1',
    name: 'A CONDESSA (THE COUNTESS)',
    title: 'SANGUE E SEDUÇÃO',
    symbol: 'CHALICE',
    arcana: 'ARCANA III',
    description: 'Você foi abençoado com a imortalidade da noite. Beba do cálice sagrado do Cortez.',
    rewardText: '2 DRINKS POR R$25 (OU 50% NO SEGUNDO)',
    rewardCodePrefix: 'DRK25',
    discountType: 'PRICE',
    value: 'R$ 25,00'
  },
  {
    id: 'card-2',
    name: 'O CARA DE BORRACHA (RUBBER MAN)',
    title: 'O MISTÉRIO DO CORREDOR',
    symbol: 'EYE',
    arcana: 'ARCANA VII',
    description: 'As sombras do hotel conspiram a seu favor. Uma passagem secreta foi revelada.',
    rewardText: 'DESCONTO DE R$ 20,00 NO INGRESSO VIP',
    rewardCodePrefix: 'VIP20',
    discountType: 'PRICE',
    value: 'R$ 20,00 OFF'
  },
  {
    id: 'card-3',
    name: 'O FUNDADOR JAMES MARCH',
    title: 'O BANQUETE MACABRO',
    symbol: 'SKULL',
    arcana: 'ARCANA XIII',
    description: 'James Patrick March convida você para brindar na Sala de Jantar Secreta.',
    rewardText: '1 SHOT CORTESIA SANGUE DO CORTEZ NA ENTRADA',
    rewardCodePrefix: 'SHOTFREE',
    discountType: 'GIFT',
    value: 'SHOT GRÁTIS'
  },
  {
    id: 'card-4',
    name: 'O CORVO DA MEIA-NOITE',
    title: 'O PRESSÁGIO DOURADO',
    symbol: 'RAVEN',
    arcana: 'ARCANA IX',
    description: 'As asas negras trazem a sorte dos condenados. Celebre com seus aliados.',
    rewardText: 'BALDE DE CERVEJA POR R$ 45 (6 UNID)',
    rewardCodePrefix: 'BALDE45',
    discountType: 'PRICE',
    value: 'R$ 45,00'
  }
];

let purchasedTickets: PurchasedTicket[] = [
  {
    id: 'TICK-901',
    token: 'AHS-TK-883921',
    buyerName: 'Gabriel Oliveira',
    buyerEmail: 'gabriel.olv@gmail.com',
    buyerPhone: '(11) 98765-4321',
    ticketId: 't-vip',
    ticketName: 'VIP SUITE 64 - OPEN BAR PREMIUM',
    category: 'VIP',
    price: 110,
    paymentMethod: 'PIX',
    status: 'VALIDO',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    lote: '1º LOTE'
  },
  {
    id: 'TICK-902',
    token: 'AHS-TK-447219',
    buyerName: 'Mariana Duarte',
    buyerEmail: 'mariana.d@yahoo.com.br',
    buyerPhone: '(11) 97123-8899',
    ticketId: 't-pista',
    ticketName: 'PISTA CORTEZ - OPEN BAR',
    category: 'PISTA',
    price: 50,
    paymentMethod: 'CARTAO',
    status: 'VALIDO',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lote: '1º LOTE'
  }
];

let guestList: GuestEntry[] = [
  {
    id: 'GUEST-1',
    name: 'Renata Vasconcelos',
    phone: '(11) 99123-4567',
    eventName: 'Halloween Party Hotel Cortez 2026',
    status: 'CONFIRMADO',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    token: 'RSVP-1092'
  },
  {
    id: 'GUEST-2',
    name: 'Lucas Ferreira Mendes',
    phone: '(11) 98877-6655',
    eventName: 'Halloween Party Hotel Cortez 2026',
    status: 'CONFIRMADO',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    token: 'RSVP-3341'
  }
];

let coupons: Coupon[] = [
  {
    id: 'CP-101',
    token: 'CORTEZ-DRK25-7891',
    rewardTitle: '2 Drinks por R$25',
    rewardValue: 'R$ 25,00',
    phone: '(11) 98811-2233',
    userName: 'Carlos Silveira',
    status: 'ATIVO',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    expiresAt: '2026-11-01T06:00:00.000Z'
  }
];

// Helper to normalize phone
function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Helper to generate crypto-like random tokens
function generateSecureToken(prefix: string): string {
  const randNum = Math.floor(100000 + Math.random() * 900000);
  const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randHex}-${randNum}`;
}

// ----------------- API ROUTES -----------------

// 1. Event Data
app.get('/api/event', (_req: Request, res: Response) => {
  res.json({
    id: 'hotel-cortez-halloween-2026',
    name: 'HOTEL CORTEZ HALLOWEEN PARTY',
    subtitle: 'AMERICAN HORROR STORY',
    tagline: 'UMA NOITE. SEIS HISTÓRIAS. INFINITAS MEMÓRIAS.',
    date: '31 DE OUTUBRO DE 2026',
    isoDate: '2026-10-31T22:00:00-03:00',
    time: '22:00 ÀS 06:00',
    location: 'HOTEL CORTEZ / PALACETE HISTÓRICO',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    description: 'Uma imersão gótica retrô inspirada no universo sombrio de American Horror Story Hotel. Três pistas de dança, performances teatrais ao vivo, cenografia em pixel art interativa, open bar premium e concurso de fantasias com R$ 5.000 em prêmios.',
    theme: 'Horror Psicológico, Gothic Deco & Dark Glamour',
    ageRestriction: '18 ANOS (Obrigatória apresentação de documento original com foto)',
    dressCodeRule: 'Traje a rigor sombrio, fantasia criativa, gótico, vintage noir ou all-black.',
    highlights: [
      '3 Ambientes imersivos (Grand Ballroom, The 1920s Bar, The Secret Room 64)',
      'Line-up com 6 DJs nacionais e internacionais (Dark Wave, Synthwave, Techno & Pop Horror)',
      'Open Bar até as 04:00 (Cerveja, Gin, Vodka, Energético e Drinks Especiais)',
      'Concurso de Fantasias com Premiação às 02:30',
      'Flash Tattoo e Maquiagem Macabra temática gratuita'
    ]
  });
});

// 2. Tickets listing
app.get('/api/tickets', (_req: Request, res: Response) => {
  res.json(tickets);
});

// Purchase Ticket (Simulation with instant validation & secure token generation)
app.post('/api/tickets/purchase', (req: Request, res: Response) => {
  const { ticketId, buyerName, buyerEmail, buyerPhone, paymentMethod } = req.body;

  if (!ticketId || !buyerName || !buyerEmail || !buyerPhone) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios para emissão do ingresso.' });
  }

  const selectedTier = tickets.find(t => t.id === ticketId);
  if (!selectedTier) {
    return res.status(404).json({ error: 'Tipo de ingresso não encontrado.' });
  }

  if (selectedTier.available <= 0) {
    return res.status(400).json({ error: 'Este lote de ingressos está esgotado.' });
  }

  // Deduct available
  selectedTier.available -= 1;

  const newTicket: PurchasedTicket = {
    id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
    token: generateSecureToken('AHS-TK'),
    buyerName: buyerName.trim(),
    buyerEmail: buyerEmail.trim().toLowerCase(),
    buyerPhone: buyerPhone.trim(),
    ticketId: selectedTier.id,
    ticketName: selectedTier.name,
    category: selectedTier.category,
    price: selectedTier.price,
    paymentMethod: paymentMethod === 'CARTAO' ? 'CARTAO' : 'PIX',
    status: 'VALIDO',
    createdAt: new Date().toISOString(),
    lote: selectedTier.batch
  };

  purchasedTickets.unshift(newTicket);

  return res.status(201).json({
    success: true,
    message: 'Ingresso emitido com sucesso!',
    ticket: newTicket
  });
});

// 3. Promotions listing
app.get('/api/promotions', (_req: Request, res: Response) => {
  res.json(promotions);
});

// Admin update promotion
app.post('/api/promotions/update', (req: Request, res: Response) => {
  const { id, price, active, name, description } = req.body;
  const promo = promotions.find(p => p.id === id);
  if (!promo) {
    return res.status(404).json({ error: 'Promoção não encontrada.' });
  }

  if (price !== undefined) promo.price = Number(price);
  if (active !== undefined) promo.active = Boolean(active);
  if (name) promo.name = name;
  if (description) promo.description = description;

  return res.json({ success: true, promotion: promo });
});

// Admin add promotion
app.post('/api/promotions/new', (req: Request, res: Response) => {
  const { name, description, quantity, price, category, tag } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }

  const newPromo: Promotion = {
    id: `promo-${Date.now()}`,
    name,
    description: description || '',
    quantity: quantity || '1 unidade',
    price: Number(price),
    active: true,
    category: category || 'BEER',
    tag
  };

  promotions.push(newPromo);
  return res.status(201).json({ success: true, promotion: newPromo });
});

// 4. Oracle / Tarot Cards
app.get('/api/oracle/cards', (_req: Request, res: Response) => {
  res.json(oracleCards);
});

// Draw Oracle Reward with Strict Backend Validation (1 per phone)
app.post('/api/oracle/draw', (req: Request, res: Response) => {
  const { phone, cardId, userName } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'O número de telefone é obrigatório para resgatar o oráculo.' });
  }

  const cleanPhone = sanitizePhone(phone);
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Por favor, informe um telefone válido com DDD.' });
  }

  // Check if this phone already claimed a coupon
  const existingCoupon = coupons.find(c => sanitizePhone(c.phone) === cleanPhone);
  if (existingCoupon) {
    return res.status(403).json({
      error: 'Você já resgatou sua carta do destino para este evento!',
      coupon: existingCoupon,
      alreadyClaimed: true
    });
  }

  // Pick card or matching cardId
  let selectedCard = oracleCards.find(c => c.id === cardId);
  if (!selectedCard) {
    selectedCard = oracleCards[Math.floor(Math.random() * oracleCards.length)];
  }

  const newCoupon: Coupon = {
    id: `CP-${Math.floor(1000 + Math.random() * 9000)}`,
    token: generateSecureToken(`CORTEZ-${selectedCard.rewardCodePrefix}`),
    rewardTitle: selectedCard.rewardText,
    rewardValue: selectedCard.value,
    phone: phone.trim(),
    userName: userName ? userName.trim() : 'Visitante do Cortez',
    status: 'ATIVO',
    createdAt: new Date().toISOString(),
    expiresAt: '2026-11-01T06:00:00.000Z'
  };

  coupons.unshift(newCoupon);

  return res.status(201).json({
    success: true,
    message: 'Destino revelado! Seu cupom mágico foi gerado.',
    card: selectedCard,
    coupon: newCoupon
  });
});

// 5. RSVP / Guest List
app.get('/api/guestlist', (_req: Request, res: Response) => {
  // Public count or safe list
  res.json({
    totalGuests: guestList.length,
    eventName: 'Halloween Party Hotel Cortez 2026',
    status: 'LISTA ABERTA'
  });
});

app.post('/api/guestlist', (req: Request, res: Response) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios para a lista VIP.' });
  }

  const cleanPhone = sanitizePhone(phone);
  const alreadyInList = guestList.some(g => sanitizePhone(g.phone) === cleanPhone);

  if (alreadyInList) {
    return res.status(400).json({ error: 'Este número de telefone já está registrado na Lista VIP.' });
  }

  const newEntry: GuestEntry = {
    id: `GUEST-${guestList.length + 1}`,
    name: name.trim(),
    phone: phone.trim(),
    eventName: 'Halloween Party Hotel Cortez 2026',
    status: 'CONFIRMADO',
    createdAt: new Date().toISOString(),
    token: generateSecureToken('RSVP')
  };

  guestList.unshift(newEntry);

  return res.status(201).json({
    success: true,
    message: 'Nome confirmado com sucesso na Lista VIP!',
    guest: {
      id: newEntry.id,
      name: newEntry.name,
      status: newEntry.status,
      token: newEntry.token,
      createdAt: newEntry.createdAt
    }
  });
});

// 6. Verification / Check-in for QR Codes & Tokens
app.post('/api/checkin/verify', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token ou QR Code não fornecido.' });
  }

  const cleanToken = token.trim().toUpperCase();

  // Check in purchased tickets
  const ticket = purchasedTickets.find(t => t.token.toUpperCase() === cleanToken);
  if (ticket) {
    return res.json({
      type: 'TICKET',
      found: true,
      data: {
        id: ticket.id,
        token: ticket.token,
        name: ticket.buyerName,
        item: ticket.ticketName,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.createdAt,
        usedAt: ticket.usedAt
      }
    });
  }

  // Check in coupons
  const coupon = coupons.find(c => c.token.toUpperCase() === cleanToken);
  if (coupon) {
    return res.json({
      type: 'COUPON',
      found: true,
      data: {
        id: coupon.id,
        token: coupon.token,
        name: coupon.userName || 'Portador do Cupom',
        item: coupon.rewardTitle,
        value: coupon.rewardValue,
        status: coupon.status,
        createdAt: coupon.createdAt,
        usedAt: coupon.usedAt
      }
    });
  }

  // Check in guest list
  const guest = guestList.find(g => g.token.toUpperCase() === cleanToken);
  if (guest) {
    return res.json({
      type: 'GUEST_LIST',
      found: true,
      data: {
        id: guest.id,
        token: guest.token,
        name: guest.name,
        item: 'Entrada Lista VIP Especial',
        status: guest.status,
        createdAt: guest.createdAt
      }
    });
  }

  return res.status(404).json({
    found: false,
    error: 'Código não encontrado ou inválido no sistema do Hotel Cortez.'
  });
});

// Confirm Check-in / Redemption
app.post('/api/checkin/confirm', (req: Request, res: Response) => {
  const { token, type } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório.' });
  }

  const cleanToken = token.trim().toUpperCase();
  const now = new Date().toISOString();

  if (type === 'TICKET') {
    const ticket = purchasedTickets.find(t => t.token.toUpperCase() === cleanToken);
    if (!ticket) return res.status(404).json({ error: 'Ingresso não encontrado.' });
    if (ticket.status === 'UTILIZADO') {
      return res.status(400).json({ error: 'INGRESSO JÁ UTILIZADO anteriormente!', usedAt: ticket.usedAt });
    }
    ticket.status = 'UTILIZADO';
    ticket.usedAt = now;
    return res.json({ success: true, message: 'ENTRADA CONFIRMADA! Bem-vindo ao Hotel Cortez.', ticket });
  }

  if (type === 'COUPON') {
    const coupon = coupons.find(c => c.token.toUpperCase() === cleanToken);
    if (!coupon) return res.status(404).json({ error: 'Cupom não encontrado.' });
    if (coupon.status === 'UTILIZADO') {
      return res.status(400).json({ error: 'PROMOÇÃO JÁ UTILIZADA!', usedAt: coupon.usedAt });
    }
    coupon.status = 'UTILIZADO';
    coupon.usedAt = now;
    return res.json({ success: true, message: 'PROMOÇÃO RESGATADA COM SUCESSO!', coupon });
  }

  if (type === 'GUEST_LIST') {
    const guest = guestList.find(g => g.token.toUpperCase() === cleanToken);
    if (!guest) return res.status(404).json({ error: 'Nome na lista não encontrado.' });
    if (guest.status === 'CHECKED_IN') {
      return res.status(400).json({ error: 'CHECK-IN DA LISTA JÁ REALIZADO!' });
    }
    guest.status = 'CHECKED_IN';
    return res.json({ success: true, message: 'CHECK-IN DA LISTA CONFIRMADO!', guest });
  }

  return res.status(400).json({ error: 'Tipo de validação inválido.' });
});

// 7. Admin Metrics & Full Database View
app.get('/api/admin/metrics', (_req: Request, res: Response) => {
  const totalTicketsSold = purchasedTickets.length;
  const totalRevenue = purchasedTickets.reduce((acc, t) => acc + t.price, 0);
  const guestListCount = guestList.length;
  const couponsGenerated = coupons.length;
  const couponsUsed = coupons.filter(c => c.status === 'UTILIZADO').length;
  const checkinsCount = purchasedTickets.filter(t => t.status === 'UTILIZADO').length + guestList.filter(g => g.status === 'CHECKED_IN').length;

  res.json({
    totalTicketsSold,
    totalRevenue,
    guestListCount,
    couponsGenerated,
    couponsUsed,
    checkinsCount,
    tickets,
    purchasedTickets,
    guestList,
    promotions,
    coupons
  });
});

// Production static assets & Vite handling in dev
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // In development, dynamically setup Vite server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hotel Cortez Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
