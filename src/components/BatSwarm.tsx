import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { PixelBat } from './PixelIcons';

gsap.registerPlugin(useGSAP);

export const BatSwarm: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Bat 1: Flies from offscreen right to offscreen left across the sky with wavy motion
    gsap.fromTo('.flying-bat-1', 
      {
        x: '110vw',
        y: '15vh',
        scale: 0.8,
        opacity: 0,
        rotation: -12,
      },
      {
        x: '-20vw',
        y: '22vh',
        opacity: 0.95,
        rotation: 8,
        duration: 9.5,
        repeat: -1,
        ease: 'none',
        repeatDelay: 2,
      }
    );

    // Sine-wave altitude oscillation for Bat 1
    gsap.to('.flying-bat-1', {
      y: '+=35',
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Bat 2: Swoops from top left to bottom right diagonally
    gsap.fromTo('.flying-bat-2',
      {
        x: '-15vw',
        y: '8vh',
        scale: 1.2,
        opacity: 0,
        rotation: 18,
      },
      {
        x: '115vw',
        y: '45vh',
        opacity: 1,
        rotation: -10,
        duration: 11,
        repeat: -1,
        ease: 'none',
        delay: 3.5,
        repeatDelay: 4,
      }
    );

    gsap.to('.flying-bat-2', {
      y: '+=45',
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Bat 3: Fast low-altitude scout swooping across the middle
    gsap.fromTo('.flying-bat-3',
      {
        x: '110vw',
        y: '40vh',
        scale: 0.7,
        opacity: 0,
        rotation: -20,
      },
      {
        x: '-25vw',
        y: '28vh',
        opacity: 0.85,
        rotation: 15,
        duration: 7.2,
        repeat: -1,
        ease: 'power1.inOut',
        delay: 6.2,
        repeatDelay: 3,
      }
    );

    gsap.to('.flying-bat-3', {
      y: '-=30',
      duration: 0.9,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Bat 4: High altitude distant tiny bat
    gsap.fromTo('.flying-bat-4',
      {
        x: '-10vw',
        y: '5vh',
        scale: 0.5,
        opacity: 0,
        rotation: 10,
      },
      {
        x: '110vw',
        y: '12vh',
        opacity: 0.7,
        rotation: -5,
        duration: 14,
        repeat: -1,
        ease: 'none',
        delay: 1,
        repeatDelay: 5,
      }
    );

    // Bat 5: Close foreground bat swooping quickly
    gsap.fromTo('.flying-bat-5',
      {
        x: '105vw',
        y: '60vh',
        scale: 1.4,
        opacity: 0,
        rotation: -25,
      },
      {
        x: '-20vw',
        y: '35vh',
        opacity: 0.9,
        rotation: 20,
        duration: 6.8,
        repeat: -1,
        ease: 'power2.inOut',
        delay: 8.5,
        repeatDelay: 6,
      }
    );

    gsap.to('.flying-bat-5', {
      y: '+=50',
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-25 overflow-hidden">
      {/* Bat 1 */}
      <div className="flying-bat-1 absolute top-0 left-0">
        <PixelBat size={24} color="#0c0714" />
      </div>

      {/* Bat 2 */}
      <div className="flying-bat-2 absolute top-0 left-0">
        <PixelBat size={32} color="#09040e" />
      </div>

      {/* Bat 3 */}
      <div className="flying-bat-3 absolute top-0 left-0">
        <PixelBat size={18} color="#150a21" />
      </div>

      {/* Bat 4 */}
      <div className="flying-bat-4 absolute top-0 left-0">
        <PixelBat size={14} color="#1b0e2b" />
      </div>

      {/* Bat 5 */}
      <div className="flying-bat-5 absolute top-0 left-0">
        <PixelBat size={38} color="#06020a" />
      </div>
    </div>
  );
};
