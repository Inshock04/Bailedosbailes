import React, { useState, useEffect } from 'react';
import {
  PixelClose,
  PixelStar,
  PixelShuffle,
  PixelWarning,
  PixelSparkles
} from './PixelIcons';
import { GiftCarnivalMaskIcon } from './GlowingRedIcons';
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

/** Faixa Pop Art de luzes/estrelas estilo história em quadrinhos para topo e base das cartas */
const FairyLightsStrip: React.FC<{ variant?: number }> = ({ variant = 0 }) => {
  const colors = ['#ff1e38', '#facc15', '#22c55e', '#38bdf8', '#a855f7'];
  return (
    <svg viewBox="0 0 120 18" className="w-full h-3.5 overflow-visible" aria-hidden="true">
      {/* Linha grossa de nanquim Pop Art */}
      <path
        d="M2 9 H118"
        fill="none"
        stroke="#000000"
        strokeWidth="2.4"
      />
      {[14, 38, 60, 82, 106].map((cx, i) => {
        const bulbColor = colors[(i + variant) % colors.length];
        return (
          <g key={cx}>
            {/* Sombra dura preta Pop Art */}
            <polygon
              points={`${cx + 1.5},3.5 ${cx + 6.5},9.5 ${cx + 1.5},15.5 ${cx - 3.5},9.5`}
              fill="#000000"
            />
            {/* Losango Pop Art */}
            <polygon
              points={`${cx},2.5 ${cx + 5},8.5 ${cx},14.5 ${cx - 5},8.5`}
              fill={bulbColor}
              stroke="#000000"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
};

/** Ilustrações Pop Art de cada carta (traço pesado em nanquim preto, sombras duras, explosões de quadrinhos e meio-tom) */
const CarnatalCardIllustration: React.FC<{ index: number }> = ({ index }) => {
  const type = index % 5;

  // Carta 1: Máscara Veneziana Pop Art com Explosão Amarela e Plumas
  if (type === 0) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16" aria-hidden="true">
        {/* Explosão Pop Art com Sombra Dura Preta */}
        <polygon
          points="34,6 42,16 56,11 50,25 60,34 47,41 53,55 39,50 32,60 25,49 11,54 16,40 6,33 17,24 12,11 26,16"
          fill="#000000"
        />
        <polygon
          points="32,4 40,14 54,9 48,23 58,32 45,39 51,53 37,48 30,58 23,47 9,52 14,38 4,31 15,22 10,9 24,14"
          fill="#facc15"
          stroke="#000000"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* Plumas angulares */}
        <path d="M31 24 C23 9 13 11 16 24 Z" fill="#ff1e38" stroke="#000000" strokeWidth="2.4" />
        <path d="M31 23 C28 7 35 7 31 23 Z" fill="#38bdf8" stroke="#000000" strokeWidth="2.4" />
        <path d="M31 24 C39 9 49 11 46 24 Z" fill="#22c55e" stroke="#000000" strokeWidth="2.4" />
        {/* Corpo da Máscara Bicolor Pop Art */}
        <path
          d="M9 28 C9 19 21 19 31 25 C41 19 53 19 53 28 C53 40 42 46 35 40 L31 45 L27 40 C20 46 9 40 9 28 Z"
          fill="#a855f7"
          stroke="#000000"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path
          d="M9 28 C9 19 21 19 31 25 L31 45 L27 40 C20 46 9 40 9 28 Z"
          fill="#ff1e38"
          stroke="#000000"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Olhos angulares */}
        <polygon points="14,28 21,24 26,29 20,32" fill="#000000" stroke="#ffffff" strokeWidth="1.2" />
        <polygon points="48,28 41,24 36,29 42,32" fill="#000000" stroke="#ffffff" strokeWidth="1.2" />
      </svg>
    );
  }

  // Carta 2: Trio Elétrico / Sound Truck Pop Art (da arte oficial)
  if (type === 1) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16" aria-hidden="true">
        <polygon points="9,11 59,7 55,57 5,53" fill="#000000" />
        <polygon points="6,8 56,4 52,54 2,50" fill="#84cc16" stroke="#000000" strokeWidth="2.6" />
        {/* Paredão de Som */}
        <rect x="14" y="13" width="34" height="13" fill="#1e293b" stroke="#000000" strokeWidth="2.6" />
        <circle cx="24" cy="19.5" r="4.2" fill="#000000" stroke="#38bdf8" strokeWidth="1.6" />
        <circle cx="24" cy="19.5" r="1.5" fill="#facc15" />
        <circle cx="38" cy="19.5" r="4.2" fill="#000000" stroke="#38bdf8" strokeWidth="1.6" />
        <circle cx="38" cy="19.5" r="1.5" fill="#facc15" />
        {/* Cabine Vermelha & Amarela */}
        <path d="M10 26 H50 V42 H10 Z" fill="#ff1e38" stroke="#000000" strokeWidth="2.8" />
        <rect x="10" y="33" width="40" height="5" fill="#facc15" stroke="#000000" strokeWidth="2" />
        <rect x="13" y="28" width="11" height="7" fill="#38bdf8" stroke="#000000" strokeWidth="2.2" />
        <line x1="15" y1="33" x2="20" y2="29" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        {/* Rodas com aro amarelo */}
        <circle cx="20" cy="43" r="5" fill="#000000" />
        <circle cx="20" cy="43" r="2" fill="#facc15" />
        <circle cx="42" cy="43" r="5" fill="#000000" />
        <circle cx="42" cy="43" r="2" fill="#facc15" />
      </svg>
    );
  }

  // Carta 3: Explosão Comic "BANG!" + Caixa Surpresa Pop Art
  if (type === 2) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16" aria-hidden="true">
        {/* Explosão de Quadrinhos */}
        <polygon
          points="32,3 39,15 54,8 47,22 61,28 48,37 55,51 40,47 32,60 24,47 9,51 16,37 3,28 17,22 10,8 25,15"
          fill="#facc15"
          stroke="#000000"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* Sombra Dura da Caixa */}
        <rect x="19" y="25" width="30" height="26" fill="#000000" />
        {/* Caixa Pop Art Vermelha e Fita Verde/Amarela */}
        <rect x="16" y="27" width="30" height="22" fill="#ff1e38" stroke="#000000" strokeWidth="2.8" />
        <rect x="13" y="20" width="36" height="8" fill="#a855f7" stroke="#000000" strokeWidth="2.8" />
        <rect x="28" y="20" width="6" height="29" fill="#facc15" stroke="#000000" strokeWidth="2.2" />
        <rect x="16" y="35" width="30" height="5" fill="#22c55e" stroke="#000000" strokeWidth="2.2" />
        {/* Raios de ação no topo */}
        <path d="M22 15 L17 7 M31 14 V5 M40 15 L45 7" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    );
  }

  // Carta 4: Taça Martini Pop Art & Raio Elétrico (Roy Lichtenstein Style)
  if (type === 3) {
    return (
      <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16" aria-hidden="true">
        <circle cx="34" cy="34" r="24" fill="#000000" />
        <circle cx="31" cy="31" r="24" fill="#38bdf8" stroke="#000000" strokeWidth="2.8" />
        {/* Raio Amarelo Pop Art ao fundo */}
        <polygon
          points="38,7 20,30 32,30 24,55 46,28 34,28"
          fill="#facc15"
          stroke="#000000"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Taça Martini */}
        <polygon points="13,18 49,18 31,37" fill="#ffffff" stroke="#000000" strokeWidth="2.8" strokeLinejoin="round" />
        <polygon points="18,23 44,23 31,37" fill="#ff1e38" stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
        <line x1="31" y1="37" x2="31" y2="51" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="21" y1="51" x2="41" y2="51" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />
        {/* Azeitona no palito */}
        <line x1="43" y1="10" x2="29" y2="28" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="38" cy="16" r="4" fill="#84cc16" stroke="#000000" strokeWidth="2.2" />
        <circle cx="38.5" cy="15.5" r="1.4" fill="#ff1e38" />
      </svg>
    );
  }

  // Carta 5: Pandeiro & Óculos Redondos Pop Art (Direto da arte do Carnatal)
  return (
    <svg viewBox="0 0 64 64" className="w-14 h-14 sm:w-16 sm:h-16" aria-hidden="true">
      {/* Sombra Dura Preta */}
      <circle cx="35" cy="34" r="23" fill="#000000" />
      {/* Corpo do Pandeiro Pop Art */}
      <circle cx="32" cy="31" r="23" fill="#facc15" stroke="#000000" strokeWidth="3" />
      <circle cx="32" cy="31" r="18" fill="#ff1e38" stroke="#000000" strokeWidth="2.4" />
      {/* Platinelas metálicas ao redor do pandeiro */}
      {[12, 52].map((cx) =>
        [18, 44].map((cy) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#38bdf8" stroke="#000000" strokeWidth="2" />
        ))
      )}
      {/* Óculos Redondos Pop Art no centro */}
      <line x1="15" y1="31" x2="49" y2="31" stroke="#000000" strokeWidth="3" />
      <circle cx="24" cy="31" r="7" fill="#0284c7" stroke="#000000" strokeWidth="2.6" />
      <circle cx="40" cy="31" r="7" fill="#0284c7" stroke="#000000" strokeWidth="2.6" />
      <line x1="21" y1="34" x2="26" y2="28" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="37" y1="34" x2="42" y2="28" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
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
            <GiftCarnivalMaskIcon size={28} className="shrink-0" />
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
                      <span className="text-[#fde047]">Código:</span>{' '}
                      <strong className="text-[#4ade80] font-pixel text-[12px]">
                        {claimedCoupon.token}
                      </strong>
                    </p>
                    <p>
                      <span className="text-[#fde047]">Status:</span>{' '}
                      <span className="bg-[#065f46] text-[#6ee7b7] px-2 py-0.5 rounded text-xs">
                        {claimedCoupon.status
                          ? claimedCoupon.status.charAt(0).toUpperCase() + claimedCoupon.status.slice(1).toLowerCase()
                          : 'Ativo'}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#fde047]">Validade:</span> Na portaria / bar do evento (19/12 a partir das 21h)
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
                  <strong className="oleo-script-swash-caps-bold text-[#4ade80]">O Papai Noel caiu no samba e o trenó estacionou no bloco!</strong>{' '}
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
                <span className="text-[#fde047] oleo-script-swash-caps-bold flex items-center gap-1">
                  <PixelSparkles size={13} color="#facc15" />
                  <span>Regra: 1 presente por folião</span>
                </span>
              </div>
            </div>
          ) : (
            /* Step 2: Revealed Reward + Claim Form */
            <div className="space-y-4 max-w-xl mx-auto animate-[fadeIn_0.25s_ease-out]">
              <div className="bg-gradient-to-b from-[#23092c] to-[#0a2216] border-2 border-[#f59e0b] rounded-xl p-4 text-center shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <FairyLightsStrip variant={1} />
                <span className="font-pixel text-[12px] sm:text-[13px] text-[#4ade80] uppercase tracking-widest block mt-1 mb-1 font-bold">
                  SEU PRESENTE DE CARNATAL SAIU!
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
