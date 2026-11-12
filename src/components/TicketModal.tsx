import React, { useState, useEffect } from 'react';
import { PixelClose, PixelFlame, PixelTicketIcon, PixelCocktail, PixelSparkles } from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { TicketTier } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTierId?: string | null;
}

const DEFAULT_TIERS: TicketTier[] = [
  {
    id: 't-open',
    name: 'Ingresso Open',
    category: 'OPEN',
    price: 35,
    batch: 'Oferta Relâmpago',
    available: 500,
    total: 500,
    features: ['Oferta Relâmpago', 'Caipirinha por 1h no início do Open'],
    drinksIncluded: ['Gin', 'Vodka', 'Energético'],
    color: '#dc2626'
  }
];

const MAX_TICKET_QUANTITY = 50;

export const calculateIngressoTotal = (quantity: number): number => {
  if (quantity <= 0) return 0;
  return quantity * 35;
};

export const calculateTicketModalTotal = (tier: TicketTier | undefined, quantity: number): number => {
  if (quantity <= 0) return 0;
  return quantity * (tier?.price || 35);
};

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
  const [tiers, setTiers] = useState<TicketTier[]>(DEFAULT_TIERS);
  const [selectedTierId, setSelectedTierId] = useState<string>('t-open');
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [paymentMethod] = useState<'pix' | 'cartao'>('cartao');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isIntegrationReady = true;

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const openOnly = data.filter((t: TicketTier) => t.category === 'OPEN' || t.id === 't-open');
          if (openOnly.length > 0) {
            setTiers(openOnly);
            setSelectedTierId(openOnly[0].id);
          }
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Trava o scroll da página ao fundo enquanto o modal está aberto
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTier = tiers.find((t) => t.id === selectedTierId) || tiers[0] || DEFAULT_TIERS[0];
  const unitPrice = currentTier?.price || 35;
  const totalPrice = calculateTicketModalTotal(currentTier, quantity);
  const drinks = currentTier?.drinksIncluded?.length
    ? currentTier.drinksIncluded
    : ['Gin', 'Vodka', 'Energético'];

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
          ticketId: currentTier?.id || 't-open',
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

  const inputClass =
    'w-full bg-[#120718]/90 border-2 border-[#431424] rounded-lg px-3.5 text-base sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] focus:shadow-[0_0_15px_rgba(34,197,94,0.25)] outline-hidden font-mono h-11 transition-all duration-200';
  const labelClass =
    'block font-pixel text-[12px] sm:text-[13px] text-[#fca5a5] mb-1.5 font-bold tracking-wide';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel max-w-xl bg-[#0e0a17]/98 border-2 border-[#ff3344] shadow-[0_0_45px_rgba(255,51,68,0.45)] rounded-2xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
      >
        {/* Modal Header (fixo no topo) */}
        <div className="flex items-center justify-between gap-2 border-b-2 border-[#450a0a] px-4 sm:px-6 py-3.5 shrink-0 bg-[#0e0a17]">
          <div className="flex items-center gap-2.5 min-w-0">
            <PixelCocktail size={22} color="#f59e0b" className="shrink-0" />
            <div className="min-w-0">
              <h2
                id="ticket-modal-title"
                className="font-pixel text-sm sm:text-base font-bold text-[#ff4455] tracking-wider leading-tight"
              >
                INGRESSOS • CARNATAL
              </h2>
              <span className="block font-mono text-xs text-[#fde047] leading-tight mt-0.5">
                19 - Dez - 21h • Ingresso Open — Oferta Relâmpago
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#3b0710] active:scale-95 text-[#fca5a5] hover:text-white cursor-pointer transition-all duration-200"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="flex flex-col min-h-0 flex-1">
          {/* Corpo rolável */}
          <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-4 space-y-4">
            {/* Informative Banner */}
            <div className="bg-[#1b0814] border border-[#7f1d1d] rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#fca5a5] font-mono leading-snug flex-1 min-w-[170px]">
                Pague com segurança pelo <strong>Mercado Pago</strong> (Pix ou Cartão).
              </span>
              <span className="shrink-0 bg-[#052e16] border border-[#22c55e] rounded-md text-[#86efac] font-pixel text-[11px] px-2.5 py-1">
                CHECKOUT OFICIAL
              </span>
            </div>

            {error && (
              <div
                className="bg-red-900/50 border border-red-500 p-3 text-red-200 text-xs font-mono rounded-xl animate-[fadeIn_0.2s_ease-out]"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* 1. Card Principal: Ingresso Open - Oferta Relâmpago */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={labelClass}>MODALIDADE DISPONÍVEL</span>
                <span className="inline-flex items-center gap-1 bg-[#f59e0b]/20 border border-[#f59e0b] text-[#fde047] px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse">
                  <PixelFlame size={12} color="#fde047" />
                  <span>Oferta Relâmpago</span>
                </span>
              </div>

              <div className="w-full p-4 rounded-xl border-2 border-[#22c55e] bg-gradient-to-br from-[#0c2414]/95 via-[#101c18]/95 to-[#160b24]/95 shadow-[0_0_25px_rgba(34,197,94,0.22)] transition-all duration-300 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="mt-1 shrink-0 w-4 h-4 rounded-full border-2 border-[#22c55e] flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    </span>
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5 font-pixel text-base sm:text-lg text-white font-bold leading-tight">
                        <PixelTicketIcon size={16} color="#4ade80" className="shrink-0" />
                        <span>{currentTier.name}</span>
                      </span>
                      <span className="inline-block mt-1 bg-[#f59e0b] text-[#0b0712] px-2 py-0.5 rounded font-pixel text-[11px] font-bold">
                        Oferta Relâmpago • Lote Especial
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-pixel text-lg sm:text-xl font-bold text-[#4ade80] leading-none">
                      R$ {unitPrice.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#86efac]">por ingresso</span>
                  </div>
                </div>

                {/* Info de Bebidas do Open */}
                <div className="pt-2.5 border-t border-[#22c55e]/30 space-y-2.5">
                  <div>
                    <span className="block text-xs text-[#bbf7d0] oleo-script-swash-caps-bold mb-1.5 flex items-center gap-1.5">
                      <PixelCocktail size={13} color="#4ade80" />
                      <span>Bebidas do Open Bar:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {drinks.map((drink) => (
                        <span
                          key={drink}
                          className="bg-[#052e16] border-2 border-[#000000] shadow-[2px_2px_0px_#000000] text-[#bbf7d0] px-3 py-1 rounded-lg text-xs sm:text-sm oleo-script-swash-caps-bold inline-flex items-center gap-1.5"
                        >
                          <PixelCocktail size={13} color="#facc15" />
                          <span>{drink}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Destaque Caipirinha por 1h no início do Open */}
                  <div className="bg-[#2a1205]/90 border-2 border-[#f59e0b] rounded-xl p-2.5 flex items-center gap-2.5 shadow-[3px_3px_0px_#000000]">
                    <PixelSparkles size={16} color="#fde047" className="shrink-0" />
                    <span className="text-xs sm:text-sm text-[#fef08a] oleo-script-swash-caps-regular leading-snug">
                      Especial: <strong className="oleo-script-swash-caps-bold">Caipirinha liberada por 1h</strong> no início do Open!
                    </span>
                  </div>
                </div>
              </div>

              <span className="block font-mono text-[11px] text-[#fca5a5]/80 mt-1.5">
                * Valor promocional de Oferta Relâmpago para vendas antecipadas. Após a compra, não realizamos estorno.
              </span>
            </div>

            {/* 2. Dados do Comprador */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="buyer-name" className={labelClass}>
                    NOME COMPLETO *
                  </label>
                  <input
                    id="buyer-name"
                    type="text"
                    required
                    autoComplete="name"
                    autoCapitalize="words"
                    placeholder="Nome do titular"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="buyer-email" className={labelClass}>
                    E-MAIL *
                  </label>
                  <input
                    id="buyer-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="off"
                    placeholder="seu@email.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="buyer-phone" className={labelClass}>
                    TELEFONE (WHATSAPP) *
                  </label>
                  <input
                    id="buyer-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="(11) 99999-9999"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Quantidade */}
                <div>
                  <span className={labelClass}>QUANTIDADE (INGRESSO OPEN)</span>
                  <div className="flex items-center gap-2 bg-[#120718]/90 border-2 border-[#431424] rounded-lg p-1 h-11">
                    <button
                      id="qty-minus"
                      type="button"
                      aria-label="Diminuir quantidade"
                      disabled={quantity <= 1}
                      onClick={() => {
                        audioManager.playClick();
                        setQuantity((prev) => Math.max(1, prev - 1));
                      }}
                      className="w-10 sm:w-9 h-full rounded-md bg-[#2d0f1b] hover:bg-[#431424] active:scale-95 disabled:opacity-40 text-white font-pixel text-base flex items-center justify-center cursor-pointer select-none transition-all duration-150"
                    >
                      -
                    </button>
                    <span
                      className="flex-1 text-center font-pixel text-base text-white font-bold tabular-nums transition-all duration-150"
                      aria-live="polite"
                    >
                      {quantity}
                    </span>
                    <button
                      id="qty-plus"
                      type="button"
                      aria-label="Aumentar quantidade"
                      disabled={quantity >= MAX_TICKET_QUANTITY}
                      onClick={() => {
                        audioManager.playClick();
                        setQuantity((prev) => Math.min(MAX_TICKET_QUANTITY, prev + 1));
                      }}
                      className="w-10 sm:w-9 h-full rounded-md bg-[#2d0f1b] hover:bg-[#431424] active:scale-95 disabled:opacity-40 text-white font-pixel text-base flex items-center justify-center cursor-pointer select-none transition-all duration-150"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Total & Botão de Checkout (fixo no rodapé) */}
          <div className="shrink-0 border-t-2 border-[#381622] bg-[#0b0712] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs text-[#fde047] block font-mono leading-tight">
                Ingresso Open (Oferta Relâmpago) • {quantity} {quantity === 1 ? 'ingresso' : 'ingressos'}
              </span>
              <span className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold leading-tight tabular-nums">
                R$ {totalPrice.toFixed(2)}
              </span>
              <span className="text-[11px] text-[#86efac] font-mono block leading-tight mt-0.5">
                Gin, Vodka, Energético + 1h de Caipirinha no início
              </span>
            </div>

            <button
              id="ticket-checkout-btn"
              type="submit"
              disabled={!isIntegrationReady || isLoading}
              className={`shrink-0 pixel-btn rounded-xl ${
                !isIntegrationReady || isLoading
                  ? 'bg-gray-700 border-gray-500 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#15803d] hover:bg-[#16a34a] active:bg-[#14532d] text-white border-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.6)] cursor-pointer'
              } px-5 sm:px-7 h-12 font-pixel text-xs sm:text-sm tracking-wider font-bold flex items-center justify-center border-2 transition-all duration-200 whitespace-nowrap`}
            >
              {!isIntegrationReady ? 'INDISPONÍVEL' : isLoading ? 'GERANDO...' : 'COMPRAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
