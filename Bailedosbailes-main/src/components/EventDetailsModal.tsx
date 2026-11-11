import React, { useEffect } from 'react';
import { PixelClose, PixelSkull, PixelStar, PixelBeer, PixelCocktail, PixelTicketIcon } from './PixelIcons';
import { audioManager } from '../utils/audio';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTickets?: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, onOpenTickets }) => {
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
        className="modal-panel max-w-2xl bg-[#0d0716] border-2 border-[#f59e0b] shadow-[0_0_35px_rgba(245,158,11,0.45)] rounded-xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-details-title"
      >
        {/* Sticky Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-b-2 border-[#5c3e06] px-4 sm:px-6 py-3 bg-[#0d0716]">
          <div className="flex items-center gap-2.5 min-w-0">
            <PixelSkull size={20} color="#f59e0b" className="shrink-0" />
            <div className="min-w-0">
              <h2
                id="event-details-title"
                className="font-pixel text-xs sm:text-base font-bold text-[#fef08a] tracking-wider leading-tight"
              >
                O EVENTO • HOTEL CORTEZ — THE RETURN
              </h2>
              <span className="block font-mono text-xs text-[#fbbf24] mt-0.5 leading-tight">
                07 de Novembro • 22:00 às 06:00 • THE TRIPLEX
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="shrink-0 w-9 h-9 flex items-center justify-center hover:bg-[#3d2906] text-[#fef08a] cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-4 space-y-5 font-mono text-xs sm:text-sm text-[#d1d5db]">
          {/* AVISO PORTARIA — REUTILIZAÇÃO DE CÓDIGO */}
          <div className="bg-[#072218] border-2 border-[#10b981] p-3.5 sm:p-4 flex items-start gap-3 text-left shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <PixelTicketIcon size={18} color="#34d399" className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-pixel text-xs sm:text-sm text-[#6ee7b7] font-bold uppercase tracking-wide block">
                AVISO IMPORTANTE • PORTARIA
              </span>
              <p className="leading-relaxed text-[#ecfdf5] font-semibold">
                Quem já foi ao evento passado, pode reutilizar o mesmo código na portaria.
              </p>
            </div>
          </div>

          {/* A MANSÃO ESTÁ DE VOLTA */}
          <div className="bg-[#1b0f24] border border-[#581c87] p-4 space-y-2.5 text-left">
            <h3 className="font-pixel text-xs sm:text-sm text-[#f43f5e] tracking-wide flex items-center gap-2 font-bold uppercase">
              <PixelStar size={13} color="#f43f5e" />
              <span>A MANSÃO ESTÁ DE VOLTA</span>
            </h3>
            <p className="leading-relaxed text-[#f3e8ff] font-semibold">
              Algumas noites terminam. Outras deixam histórias que merecem uma continuação.
            </p>
            <p className="leading-relaxed text-[#d1d5db]">
              A mansão abre novamente suas portas para mais uma noite de música, experiências e muita diversão. Uma nova edição, novos momentos e uma atmosfera preparada para surpreender quem estiver presente.
            </p>
            <p className="leading-relaxed text-[#e9d5ff]">
              Prepare sua fantasia, reúna sua galera e venha fazer parte de mais uma noite que promete entrar para a história.
            </p>
            <p className="leading-relaxed text-[#fbbf24] font-bold">
              Dessa vez, a história continua.
            </p>
          </div>

          {/* ATRAÇÕES */}
          <div className="space-y-3">
            <h3 className="font-pixel text-xs sm:text-sm text-[#fbbf24] uppercase tracking-wide flex items-center gap-2 font-bold">
              <PixelStar size={13} color="#fbbf24" />
              <span>ATRAÇÕES</span>
            </h3>

            <div className="space-y-2.5">
              {/* 01 • LINE-UP DE DJS */}
              <div className="bg-[#14081c] border-2 border-[#7e22ce] p-3.5 space-y-1.5">
                <span className="font-pixel text-xs sm:text-sm text-[#c084fc] font-bold block">
                  01 • LINE-UP DE DJS
                </span>
                <div className="flex flex-col gap-0.5 font-pixel text-xs sm:text-sm text-[#e9d5ff] pt-0.5">
                  <span>???</span>
                  <span>???</span>
                  <span>???</span>
                </div>
              </div>

              {/* 02 • CONCURSO DE FANTASIAS — PARTE 2 */}
              <div className="bg-[#14081c] border-2 border-[#b45309] p-3.5 space-y-1.5">
                <span className="font-pixel text-xs sm:text-sm text-[#f59e0b] font-bold block">
                  02 • CONCURSO DE FANTASIAS — PARTE 2
                </span>
                <p className="text-xs sm:text-sm text-[#fef08a] font-semibold">
                  O concurso está de volta!
                </p>
                <p className="text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
                  Prepare sua melhor produção, solte a criatividade e entre na disputa. A segunda edição promete novas fantasias, personagens e momentos inesquecíveis.
                </p>
              </div>

              {/* 03 • DECORAÇÃO TEMÁTICA */}
              <div className="bg-[#14081c] border-2 border-[#6b21a8] p-3.5 space-y-1.5">
                <span className="font-pixel text-xs sm:text-sm text-[#d8b4fe] font-bold block">
                  03 • DECORAÇÃO TEMÁTICA
                </span>
                <p className="text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
                  A atmosfera da mansão continua presente, com cenários, iluminação especial, elementos temáticos e detalhes espalhados pelo ambiente para tornar a experiência ainda mais imersiva.
                </p>
              </div>

              {/* 04 • PATROCÍNIO COROTE */}
              <div className="bg-[#14081c] border-2 border-[#15803d] p-3.5 space-y-1.5">
                <span className="font-pixel text-xs sm:text-sm text-[#4ade80] font-bold flex items-center gap-1.5">
                  <PixelCocktail size={14} color="#4ade80" />
                  <span>04 • PATROCÍNIO COROTE</span>
                </span>
                <p className="text-xs sm:text-sm text-[#bbf7d0] font-semibold leading-relaxed">
                  A Corote chega junto nessa edição como patrocinadora oficial do evento!
                </p>
                <p className="text-xs sm:text-sm text-[#dcfce7] leading-relaxed">
                  Uma parceria que fortalece a festa e promete marcar presença nessa nova experiência.
                </p>
              </div>

              {/* 05 • PROMOÇÕES PARA OS CERVEJEIROS */}
              <div className="bg-[#14081c] border-2 border-[#991b1b] p-3.5 space-y-1.5">
                <span className="font-pixel text-xs sm:text-sm text-[#ef4444] font-bold flex items-center gap-1.5">
                  <PixelBeer size={14} color="#f59e0b" />
                  <span>05 • PROMOÇÕES PARA OS CERVEJEIROS</span>
                </span>
                <p className="text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
                  Para quem não dispensa uma cerveja, teremos promoções especiais durante a festa.
                </p>
              </div>
            </div>
          </div>

          {/* E DEPOIS? */}
          <div className="bg-[#160624] border border-[#a855f7] p-4 text-center space-y-2 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <h3 className="font-pixel text-xs sm:text-sm text-[#e9d5ff] uppercase tracking-wider font-bold flex items-center justify-center gap-2">
              <PixelStar size={13} color="#c084fc" />
              <span>E DEPOIS?</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#e9d5ff] leading-relaxed">
              Das 22:00 às 06:00, a mansão será palco de mais uma história.
            </p>
            <p className="text-xs sm:text-sm text-[#d8b4fe] italic leading-relaxed">
              Algumas surpresas não precisam ser anunciadas. Algumas experiências são melhores quando descobertas na hora.
            </p>
            <p className="text-xs sm:text-sm text-[#fbbf24] font-bold pt-0.5">
              A segunda parte começa quando você chega.
            </p>
          </div>
        </div>

        {/* Sticky Footer / CTA */}
        <div className="shrink-0 border-t-2 border-[#5c3e06] bg-[#0b0613] px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-2">
              <span className="font-pixel text-xs sm:text-sm text-[#fbbf24] font-bold">INGRESSO OPEN • PÓS OPEN</span>
              <span className="font-pixel text-base sm:text-lg text-[#22c55e] font-bold">R$10</span>
            </div>
            <span className="block text-[11px] text-[#e9d5ff] font-mono mt-0.5">
              Open: 22:00 às 23:00 • Entrada Pós Open: a partir das 23:00
            </span>
            <span className="block text-[11px] text-[#fca5a5] font-mono italic mt-0.5">
              *Valor válido somente para vendas antecipadas.*
            </span>
            <span className="block text-[11px] text-[#ef4444] font-mono italic">
              *Após a compra do ingresso, não realizamos estorno.*
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
              if (onOpenTickets) {
                onOpenTickets();
              }
            }}
            className="w-full sm:w-auto pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white px-5 py-2.5 font-pixel text-xs sm:text-[13px] tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <PixelSkull size={14} color="#ffffff" />
            <span>GARANTIR INGRESSO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
