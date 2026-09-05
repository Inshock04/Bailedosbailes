import React from 'react';
import { PixelClose, PixelWardrobe, PixelSkull, PixelCrown } from './PixelIcons';
import { audioManager } from '../utils/audio';

interface DressCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DressCodeModal: React.FC<DressCodeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#100818] border-2 border-[#a855f7] shadow-[0_0_35px_rgba(168,85,247,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#581c87] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelWardrobe size={22} color="#c084fc" />
            <div>
              <h2 className="font-pixel text-sm sm:text-base font-bold text-[#e9d5ff] tracking-wider">
                DRESS CODE • GUIA DE ESTILO
              </h2>
              <span className="font-mono text-xs text-[#c084fc]">
                Concurso de Fantasias com R$ 5.000 em premiações
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#3b0764] text-[#e9d5ff] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Content & Lookbook */}
        <div className="space-y-3 font-mono text-xs sm:text-sm text-[#d1d5db]">
          <div className="bg-[#1b0d2d] border border-[#7e22ce] p-3 text-left">
            <span className="font-pixel text-[10px] sm:text-[11px] text-[#fde047] block mb-1">
              ✦ CONCEITO: GOTHIC GLAMOUR & RETRO HORROR
            </span>
            <p className="leading-relaxed">
              Incentivamos todos os convidados a entrarem de cabeça na estética do Hotel Cortez. Trajes temáticos, alfaiataria decadente dos anos 20, visual vampírico aristocrata ou fantasias icônicas de horror.
            </p>
          </div>

          {/* 3 Style Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-[#150720] border border-[#6b21a8] p-3">
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#f43f5e] block mb-1">1. A CONDESSA</span>
              <p className="text-xs text-[#c4b5fd] leading-relaxed">Vestidos de alta costura, luvas com garras prateadas, veludo escuro e joias vintage.</p>
            </div>
            <div className="bg-[#150720] border border-[#6b21a8] p-3">
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#fbbf24] block mb-1">2. VINTAGE NOIR</span>
              <p className="text-xs text-[#c4b5fd] leading-relaxed">Smokings anos 1920, suspensórios, bengalas com castão, cartolas e maquiagem retrô.</p>
            </div>
            <div className="bg-[#150720] border border-[#6b21a8] p-3">
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#34d399] block mb-1">3. ALL BLACK & GOTH</span>
              <p className="text-xs text-[#c4b5fd] leading-relaxed">Couro, rendas, corset, botas pesadas, capas e maquiagem dark marcante.</p>
            </div>
          </div>

          {/* Costume Contest Notice */}
          <div className="bg-[#241306] border border-[#d97706] p-3 flex items-start gap-2.5">
            <PixelCrown size={22} color="#fbbf24" />
            <div>
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#fef08a] block mb-0.5">CONCURSO DE FANTASIAS ÀS 02:30:</span>
              <p className="text-xs text-[#fed7aa] leading-relaxed">
                Categorias: Melhor Fantasia AHS, Mais Assustadora e Melhor Casal/Grupo. Inscrições gratuitas na recepção.
              </p>
            </div>
          </div>

          {/* Prohibited items */}
          <div className="bg-[#240810] border border-[#7f1d1d] p-3 text-xs text-[#fca5a5]">
            <span className="font-pixel text-[9px] sm:text-[10px] text-[#ef4444] block mb-0.5">ITENS NÃO PERMITIDOS:</span>
            <p>Objetos cortantes ou perfurantes reais, réplicas de armas com metal, fogos de artifício e recipientes de vidro externos.</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-3 border-t border-[#581c87] flex justify-end">
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="pixel-btn bg-[#7e22ce] hover:bg-[#9333ea] text-white px-5 py-2.5 font-pixel text-[10px] sm:text-[11px] font-bold"
          >
            ENTENDIDO
          </button>
        </div>

      </div>
    </div>
  );
};
