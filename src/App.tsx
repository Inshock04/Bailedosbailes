/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  PixelSkull, 
  PixelVolume, 
  PixelVolumeMute, 
  PixelSparkles, 
  PixelDoor, 
  PixelKey,
  PixelPin,
  PixelWardrobe,
  PixelTicketIcon,
  PixelGhost,
  PixelHome,
  PixelInfo,
  PixelUserPlus,
  PixelExternalLink
} from './components/PixelIcons';
import { 
  VictorianMansionIcon, 
  CryingNunIcon, 
  CircusTentIcon, 
  WitchHatIcon, 
  VintageKeyIcon 
} from './components/GlowingRedIcons';
import { HotelScene } from './components/HotelScene';
import { BatSwarm } from './components/BatSwarm';
import { DenseAtmosphericFog } from './components/DenseAtmosphericFog';
import { CardSmokeCanvas } from './components/CardSmokeCanvas';
import { CustomCursor } from './components/CustomCursor';
import { TicketModal } from './components/TicketModal';
import { OracleModal } from './components/OracleModal';
import { PromotionsModal } from './components/PromotionsModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { LocationModal } from './components/LocationModal';
import { DressCodeModal } from './components/DressCodeModal';
import { AboutModal, FaqModal, ContactModal } from './components/InfoModals';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { OfficialSocialButtons } from './components/OfficialSocialButtons';
import { audioManager } from './utils/audio';

gsap.registerPlugin(useGSAP);

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const leftSidebarRef = useRef<HTMLDivElement>(null);

  // Modals & Sound State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [hoveredIconId, setHoveredIconId] = useState<string | null>(null);
  const [isMusicOn, setIsMusicOn] = useState<boolean>(false);
  const [isCrtOn, setIsCrtOn] = useState<boolean>(false);
  const [isCardMinimized, setIsCardMinimized] = useState<boolean>(false);
  const [currentScene, setCurrentScene] = useState<'circus' | 'hotel'>('circus');

  // Real-Time Countdown to October 31, 2026, 21:00
  const [timeLeft, setTimeLeft] = useState({
    days: 28,
    hours: 14,
    minutes: 36,
    seconds: 48,
  });

  // Master GSAP Intro Timeline
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Intro Card Gradual Emergence Animation (Introduction)
    if (rightSidebarRef.current) {
      tl.fromTo(
        rightSidebarRef.current,
        {
          opacity: 0,
          y: -20,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.2,
        }
      );

      tl.from(
        '.sidebar-item-anim',
        {
          y: 10,
          opacity: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power2.out',
        },
        '-=0.6'
      );
    }

    // Navigation bar entrance
    if (leftSidebarRef.current) {
      tl.from(
        leftSidebarRef.current,
        {
          opacity: 0,
          y: 15,
          duration: 0.7,
          ease: 'power2.out',
        },
        '-=0.3'
      );
    }

    // Glowing pulsing title animation
    gsap.to('.neon-ahs-title', {
      textShadow: '0 0 20px rgba(239, 68, 68, 0.95), 0 0 8px rgba(255, 255, 255, 0.8)',
      repeat: -1,
      yoyo: true,
      duration: 2.2,
      ease: 'sine.inOut',
    });

    // Glowing pulsing Triplex title
    gsap.to('.neon-triplex-title', {
      textShadow: '0 0 25px rgba(245, 158, 11, 0.9), 0 0 10px rgba(239, 68, 68, 0.7)',
      repeat: -1,
      yoyo: true,
      duration: 1.8,
      ease: 'sine.inOut',
    });

  }, { scope: containerRef });

  useEffect(() => {
    const targetDate = new Date('2026-10-31T21:00:00-03:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Audio Toggle
  const toggleAudio = () => {
    audioManager.playClick();
    const newState = audioManager.toggleMusic((playing) => setIsMusicOn(playing));
    setIsMusicOn(newState);
  };

  const handleOpenSection = (sectionId: string) => {
    audioManager.playClick();
    setActiveModal(sectionId);
  };

  // Left sidebar with 5 Animated Glowing Red SVG Icons (Casarão Vitoriano, Freira Chorando, Lona de Circo, Chapéu de Bruxa, Chave Vintage)
  const leftSidebarIcons = [
    {
      id: 'home',
      label: 'CASARÃO VITORIANO / HOME',
      renderIcon: (isHovered: boolean, isActive: boolean) => (
        <VictorianMansionIcon isHovered={isHovered} isActive={isActive} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      ),
      bg: 'hover:bg-[#ff0033]/20',
      activeColor: 'bg-[#ff0033]/30',
      action: () => {
        audioManager.playClick();
        setCurrentScene('hotel');
        setActiveModal(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'evento',
      label: 'FREIRA CHORANDO / INFO DO EVENTO',
      renderIcon: (isHovered: boolean, isActive: boolean) => (
        <CryingNunIcon isHovered={isHovered} isActive={isActive} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      ),
      bg: 'hover:bg-[#ff0033]/20',
      activeColor: 'bg-[#ff0033]/30',
      action: () => handleOpenSection('evento'),
    },
    {
      id: 'ingressos',
      label: 'LONA DE CIRCO / INGRESSOS & ATRAÇÕES',
      renderIcon: (isHovered: boolean, isActive: boolean) => (
        <CircusTentIcon isHovered={isHovered} isActive={isActive} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      ),
      bg: 'hover:bg-[#ff0033]/20',
      activeColor: 'bg-[#ff0033]/30',
      action: () => {
        setCurrentScene('circus');
        handleOpenSection('tickets');
      },
    },
    {
      id: 'oraculo',
      label: 'CHAPÉU DE BRUXA / ORÁCULO & TAROT',
      renderIcon: (isHovered: boolean, isActive: boolean) => (
        <WitchHatIcon isHovered={isHovered} isActive={isActive} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      ),
      bg: 'hover:bg-[#ff0033]/20',
      activeColor: 'bg-[#ff0033]/30',
      action: () => handleOpenSection('cards'),
    },
    {
      id: 'admin',
      label: 'CHAVE VINTAGE / ÁREA DE ADM',
      renderIcon: (isHovered: boolean, isActive: boolean) => (
        <VintageKeyIcon isHovered={isHovered} isActive={isActive} className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      ),
      bg: 'hover:bg-[#ff0033]/20',
      activeColor: 'bg-[#ff0033]/30',
      action: () => handleOpenSection('admin'),
    },
  ];

  return (
    <div 
      ref={containerRef}
      className={`min-h-[100dvh] w-full bg-[#05030a] text-[#eae5f5] relative overflow-x-hidden flex ${isCrtOn ? 'crt-overlay' : ''}`}
    >
      {/* Custom Pixel Art Skeleton / Horror Dagger Cursor */}
      <CustomCursor />

      {/* ========================================================================= */}
      {/* 1. HOTEL SCENERY OCCUPYING THE ENTIRE DESIGN (FULL SCREEN PIXEL ART) */}
      {/* ========================================================================= */}
      <HotelScene currentScene={currentScene} />

      {/* ========================================================================= */}
      {/* 2. GSAP ANIMATED BATS SWARM & DENSE ATMOSPHERIC ROLLING FOG */}
      {/* ========================================================================= */}
      <BatSwarm />
      <DenseAtmosphericFog />

      {/* ========================================================================= */}
      {/* 3. NAVIGATION BAR: BOTTOM ON MOBILE / LEFT SIDEBAR ON DESKTOP */}
      {/* ========================================================================= */}
      <div className="fixed bottom-2 sm:bottom-3 inset-x-0 z-[110] pointer-events-none flex justify-center items-center px-3 sm:px-2 md:inset-x-auto md:left-3 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:block" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <nav 
          ref={leftSidebarRef}
          aria-label="Menu de Navegação Vermelho Brilhoso"
          className="pointer-events-auto flex flex-row md:flex-col items-center justify-center gap-2 sm:gap-2.5 md:gap-1.5 bg-[#0c0614]/92 md:bg-transparent backdrop-blur-lg md:backdrop-blur-none px-3 sm:px-3 py-2 sm:py-1.5 md:p-0.5 border border-[#ff1e38]/40 md:border-none rounded-xl md:rounded-none shadow-[0_0_30px_rgba(0,0,0,0.9)] md:shadow-none select-none max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-1rem)]"
        >
          {leftSidebarIcons.map((item) => {
            const isActive = activeModal === item.id || (item.id === 'home' && activeModal === null);
            const isHovered = hoveredIconId === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setHoveredIconId(item.id)}
                onMouseLeave={() => setHoveredIconId(null)}
                title={item.label}
                aria-label={item.label}
                className={`left-icon-btn group relative w-10 h-10 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center outline-none border rounded-lg md:rounded-none ${
                  isActive 
                    ? `${item.activeColor} border-[#ff0033]/70 shadow-[0_0_18px_rgba(255,0,51,0.6),inset_0_0_8px_rgba(255,0,51,0.35)] scale-105` 
                    : 'bg-transparent border-transparent hover:border-[#ff0033]/80 hover:bg-[#ff0033]/25 hover:shadow-[0_0_22px_rgba(255,0,51,0.85),inset_0_0_10px_rgba(255,0,51,0.4)]'
                } hover:scale-105 active:scale-95 transition-all duration-300 ease-out cursor-pointer select-none`}
              >
                {item.renderIcon(isHovered, isActive)}

                {/* Tooltip on hover: Above on mobile bottom-bar, Right side on desktop */}
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 md:bottom-auto md:left-full md:translate-x-0 md:ml-2 md:top-1/2 md:-translate-y-1/2 px-2.5 py-1 bg-[#180509]/95 text-[11px] sm:text-[12px] font-pixel text-[#ff4d6d] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-[0_0_15px_rgba(255,30,56,0.8)] z-[110]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* 4. EVENT INTRODUCTION CARD: HORIZONTAL ON MOBILE / SIDEBAR ON DESKTOP */}
      {/* ========================================================================= */}
      <div className="relative z-30 w-full min-h-screen flex justify-center md:justify-end items-start md:items-center pointer-events-none p-2 sm:p-3 md:p-4 pt-2 sm:pt-3 md:pt-4 pb-24 sm:pb-20 md:pb-4">
        
        {/* If Minimized on Mobile/Desktop, show ultra-compact floating button */}
        {isCardMinimized ? (
          <div className="pointer-events-auto self-start sm:self-center md:self-center my-0 md:my-auto flex flex-col items-center sm:items-end gap-1.5">
            <button
              onClick={() => {
                audioManager.playClick();
                setIsCardMinimized(false);
              }}
              className="bg-[#0c0614]/95 border-2 border-[#ff3344] text-[#ff3344] hover:text-white px-3 py-2 font-pixel text-[14px] sm:text-[15px] tracking-wider shadow-[0_0_20px_rgba(255,51,68,0.6)] flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <PixelSkull size={13} color="#ef4444" />
              <span>THE TRIPLEX • EXPANDIR</span>
            </button>
            <button
              onClick={() => handleOpenSection('tickets')}
              className="bg-[#991b1b] hover:bg-[#b91c1c] text-white px-3 py-1.5 font-pixel text-[13px] sm:text-[14px] tracking-wider border border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer"
            >
              COMPRAR INGRESSO
            </button>
          </div>
        ) : (
          /* Responsive Horizontal Top Card (Mobile) / Compact Sidebar (Desktop) */
          <aside 
            ref={rightSidebarRef}
            className="relative pointer-events-auto w-full max-w-[96vw] sm:max-w-[94vw] md:max-w-[305px] lg:max-w-[335px] bg-[#0c0614]/95 backdrop-blur-md border-2 border-[#361c4d] rounded-xl md:rounded-none shadow-[0_0_30px_rgba(0,0,0,0.95)] flex flex-col justify-between p-3 sm:p-3 md:p-3.5 my-0 md:my-auto max-h-[80vh] sm:max-h-[85vh] md:max-h-[92vh] overflow-y-auto overflow-x-hidden custom-scrollbar select-none mobile-scroll-smooth"
          >
            {/* Atmospheric canvas smoke particles at the bottom of the card */}
            <CardSmokeCanvas className="absolute bottom-0 left-0 right-0 w-full h-20 sm:h-24 md:h-28 z-0 pointer-events-none opacity-85" />
            
            {/* Top Bar on Mobile & Desktop: Branding Header */}
            <div className="relative z-10 sidebar-item-anim border-b-2 border-[#2a133d] pb-2 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[13px] sm:text-[14px] text-[#ef4444] tracking-widest uppercase flex items-center gap-1 font-bold">
                    <PixelSkull size={12} color="#ef4444" />
                    <span>HALLOWEEN</span>
                  </span>
                  <span className="bg-[#1f0a17] border border-[#7f1d1d] px-1.5 py-0.5 font-pixel text-[12px] sm:text-[13px] text-[#fca5a5]">
                    2026
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[13px] sm:text-[14px] text-[#a855f7]">
                    • 31 OUT • 21H
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[#ef4444] font-pixel text-[13px] sm:text-[14px] font-bold sm:hidden">
                    31 OUT • 21H
                  </span>
                  {/* Minimize toggle button */}
                  <button
                    onClick={() => {
                      audioManager.playClick();
                      setIsCardMinimized(true);
                    }}
                    title="Minimizar painel para ver o hotel"
                    className="px-2 py-0.5 bg-[#2a133d] hover:bg-[#ff3344] text-[#d1d5db] hover:text-white font-pixel text-[14px] transition-colors cursor-pointer"
                  >
                    —
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-1 mt-1">
                <div className="flex items-baseline gap-2">
                  <h2 className="neon-ahs-title font-pixel text-[14px] sm:text-[15px] md:text-[15px] text-[#ff3344] font-black tracking-wider leading-tight">
                    AMERICAN HORROR STORY
                  </h2>
                  <h1 className="neon-triplex-title font-pixel text-base sm:text-lg md:text-xl text-[#f59e0b] font-black tracking-wider leading-none">
                    THE TRIPLEX
                  </h1>
                </div>
                <span className="text-[#a855f7] flex items-center gap-0.5 text-[13px] sm:text-[14px] font-pixel">
                  <PixelPin size={12} color="#a855f7" />
                  <span>SÃO PAULO</span>
                </span>
              </div>
            </div>

            {/* Middle Section: Horizontal Multi-Column Grid on Mobile / Stacked on Desktop */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
              
              {/* Column 1 (Mobile) / Top Box (Desktop): Buy Ticket CTA & Countdown */}
              <div className="space-y-2">
                {/* Primary Buy Ticket CTA Button */}
                <div className="sidebar-item-anim">
                  <button
                    onClick={() => handleOpenSection('tickets')}
                    className="w-full pixel-btn bg-[#991b1b] hover:bg-[#b91c1c] active:bg-[#7f1d1d] text-white py-2 px-3 font-pixel text-[14px] sm:text-[15px] tracking-wider font-bold flex items-center justify-center gap-2 border-2 border-[#ff3344] shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer"
                  >
                    <PixelSkull size={13} color="#ffffff" />
                    <span>COMPRAR INGRESSO</span>
                  </button>
                </div>

                {/* Real-time Countdown Box */}
                <div className="sidebar-item-anim bg-[#12071f] border border-[#361c4d] p-1.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="font-pixel text-[12px] sm:text-[13px] text-[#a855f7] tracking-widest uppercase font-bold">
                      CONTAGEM REGRESSIVA
                    </span>
                    <span className="font-pixel text-[12px] sm:text-[13px] text-[#ef4444] font-bold">AO VIVO</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <div className="bg-[#180b29] border border-[#4c1d95] p-1 flex flex-col items-center">
                      <span className="font-pixel text-sm sm:text-base md:text-lg text-white font-bold">{timeLeft.days}</span>
                      <span className="font-pixel text-[11px] sm:text-[12px] text-[#9ca3af]">DIAS</span>
                    </div>
                    <div className="bg-[#180b29] border border-[#4c1d95] p-1 flex flex-col items-center">
                      <span className="font-pixel text-sm sm:text-base md:text-lg text-white font-bold">{timeLeft.hours}</span>
                      <span className="font-pixel text-[11px] sm:text-[12px] text-[#9ca3af]">HRS</span>
                    </div>
                    <div className="bg-[#180b29] border border-[#4c1d95] p-1 flex flex-col items-center">
                      <span className="font-pixel text-sm sm:text-base md:text-lg text-white font-bold">{timeLeft.minutes}</span>
                      <span className="font-pixel text-[11px] sm:text-[12px] text-[#9ca3af]">MIN</span>
                    </div>
                    <div className="bg-[#180b29] border border-[#4c1d95] p-1 flex flex-col items-center">
                      <span className="font-pixel text-sm sm:text-base md:text-lg text-[#ef4444] font-bold">{timeLeft.seconds}</span>
                      <span className="font-pixel text-[11px] sm:text-[12px] text-[#9ca3af]">SEG</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 (Mobile) / Bottom Box (Desktop): Location & Maps */}
              <div className="sidebar-item-anim bg-[#11071c] border border-[#22c55e]/70 p-2 flex flex-col justify-between space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[13px] sm:text-[14px] text-[#86efac] tracking-wider uppercase font-bold flex items-center gap-1">
                    <PixelPin size={12} color="#22c55e" />
                    <span>LOCALIZAÇÃO</span>
                  </span>
                  <span className="font-pixel text-[12px] sm:text-[13px] text-[#4ade80]">ITAIM PAULISTA • SP</span>
                </div>

                {/* Venue Address Info */}
                <div className="bg-[#0b1710] border border-[#166534] p-1.5 space-y-0.5">
                  <div className="font-pixel text-[14px] sm:text-[15px] text-[#bbf7d0] font-bold leading-tight">
                    THE TRIPLEX
                  </div>
                  <div className="font-mono text-[13px] sm:text-[14px] text-[#86efac] leading-tight">
                    Rua Manoel Castilho, 201 - São Paulo
                  </div>
                </div>

                {/* Google Maps Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <a
                    href="https://maps.google.com/?q=Rua+Manoel+Castilho,+201,+Itaim+Paulista,+Sao+Paulo,+SP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-[#052e16] hover:bg-[#14532d] active:bg-[#052e16] border border-[#22c55e] text-[#86efac] hover:text-white font-pixel text-[12px] sm:text-[13px] tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer text-center"
                  >
                    <PixelExternalLink size={12} color="#86efac" />
                    <span>MAPS</span>
                  </a>

                  <button
                    onClick={() => handleOpenSection('local')}
                    className="p-1.5 bg-[#180b29] hover:bg-[#2e1065] active:bg-[#180b29] border border-[#a855f7] text-[#e9d5ff] font-pixel text-[12px] sm:text-[13px] tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer text-center"
                  >
                    <PixelPin size={12} color="#c084fc" />
                    <span>VER MAPA</span>
                  </button>
                </div>

                {/* Canais Oficiais de Contato: WhatsApp e Instagram */}
                <div className="border-t border-[#166534]/50 pt-1.5 mt-0.5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-pixel text-[12px] sm:text-[13px] text-[#86efac] tracking-wider uppercase font-bold">
                      ATENDIMENTO
                    </span>

                  </div>
                  <OfficialSocialButtons />
                </div>
              </div>

            </div>

            {/* Bottom Footer Bar: Audio, CRT & Info Links */}
            <div className="relative z-10 sidebar-item-anim mt-2 pt-2 border-t border-[#2a133d] flex flex-wrap items-center justify-between gap-2">
              
              {/* 8-bit Audio Bar & CRT Filter Toggle */}
              <div className="flex items-center gap-1.5 flex-1 min-w-[150px]">
                {/* Audio Toggle: Trilha Sonora Oficial American Horror Story */}
                <button
                  onClick={toggleAudio}
                  title="Tocar / Pausar trilha sonora oficial American Horror Story: Hotel (Loop Contínuo)"
                  aria-label="Controle de áudio da trilha American Horror Story"
                  className={`flex-1 py-1 px-1.5 border flex items-center justify-between text-[12px] sm:text-[13px] font-pixel transition-all cursor-pointer ${
                    isMusicOn 
                      ? 'bg-[#14532d] border-[#22c55e] text-[#86efac] shadow-[0_0_12px_rgba(34,197,94,0.4)]' 
                      : 'bg-[#160a21] border-[#361c4d] text-[#9ca3af] hover:border-[#ff3344]/60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {isMusicOn ? (
                      <PixelVolume size={11} color="#22c55e" />
                    ) : (
                      <PixelVolumeMute size={11} color="#ef4444" />
                    )}
                    <span>AHS THEME</span>
                  </div>
                  <span className={isMusicOn ? 'text-[#86efac] font-bold animate-pulse' : 'text-[#ef4444]'}>
                    {isMusicOn ? 'LOOP ON' : 'OFF'}
                  </span>
                </button>

                {/* CRT Monitor Toggle */}
                <button
                  onClick={() => {
                    audioManager.playClick();
                    setIsCrtOn(!isCrtOn);
                  }}
                  className={`py-1 px-1.5 border text-[12px] sm:text-[13px] font-pixel transition-all cursor-pointer ${
                    isCrtOn 
                      ? 'bg-[#3b0764] border-[#a855f7] text-[#f5d0fe]' 
                      : 'bg-[#160a21] border-[#361c4d] text-[#9ca3af]'
                  }`}
                >
                  CRT:{isCrtOn ? 'ON' : 'OFF'}
                </button>

                {/* Scene Toggle: Circo Macabro vs Hotel Cortez */}
                <button
                  onClick={() => {
                    audioManager.playClick();
                    setCurrentScene(prev => prev === 'circus' ? 'hotel' : 'circus');
                  }}
                  title="Alternar entre o Circo Macabro e o Hotel Cortez"
                  className="py-1 px-1.5 border text-[12px] sm:text-[13px] font-pixel transition-all cursor-pointer bg-[#180a14] border-[#7f1d1d] text-[#fca5a5] hover:border-[#ff3344] hover:bg-[#3b0710]"
                >
                  {currentScene === 'circus' ? 'CENÁRIO: CIRCO' : 'CENÁRIO: HOTEL'}
                </button>
              </div>

              {/* Quick Links / Info / Admin */}
              <div className="flex items-center justify-end gap-1.5 text-[12px] sm:text-[13px] font-pixel text-[#9ca3af]">
                <button
                  onClick={() => handleOpenSection('sobre')}
                  className="hover:text-[#ef4444] transition-colors cursor-pointer"
                >
                  SOBRE
                </button>
                <span>•</span>
                <button
                  onClick={() => handleOpenSection('faq')}
                  className="hover:text-[#ef4444] transition-colors cursor-pointer"
                >
                  FAQ
                </button>
                <span>•</span>
                <button
                  onClick={() => handleOpenSection('contato')}
                  className="hover:text-[#ef4444] transition-colors cursor-pointer"
                >
                  CONTATO
                </button>
                <span>•</span>
                <button
                  onClick={() => handleOpenSection('admin')}
                  className="hover:text-[#fbbf24] transition-colors cursor-pointer flex items-center gap-0.5 text-[#d97706]"
                >
                  <PixelKey size={9} color="#d97706" />
                  <span>ADMIN</span>
                </button>
              </div>

            </div>

          </aside>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. MODALS & POPUPS (Full Functional Engine Preserved) */}
      {/* ========================================================================= */}
      <TicketModal
        isOpen={activeModal === 'tickets'}
        onClose={() => setActiveModal(null)}
      />

      <OracleModal
        isOpen={activeModal === 'cards'}
        onClose={() => setActiveModal(null)}
      />

      <PromotionsModal
        isOpen={activeModal === 'promocoes'}
        onClose={() => setActiveModal(null)}
      />

      <EventDetailsModal
        isOpen={activeModal === 'evento'}
        onClose={() => setActiveModal(null)}
        onOpenTickets={() => setActiveModal('tickets')}
      />

      <LocationModal
        isOpen={activeModal === 'local'}
        onClose={() => setActiveModal(null)}
      />

      <DressCodeModal
        isOpen={activeModal === 'dresscode'}
        onClose={() => setActiveModal(null)}
      />

      <AboutModal
        isOpen={activeModal === 'sobre'}
        onClose={() => setActiveModal(null)}
      />

      <FaqModal
        isOpen={activeModal === 'faq'}
        onClose={() => setActiveModal(null)}
      />

      <ContactModal
        isOpen={activeModal === 'contato'}
        onClose={() => setActiveModal(null)}
      />

      <AdminDashboardModal
        isOpen={activeModal === 'admin'}
        onClose={() => setActiveModal(null)}
      />

    </div>
  );
}
