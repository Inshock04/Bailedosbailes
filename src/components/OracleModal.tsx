import React, { useState, useEffect } from 'react';
import {
  PixelClose,
  PixelStar,
  PixelShuffle,
  PixelWarning,
  PixelSparkles
} from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { OracleCard, Coupon } from '../types';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

interface OracleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ORACLE_CARDS: OracleCard[] = [
  {
    id: 'card-caipiroska-70',
    name: '4 Caipiroska de R$ 120 por R$ 70',
    title: 'MÁSCARA DA FOLIA',
    symbol: 'CHALICE',
    arcana: 'CARNATAL I',
    description: 'Quatro taças geladas no ritmo do bloco para brindar o Carnatal no The Triplex.',
    rewardText: '4 caipiroska de 120 por 70',
    rewardCodePrefix: 'CAIP70',
    discountType: 'PRICE',
    value: 'R$ 70,00'
  },
  {
    id: 'card-vodkabaly-50',
    name: '3 Dose de Vodka c/ Baly por R$ 50',
    title: 'TRENÓ DA MADRUGADA',
    symbol: 'FLAME',
    arcana: 'CARNATAL II',
    description: 'Energia intensa puxada pelas renas da folia para atravessar a noite na pista.',
    rewardText: '3 dose de vodka c/baly por 50',
    rewardCodePrefix: 'VBALY50',
    discountType: 'PRICE',
    value: 'R$ 50,00'
  },
  {
    id: 'card-maracujack-55',
    name: '2 Maracujack de R$ 70 por R$ 55',
    title: 'PRESENTE DO PAPAI NOEL',
    symbol: 'RAVEN',
    arcana: 'CARNATAL III',
    description: "Jack Daniel's com maracujá saindo direto da caixa de presentes para celebrar em dose dupla.",
    rewardText: '2 maracujack de 70 por 55',
    rewardCodePrefix: 'MJACK55',
    discountType: 'PRICE',
    value: 'R$ 55,00'
  },
  {
    id: 'card-whiskysour-55',
    name: '2 Whisky Sour de R$ 70 por R$ 55',
    title: 'BRILHO DOS PISCA-PISCAS',
    symbol: 'MOON',
    arcana: 'CARNATAL IV',
    description: 'O equilíbrio cítrico iluminado pelos pisca-piscas natalinos e confetes de carnaval.',
    rewardText: '2 whisky sour de 70 por 55',
    rewardCodePrefix: 'WSOUR55',
    discountType: 'PRICE',
    value: 'R$ 55,00'
  },
  {
    id: 'card-jackcoke-55',
    name: '2 Jack and Coke de R$ 70 por R$ 55',
    title: 'BLOCO DAS RENAS',
    symbol: 'SKULL',
    arcana: 'CARNATAL V',
    description: 'A combinação lendária servida trincando no encontro entre o Carnaval e o Natal.',
    rewardText: '2 Jack and Coke de 70 por 55',
    rewardCodePrefix: 'JCOKE55',
    discountType: 'PRICE',
    value: 'R$ 55,00'
  }
];

function shuffleDeck<T>(array: T[], count = 5): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

/** Cordão de pisca-piscas natalinos/carnavalescos para o topo e base das cartas */
const FairyLightsStrip: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const colors = ['#ff3344', '#fbbf24', '#22c55e', '#38bdf8', '#e879f9', '#f97316'];
  return (
    <svg viewBox="0 0 120 18" className="w-full h-3.5 overflow-visible" aria-hidden="true">
      {/* Fio */}
      <path
        d="M2 5 Q15 12 30 5 T60 5 T90 5 T118 5"
        fill="none"
        stroke="#374151"
        strokeWidth="1.5"
      />
      {[12, 32, 52, 72, 92, 110].map((cx, i) => {
        const bulbColor = colors[(i + variant) % colors.length];
        const cy = i % 2 === 0 ? 8 : 6;
        return (
          <g key={cx}>
            <rect x={cx - 1.5} y={cy - 3.5} width="3" height="2" fill="#9ca3af" rx="0.5" />
            <circle
              cx={cx}
              cy={cy + 1}
              r="3.2"
              fill={bulbColor}
              className="animate-pulse"
              style={{
                filter: `drop-shadow(0 0 5px ${bulbColor})`,
                animationDelay: `${((i + variant) * 180) % 900}ms`
              }}
            />
          </g>
        );
      })}
    </svg>
  );
};

/** Ilustrações personalizadas de cada carta: Máscaras de Carnaval, Renas/Trenó, Caixa de Presentes e Pisca-Piscas */
const CarnatalCardIllustration: React.FC<{ index: number }> = ({ index }) => {
  const type = index % 5;

  // Carta 1: Máscara de Carnaval Veneziana com plumas e confetes
  if (type === 0) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_10px_rgba(232,121,249,0.7)]" aria-hidden="true">
        {/* Plumas de Carnaval */}
        <path d="M32 22 C22 6 12 8 16 22" stroke="#f43f5e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M32 20 C32 4 38 4 36 20" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M32 22 C42 6 52 8 48 22" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Corpo da Máscara */}
        <path
          d="M10 26 C10 18 22 18 32 24 C42 18 54 18 54 26 C54 38 44 44 36 38 L32 43 L28 38 C20 44 10 38 10 26 Z"
          fill="#a855f7"
          stroke="#fde047"
          strokeWidth="2"
        />
        {/* Olhos da máscara */}
        <ellipse cx="22" cy="29" rx="5.5" ry="3.2" fill="#090414" stroke="#fde047" strokeWidth="1.2" />
        <ellipse cx="42" cy="29" rx="5.5" ry="3.2" fill="#090414" stroke="#fde047" strokeWidth="1.2" />
        {/* Confetes e brilhos */}
        <circle cx="14" cy="48" r="2" fill="#fbbf24" />
        <circle cx="50" cy="47" r="2" fill="#22c55e" />
        <circle cx="32" cy="52" r="2" fill="#f43f5e" />
      </svg>
    );
  }

  // Carta 2: Rena de Natal com nariz vermelho brilhante, galhada festiva e trenó
  if (type === 1) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]" aria-hidden="true">
        {/* Galhadas da Rena com pisca-pisca pendurado */}
        <path d="M22 24 L15 10 M18 16 L11 15 M20 20 L25 13" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 24 L49 10 M46 16 L53 15 M44 20 L39 13" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="11" cy="15" r="2.2" fill="#22c55e" />
        <circle cx="53" cy="15" r="2.2" fill="#38bdf8" />
        {/* Orelhas e rosto da Rena */}
        <ellipse cx="18" cy="27" rx="4" ry="2.2" fill="#b45309" transform="rotate(-20 18 27)" />
        <ellipse cx="46" cy="27" rx="4" ry="2.2" fill="#b45309" transform="rotate(20 46 27)" />
        <ellipse cx="32" cy="34" rx="12" ry="13" fill="#d97706" stroke="#fef08a" strokeWidth="1.5" />
        {/* Máscara de carnaval na rena */}
        <path d="M20 30 Q26 26 32 30 Q38 26 44 30 Q40 36 32 33 Q24 36 20 30 Z" fill="#9333ea" stroke="#fde047" strokeWidth="1" />
        <circle cx="27" cy="31" r="1.6" fill="#fff" />
        <circle cx="37" cy="31" r="1.6" fill="#fff" />
        {/* Nariz vermelho iluminado (Rudolph) */}
        <circle cx="32" cy="41" r="4.2" fill="#ff1e38" stroke="#fecdd3" strokeWidth="1" />
        {/* Trenó estilizado na base */}
        <path d="M14 53 H50 C54 53 55 49 52 48" stroke="#fde047" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Carta 3: Caixa de Presentes Natalina com laço dourado e serpentinas
  if (type === 2) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_10px_rgba(239,68,68,0.75)]" aria-hidden="true">
        {/* Laço superior */}
        <path d="M32 22 C22 10 14 18 24 23 Z" fill="#fbbf24" stroke="#fef08a" strokeWidth="1.5" />
        <path d="M32 22 C42 10 50 18 40 23 Z" fill="#fbbf24" stroke="#fef08a" strokeWidth="1.5" />
        {/* Tampa da caixa */}
        <rect x="13" y="22" width="38" height="8" rx="2" fill="#dc2626" stroke="#fde047" strokeWidth="1.5" />
        {/* Corpo da caixa */}
        <rect x="16" y="30" width="32" height="24" rx="2" fill="#b91c1c" stroke="#fde047" strokeWidth="1.5" />
        {/* Fitas douradas e verdes */}
        <rect x="29" y="22" width="6" height="32" fill="#fbbf24" />
        <rect x="16" y="39" width="32" height="5" fill="#22c55e" />
        {/* Confetes ao redor */}
        <circle cx="10" cy="18" r="2" fill="#38bdf8" />
        <circle cx="54" cy="18" r="2" fill="#e879f9" />
        <circle cx="11" cy="46" r="1.8" fill="#fbbf24" />
        <circle cx="53" cy="46" r="1.8" fill="#22c55e" />
      </svg>
    );
  }

  // Carta 4: Pisca-Piscas Mágicos em espiral + Árvore/Folia de Carnatal
  if (type === 3) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_10px_rgba(34,197,94,0.75)]" aria-hidden="true">
        {/* Estrela no topo */}
        <polygon points="32,7 35,14 42,14 36,18 38,25 32,21 26,25 28,18 22,14 29,14" fill="#fde047" />
        {/* Fios de Pisca-Pisca cruzados */}
        <path d="M14 26 Q32 34 50 26" stroke="#86efac" strokeWidth="2" fill="none" />
        <path d="M12 38 Q32 46 52 38" stroke="#c084fc" strokeWidth="2" fill="none" />
        <path d="M16 49 Q32 55 48 49" stroke="#fde047" strokeWidth="2" fill="none" />
        {/* Lâmpadas coloridas brilhantes */}
        <circle cx="18" cy="28" r="3.5" fill="#ff3344" />
        <circle cx="32" cy="31" r="3.5" fill="#38bdf8" />
        <circle cx="46" cy="28" r="3.5" fill="#fbbf24" />
        <circle cx="16" cy="40" r="3.5" fill="#e879f9" />
        <circle cx="32" cy="43" r="3.5" fill="#22c55e" />
        <circle cx="48" cy="40" r="3.5" fill="#ff3344" />
        <circle cx="24" cy="52" r="3.5" fill="#fbbf24" />
        <circle cx="40" cy="52" r="3.5" fill="#38bdf8" />
      </svg>
    );
  }

  // Carta 5: Trenó Voador + Caixa de Presentes + Máscara de Carnaval
  return (
    <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_10px_rgba(245,158,11,0.75)]" aria-hidden="true">
      {/* Caixa de presente dentro do trenó */}
      <rect x="20" y="16" width="16" height="14" rx="1.5" fill="#22c55e" stroke="#fde047" strokeWidth="1.2" />
      <rect x="26.5" y="16" width="3" height="14" fill="#ef4444" />
      {/* Corpo do Trenó */}
      <path d="M12 28 H46 L52 38 H16 Z" fill="#dc2626" stroke="#fde047" strokeWidth="1.5" />
      {/* Esquis dourados do trenó */}
      <path d="M10 44 H52 C56 44 58 40 54 38" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Mini máscara de carnaval sobre o trenó */}
      <path d="M30 22 C30 18 36 18 40 21 C44 18 50 18 50 22 C50 27 44 29 40 26 C36 29 30 27 30 22 Z" fill="#a855f7" stroke="#fef08a" strokeWidth="1.2" />
      {/* Luzes de pisca-pisca na base */}
      <circle cx="18" cy="51" r="2.2" fill="#ff3344" />
      <circle cx="28" cy="51" r="2.2" fill="#22c55e" />
      <circle cx="38" cy="51" r="2.2" fill="#38bdf8" />
      <circle cx="48" cy="51" r="2.2" fill="#fbbf24" />
    </svg>
  );
};

const CARD_BADGE_LABELS = [
  'MÁSCARA',
  'RENAS',
  'PRESENTE',
  'PISCA-PISCA',
  'TRENÓ FOLIA'
];

export const OracleModal: React.FC<OracleModalProps> = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState<OracleCard[]>(() => shuffleDeck(DEFAULT_ORACLE_CARDS, 5));
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [revealedCard, setRevealedCard] = useState<OracleCard | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [claimedCoupon, setClaimedCoupon] = useState<Coupon | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const loadCards = () => {
    fetch('/api/oracle/cards')
      .then((res) => res.json())
      .then((data: OracleCard[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCards(shuffleDeck(data, 5));
        } else {
          setCards(shuffleDeck(DEFAULT_ORACLE_CARDS, 5));
        }
      })
      .catch(() => {
        setCards(shuffleDeck(DEFAULT_ORACLE_CARDS, 5));
      });
  };

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCardId(null);
      setRevealedCard(null);
      setIsFlipping(false);
      setErrorMsg(null);
      setClaimedCoupon(null);
      setQrCodeDataUrl('');
      loadCards();

      fetch('/api/oracle/me', { credentials: 'same-origin' })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (!res.ok) {
            console.error('[Oracle] Falha ao recuperar resgate', {
              operation: 'GET /api/oracle/me',
              status: res.status,
              response: data
            });
            return null;
          }
          return data;
        })
        .then(async (data) => {
          if (!data?.coupon) return;
          setClaimedCoupon(data.coupon);
          const qr = await QRCode.toDataURL(data.coupon.token, { width: 180, margin: 1 });
          setQrCodeDataUrl(qr);
        })
        .catch((error) =>
          console.error('[Oracle] Falha de conexão ao recuperar resgate', {
            operation: 'GET /api/oracle/me',
            error
          })
        );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCardClick = (card: OracleCard) => {
    if (revealedCard || isFlipping || claimedCoupon) return;

    audioManager.playCardFlip();
    setSelectedCardId(card.id);
    setIsFlipping(true);

    setTimeout(() => {
      setRevealedCard(card);
      setIsFlipping(false);
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#ef4444', '#fbbf24', '#22c55e', '#a855f7', '#38bdf8']
      });
    }, 550);
  };

  const handleClaimReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setErrorMsg('Informe seu telefone com DDD para vincular o cupom.');
      audioManager.playError();
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/oracle/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          userName: userName || 'Folião do Carnatal',
          cardId: revealedCard?.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[Oracle] Falha ao registrar resgate', {
          operation: 'POST /api/oracle/draw',
          status: res.status,
          response: data
        });
        if (data.coupon) {
          setClaimedCoupon(data.coupon);
          const qr = await QRCode.toDataURL(data.coupon.token, { width: 180, margin: 1 });
          setQrCodeDataUrl(qr);
        }
        throw new Error(data.error || 'Erro ao resgatar recompensa.');
      }

      setClaimedCoupon(data.coupon);
      audioManager.playSuccess();

      const qr = await QRCode.toDataURL(data.coupon.token, { width: 180, margin: 1 });
      setQrCodeDataUrl(qr);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão.');
      audioManager.playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel max-w-4xl bg-gradient-to-b from-[#12071f] via-[#0d0716] to-[#091510] border-2 border-[#f59e0b] shadow-[0_0_40px_rgba(245,158,11,0.45)] rounded-2xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oracle-modal-title"
      >
        {/* Sticky Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-b-2 border-[#f59e0b]/40 px-4 sm:px-6 py-3 bg-[#12071f]/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg sm:text-xl shrink-0" aria-hidden="true">🎭🎄</span>
            <div className="min-w-0">
              <h2
                id="oracle-modal-title"
                className="font-pixel text-xs sm:text-base font-bold text-[#fde047] tracking-wider leading-tight"
              >
                CUPONS DE CARNATAL • THE TRIPLEX
              </h2>
              <span className="block text-[11px] sm:text-xs text-[#86efac] oleo-script-swash-caps-regular leading-tight">
                Onde o brilho dos pisca-piscas encontra a folia do Carnaval!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#2e1065] active:scale-95 text-[#fde047] cursor-pointer transition-all duration-200"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-4">
          {claimedCoupon ? (
            /* Claimed Reward Coupon */
            <div className="space-y-4 text-center max-w-xl mx-auto animate-[fadeIn_0.25s_ease-out]">
              <div className="bg-[#1b0d2d] border-2 border-[#f59e0b] rounded-xl p-4 sm:p-5 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
                <span className="font-pixel text-[12px] sm:text-[13px] text-[#fbbf24] uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1 font-bold">
                  <PixelStar size={12} color="#fbbf24" />
                  <span>PRESENTE DE CARNATAL RESGATADO</span>
                  <PixelStar size={12} color="#fbbf24" />
                </span>
                <h3 className="font-pixel text-base sm:text-lg text-white mb-1 font-bold uppercase">
                  {claimedCoupon.rewardTitle}
                </h3>
                <p className="oleo-script-swash-caps-regular text-xs sm:text-sm text-[#fde047] mb-3">
                  Folião(ã): {claimedCoupon.userName || claimedCoupon.phone}
                </p>

                <div className="bg-[#0b0413] border border-[#22c55e]/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  {qrCodeDataUrl && (
                    <div className="p-1.5 bg-white border border-[#000] rounded-lg shrink-0">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code Cupom"
                        className="w-28 h-28 sm:w-32 sm:h-32 image-pixelated"
                      />
                    </div>
                  )}
                  <div className="text-left font-mono text-xs sm:text-sm space-y-1.5">
                    <p>
                      <span className="text-[#fde047]">CÓDIGO:</span>{' '}
                      <strong className="text-[#4ade80] font-pixel text-[12px]">
                        {claimedCoupon.token}
                      </strong>
                    </p>
                    <p>
                      <span className="text-[#fde047]">STATUS:</span>{' '}
                      <span className="bg-[#065f46] text-[#6ee7b7] px-2 py-0.5 rounded text-xs">
                        {claimedCoupon.status}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#fde047]">VALIDADE:</span> Na portaria / bar do evento (19/12 a partir das 21h)
                    </p>
                    <p className="text-xs text-[#bbf7d0] mt-1">
                      Apresente no bar do The Triplex para validar seu presente de Carnatal.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  onClose();
                }}
                className="pixel-btn rounded-lg bg-[#15803d] hover:bg-[#16a34a] text-white px-6 py-3 font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold cursor-pointer"
              >
                FECHAR E SALVAR CUPOM
              </button>
            </div>
          ) : !revealedCard ? (
            /* Step 1: Pick a Custom Carnatal Card (5 Shuffled Cards) */
            <div className="space-y-4 text-center">
              {/* Legenda misturando Carnaval com Natal */}
              <div className="bg-gradient-to-r from-[#2a0918]/90 via-[#1a0b2e]/90 to-[#072617]/90 border border-[#f59e0b]/60 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <p className="oleo-script-swash-caps-regular text-xs sm:text-sm text-[#fef08a] leading-relaxed text-center sm:text-left">
                  🎭🎄 <strong className="oleo-script-swash-caps-bold text-[#4ade80]">O Papai Noel caiu no samba e o trenó estacionou no bloco!</strong>{' '}
                  Entre confetes, máscaras de carnaval, renas e pisca-piscas, escolha uma das{' '}
                  <strong className="oleo-script-swash-caps-bold text-[#f43f5e]">5 cartas premiadas de Carnatal</strong>{' '}
                  para abrir seu presente e garantir seu desconto no bar:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setCards(shuffleDeck(cards.length > 0 ? cards : DEFAULT_ORACLE_CARDS, 5));
                  }}
                  className="shrink-0 font-pixel text-[11px] text-[#fde047] hover:text-white border border-[#f59e0b] hover:border-[#22c55e] px-3 py-2 rounded-lg bg-[#240b36] hover:bg-[#14532d] transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                  title="Embaralhar as cartas novamente"
                >
                  <PixelShuffle size={13} color="currentColor" />
                  <span>EMBARALHAR</span>
                </button>
              </div>

              {/* 5 Custom Carnatal Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 py-1">
                {cards.slice(0, 5).map((c, index) => (
                  <button
                    type="button"
                    key={c.id || index}
                    onClick={() => handleCardClick(c)}
                    className={`group cursor-pointer relative h-48 sm:h-56 rounded-xl bg-gradient-to-b from-[#23092c] via-[#130924] to-[#082014] border-2 border-[#f59e0b]/80 p-2.5 flex flex-col items-center justify-between transition-all duration-300 hover:border-[#4ade80] hover:shadow-[0_0_24px_rgba(74,222,128,0.5)] hover:-translate-y-1.5 ${
                      index === 4 ? 'col-span-2 sm:col-span-1 max-w-[210px] sm:max-w-none mx-auto w-full' : 'w-full'
                    } ${
                      isFlipping && selectedCardId === c.id
                        ? 'scale-105 rotate-3 border-[#4ade80]'
                        : ''
                    }`}
                  >
                    {/* Header da Carta */}
                    <div className="w-full flex items-center justify-between border-b border-[#f59e0b]/40 pb-1">
                      <span className="font-pixel text-[9px] sm:text-[10px] text-[#fde047]">
                        {CARD_BADGE_LABELS[index % CARD_BADGE_LABELS.length]}
                      </span>
                      <span className="font-pixel text-[10px] sm:text-[11px] text-[#4ade80] font-bold">
                        {ROMAN_NUMERALS[index] || `0${index + 1}`}
                      </span>
                    </div>

                    {/* Pisca-piscas no topo da carta */}
                    <FairyLightsStrip variant={index} />

                    {/* Emblema Central Personalizado (Máscara, Rena, Presente, Pisca-Pisca, Trenó) */}
                    <div className="w-full flex-1 my-1 rounded-lg bg-[#0d0518]/90 border border-[#a855f7]/60 group-hover:border-[#fde047] flex flex-col items-center justify-center p-1.5 shadow-inner transition-all duration-300">
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        <CarnatalCardIllustration index={index} />
                      </div>
                      <span className="oleo-script-swash-caps-bold text-[11px] sm:text-xs text-[#f9a8d4] group-hover:text-[#fde047] mt-0.5">
                        Carnatal Triplex
                      </span>
                    </div>

                    {/* Pisca-piscas na base */}
                    <FairyLightsStrip variant={index + 2} />

                    <span className="font-pixel text-[10px] sm:text-[11px] text-[#fef08a] group-hover:text-[#4ade80] font-bold tracking-wider pt-0.5">
                      ABRIR PRESENTE
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-xs oleo-script-swash-caps-regular text-[#bbf7d0] border-t border-[#22c55e]/30 pt-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
                <span className="flex items-center gap-1.5 text-center sm:text-left">
                  <PixelStar size={12} color="#fde047" className="shrink-0" />
                  <span>Promoções exclusivas de Carnatal válidas no bar do evento</span>
                </span>
                <span className="text-[#fde047] oleo-script-swash-caps-bold">🎁 Regra: 1 presente por folião</span>
              </div>
            </div>
          ) : (
            /* Step 2: Revealed Reward + Claim Form */
            <div className="space-y-4 max-w-xl mx-auto animate-[fadeIn_0.25s_ease-out]">
              <div className="bg-gradient-to-b from-[#23092c] to-[#0a2216] border-2 border-[#f59e0b] rounded-xl p-4 text-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <FairyLightsStrip variant={1} />
                <span className="font-pixel text-[12px] sm:text-[13px] text-[#4ade80] uppercase tracking-widest block mt-1 mb-1 font-bold">
                  🎄🎭 SEU PRESENTE DE CARNATAL SAIU!
                </span>
                <h3 className="font-pixel text-base sm:text-lg text-[#fef08a] mb-1 font-bold uppercase">
                  {revealedCard.name}
                </h3>
                <p className="oleo-script-swash-caps-regular text-xs sm:text-sm text-[#e9d5ff] italic mb-3">
                  "{revealedCard.description}"
                </p>

                <div className="bg-[#0b1f15] border border-[#22c55e] rounded-xl p-3 text-center">
                  <span className="text-xs text-[#bbf7d0] block oleo-script-swash-caps-regular">
                    Cupom de Desconto Revelado:
                  </span>
                  <span className="font-pixel text-base sm:text-lg text-[#4ade80] font-bold block mt-1 uppercase">
                    {revealedCard.rewardText}
                  </span>
                </div>
              </div>

              {/* Claim Form */}
              <form
                onSubmit={handleClaimReward}
                className="space-y-3 bg-[#130720] border border-[#f59e0b]/50 rounded-xl p-4"
              >
                <span className="font-pixel text-[12px] sm:text-[13px] text-[#fde047] block uppercase font-bold">
                  RESGATE SEU CUPOM DE CARNATAL
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Seu Nome"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-[#0b0413] border border-[#581c87] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono"
                  />
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    placeholder="WhatsApp / Telefone com DDD *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#0b0413] border border-[#581c87] rounded-lg px-3 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-[#450a0a] border border-[#ef4444] rounded-lg text-[#fca5a5] text-xs sm:text-sm font-mono flex items-center gap-2">
                    <PixelWarning size={14} color="#ef4444" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full pixel-btn rounded-lg bg-[#15803d] hover:bg-[#16a34a] text-white py-3 font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>GERANDO CUPOM DE CARNATAL...</span>
                  ) : (
                    <>
                      <PixelSparkles size={14} color="#fef08a" />
                      <span>RESGATAR MEU PRESENTE AGORA</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
