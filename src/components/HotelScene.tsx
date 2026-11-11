import React, { useRef, useState, useEffect } from 'react';
import triplexBgPc from '../assets/images/triplex_bg_pc.jpg';
import triplexBgMobile from '../assets/images/triplex_bg_mobile.jpg';

interface HotelSceneProps {
  currentScene?: 'circus' | 'hotel';
}

export const HotelScene: React.FC<HotelSceneProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleViewportChange = () => setIsMobile(mediaQuery.matches);
    handleViewportChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleViewportChange);
      return () => mediaQuery.removeEventListener('change', handleViewportChange);
    }

    mediaQuery.addListener(handleViewportChange);
    return () => mediaQuery.removeListener(handleViewportChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-[100dvh] min-h-[100dvh] overflow-hidden select-none pointer-events-none z-0"
    >
      <div className="relative w-full h-full bg-[#1a3a08]">
        {/* ========================================================================= */}
        {/* IMAGEM DE FUNDO ADAPTADA: MOBILE (ARTE VERTICAL COMPLETA) E PC (HORIZONTAL) */}
        {/* ========================================================================= */}
        <picture className="block w-full h-full">
          <source media="(max-width: 768px)" srcSet={triplexBgMobile} />
          <img
            src={isMobile ? triplexBgMobile : triplexBgPc}
            alt="The Triplex - Arte Oficial de Fundo"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`bg-scenery-img block w-full h-full select-none transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              objectPosition: 'center center',
            }}
          />
        </picture>
      </div>
    </div>
  );
};
