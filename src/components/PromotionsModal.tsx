import React, { useState, useEffect } from 'react';
import { PixelClose, PixelCocktail, PixelCheck, PixelSkull } from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { Promotion } from '../types';

interface PromotionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTickets: () => void;
}

export const PromotionsModal: React.FC<PromotionsModalProps> = ({ isOpen, onClose, onOpenTickets }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/promotions')
      .then(res => res.json())
      .then(data => setPromotions(data.filter((p: Promotion) => p.active)))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = (promo: Promotion) => {
    audioManager.playSuccess();
    setClaimedNotice(`Promoção "${promo.name}" salva! Apresente o código promocional no bar.`);
    setTimeout(() => setClaimedNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0712] border-2 border-[#d97706] shadow-[0_0_35px_rgba(217,119,6,0.5)] rounded-xl p-4 sm:p-6 text-[#f3edf9] my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#451a03] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelCocktail size={20} color="#fbbf24" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#fef08a] tracking-wider">
                PROMOÇÕES DA NOITE • BAR CORTEZ
              </h2>
              <span className="font-mono text-[12px] text-[#fbbf24]">
                Valores exclusivos e combos especiais para a festa
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#3b1c04] text-[#fbbf24] cursor-pointer"
          >
            <PixelClose size={16} />
          </button>
        </div>

        {claimedNotice && (
          <div className="mb-4 p-2.5 bg-[#064e3b] border border-[#10b981] text-[#a7f3d0] font-mono text-xs flex items-center gap-2">
            <PixelCheck size={16} color="#34d399" />
            <span>{claimedNotice}</span>
          </div>
        )}

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {promotions.map(promo => (
            <div
              key={promo.id}
              className="bg-[#190d18] border-2 border-[#5c2807] p-3 flex flex-col justify-between hover:border-[#f59e0b] transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-pixel text-[11px] text-[#fef08a] font-bold">
                    {promo.name}
                  </span>
                  {promo.tag && (
                    <span className="bg-[#991b1b] text-white font-pixel text-[9px] px-1.5 py-0.5">
                      {promo.tag}
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-[#d1d5db] font-mono leading-tight mb-2">
                  {promo.description}
                </p>

                <div className="text-[11px] font-pixel text-[#9ca3af] mb-2">
                  QUANTIDADE: {promo.quantity}
                </div>
              </div>

              <div className="pt-2 border-t border-[#3d1806] flex items-center justify-between">
                <div>
                  {promo.originalPrice && (
                    <span className="text-[12px] text-[#6b7280] line-through font-mono mr-1.5">
                      R$ {promo.originalPrice}
                    </span>
                  )}
                  <span className="font-pixel text-xs text-[#22c55e] font-bold">
                    R$ {promo.price}
                  </span>
                </div>

                <button
                  onClick={() => handleClaim(promo)}
                  className="pixel-btn bg-[#d97706] hover:bg-[#f59e0b] text-black px-2.5 py-1.5 font-pixel text-[10px] font-bold tracking-wider"
                >
                  SALVAR PROMO
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#3d1806] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[12px] font-mono text-[#9ca3af]">
            * Bebidas alcoólicas destinadas exclusivamente a maiores de 18 anos.
          </span>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
              onOpenTickets();
            }}
            className="pixel-btn bg-[#991b1b] hover:bg-[#b91c1c] text-white px-4 py-2 font-pixel text-[10px]"
          >
            COMPRAR INGRESSO OPEN BAR 💀
          </button>
        </div>

      </div>
    </div>
  );
};
