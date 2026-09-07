import React from 'react';
import { PixelClose, PixelSkull } from './PixelIcons';
import { audioManager } from '../utils/audio';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTickets?: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, onOpenTickets }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0d0716] border-2 border-[#f59e0b] shadow-[0_0_35px_rgba(245,158,11,0.5)] rounded-xl p-4 sm:p-6 text-[#f3edf9] my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#5c3e06] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#f59e0b" />
            <div>
              <h2 className="font-pixel text-xs sm:text-base font-bold text-[#fef08a] tracking-wider">
                O EVENTO • HOTEL CORTEZ HALLOWEEN
              </h2>
              <span className="font-mono text-xs text-[#fbbf24]">
                31 de Outubro de 2026 • THE TRIPLEX • 21:00 às 06:00
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

        <div className="space-y-5 font-mono text-xs sm:text-sm text-[#d1d5db]">
          
          {/* ✦ UMA NOITE NA MANSÃO */}
          <div className="bg-[#1b0f24] border border-[#581c87] p-4 space-y-2.5 text-left">
            <h3 className="font-pixel text-xs sm:text-sm text-[#f43f5e] tracking-wide flex items-center gap-1.5 font-bold">
              <span>✦</span>
              <span>UMA NOITE NA MANSÃO</span>
            </h3>
            <p className="leading-relaxed text-[#e9d5ff]">
              Uma noite para entrar no clima, cercada por decorações temáticas, referências ao universo do terror e uma atmosfera de mansão sombria, sem perder a essência de uma grande festa.
            </p>
            <p className="leading-relaxed text-[#d1d5db]">
              Ambientes decorados, iluminação especial, personagens, detalhes escondidos e elementos inspirados em histórias de horror estarão espalhados pelo espaço para criar a atmosfera da noite.
            </p>
            <p className="leading-relaxed text-[#fbbf24] font-semibold">
              Prepare sua fantasia, explore a mansão e descubra o que acontece quando a noite começa a ficar realmente interessante.
            </p>
          </div>

          {/* ✦ ATRAÇÕES */}
          <div className="space-y-3">
            <h3 className="font-pixel text-xs sm:text-sm text-[#fbbf24] uppercase tracking-wide flex items-center gap-1.5 font-bold">
              <span>✦</span>
              <span>ATRAÇÕES</span>
            </h3>

            <div className="space-y-2.5">
              {/* Atração 01 */}
              <div className="bg-[#14081c] border-2 border-[#7e22ce] p-3.5 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-pixel text-xs sm:text-sm text-[#c084fc] font-bold">
                    01 • 3 DJs + OPEN BAR
                  </span>
                  <span className="bg-[#581c87] text-[#fef08a] font-pixel text-[11px] px-2 py-0.5 border border-[#a855f7]">
                    OPEN 21:00 ÀS 00:00
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
                  Três DJs comandando a pista com uma seleção de sons para manter a festa em alta.
                </p>
                <div className="text-xs text-[#86efac] font-bold pt-1">
                  Open das 21:00 às 00:00. (Gin, Vodka, Energético, Caipirinha, Canelinha & ???)
                </div>
              </div>

              {/* Atração 02 */}
              <div className="bg-[#14081c] border-2 border-[#b45309] p-3.5 space-y-1.5">
                <span className="font-pixel text-xs sm:text-sm text-[#f59e0b] font-bold block">
                  02 • DECORAÇÃO TEMÁTICA + CONCURSO DE FANTASIAS
                </span>
                <p className="text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
                  A mansão estará completamente decorada com elementos temáticos, referências de terror e cenários perfeitos para entrar no clima.
                </p>
                <p className="text-xs sm:text-sm text-[#fbbf24] font-semibold">
                  E, claro: prepare sua melhor fantasia para o Concurso de Fantasias.
                </p>
              </div>

              {/* Atração 03 */}
              <div className="bg-[#14081c] border-2 border-[#991b1b] p-3.5 space-y-1.5">
                <span className="font-pixel text-xs sm:text-sm text-[#ef4444] font-bold block">
                  03 • PROMOÇÕES PARA OS CERVEJEIROS
                </span>
                <p className="text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
                  Quem não dispensa uma cerveja terá promoções especiais durante toda a festa.
                </p>
              </div>
            </div>
          </div>

          {/* ✦ CRONOGRAMA DA NOITE */}
          <div className="space-y-2.5">
            <h3 className="font-pixel text-xs sm:text-sm text-[#fbbf24] uppercase tracking-wide flex items-center gap-1.5 font-bold">
              <span>✦</span>
              <span>CRONOGRAMA DA NOITE</span>
            </h3>

            <div className="bg-[#140a1c] border border-[#3b1747] p-3.5 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-[#2b1035] pb-2">
                <span className="font-pixel text-xs text-[#f59e0b] font-bold">21:00</span>
                <span className="text-[#f3edf9]">Início do rolê e abertura da noite</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#2b1035] pb-2">
                <span className="font-pixel text-xs text-[#22c55e] font-bold">21:00</span>
                <span className="text-[#86efac] font-bold">Início do Open</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#2b1035] pb-2">
                <span className="font-pixel text-xs text-[#ef4444] font-bold">???</span>
                <span className="text-[#fca5a5]">Encerramento do Open</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#2b1035] pb-2">
                <span className="font-pixel text-xs text-[#f59e0b] font-bold">???</span>
                <span className="text-[#fef08a] font-bold">Grande Concurso de Fantasias</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#2b1035] pb-2">
                <span className="font-pixel text-xs text-[#c084fc] font-bold">???</span>
                <span className="text-[#c084fc] font-pixel text-xs">???</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#2b1035] pb-2">
                <span className="font-pixel text-xs text-[#c084fc] font-bold">???</span>
                <span className="text-[#c084fc] font-pixel text-xs">???</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#2b1035] pb-2">
                <span className="font-pixel text-xs text-[#c084fc] font-bold">???</span>
                <span className="text-[#c084fc] font-pixel text-xs">???</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-pixel text-xs text-[#a855f7] font-bold">???</span>
                <span className="text-[#a855f7] font-pixel text-xs">???</span>
              </div>
            </div>
          </div>

          {/* ✦ E DEPOIS? */}
          <div className="bg-[#160624] border border-[#a855f7] p-4 text-center space-y-1.5 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <h3 className="font-pixel text-xs sm:text-sm text-[#e9d5ff] uppercase tracking-wider font-bold">
              ✦ E DEPOIS?
            </h3>
            <p className="text-xs sm:text-sm text-[#d8b4fe] italic">
              Algumas coisas é melhor descobrir na hora.
            </p>
            <p className="text-xs sm:text-sm text-[#fbbf24] font-bold">
              A noite ainda guarda algumas surpresas.
            </p>
          </div>

        </div>

        {/* Footer / CTA */}
        <div className="mt-5 pt-3 border-t-2 border-[#5c3e06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="font-pixel text-[12px] text-[#fbbf24] block">INGRESSO OPEN (1º LOTE)</span>
            <span className="font-pixel text-base text-[#22c55e] font-bold">R$ 45,00</span>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
              if (onOpenTickets) {
                onOpenTickets();
              }
            }}
            className="w-full sm:w-auto pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white px-5 py-2.5 font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold"
          >
            GARANTIR INGRESSO 💀
          </button>
        </div>

      </div>
    </div>
  );
};
