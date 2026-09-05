import React from 'react';
import { PixelClose, PixelPin, PixelArrow } from './PixelIcons';
import { OfficialSocialButtons } from './OfficialSocialButtons';
import { audioManager } from '../utils/audio';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0c120a] border-2 border-[#65a30d] shadow-[0_0_35px_rgba(101,163,13,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#365314] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelPin size={22} color="#ef4444" />
            <div>
              <h2 className="font-pixel text-sm sm:text-base font-bold text-[#bef264] tracking-wider">
                LOCALIZAÇÃO • THE TRIPLEX
              </h2>
              <span className="font-mono text-xs text-[#a3e635]">
                THE TRIPLEX • Rua Manoel Castilho, 201 - Itaim Paulista, São Paulo - SP
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#1a2e05] text-[#bef264] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Pixel Radar & Map Grid */}
        <div className="bg-[#070e05] border-2 border-[#4d7c0f] p-3 mb-4 text-center relative overflow-hidden">
          <div className="h-44 bg-[#0a1708] border border-[#365314] grid grid-cols-6 grid-rows-4 gap-1 p-2 relative">
            {/* Grid elements */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border border-[#14290f] bg-[#071305]/60"></div>
            ))}

            {/* Simulated Road Lines */}
            <div className="absolute top-1/2 left-0 right-0 h-6 bg-[#1e3a14] -translate-y-1/2 border-y border-[#4d7c0f] flex items-center justify-around">
              <span className="font-pixel text-[9px] sm:text-[10px] text-[#bef264]">RUA MANOEL CASTILHO, 201</span>
            </div>

            {/* Target Pin in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <PixelPin size={26} color="#ef4444" className="drop-shadow-[0_0_10px_#ef4444]" />
              <div className="bg-[#140507] border border-[#ef4444] px-2 py-0.5 mt-0.5">
                <span className="font-pixel text-[9px] text-white font-bold">THE TRIPLEX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transit & Access Info */}
        <div className="space-y-3 font-mono text-xs sm:text-sm text-[#d1d5db]">
          <div className="bg-[#111c0c] border border-[#3f6212] p-3">
            <span className="font-pixel text-[10px] text-[#bef264] block mb-1">🚆 TRANSPORTE PÚBLICO / CPTM:</span>
            <p className="leading-relaxed">Fácil acesso pela <strong className="text-white">Estação Itaim Paulista (Linha 12 - Safira)</strong> e linhas de ônibus da região leste.</p>
          </div>

          <div className="bg-[#111c0c] border border-[#3f6212] p-3">
            <span className="font-pixel text-[10px] text-[#bef264] block mb-1">🚗 CARRO / APLICATIVO / ESTACIONAMENTO:</span>
            <p className="leading-relaxed">Ponto de desembarque direto na porta pela <strong className="text-white">Rua Manoel Castilho, 201</strong> com segurança monitorada para a festa.</p>
          </div>
        </div>

        {/* Quick App Link Buttons */}
        <div className="mt-4 pt-3 border-t border-[#365314] flex flex-col sm:flex-row gap-2">
          <a
            href="https://maps.google.com/?q=Rua+Manoel+Castilho,+201,+Itaim+Paulista,+Sao+Paulo,+SP"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioManager.playClick()}
            className="flex-1 pixel-btn bg-[#365314] hover:bg-[#4d7c0f] text-white py-2.5 text-center font-pixel text-[10px] sm:text-[11px] tracking-wider"
          >
            ABRIR NO GOOGLE MAPS
          </a>
          <a
            href="https://waze.com/ul?q=Rua+Manoel+Castilho+201+Itaim+Paulista"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => audioManager.playClick()}
            className="flex-1 pixel-btn bg-[#1e293b] hover:bg-[#334155] text-white py-2.5 text-center font-pixel text-[10px] sm:text-[11px] tracking-wider"
          >
            ABRIR NO WAZE
          </a>
        </div>

        {/* Canais Oficiais de Contato: WhatsApp e Instagram */}
        <div className="mt-3 pt-2.5 border-t border-[#365314]/80">
          <div className="flex items-center justify-between pb-1">
            <span className="font-pixel text-[9px] text-[#bef264] tracking-wider uppercase font-bold">
              CANAIS OFICIAIS
            </span>
            <span className="font-mono text-[9px] text-[#a3e635]">
              ATENDIMENTO & DÚVIDAS
            </span>
          </div>
          <OfficialSocialButtons />
        </div>

      </div>
    </div>
  );
};
