import React from 'react';
import { PixelClose, PixelSkull } from './PixelIcons';
import { audioManager } from '../utils/audio';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTickets: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, onOpenTickets }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d0716] border-2 border-[#f59e0b] shadow-[0_0_35px_rgba(245,158,11,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#5c3e06] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#f59e0b" />
            <div>
              <h2 className="font-pixel text-sm sm:text-base font-bold text-[#fef08a] tracking-wider">
                O EVENTO • HOTEL CORTEZ HALLOWEEN
              </h2>
              <span className="font-mono text-xs text-[#fbbf24]">
                31 de Outubro de 2026 • 22:00 às 06:00
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#3d2906] text-[#fef08a] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Narrative & Concept */}
        <div className="space-y-4 font-mono text-xs sm:text-sm text-[#d1d5db]">
          <div className="bg-[#1b0f24] border border-[#581c87] p-3 text-left">
            <span className="font-pixel text-[10px] sm:text-[11px] text-[#f43f5e] block mb-1">
              "UMA NOITE. SEIS HISTÓRIAS. INFINITAS MEMÓRIAS."
            </span>
            <p className="leading-relaxed text-xs sm:text-sm">
              Inspirada na estética cult da antologia <strong className="text-white">American Horror Story: Hotel</strong>, esta noite reúne os espíritos mais refinados e excêntricos em uma mansão histórica com arquitetura Art Déco decadente, cenografia gótica imersiva e experiências sensoriais exclusivas.
            </p>
          </div>

          {/* 3 Themed Areas */}
          <div>
            <h3 className="font-pixel text-xs text-[#fbbf24] mb-2 uppercase tracking-wide">
              ✦ OS 3 AMBIENTES DA MANSÃO
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-[#14081c] border border-[#4a154b] p-3">
                <span className="font-pixel text-[9px] sm:text-[10px] text-[#ef4444] block mb-1">SALÃO 1 • THE BALLROOM</span>
                <p className="text-xs text-[#9ca3af] leading-relaxed">Palco principal com DJs de Techno, Synthwave e Dark Pop com visual retrô 8-bit.</p>
              </div>
              <div className="bg-[#14081c] border border-[#4a154b] p-3">
                <span className="font-pixel text-[9px] sm:text-[10px] text-[#f59e0b] block mb-1">SALÃO 2 • THE 1920s BAR</span>
                <p className="text-xs text-[#9ca3af] leading-relaxed">Ambiente jazz noir e coquetelaria exclusiva com o Fundador James March.</p>
              </div>
              <div className="bg-[#14081c] border border-[#4a154b] p-3">
                <span className="font-pixel text-[9px] sm:text-[10px] text-[#c084fc] block mb-1">SALÃO 3 • SUITE 64 SECRETA</span>
                <p className="text-xs text-[#9ca3af] leading-relaxed">Acesso VIP com performances teatrais interativas e lounges de veludo.</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h3 className="font-pixel text-xs text-[#fbbf24] mb-2 uppercase tracking-wide">
              ✦ CRONOGRAMA DA NOITE
            </h3>
            <div className="bg-[#140a1c] border border-[#3b1747] p-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-[#2b1035] pb-1.5">
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#f59e0b]">22:00</span>
                <span>Abertura dos portões e Recepção com Welcome Shot</span>
              </div>
              <div className="flex justify-between border-b border-[#2b1035] pb-1.5">
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#f59e0b]">00:30</span>
                <span>Performance A Condessa & O Banquete Noturno</span>
              </div>
              <div className="flex justify-between border-b border-[#2b1035] pb-1.5">
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#f59e0b]">02:30</span>
                <span>Grande Concurso de Fantasias (R$ 5.000 em prêmios)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-pixel text-[10px] sm:text-[11px] text-[#f59e0b]">04:00 - 06:00</span>
                <span>After Dark Set • Encerramento ao amanhecer</span>
              </div>
            </div>
          </div>

          {/* Important Rules */}
          <div className="bg-[#240810] border border-[#7f1d1d] p-3 text-xs text-[#fca5a5] space-y-1">
            <p><strong>Censura:</strong> 18 anos. Obrigatório documento original com foto (RG ou CNH).</p>
            <p><strong>Segurança:</strong> Revista rigorosa na entrada. Ambiente monitorado.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5 pt-3 border-t-2 border-[#5c3e06] flex items-center justify-between">
          <span className="font-pixel text-[10px] text-[#fbbf24]">LOTES LIMITADOS</span>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
              onOpenTickets();
            }}
            className="pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white px-5 py-2.5 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold"
          >
            GARANTIR INGRESSO 💀
          </button>
        </div>

      </div>
    </div>
  );
};
