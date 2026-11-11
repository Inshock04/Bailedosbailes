import React, { useEffect } from 'react';
import { PixelClose, PixelPin, PixelTrain, PixelCar } from './PixelIcons';
import { OfficialSocialButtons } from './OfficialSocialButtons';
import { audioManager } from '../utils/audio';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
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
        className="modal-panel max-w-xl bg-[#0c120a] border-2 border-[#65a30d] shadow-[0_0_35px_rgba(101,163,13,0.5)] rounded-xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b-2 border-[#365314] px-4 sm:px-6 py-3 bg-[#0c120a]">
          <div className="flex items-center gap-2 min-w-0">
            <PixelPin size={22} color="#ef4444" className="shrink-0" />
            <div className="min-w-0">
              <h2 className="font-pixel text-sm sm:text-base font-bold text-[#bef264] tracking-wider leading-tight">
                LOCALIZAÇÃO • THE TRIPLEX
              </h2>
              <span className="block font-mono text-xs text-[#a3e635] leading-tight mt-0.5">
                R. Manuel de Castilho, 201 - Itaim Paulista, São Paulo - SP
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="shrink-0 w-9 h-9 flex items-center justify-center hover:bg-[#1a2e05] text-[#bef264] cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-4 space-y-4">
          {/* Pixel Radar & Map Grid */}
          <div className="bg-[#070e05] border-2 border-[#4d7c0f] p-3 text-center relative overflow-hidden">
            <div className="h-40 sm:h-44 bg-[#0a1708] border border-[#365314] grid grid-cols-6 grid-rows-4 gap-1 p-2 relative">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border border-[#14290f] bg-[#071305]/60" />
              ))}

              {/* Simulated Road Lines */}
              <div className="absolute top-1/2 left-0 right-0 h-6 bg-[#1e3a14] -translate-y-1/2 border-y border-[#4d7c0f] flex items-center justify-around">
                <span className="font-pixel text-[11px] sm:text-[12px] text-[#bef264]">
                  R. MANUEL DE CASTILHO, 201
                </span>
              </div>

              {/* Target Pin in center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <PixelPin size={26} color="#ef4444" className="drop-shadow-[0_0_10px_#ef4444]" />
                <div className="bg-[#140507] border border-[#ef4444] px-2 py-0.5 mt-0.5">
                  <span className="font-pixel text-[11px] text-white font-bold">THE TRIPLEX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transit & Access Info */}
          <div className="space-y-3 font-mono text-xs sm:text-sm text-[#d1d5db]">
            <div className="bg-[#111c0c] border border-[#3f6212] p-3">
              <span className="font-pixel text-[12px] text-[#bef264] flex items-center gap-1.5 mb-1">
                <PixelTrain size={14} color="#bef264" />
                <span>TRANSPORTE PÚBLICO / CPTM:</span>
              </span>
              <p className="leading-relaxed">
                Fácil acesso pela <strong className="text-white">Estação Itaim Paulista (Linha 12 - Safira)</strong> e linhas de ônibus da região leste.
              </p>
            </div>

            <div className="bg-[#111c0c] border border-[#3f6212] p-3">
              <span className="font-pixel text-[12px] text-[#bef264] flex items-center gap-1.5 mb-1">
                <PixelCar size={14} color="#bef264" />
                <span>CARRO / APLICATIVO / ESTACIONAMENTO:</span>
              </span>
              <p className="leading-relaxed">
                Ponto de desembarque direto na porta pela <strong className="text-white">R. Manuel de Castilho, 201</strong>.
              </p>
            </div>
          </div>

          {/* Quick App Link Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <a
              href="https://maps.google.com/?q=R.+Manuel+de+Castilho,+201,+Itaim+Paulista,+Sao+Paulo,+SP"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioManager.playClick()}
              className="flex-1 pixel-btn bg-[#365314] hover:bg-[#4d7c0f] text-white py-2.5 text-center font-pixel text-[12px] sm:text-[13px] tracking-wider"
            >
              ABRIR NO GOOGLE MAPS
            </a>
            <a
              href="https://waze.com/ul?q=R+Manuel+de+Castilho+201+Itaim+Paulista"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioManager.playClick()}
              className="flex-1 pixel-btn bg-[#1e293b] hover:bg-[#334155] text-white py-2.5 text-center font-pixel text-[12px] sm:text-[13px] tracking-wider"
            >
              ABRIR NO WAZE
            </a>
          </div>

          {/* Canais Oficiais de Contato: WhatsApp e Instagram */}
          <div className="pt-2.5 border-t border-[#365314]/80">
            <div className="flex items-center justify-between pb-1.5">
              <span className="font-pixel text-[11px] text-[#bef264] tracking-wider uppercase font-bold">
                ATENDIMENTO & DÚVIDAS
              </span>
              <span className="font-mono text-[11px] text-[#a3e635]">CANAIS OFICIAIS</span>
            </div>
            <OfficialSocialButtons />
          </div>
        </div>
      </div>
    </div>
  );
};
