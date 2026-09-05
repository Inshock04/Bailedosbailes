import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import circusScenery from '../assets/images/freakshow_circus_scenery.jpg';
import theTriplexHotelScenery from '../assets/images/the_triplex_hotel_1788309454235.jpg';

gsap.registerPlugin(useGSAP);

interface HotelSceneProps {
  currentScene?: 'circus' | 'hotel';
}

export const HotelScene: React.FC<HotelSceneProps> = ({ currentScene = 'circus' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (currentScene === 'circus') {
      // 1. Efeito de Pulso das Lâmpadas Incandescentes do Circo
      gsap.to('.circus-bulb-glow', {
        scale: 1.15,
        opacity: 0.9,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 0.3,
          from: 'random',
        },
      });

      // 2. Micro-flicker sutil das lâmpadas vintage de circo
      gsap.to('.circus-flicker-layer', {
        opacity: 0.88,
        duration: 0.12,
        repeat: -1,
        yoyo: true,
        ease: 'rough({ strength: 0.8, points: 15, template: power0.none, randomize: true })',
      });

      // 3. Brilho do Estande / Letreiro "CIRCO"
      gsap.to('.circo-sign-glow', {
        opacity: 0.85,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // 4. Respiração Sinistra nas Máscaras dos Palhaços (Crimson Glow)
      gsap.to('.clown-aura-glow', {
        opacity: 0.75,
        scale: 1.08,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    } else {
      // Animações para o cenário clássico do Hotel
      gsap.to('.celestial-moon-glow', {
        scale: 1.08,
        opacity: 0.95,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      const rgbTl = gsap.timeline({ repeat: -1 });
      rgbTl
        .to('.hotel-rgb-red', { opacity: 0.85, duration: 2.2, ease: 'sine.inOut' })
        .to('.hotel-rgb-red', { opacity: 0.35, duration: 1.8, ease: 'sine.inOut' })
        .to('.hotel-rgb-amber', { opacity: 0.9, duration: 2.5, ease: 'sine.inOut' }, '-=1.5')
        .to('.hotel-rgb-amber', { opacity: 0.4, duration: 2, ease: 'sine.inOut' })
        .to('.hotel-rgb-violet', { opacity: 0.8, duration: 2.8, ease: 'sine.inOut' }, '-=1.8')
        .to('.hotel-rgb-violet', { opacity: 0.3, duration: 2.2, ease: 'sine.inOut' });
    }
  }, { scope: containerRef, dependencies: [currentScene] });

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
      <div className="relative w-full h-full bg-[#05090c]">
        {/* ========================================================================= */}
        {/* 1. IMAGEM DO CENÁRIO COM RENDERIZAÇÃO PIXEL ART ADAPTADA */}
        {/* ========================================================================= */}
        <img
          src={currentScene === 'circus' ? circusScenery : theTriplexHotelScenery}
          alt={currentScene === 'circus' ? "Cenário Pixel Art Circo Macabro / Freak Show" : "The Triplex 2D Pixel Art Scenery"}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center image-pixelated select-none"
        />

        {currentScene === 'circus' ? (
          <>
            {/* ========================================================================= */}
            {/* 2. ILUMINAÇÃO ADAPTADA: CIRCO MACABRO / FREAK SHOW */}
            {/* ========================================================================= */}

            {/* A. Iluminação Quente do Letreiro e Tenda "CIRCO" (Lado Direito) */}
            <div className="circo-sign-glow absolute top-[48%] right-[2%] sm:right-[6%] w-72 sm:w-96 h-48 sm:h-64 rounded-full bg-radial from-[#f59e0b]/40 via-[#b45309]/20 to-transparent blur-2xl pointer-events-none"></div>

            {/* B. Ponto de Luz Âmbar no topo do Estande CIRCO */}
            <div className="circus-bulb-glow absolute top-[52%] right-[10%] sm:right-[14%] w-24 h-24 rounded-full bg-radial from-[#ffffff]/70 via-[#fde047]/35 to-transparent blur-lg pointer-events-none"></div>

            {/* C. Varal de Luzes Suspensas (Cordão Central) */}
            <div className="circus-bulb-glow absolute top-[30%] left-[34%] -translate-x-1/2 w-32 h-32 rounded-full bg-radial from-[#fef08a]/50 via-[#eab308]/20 to-transparent blur-xl pointer-events-none"></div>
            <div className="circus-bulb-glow absolute top-[42%] left-[48%] -translate-x-1/2 w-40 h-40 rounded-full bg-radial from-[#fef08a]/45 via-[#eab308]/15 to-transparent blur-xl pointer-events-none"></div>
            <div className="circus-bulb-glow absolute top-[52%] left-[62%] -translate-x-1/2 w-36 h-36 rounded-full bg-radial from-[#fef08a]/45 via-[#eab308]/15 to-transparent blur-xl pointer-events-none"></div>

            {/* D. Máscaras dos Palhaços das Tendas Listradas (Aura Vermelha Sinistra) */}
            <div className="clown-aura-glow absolute top-[32%] left-[12%] sm:left-[14%] w-44 sm:w-56 h-44 sm:h-56 rounded-full bg-radial from-[#ef4444]/35 via-[#991b1b]/15 to-transparent blur-2xl pointer-events-none"></div>
            <div className="clown-aura-glow absolute top-[46%] left-[32%] sm:left-[34%] w-36 sm:w-44 h-36 sm:h-44 rounded-full bg-radial from-[#ef4444]/30 via-[#991b1b]/10 to-transparent blur-2xl pointer-events-none"></div>

            {/* E. Efeito de Luz no Chão de Terra e Pedras Úmidas */}
            <div className="circus-flicker-layer absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050308] via-[#1a0f05]/50 to-transparent pointer-events-none"></div>

            {/* F. Névoa Esmagadora / Esmagada Verde-Ciano no Topo (Skyline Gótico) */}
            <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#040e11]/80 via-[#07191e]/40 to-transparent pointer-events-none"></div>

            {/* G. Vinheta Escura nas Bordas para Foco Cinematográfico */}
            <div className="absolute inset-0 bg-radial from-transparent via-[#030608]/25 to-[#030507]/85 pointer-events-none"></div>
          </>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* ILUMINAÇÃO DO HOTEL CORTEZ / THE TRIPLEX */}
            {/* ========================================================================= */}
            <div className="absolute top-[8%] left-[18%] sm:left-[22%] -translate-x-1/2 -translate-y-1/2 w-48 sm:w-72 h-48 sm:h-72 pointer-events-none">
              <div className="celestial-moon-glow absolute inset-0 rounded-full bg-radial from-[#fef08a]/45 via-[#f59e0b]/20 to-transparent blur-2xl"></div>
              <div className="absolute inset-8 rounded-full bg-radial from-[#ffffff]/70 via-[#fef9c3]/40 to-transparent blur-md"></div>
            </div>
            <div className="hotel-rgb-red absolute top-[18%] left-[45%] sm:left-[48%] -translate-x-1/2 w-72 sm:w-96 h-28 bg-radial from-[#ef4444]/40 via-[#b91c1c]/20 to-transparent blur-xl pointer-events-none"></div>
            <div className="hotel-rgb-amber absolute top-[36%] left-[46%] -translate-x-1/2 w-[60vw] sm:w-[35vw] h-48 bg-radial from-[#f59e0b]/35 via-[#d97706]/15 to-transparent blur-2xl pointer-events-none"></div>
            <div className="hotel-rgb-violet absolute top-[28%] right-[25%] w-80 h-64 bg-radial from-[#a855f7]/30 via-[#7e22ce]/15 to-transparent blur-3xl pointer-events-none"></div>
            <div className="ambient-flicker-layer absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#07040d] via-[#12071f]/60 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-radial from-transparent via-[#05030a]/30 to-[#05030a]/85 pointer-events-none"></div>
          </>
        )}
      </div>
    </div>
  );
};
