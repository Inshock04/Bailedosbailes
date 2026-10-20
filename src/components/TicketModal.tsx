import React, { useState, useEffect } from 'react';
import { PixelClose, PixelSkull, PixelCheck } from './PixelIcons';
import { WhatsAppIcon } from './OfficialSocialButtons';
import { audioManager } from '../utils/audio';
import type { TicketTier } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTierId?: string | null;
}

const DEFAULT_TIERS: TicketTier[] = [
  {
    id: 't-open-50',
    name: 'INGRESSO OPEN BAR',
    category: 'OPEN',
    price: 55,
    batch: '3º LOTE',
    available: 200,
    total: 200,
    features: ['Open Bar das 21:00 às 00:00'],
    drinksIncluded: ['Gin', 'Vodka', 'Energético', 'Caipirinha', 'Canelinha', '???'],
    color: '#991b1b'
  },
  {
    id: 't-normal-10',
    name: 'ENTRADA PÓS-OPEN',
    category: 'PISTA',
    price: 10,
    batch: '3º LOTE',
    available: 200,
    total: 200,
    features: ['Entrada após o encerramento do Open Bar'],
    drinksIncluded: [],
    color: '#2563eb'
  }
];

// Pacotes promocionais (espelha o servidor): quantidade -> preço total
const TICKET_PACKS: Record<string, Record<number, number>> = {
  OPEN: { 2: 100, 3: 130 },
  PISTA: { 3: 20, 7: 50 }
};

const calculateTotal = (tier: TicketTier | undefined, quantity: number): number => {
  if (!tier?.price) return 0;
  const packs = TICKET_PACKS[tier.category] || {};
  const best: number[] = [0];
  for (let q = 1; q <= quantity; q++) {
    best[q] = best[q - 1] + tier.price;
    for (const [size, packPrice] of Object.entries(packs)) {
      const s = Number(size);
      if (s <= q) best[q] = Math.min(best[q], best[q - s] + packPrice);
    }
  }
  return best[quantity];
};

const getPackLabel = (tier: TicketTier | undefined): string => {
  const packs = TICKET_PACKS[tier?.category || ''] || {};
  return Object.entries(packs).map(([q, p]) => `${q} por R$ ${p}`).join(' • ');
};

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, preselectedTierId }) => {
  const [tiers, setTiers] = useState<TicketTier[]>(DEFAULT_TIERS);
  const [selectedTierId, setSelectedTierId] = useState<string>('t-open-50');
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('cartao');

  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const isIntegrationReady = true; // Habilita a integração Mercado Pago

  useEffect(() => {
    // Tiers are now hardcoded or fetched, but we initialize with both options.
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTiers(data);
        }
      })
      .catch(() => {});
  }, [isOpen, preselectedTierId]);

  // Aplica o tipo pré-selecionado (se houver) ao abrir
  useEffect(() => {
    if (isOpen && preselectedTierId) setSelectedTierId(preselectedTierId);
  }, [isOpen, preselectedTierId]);

  // Trava o scroll da página ao fundo enquanto o modal está aberto (mobile)
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);



  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = tiers.find(t => t.id === selectedTierId) || tiers[0] || {} as any;
  const totalPrice = calculateTotal(currentTier, quantity);
  const hasDiscount = !!currentTier?.price && totalPrice < currentTier.price * quantity;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!buyerName || !buyerEmail || !buyerPhone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isIntegrationReady) {
      setError('O pagamento ainda não está disponível. Tente novamente mais tarde.');
      return;
    }

    setIsLoading(true);
    audioManager.playClick();

    try {
      const sellerSlug = localStorage.getItem('referral_seller') || undefined;

      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: currentTier?.id,
          quantity,
          buyerName,
          buyerEmail,
          buyerPhone,
          sellerSlug,
          paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar pagamento.');
      }

      if (data.checkoutUrl) {
        audioManager.playSuccess();
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Link de pagamento não recebido.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar o pagamento.');
    } finally {
      setIsLoading(false);
    }
  };



  const inputClass = "w-full bg-[#120718] border-2 border-[#431424] px-3 text-base sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono h-12 sm:h-11";
  const labelClass = "block font-pixel text-[11px] sm:text-[12px] text-[#fca5a5] mb-1.5 uppercase font-bold";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overscroll-contain"
      style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-xl bg-[#0e0a17] border-2 border-[#ff3344] shadow-[0_0_35px_rgba(255,51,68,0.5)] rounded-xl text-[#f3edf9] flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100dvh - 6.5rem - env(safe-area-inset-bottom, 0px))' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
      >
        
        {/* Modal Header (fixo no topo) */}
        <div className="flex items-center justify-between gap-2 border-b-2 border-[#450a0a] px-4 sm:px-6 py-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <PixelSkull size={20} color="#ef4444" />
            <div className="min-w-0">
              <h2 id="ticket-modal-title" className="font-pixel text-[11px] sm:text-sm font-bold text-[#ff4455] tracking-wider leading-tight">
                BILHETERIA OFICIAL • THE TRIPLEX
              </h2>
              <span className="block font-mono text-[11px] sm:text-[12px] text-[#fca5a5] leading-tight mt-0.5">
                Open Bar • Pós-Open • Combos promocionais
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="shrink-0 w-10 h-10 flex items-center justify-center hover:bg-[#3b0710] active:bg-[#3b0710] text-[#fca5a5] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="flex flex-col min-h-0 flex-1">
          {/* Corpo rolável */}
          <div className="overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4 flex-1 min-h-0">

            {/* Informative Banner */}
            <div className="bg-[#1b0814] border border-[#7f1d1d] p-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#fca5a5] font-mono leading-snug flex-1 min-w-[180px]">
                Pague com segurança pelo <strong>Mercado Pago</strong> (PIX ou Cartão).
              </span>
              <span className="shrink-0 bg-[#052e16] border border-[#22c55e] text-[#86efac] font-pixel text-[10px] px-2 py-1">
                CHECKOUT OFICIAL
              </span>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 p-3 text-red-200 text-xs font-mono rounded" role="alert">
                {error}
              </div>
            )}

            {/* 1. Modalidade do Ingresso */}
            <div>
              <span className={labelClass}>MODALIDADE DO INGRESSO</span>
              <div className="grid grid-cols-1 gap-2" role="radiogroup">
                {tiers.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const packs = Object.entries(TICKET_PACKS[tier.category] || {});
                  return (
                    <button
                      key={tier.id}
                      id={`tier-${tier.id}`}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        audioManager.playClick();
                        setSelectedTierId(tier.id);
                      }}
                      className={`w-full p-3 sm:p-3.5 border-2 text-left transition-all cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? 'border-[#22c55e] bg-[#0c2414] shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                          : 'border-[#431424] bg-[#120718] hover:border-[#fca5a5]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {/* Indicador de seleção */}
                          <span className={`mt-0.5 shrink-0 w-4 h-4 border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#22c55e]' : 'border-[#6b2a3a]'
                          }`}>
                            {isSelected && <span className="w-2 h-2 bg-[#22c55e]" />}
                          </span>
                          <div className="min-w-0">
                            <span className="block font-pixel text-[12px] sm:text-sm text-white font-bold leading-tight">
                              {tier.name}
                            </span>
                            <span className="inline-block mt-1 bg-[#240c1e] text-[#fca5a5] px-1.5 py-0.5 border border-[#581c2b] font-pixel text-[10px] sm:text-[11px]">
                              {tier.batch}
                            </span>
                          </div>
                        </div>
                        <span className={`shrink-0 font-pixel text-base sm:text-lg font-bold leading-tight ${
                          isSelected ? 'text-[#22c55e]' : 'text-gray-400'
                        }`}>
                          R$ {tier.price.toFixed(2)}
                        </span>
                      </div>

                      {packs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 pl-[26px]">
                          {packs.map(([q, p]) => (
                            <span
                              key={q}
                              className={`font-mono text-[11px] px-2 py-0.5 border ${
                                isSelected
                                  ? 'bg-[#2a1a05] text-[#fbbf24] border-[#a16207]'
                                  : 'bg-[#1a0f12] text-[#d6a24a] border-[#4a2a10]'
                              }`}
                            >
                              {q} por R$ {p}
                            </span>
                          ))}
                        </div>
                      )}

                      <span className="block font-mono text-[10px] sm:text-[11px] text-[#fca5a5]/80 mt-2 pl-[26px]">
                        * Valor somente para vendas antecipadas
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Detalhes da modalidade selecionada */}
            {currentTier?.category === 'OPEN' ? (
              <div className="bg-[#12071a] border border-[#4c1d95] p-3 sm:p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#3b1754] pb-2">
                  <span className="font-pixel text-[11px] sm:text-[12px] text-[#d8b4fe] font-bold uppercase">
                    BEBIDAS INCLUSAS NO OPEN:
                  </span>
                  <span className="font-mono text-[11px] sm:text-[12px] text-[#86efac]">
                    21:00 às 00:00 • THE TRIPLEX
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentTier?.drinksIncluded?.map((drink: string, i: number) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 border font-mono ${
                        drink === '???'
                          ? 'bg-[#581c87] text-[#fef08a] border-[#eab308] font-pixel text-[12px] font-bold shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                          : 'bg-[#2e1065] text-[#e9d5ff] border-[#6b21a8]'
                      }`}
                    >
                      ✓ {drink}
                    </span>
                  ))}
                </div>
              </div>
            ) : currentTier?.id ? (
              <div className="bg-[#0a1226] border border-[#1e3a8a] p-3 sm:p-3.5">
                <span className="block font-pixel text-[11px] sm:text-[12px] text-[#93c5fd] font-bold uppercase mb-1">
                  ENTRADA PÓS-OPEN
                </span>
                <span className="block font-mono text-xs text-[#bfdbfe] leading-snug">
                  {currentTier?.features?.[0] || 'Entrada após o encerramento do Open Bar'} (a partir das 00:00). Não inclui bebidas do Open.
                </span>
              </div>
            ) : null}

            {/* 3. Dados do Comprador */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="buyer-name" className={labelClass}>NOME COMPLETO *</label>
                  <input
                    id="buyer-name"
                    type="text"
                    required
                    autoComplete="name"
                    autoCapitalize="words"
                    placeholder="Nome do titular"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="buyer-email" className={labelClass}>E-MAIL *</label>
                  <input
                    id="buyer-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="off"
                    placeholder="seu@email.com"
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="buyer-phone" className={labelClass}>TELEFONE (WHATSAPP) *</label>
                  <input
                    id="buyer-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="(11) 99999-9999"
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Quantidade */}
                <div>
                  <span className={labelClass}>QUANTIDADE DE INGRESSOS</span>
                  <div className="flex items-center gap-2 bg-[#120718] border-2 border-[#431424] p-1 h-12 sm:h-11">
                    <button
                      id="qty-minus"
                      type="button"
                      aria-label="Diminuir quantidade"
                      disabled={quantity <= 1}
                      onClick={() => {
                        audioManager.playClick();
                        setQuantity(prev => Math.max(1, prev - 1));
                      }}
                      className="w-11 sm:w-9 h-full bg-[#2d0f1b] hover:bg-[#431424] active:bg-[#431424] disabled:opacity-40 text-white font-pixel text-base flex items-center justify-center cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-pixel text-base text-white font-bold" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      id="qty-plus"
                      type="button"
                      aria-label="Aumentar quantidade"
                      disabled={quantity >= 10}
                      onClick={() => {
                        audioManager.playClick();
                        setQuantity(prev => Math.min(10, prev + 1));
                      }}
                      className="w-11 sm:w-9 h-full bg-[#2d0f1b] hover:bg-[#431424] active:bg-[#431424] disabled:opacity-40 text-white font-pixel text-base flex items-center justify-center cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Total & Botão de Checkout (fixo no rodapé) */}
          <div className="shrink-0 border-t-2 border-[#381622] bg-[#0b0712] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-[#9ca3af] block font-mono leading-tight">
                VALOR TOTAL • {quantity} {quantity === 1 ? 'ingresso' : 'ingressos'}
              </span>
              <span className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold leading-tight">
                R$ {totalPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-[#fbbf24] font-mono block leading-tight">
                  🔥 Combo • economia de R$ {(currentTier.price * quantity - totalPrice).toFixed(2)}
                </span>
              )}
              <span className="text-[9px] sm:text-[10px] text-[#fca5a5]/70 font-mono block leading-tight mt-0.5">
                * Valor somente para vendas antecipadas
              </span>
            </div>

            <button
              id="ticket-checkout-btn"
              type="submit"
              disabled={!isIntegrationReady || isLoading}
              className={`shrink-0 pixel-btn ${(!isIntegrationReady || isLoading) ? 'bg-gray-700 border-gray-500 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#15803d] hover:bg-[#16a34a] active:bg-[#14532d] text-white border-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.6)] cursor-pointer'} px-4 sm:px-6 h-12 font-pixel text-[11px] sm:text-[13px] tracking-wider font-bold flex items-center justify-center border-2 transition-all whitespace-nowrap`}
            >
              {!isIntegrationReady 
                ? 'INDISPONÍVEL' 
                : isLoading 
                  ? 'GERANDO...' 
                  : 'COMPRAR'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
