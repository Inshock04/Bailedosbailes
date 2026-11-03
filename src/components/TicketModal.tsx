import React, { useState, useEffect } from 'react';
import { PixelClose, PixelSkull, PixelFlame, PixelTicketIcon } from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { TicketTier } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTierId?: string | null;
}

const DEFAULT_TIERS: TicketTier[] = [
  {
    id: 't-ingresso',
    name: 'Ingresso',
    category: 'PISTA',
    price: 10,
    batch: 'ANTECIPADO',
    available: 500,
    total: 500,
    features: ['Acesso oficial ao evento das 22:00 às 06:00'],
    drinksIncluded: [],
    color: '#dc2626'
  }
];

const QUICK_COMBOS = [
  { qty: 1, label: '1 por R$ 10' },
  { qty: 3, label: '3 por R$ 20' },
  { qty: 5, label: '5 por R$ 30' }
];

const MAX_TICKET_QUANTITY = 50;

/**
 * Regra progressiva oficial:
 * 1 por R$ 10 (2 = R$ 20)
 * 3 por R$ 20 (4 = R$ 30)
 * 5 por R$ 30
 * A partir de 5 ingressos, cada ingresso adicional custa R$ 5 (6 = 35, 7 = 40, ...)
 */
export const calculateIngressoTotal = (quantity: number): number => {
  if (quantity <= 0) return 0;
  if (quantity === 1) return 10;
  if (quantity === 2) return 20;
  if (quantity === 3) return 20;
  if (quantity === 4) return 30;
  return 30 + (quantity - 5) * 5;
};

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, preselectedTierId }) => {
  const [tiers, setTiers] = useState<TicketTier[]>(DEFAULT_TIERS);
  const [selectedTierId, setSelectedTierId] = useState<string>('t-ingresso');
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
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const validTiers = data.filter((t: TicketTier) => t.category !== 'OPEN');
          if (validTiers.length > 0) {
            setTiers(validTiers);
            setSelectedTierId(validTiers[0].id);
          }
        }
      })
      .catch(() => {});
  }, [isOpen, preselectedTierId]);

  useEffect(() => {
    if (isOpen && preselectedTierId) {
      setSelectedTierId(preselectedTierId);
    }
  }, [isOpen, preselectedTierId]);

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

  const currentTier = tiers.find(t => t.id === selectedTierId) || tiers[0] || DEFAULT_TIERS[0];
  const baseUnitPrice = currentTier?.price || 10;
  const totalPrice = calculateIngressoTotal(quantity);
  const fullPrice = baseUnitPrice * quantity;
  const savings = Math.max(0, fullPrice - totalPrice);
  const hasDiscount = savings > 0;

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
          ticketId: currentTier?.id || 't-ingresso',
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
    'w-full bg-[#120718] border-2 border-[#431424] px-3 text-base sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono h-11';
  const labelClass =
    'block font-pixel text-[11px] sm:text-[12px] text-[#fca5a5] mb-1.5 uppercase font-bold';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel max-w-xl bg-[#0e0a17] border-2 border-[#ff3344] shadow-[0_0_35px_rgba(255,51,68,0.5)] rounded-xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-modal-title"
      >
        {/* Modal Header (fixo no topo) */}
        <div className="flex items-center justify-between gap-2 border-b-2 border-[#450a0a] px-4 sm:px-6 py-3 shrink-0 bg-[#0e0a17]">
          <div className="flex items-center gap-2 min-w-0">
            <PixelSkull size={20} color="#ef4444" className="shrink-0" />
            <div className="min-w-0">
              <h2
                id="ticket-modal-title"
                className="font-pixel text-[11px] sm:text-sm font-bold text-[#ff4455] tracking-wider leading-tight"
              >
                BILHETERIA OFICIAL • THE TRIPLEX
              </h2>
              <span className="block font-mono text-[11px] sm:text-[12px] text-[#fca5a5] leading-tight mt-0.5">
                07 de Novembro • 22h às 06h • Combos promocionais
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="shrink-0 w-9 h-9 flex items-center justify-center hover:bg-[#3b0710] active:bg-[#3b0710] text-[#fca5a5] cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="flex flex-col min-h-0 flex-1">
          {/* Corpo rolável */}
          <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-3.5 space-y-3.5">
            {/* Informative Banner */}
            <div className="bg-[#1b0814] border border-[#7f1d1d] p-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[#fca5a5] font-mono leading-snug flex-1 min-w-[170px]">
                Pague com segurança pelo <strong>Mercado Pago</strong> (PIX ou Cartão).
              </span>
              <span className="shrink-0 bg-[#052e16] border border-[#22c55e] text-[#86efac] font-pixel text-[10px] px-2 py-1">
                CHECKOUT OFICIAL
              </span>
            </div>

            {error && (
              <div
                className="bg-red-900/50 border border-red-500 p-3 text-red-200 text-xs font-mono rounded"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* 1. Card Único do Ingresso + Combos */}
            <div>
              <span className={labelClass}>SEU INGRESSO</span>
              <div className="w-full p-3.5 border-2 border-[#22c55e] bg-[#0c2414]/90 shadow-[0_0_15px_rgba(34,197,94,0.25)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <PixelTicketIcon size={18} color="#4ade80" className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="block font-pixel text-sm sm:text-base text-white font-bold leading-tight uppercase">
                        {currentTier.name}
                      </span>
                      <span className="inline-block mt-1 bg-[#14532d] text-[#bbf7d0] px-1.5 py-0.5 border border-[#22c55e]/60 font-pixel text-[10px] sm:text-[11px]">
                        22:00 ÀS 06:00 • ANTECIPADO
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 font-pixel text-base sm:text-lg text-[#22c55e] font-bold leading-tight">
                    R$ 10,00
                  </span>
                </div>

                {/* Seletores rápidos de combo */}
                <div className="mt-3 pt-2.5 border-t border-[#166534]/70">
                  <span className="block font-pixel text-[10px] sm:text-[11px] text-[#fde047] uppercase mb-1.5">
                    ESCOLHA UM COMBO OU AJUSTE A QUANTIDADE:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {QUICK_COMBOS.map((combo) => {
                      const active = quantity === combo.qty;
                      return (
                        <button
                          key={combo.qty}
                          type="button"
                          onClick={() => {
                            audioManager.playClick();
                            setQuantity(combo.qty);
                          }}
                          className={`py-1.5 px-2 border font-mono text-xs font-bold transition-all cursor-pointer text-center ${
                            active
                              ? 'bg-[#f59e0b] text-[#0b0712] border-[#fef08a] shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'bg-[#1a1207] text-[#fbbf24] border-[#a16207] hover:border-[#fde047]'
                          }`}
                        >
                          {combo.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="block font-mono text-[11px] text-[#86efac] mt-2 leading-snug">
                    A partir de 5 ingressos, cada ingresso adicional sai por <strong>R$ 5,00</strong> (6 por R$ 35 • 7 por R$ 40...).
                  </span>
                  <span className="block font-mono text-[10px] text-[#fca5a5]/80 mt-1">
                    * Valor válido somente para vendas antecipadas. Após a compra, não realizamos estorno.
                  </span>
                </div>
              </div>
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
                  <span className={labelClass}>QUANTIDADE DE INGRESSOS</span>
                  <div className="flex items-center gap-2 bg-[#120718] border-2 border-[#431424] p-1 h-11">
                    <button
                      id="qty-minus"
                      type="button"
                      aria-label="Diminuir quantidade"
                      disabled={quantity <= 1}
                      onClick={() => {
                        audioManager.playClick();
                        setQuantity((prev) => Math.max(1, prev - 1));
                      }}
                      className="w-10 sm:w-9 h-full bg-[#2d0f1b] hover:bg-[#431424] active:bg-[#431424] disabled:opacity-40 text-white font-pixel text-base flex items-center justify-center cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span
                      className="flex-1 text-center font-pixel text-base text-white font-bold tabular-nums"
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
                      className="w-10 sm:w-9 h-full bg-[#2d0f1b] hover:bg-[#431424] active:bg-[#431424] disabled:opacity-40 text-white font-pixel text-base flex items-center justify-center cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Total & Botão de Checkout (fixo no rodapé) */}
          <div className="shrink-0 border-t-2 border-[#381622] bg-[#0b0712] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-[#9ca3af] block font-mono leading-tight">
                VALOR TOTAL • {quantity} {quantity === 1 ? 'ingresso' : 'ingressos'}
              </span>
              <span className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold leading-tight tabular-nums">
                R$ {totalPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-[#fbbf24] font-mono flex items-center gap-1 leading-tight mt-0.5">
                  <PixelFlame size={12} color="#fbbf24" />
                  <span>Combo • economia de R$ {savings.toFixed(2)}</span>
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
              className={`shrink-0 pixel-btn ${
                !isIntegrationReady || isLoading
                  ? 'bg-gray-700 border-gray-500 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#15803d] hover:bg-[#16a34a] active:bg-[#14532d] text-white border-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.6)] cursor-pointer'
              } px-4 sm:px-6 h-12 font-pixel text-[11px] sm:text-[13px] tracking-wider font-bold flex items-center justify-center border-2 transition-all whitespace-nowrap`}
            >
              {!isIntegrationReady ? 'INDISPONÍVEL' : isLoading ? 'GERANDO...' : 'COMPRAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
