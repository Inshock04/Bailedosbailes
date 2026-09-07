import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { PixelArrow, PixelPin, PixelCocktail, PixelCardIcon, PixelWardrobe, PixelSkull, PixelEye } from './PixelIcons';
import { audioManager } from '../utils/audio';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface ExplorationCardsProps {
  onSelectSection: (sectionId: string) => void;
  activeSection: string | null;
}

export const ExplorationCards: React.FC<ExplorationCardsProps> = ({ onSelectSection, activeSection }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.exploration-card-item', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 90%',
      },
      y: 30,
      opacity: 0,
      stagger: 0.07,
      duration: 0.55,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    });
  }, { scope: containerRef });

  const cards = [
    {
      id: 'admin',
      title: 'ÁREA DE ADM',
      desc: 'Acesso restrito da organização para métricas, scanner de ingressos e gestão.',
      action: 'ACESSAR',
      accentColor: '#ef4444',
      renderThumbnail: () => (
        <div className="w-full h-20 bg-[#160a12] border border-[#5c1322] relative p-1.5 flex flex-col justify-between overflow-hidden">
          {/* Framed portraits on wall */}
          <div className="flex justify-between px-2">
            <div className="w-3 h-4 bg-[#2e0e18] border border-[#991b1b] flex items-center justify-center">
              <div className="w-1.5 h-2 bg-[#f87171]/40"></div>
            </div>
            <div className="w-4 h-4 bg-[#2e0e18] border border-[#991b1b] flex items-center justify-center">
              <div className="w-2 h-2 bg-[#f87171]/40"></div>
            </div>
          </div>
          {/* Vintage Study Desk with Glowing Lamp */}
          <div className="w-full h-7 bg-[#240810] border-t border-[#7f1d1d] flex items-center justify-between px-2">
            <div className="w-3 h-4 bg-[#f59e0b] shadow-[0_0_8px_#f59e0b] border border-[#fef08a]"></div>
            <div className="font-pixel text-[10px] text-[#fca5a5]">ADMIN</div>
          </div>
        </div>
      )
    },
    {
      id: 'evento',
      title: 'EVENTO',
      desc: 'Informações sobre a festa, data, horário e atrações especiais.',
      action: 'ENTRAR',
      accentColor: '#f59e0b',
      renderThumbnail: () => (
        <div className="w-full h-20 bg-[#180e22] border border-[#432361] relative p-1 flex flex-col items-center justify-between overflow-hidden">
          {/* Grand Chandelier */}
          <div className="w-6 h-5 bg-[#fef08a] shadow-[0_0_12px_#fef08a] border border-[#d97706]"></div>
          {/* Ballroom Archway */}
          <div className="w-full h-8 bg-[#2d123b] border-t border-[#7e22ce] flex justify-around items-end pb-1">
            <div className="w-2 h-4 bg-[#fde047]/40"></div>
            <div className="w-4 h-3 bg-[#a855f7]"></div>
            <div className="w-2 h-4 bg-[#fde047]/40"></div>
          </div>
        </div>
      )
    },
    {
      id: 'promocoes',
      title: 'PROMOÇÕES',
      desc: 'Confira as promoções de bebidas e combos exclusivos da noite.',
      action: 'ENTRAR',
      accentColor: '#f59e0b',
      renderThumbnail: () => (
        <div className="w-full h-20 bg-[#160a14] border border-[#581c87] relative p-1.5 flex flex-col justify-between overflow-hidden">
          {/* Bar shelf bottles */}
          <div className="flex justify-center gap-1.5 border-b border-[#78350f] pb-1">
            <div className="w-2 h-4 bg-[#ef4444]"></div>
            <div className="w-2 h-5 bg-[#22c55e]"></div>
            <div className="w-2 h-4 bg-[#3b82f6]"></div>
            <div className="w-2 h-5 bg-[#f59e0b]"></div>
          </div>
          {/* Counter with drink */}
          <div className="w-full h-6 bg-[#3d1806] border-t border-[#b45309] flex items-center justify-center">
            <PixelCocktail size={14} color="#fef08a" />
          </div>
        </div>
      )
    },
    {
      id: 'cards',
      title: 'CARDS / ORÁCULO',
      desc: 'Vire uma carta e descubra seu destino. Ganhe prêmios e descontos exclusivos.',
      action: 'JOGAR',
      accentColor: '#c084fc',
      renderThumbnail: () => (
        <div className="w-full h-20 bg-[#150a24] border border-[#6b21a8] relative p-1 flex flex-col items-center justify-center overflow-hidden">
          {/* 3 Occult Tarot Cards & Candles */}
          <div className="flex items-center gap-1">
            <div className="w-1 h-3 bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]"></div>
            <div className="w-5 h-8 bg-[#3b0764] border border-[#a855f7] flex items-center justify-center -rotate-6">
              <PixelEye size={8} color="#e9d5ff" />
            </div>
            <div className="w-6 h-9 bg-[#4c1d95] border-2 border-[#c084fc] flex items-center justify-center z-10 shadow-[0_0_8px_#a855f7]">
              <PixelCardIcon size={10} color="#f5d0fe" />
            </div>
            <div className="w-5 h-8 bg-[#3b0764] border border-[#a855f7] flex items-center justify-center rotate-6">
              <PixelSkull size={8} color="#e9d5ff" />
            </div>
            <div className="w-1 h-3 bg-[#f59e0b] shadow-[0_0_6px_#f59e0b]"></div>
          </div>
          <div className="w-full h-1 bg-[#7e22ce] mt-1"></div>
        </div>
      )
    },
    {
      id: 'local',
      title: 'LOCAL',
      desc: 'Veja o mapa, endereço e as melhores rotas para chegar ao evento.',
      action: 'VER MAPA',
      accentColor: '#ef4444',
      renderThumbnail: () => (
        <div className="w-full h-20 bg-[#161a12] border border-[#3f6212] relative p-1 flex flex-col items-center justify-center overflow-hidden">
          {/* Grid Map with Radar & Red Pin */}
          <div className="w-full h-full bg-[#111c0f] border border-[#4d7c0f] grid grid-cols-4 grid-rows-3 gap-0.5 p-1 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <PixelPin size={18} color="#ef4444" className="drop-shadow-[0_0_6px_#ef4444]" />
            </div>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border border-[#1e3a17] bg-[#0c170a]/50"></div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'dresscode',
      title: 'DRESS CODE',
      desc: 'Inspirações de looks e dress code para entrar no clima.',
      action: 'VER LOOKS',
      accentColor: '#f59e0b',
      renderThumbnail: () => (
        <div className="w-full h-20 bg-[#1a0e24] border border-[#581c87] relative p-1.5 flex items-center justify-between overflow-hidden">
          {/* Wardrobe with clothes */}
          <div className="w-1/2 h-full bg-[#12061c] border border-[#7e22ce] p-1 flex flex-col justify-end">
            <div className="w-full h-1 bg-[#d97706]"></div>
            <div className="flex justify-around pt-1">
              <div className="w-1.5 h-6 bg-[#f5f5f5]"></div>
              <div className="w-1.5 h-6 bg-[#000]"></div>
              <div className="w-1.5 h-7 bg-[#dc2626]"></div>
            </div>
          </div>
          {/* Gilded Ornate Mirror */}
          <div className="w-8 h-14 bg-[#2e104a] border-2 border-[#d97706] rounded-t-full shadow-[0_0_8px_rgba(217,119,6,0.6)] flex items-center justify-center">
            <div className="w-4 h-8 bg-[#fbbf24]/20 rounded-t-full"></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div ref={containerRef} className="w-full max-w-7xl mx-auto mt-8 mb-10 px-2 select-none">
      {/* Exploration Header with Dotted Lines */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="hidden sm:block flex-1 border-t-2 border-dotted border-[#7e22ce]/60"></div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#a855f7]"></span>
          <h2 className="font-pixel text-[12px] md:text-xs tracking-widest text-[#d8b4fe] uppercase">
            NAVEGAÇÃO POR EXPLORAÇÃO
          </h2>
          <span className="w-1.5 h-1.5 bg-[#a855f7]"></span>
        </div>
        <div className="hidden sm:block flex-1 border-t-2 border-dotted border-[#7e22ce]/60"></div>
      </div>

      {/* 6 Exploration Cards Grid with Staggered Entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card, idx) => {
          const isActive = activeSection === card.id;

          return (
            <div
              key={card.id}
              onClick={() => {
                audioManager.playClick();
                onSelectSection(card.id);
              }}
              onMouseEnter={() => audioManager.playHover()}
              className={`exploration-card-item group cursor-pointer bg-[#0e0a17] border-2 flex flex-col justify-between p-2.5 transition-all duration-150 relative ${
                isActive
                  ? 'border-[#a855f7] bg-[#1a0f2b] shadow-[0_0_15px_rgba(168,85,247,0.5)] -translate-y-1'
                  : 'border-[#2d1b3f] hover:border-[#7e22ce] hover:bg-[#140c20]'
              }`}
            >
              {/* Card Title */}
              <div className="flex items-center justify-between mb-1.5">
                <span 
                  className="font-pixel text-[11px] md:text-[12px] font-bold tracking-wider"
                  style={{ color: card.accentColor }}
                >
                  {card.title}
                </span>
                {idx < cards.length - 1 && (
                  <span className="hidden lg:inline-block text-[#6b21a8] text-xs font-mono ml-1">⇢</span>
                )}
              </div>

              {/* Thumbnail Container */}
              <div className="my-1.5">{card.renderThumbnail()}</div>

              {/* Description */}
              <p className="font-mono text-[13px] leading-relaxed text-[#c7bfd6] my-2 min-h-[44px]">
                {card.desc}
              </p>

              {/* Action Link */}
              <div className="pt-2 border-t border-[#231533] flex items-center justify-between">
                <span className="font-pixel text-[10px] md:text-[11px] text-[#f43f5e] group-hover:text-[#fb7185] flex items-center gap-1">
                  <span>→</span> {card.action}
                </span>
                <span className="w-1.5 h-1.5 bg-[#4c1d95] group-hover:bg-[#a855f7]"></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

