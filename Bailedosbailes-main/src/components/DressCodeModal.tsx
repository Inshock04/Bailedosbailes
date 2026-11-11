import React, { useEffect } from 'react';
import { PixelClose, PixelWardrobe, PixelCrown, PixelStar } from './PixelIcons';
import { audioManager } from '../utils/audio';

interface DressCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DressCodeModal: React.FC<DressCodeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel max-w-xl bg-[#100818] border-2 border-[#a855f7] shadow-[0_0_35px_rgba(168,85,247,0.5)] rounded-xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b-2 border-[#581c87] px-4 sm:px-6 py-3 bg-[#100818]">
          <div className="flex items-center gap-2 min-w-0">
            <PixelWardrobe size={22} color="#c084fc" className="shrink-0" />
            <div className="min-w-0">
              <h2 className="font-pixel text-sm sm:text-base font-bold text-[#e9d5ff] tracking-wider leading-tight">
                DRESS CODE • GUIA DE ESTILO
              </h2>
              <span className="block font-mono text-xs text-[#c084fc] leading-tight mt-0.5">
                Concurso de Fantasias — Parte 2
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="shrink-0 w-9 h-9 flex items-center justify-center hover:bg-[#3b0764] text-[#e9d5ff] cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Content & Lookbook */}
        <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-4 space-y-3 font-mono text-xs sm:text-sm text-[#d1d5db]">
          <div className="bg-[#1b0d2d] border border-[#7e22ce] p-3 text-left">
            <span className="font-pixel text-[12px] sm:text-[13px] text-[#fde047] flex items-center gap-1.5 mb-1">
              <PixelStar size={13} color="#fde047" />
              <span>CONCEITO: GOTHIC GLAMOUR & RETRO HORROR</span>
            </span>
            <p className="leading-relaxed">
              Incentivamos todos os convidados a entrarem de cabeça na estética do Hotel Cortez. Trajes temáticos, alfaiataria decadente dos anos 20, visual vampírico aristocrata ou fantasias icônicas de horror.
            </p>
          </div>

          {/* 3 Style Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-[#150720] border border-[#6b21a8] p-3">
              <span className="font-pixel text-[11px] sm:text-[12px] text-[#f43f5e] block mb-1">
                1. A CONDESSA
              </span>
              <p className="text-xs text-[#c4b5fd] leading-relaxed">
                Vestidos de alta costura, luvas com garras prateadas, veludo escuro e joias vintage.
              </p>
            </div>
            <div className="bg-[#150720] border border-[#6b21a8] p-3">
              <span className="font-pixel text-[11px] sm:text-[12px] text-[#fbbf24] block mb-1">
                2. VINTAGE NOIR
              </span>
              <p className="text-xs text-[#c4b5fd] leading-relaxed">
                Smokings anos 1920, suspensórios, bengalas com castão, cartolas e maquiagem retrô.
              </p>
            </div>
            <div className="bg-[#150720] border border-[#6b21a8] p-3">
              <span className="font-pixel text-[11px] sm:text-[12px] text-[#34d399] block mb-1">
                3. ALL BLACK & GOTH
              </span>
              <p className="text-xs text-[#c4b5fd] leading-relaxed">
                Couro, rendas, corset, botas pesadas, capas e maquiagem dark marcante.
              </p>
            </div>
          </div>

          {/* Costume Contest Notice */}
          <div className="bg-[#241306] border border-[#d97706] p-3 flex items-start gap-2.5">
            <PixelCrown size={22} color="#fbbf24" className="shrink-0 mt-0.5" />
            <div>
              <span className="font-pixel text-[11px] sm:text-[12px] text-[#fef08a] block mb-0.5">
                CONCURSO DE FANTASIAS — PARTE 2:
              </span>
              <p className="text-xs text-[#fed7aa] leading-relaxed">
                O concurso está de volta! Prepare sua melhor produção, solte a criatividade e entre na disputa durante a festa.
              </p>
            </div>
          </div>

          {/* Prohibited items */}
          <div className="bg-[#240810] border border-[#7f1d1d] p-3 text-xs text-[#fca5a5]">
            <span className="font-pixel text-[11px] sm:text-[12px] text-[#ef4444] block mb-0.5">
              ITENS NÃO PERMITIDOS:
            </span>
            <p>
              Objetos cortantes ou perfurantes reais, réplicas de armas com metal, fogos de artifício e recipientes de vidro externos.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-[#581c87] bg-[#0b0512] flex justify-end">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="pixel-btn bg-[#7e22ce] hover:bg-[#9333ea] text-white px-5 py-2.5 font-pixel text-[12px] sm:text-[13px] font-bold cursor-pointer"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};
