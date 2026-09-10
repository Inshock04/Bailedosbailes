import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PixelGhost } from './PixelIcons';

gsap.registerPlugin(useGSAP);

export const GhostWalk: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Ghost 1: Wandering cyan spirit floating from left to right along the street
    gsap.fromTo(
      '.street-ghost-1',
      {
        x: '-12vw',
        y: '78vh',
        opacity: 0,
        scale: 1.1,
      },
      {
        x: '112vw',
        y: '79vh',
        opacity: 0.9,
        duration: 16,
        repeat: -1,
        ease: 'none',
        delay: 0,
        repeatDelay: 1.5,
      }
    );

    // Floating bobbing motion for Ghost 1
    gsap.to('.street-ghost-1', {
      y: '+=18',
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Ghost 2: Distant purple phantom gliding from right to left in background street
    gsap.fromTo(
      '.street-ghost-2',
      {
        x: '112vw',
        y: '72vh',
        opacity: 0,
        scale: 0.85,
      },
      {
        x: '-15vw',
        y: '71vh',
        opacity: 0.8,
        duration: 20,
        repeat: -1,
        ease: 'none',
        delay: 3,
        repeatDelay: 2,
      }
    );

    // Floating bobbing motion for Ghost 2
    gsap.to('.street-ghost-2', {
      y: '-=15',
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Ghost 3: Crimson glowing spectral phantom drifting along the lower entrance pavement
    gsap.fromTo(
      '.street-ghost-3',
      {
        x: '-15vw',
        y: '83vh',
        opacity: 0,
        scale: 1.35,
      },
      {
        x: '115vw',
        y: '84vh',
        opacity: 0.88,
        duration: 14,
        repeat: -1,
        ease: 'power1.inOut',
        delay: 6,
        repeatDelay: 2.5,
      }
    );

    gsap.to('.street-ghost-3', {
      y: '+=20',
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Ghost 4: Fast radiant white spirit floating right to left
    gsap.fromTo(
      '.street-ghost-4',
      {
        x: '115vw',
        y: '86vh',
        opacity: 0,
        scale: 1.05,
      },
      {
        x: '-15vw',
        y: '85vh',
        opacity: 0.85,
        duration: 18,
        repeat: -1,
        ease: 'none',
        delay: 9,
        repeatDelay: 3,
      }
    );

    gsap.to('.street-ghost-4', {
      y: '-=16',
      duration: 1.6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Ghost 5: Tiny mischievous emerald spirit hovering across the middle street
    gsap.fromTo(
      '.street-ghost-5',
      {
        x: '-10vw',
        y: '75vh',
        opacity: 0,
        scale: 0.9,
      },
      {
        x: '110vw',
        y: '76vh',
        opacity: 0.85,
        duration: 22,
        repeat: -1,
        ease: 'none',
        delay: 12,
        repeatDelay: 2,
      }
    );

    gsap.to('.street-ghost-5', {
      y: '+=14',
      duration: 1.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Ghost Ethereal Glow Pulsing
    gsap.to('.ghost-glow-aura', {
      opacity: 0.95,
      scale: 1.25,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {/* Ghost 1 - Cyan */}
      <div className="street-ghost-1 absolute top-0 left-0 flex flex-col items-center">
        <div className="ghost-glow-aura absolute -inset-3 rounded-full bg-cyan-400/30 blur-md pointer-events-none"></div>
        <PixelGhost size={38} color="#cffafe" />
        <div className="w-12 h-2.5 bg-cyan-400/30 rounded-full blur-sm mt-1"></div>
      </div>

      {/* Ghost 2 - Purple */}
      <div className="street-ghost-2 absolute top-0 left-0 flex flex-col items-center">
        <div className="ghost-glow-aura absolute -inset-2.5 rounded-full bg-purple-400/30 blur-md pointer-events-none"></div>
        <PixelGhost size={30} color="#f3e8ff" />
        <div className="w-9 h-2 bg-purple-500/25 rounded-full blur-xs mt-1"></div>
      </div>

      {/* Ghost 3 - Crimson / Red */}
      <div className="street-ghost-3 absolute top-0 left-0 flex flex-col items-center">
        <div className="ghost-glow-aura absolute -inset-4 rounded-full bg-red-500/35 blur-lg pointer-events-none"></div>
        <PixelGhost size={48} color="#ffe4e6" />
        <div className="w-16 h-3.5 bg-red-500/35 rounded-full blur-md mt-1"></div>
      </div>

      {/* Ghost 4 - Pure White / Amber */}
      <div className="street-ghost-4 absolute top-0 left-0 flex flex-col items-center">
        <div className="ghost-glow-aura absolute -inset-3 rounded-full bg-amber-300/30 blur-md pointer-events-none"></div>
        <PixelGhost size={36} color="#ffffff" />
        <div className="w-11 h-2.5 bg-amber-400/25 rounded-full blur-sm mt-1"></div>
      </div>

      {/* Ghost 5 - Emerald */}
      <div className="street-ghost-5 absolute top-0 left-0 flex flex-col items-center">
        <div className="ghost-glow-aura absolute -inset-3 rounded-full bg-emerald-400/30 blur-md pointer-events-none"></div>
        <PixelGhost size={32} color="#d1fae5" />
        <div className="w-10 h-2 bg-emerald-400/30 rounded-full blur-sm mt-1"></div>
      </div>
    </div>
  );
};
