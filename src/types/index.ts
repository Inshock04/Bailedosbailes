export interface EventInfo {
  id: string;
  name: string;
  subtitle: string;
  tagline: string;
  date: string;
  isoDate: string;
  time: string;
  location: string;
  address: string;
  description: string;
  theme: string;
  ageRestriction: string;
  dressCodeRule: string;
  highlights: string[];
}

export interface TicketTier {
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
  popular?: boolean;
}

export interface Promotion {
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

export interface OracleCard {
  id: string;
  name: string;
  title: string;
  symbol: 'SKULL' | 'EYE' | 'RAVEN' | 'MOON' | 'FLAME' | 'CHALICE';
  arcana: string;
  description: string;
  rewardText: string;
  rewardCodePrefix: string;
  discountType: 'PRICE' | 'PERCENT' | 'GIFT';
  value: string;
}

export interface Coupon {
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

export interface GuestListEntry {
  id: string;
  name: string;
  phone: string;
  eventName: string;
  status: 'CONFIRMADO' | 'CHECKED_IN' | 'CANCELADO';
  createdAt: string;
  token: string;
}

export interface PurchasedTicket {
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

export interface AdminMetrics {
  totalTicketsSold: number;
  totalRevenue: number;
  guestListCount: number;
  couponsGenerated: number;
  couponsUsed: number;
  checkinsCount: number;
  recentSales: PurchasedTicket[];
}
