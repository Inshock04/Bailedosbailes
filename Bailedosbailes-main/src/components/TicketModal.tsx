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
    id: 't-open-45',
    name: 'INGRESSO OPEN',
    category: 'OPEN',
    price: 45,
    originalPrice: 65,
    batch: '1º LOTE',
    available: 200,
    total: 200,
    features: [
      'Open Bar das 21:00 às 00:00'
    ],
    drinksIncluded: ['Gin', 'Vodka', 'Energético', 'Caipirinha', 'Canelinha', '???'],
    color: '#991b1b'
  }
];

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, preselectedTierId }) => {
  const [tiers, setTiers] = useState<TicketTier[]>(DEFAULT_TIERS);
  const [selectedTierId, setSelectedTierId] = useState<string>('t-open-45');
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTiers(data);
          setSelectedTierId(data[0].id);
        }
      })
      .catch(() => {});
  }, [isOpen, preselectedTierId]);

  if (!isOpen) return null;

  const currentTier = tiers[0] || DEFAULT_TIERS[0];
  const totalPrice = currentTier ? currentTier.price * quantity : 0;

  const handleWhatsAppRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    audioManager.playSuccess();

    const tierName = currentTier?.name || 'Ingresso Open - Hotel Cortez';
    const batch = currentTier?.batch || '1º Lote';
    const totalFormatted = totalPrice.toFixed(2);
    const nameLine = buyerName.trim() ? `\n👤 *Nome:* ${buyerName.trim()}` : '';

    const message =
      `Olá! Gostaria de garantir meu ingresso para o *Halloween Hotel Cortez 2026* no *The Triplex*:\n\n` +
      `🎫 *Ingresso:* ${tierName} (R$ 45,00)\n` +
      `📦 *Lote:* ${batch}\n` +
      `🔢 *Quantidade:* ${quantity} ingresso(s)\n` +
      `💰 *Total:* R$ ${totalFormatted}${nameLine}\n` +
      `📍 *Local:* The Triplex (Rua Manoel Castilho, 201 - Itaim Paulista, SP)\n\n` +
      `Poderia me passar a chave PIX oficial e as instruções para confirmação da reserva?`;

    const whatsappUrl = `https://wa.me/5511943963952?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="relative w-full max-w-xl bg-[#0e0a17] border-2 border-[#ff3344] shadow-[0_0_35px_rgba(255,51,68,0.5)] rounded-xl p-4 sm:p-6 text-[#f3edf9] my-auto mb-20 sm:mb-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#450a0a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#ff4455] tracking-wider">
                BILHETERIA OFICIAL • THE TRIPLEX
              </h2>
              <span className="font-mono text-[12px] text-[#fca5a5]">
                Ingresso Open R$ 45,00 • Atendimento Direto via WhatsApp
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#3b0710] text-[#fca5a5] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="mb-4 bg-[#1b0814] border border-[#7f1d1d] p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <WhatsAppIcon className="text-[#22c55e]" size={16} />
            <span className="text-xs text-[#fca5a5] font-mono leading-tight">
              Finalize seu pedido diretamente no <strong>WhatsApp Oficial</strong> com a organização.
            </span>
          </div>
          <span className="shrink-0 bg-[#052e16] border border-[#22c55e] text-[#86efac] font-pixel text-[10px] px-2 py-1">
            CANAL OFICIAL
          </span>
        </div>

        <form onSubmit={handleWhatsAppRedirect} className="space-y-4">
          
          {/* 1. Modalidade do Ingresso (Única opção Open 45 reais) */}
          <div>
            <label className="block font-pixel text-[12px] sm:text-[13px] text-[#fca5a5] mb-2 uppercase font-bold">
              MODALIDADE DO INGRESSO
            </label>
            <div className="p-3.5 border-2 border-[#22c55e] bg-[#0c2414] shadow-[0_0_15px_rgba(34,197,94,0.3)] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="font-pixel text-xs sm:text-sm text-white font-bold">
                  INGRESSO OPEN
                </span>
                <span className="bg-[#240c1e] text-[#fca5a5] px-1.5 py-0.5 border border-[#581c2b] font-pixel text-[11px]">
                  1º LOTE
                </span>
              </div>
              <div className="text-right">
                <span className="font-pixel text-base sm:text-lg text-[#22c55e] font-bold">
                  R$ 45,00
                </span>
              </div>
            </div>
          </div>

          {/* 2. Bebidas Inclusas no Open */}
          <div className="bg-[#12071a] border border-[#4c1d95] p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#3b1754] pb-2">
              <span className="font-pixel text-[12px] text-[#d8b4fe] font-bold uppercase">
                BEBIDAS INCLUSAS NO OPEN:
              </span>
              <span className="font-mono text-[12px] text-[#86efac]">
                A partir das 21:00 • THE TRIPLEX
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Gin', 'Vodka', 'Energético', 'Caipirinha', 'Canelinha', '???'].map((drink, i) => (
                <span
                  key={i}
                  className={`text-xs px-2.5 py-1 border font-mono ${
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

          {/* 3. Quantidade & Nome do Titular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Quantidade */}
            <div>
              <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 uppercase font-bold">
                QUANTIDADE DE INGRESSOS
              </label>
              <div className="flex items-center gap-2 bg-[#120718] border-2 border-[#431424] p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setQuantity(prev => Math.max(1, prev - 1));
                  }}
                  className="w-8 h-8 bg-[#2d0f1b] hover:bg-[#431424] text-white font-pixel text-xs flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="flex-1 text-center font-pixel text-sm text-white font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setQuantity(prev => Math.min(10, prev + 1));
                  }}
                  className="w-8 h-8 bg-[#2d0f1b] hover:bg-[#431424] text-white font-pixel text-xs flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Nome Opcional */}
            <div>
              <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 uppercase font-bold">
                NOME DO TITULAR (OPCIONAL)
              </label>
              <input
                type="text"
                placeholder="Seu nome para a mensagem"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="w-full bg-[#120718] border-2 border-[#431424] px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono h-11"
              />
            </div>
          </div>

          {/* 4. Total & Botão Oficial WhatsApp */}
          <div className="pt-3 border-t-2 border-[#381622] flex flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-[#9ca3af] block font-mono">VALOR TOTAL</span>
              <span className="font-pixel text-base sm:text-xl text-[#22c55e] font-bold">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="flex-1 sm:flex-none pixel-btn bg-[#15803d] hover:bg-[#16a34a] active:bg-[#14532d] text-white px-3 sm:px-6 py-2.5 sm:py-3.5 font-pixel text-[10px] sm:text-[13px] tracking-wider font-bold flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.6)] cursor-pointer transition-all whitespace-nowrap"
            >
              <WhatsAppIcon className="text-white" size={16} />
              <span>GARANTIR NO WHATSAPP</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
