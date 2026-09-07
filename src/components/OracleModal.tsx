import React, { useState, useEffect } from 'react';
import { PixelClose, PixelCardIcon, PixelSkull, PixelCheck } from './PixelIcons';
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
    id: 'card-skolbeats-40',
    name: '3 SKOL BEATS POR R$ 40',
    title: 'O RITMO DOS IMORTAIS',
    symbol: 'CHALICE',
    arcana: 'ARCANA I',
    description: 'A Condessa convoca a noite com ritmo frenético. O néctar da celebração aguarda por você.',
    rewardText: '3 SKOL BEATS POR R$ 40',
    rewardCodePrefix: 'BEATS40',
    discountType: 'PRICE',
    value: 'R$ 40,00'
  },
  {
    id: 'card-redlabel-60',
    name: '2 DOSES DE RED LABEL POR R$ 60',
    title: 'BANQUETE DE WHISKY',
    symbol: 'SKULL',
    arcana: 'ARCANA II',
    description: 'James March brinda no salão nobre com o mais refinado destilado escocês.',
    rewardText: '2 DOSES DE RED LABEL POR R$ 60',
    rewardCodePrefix: 'RED60',
    discountType: 'PRICE',
    value: 'R$ 60,00'
  },
  {
    id: 'card-jackdaniels-35',
    name: "1 DOSE DE JACK DANIEL'S POR R$ 35",
    title: 'TENNESSEE OBSCURO',
    symbol: 'EYE',
    arcana: 'ARCANA III',
    description: 'As sombras revelam a lendária dose âmbar das noites proibidas do Cortez.',
    rewardText: "1 DOSE DE JACK DANIEL'S POR R$ 35",
    rewardCodePrefix: 'JACK35',
    discountType: 'PRICE',
    value: 'R$ 35,00'
  },
  {
    id: 'card-doublerosh-40',
    name: 'DOUBLE ROSH POR R$ 40',
    title: 'NÉVOA MÍSTICA',
    symbol: 'FLAME',
    arcana: 'ARCANA IV',
    description: 'A névoa ancestral invade o lounge com o dobro da essência e do vapor.',
    rewardText: 'DOUBLE ROSH POR R$ 40',
    rewardCodePrefix: 'ROSH40',
    discountType: 'PRICE',
    value: 'R$ 40,00'
  },
  {
    id: 'card-smirnoff-50',
    name: '2 DOSES DE SMIRNOFF POR R$ 50',
    title: 'PUREZA GÉLIDA',
    symbol: 'MOON',
    arcana: 'ARCANA V',
    description: 'Um ritual de vodka destilada dez vezes para purificar o seu espírito na pista.',
    rewardText: '2 DOSES DE SMIRNOFF POR R$ 50',
    rewardCodePrefix: 'SMIR50',
    discountType: 'PRICE',
    value: 'R$ 50,00'
  },
  {
    id: 'card-caipirinha-50',
    name: '3 CAIPIRINHAS POR R$ 50',
    title: 'TRINDADE TROPICAL',
    symbol: 'CHALICE',
    arcana: 'ARCANA VI',
    description: 'O caldeirão das bruxas ferve a tríade perfeita de frutas e limão para você.',
    rewardText: '3 CAIPIRINHAS POR R$ 50',
    rewardCodePrefix: 'CAIP50',
    discountType: 'PRICE',
    value: 'R$ 50,00'
  },
  {
    id: 'card-maracujack-55',
    name: '2 MARACUJACK POR R$ 55',
    title: 'JACK & MARACUJÁ DUPLO',
    symbol: 'RAVEN',
    arcana: 'ARCANA VII',
    description: "Jack Daniel's casado com o fruto da paixão em dose dupla para curtir a noite.",
    rewardText: '2 MARACUJACK POR R$ 55',
    rewardCodePrefix: 'MJACK55',
    discountType: 'PRICE',
    value: 'R$ 55,00'
  },
  {
    id: 'card-maracujack-30',
    name: '1 MARACUJACK POR R$ 30',
    title: 'O TOQUE DOURADO',
    symbol: 'EYE',
    arcana: 'ARCANA VIII',
    description: 'Refrescante, marcante e intenso: o drink assinatura do baile em valor especial.',
    rewardText: '1 MARACUJACK POR R$ 30',
    rewardCodePrefix: 'MJACK30',
    discountType: 'PRICE',
    value: 'R$ 30,00'
  }
];

function shuffleDeck<T>(array: T[], count = 6): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export const OracleModal: React.FC<OracleModalProps> = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState<OracleCard[]>(() => shuffleDeck(DEFAULT_ORACLE_CARDS, 6));
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
      .then(res => res.json())
      .then((data: OracleCard[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCards(shuffleDeck(data, 6));
        } else {
          setCards(shuffleDeck(DEFAULT_ORACLE_CARDS, 6));
        }
      })
      .catch(() => {
        setCards(shuffleDeck(DEFAULT_ORACLE_CARDS, 6));
      });
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedCardId(null);
      setRevealedCard(null);
      setIsFlipping(false);
      setErrorMsg(null);
      loadCards();
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
        particleCount: 45,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#d97706', '#dc2626', '#34d399']
      });
    }, 600);
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
          userName: userName || 'Hóspede Secreto',
          cardId: revealedCard?.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="relative w-full max-w-4xl bg-[#0d0716] border-2 border-[#9333ea] shadow-[0_0_35px_rgba(147,51,234,0.5)] rounded-xl p-4 sm:p-6 text-[#f3edf9] my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3b0764] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelCardIcon size={20} color="#c084fc" />
            <h2 className="font-pixel text-xs sm:text-base font-bold text-[#d8b4fe] tracking-wider">
              ORÁCULO DO HOTEL CORTEZ
            </h2>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#2e1065] text-[#d8b4fe] cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {claimedCoupon ? (
          /* Claimed Reward Coupon */
          <div className="space-y-4 text-center max-w-xl mx-auto">
            <div className="bg-[#1b0d2d] border-2 border-[#d97706] p-4 sm:p-5 shadow-[0_0_20px_rgba(217,119,6,0.4)]">
              <span className="font-pixel text-[12px] sm:text-[13px] text-[#fbbf24] uppercase tracking-widest block mb-1 font-bold">
                ★ RECOMPENSA RESGATADA ★
              </span>
              <h3 className="font-pixel text-base sm:text-lg text-white mb-1 font-bold">
                {claimedCoupon.rewardTitle}
              </h3>
              <p className="font-mono text-xs sm:text-sm text-[#d8b4fe] mb-3">
                Titular: {claimedCoupon.userName || claimedCoupon.phone}
              </p>

              <div className="bg-[#0b0413] border border-[#581c87] p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                {qrCodeDataUrl && (
                  <div className="p-1.5 bg-white border border-[#000]">
                    <img src={qrCodeDataUrl} alt="QR Code Cupom" className="w-28 h-28 sm:w-32 sm:h-32 image-rendering-pixelated" />
                  </div>
                )}
                <div className="text-left font-mono text-xs sm:text-sm space-y-1.5">
                  <p><span className="text-[#a855f7]">CÓDIGO:</span> <strong className="text-[#fbbf24] font-pixel text-[12px]">{claimedCoupon.token}</strong></p>
                  <p><span className="text-[#a855f7]">STATUS:</span> <span className="bg-[#065f46] text-[#6ee7b7] px-2 py-0.5 text-xs">{claimedCoupon.status}</span></p>
                  <p><span className="text-[#a855f7]">VALIDADE:</span> Na portaria / bar do evento até 06:00</p>
                  <p className="text-xs text-[#9ca3af] mt-1">Apresente no bar do Hotel Cortez para validar.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                audioManager.playClick();
                onClose();
              }}
              className="pixel-btn bg-[#9333ea] hover:bg-[#a855f7] text-white px-6 py-3 font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold"
            >
              FECHAR E SALVAR CUPOM
            </button>
          </div>
        ) : !revealedCard ? (
          /* Step 1: Pick a Tarot Card (6 Shuffled Cards) */
          <div className="space-y-4 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
              <p className="font-mono text-xs sm:text-sm text-[#d8b4fe] leading-relaxed text-center sm:text-left">
                As sombras do Cortez guardam bênçãos e oferendas. Escolha uma das <strong>6 cartas arcanas embaralhadas</strong> para revelar sua sorte da noite:
              </p>
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  setCards(shuffleDeck(DEFAULT_ORACLE_CARDS, 6));
                }}
                className="shrink-0 font-pixel text-[11px] text-[#c084fc] hover:text-[#fde047] border border-[#7e22ce] hover:border-[#f59e0b] px-2.5 py-1 bg-[#1e0a35] transition-colors cursor-pointer"
                title="Embaralhar as cartas novamente"
              >
                🔀 RE-EMBARALHAR
              </button>
            </div>

            {/* 6 Shuffled Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 py-2">
              {cards.slice(0, 6).map((c, index) => (
                <div
                  key={c.id || index}
                  onClick={() => handleCardClick(c)}
                  className={`group cursor-pointer relative h-44 sm:h-52 bg-[#19092d] border-2 border-[#7e22ce] p-2 flex flex-col items-center justify-between transition-all duration-300 hover:border-[#f59e0b] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:-translate-y-1 ${
                    isFlipping && selectedCardId === c.id ? 'scale-105 rotate-3 border-[#f59e0b]' : ''
                  }`}
                >
                  <div className="w-full flex items-center justify-between border-b border-[#581c87] pb-1">
                    <span className="font-pixel text-[10px] text-[#a855f7]">ARCANA</span>
                    <span className="font-pixel text-[11px] text-[#fef08a] font-bold">{ROMAN_NUMERALS[index] || `0${index + 1}`}</span>
                  </div>
                  
                  {/* Occult Pixel Back Emblem */}
                  <div className="w-12 h-20 sm:w-14 sm:h-24 bg-[#110520] border border-[#9333ea] group-hover:border-[#f59e0b] flex flex-col items-center justify-center gap-1.5 shadow-inner transition-colors">
                    <span className="font-pixel text-base text-[#e9d5ff] group-hover:text-[#fde047] transition-colors">✦</span>
                    <div className="w-6 h-px bg-[#7e22ce] group-hover:bg-[#f59e0b]"></div>
                    <span className="font-pixel text-[10px] tracking-wider text-[#c084fc]">CORTEZ</span>
                  </div>

                  <span className="font-pixel text-[11px] text-[#e9d5ff] group-hover:text-[#fde047] font-bold tracking-wider">
                    ESCOLHER
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xs font-mono text-[#9ca3af] border-t border-[#2d124d] pt-2 flex flex-col sm:flex-row items-center justify-between gap-1">
              <span>★ 6 cartas embaralhadas a cada rodada</span>
              <span>Regra: 1 cupom por número de telefone</span>
            </div>
          </div>
        ) : (
          /* Step 2: Revealed Reward + Claim Form */
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="bg-[#1c0c2e] border-2 border-[#a855f7] p-4 text-center">
              <span className="font-pixel text-[12px] sm:text-[13px] text-[#f43f5e] uppercase tracking-widest block mb-1 font-bold">
                VOCÊ FOI ESCOLHIDO PELO DESTINO
              </span>
              <h3 className="font-pixel text-base sm:text-lg text-[#fef08a] mb-1 font-bold">
                {revealedCard.name}
              </h3>
              <p className="font-mono text-xs sm:text-sm text-[#e9d5ff] italic mb-3">
                "{revealedCard.description}"
              </p>

              <div className="bg-[#2d1047] border border-[#c084fc] p-3 text-center">
                <span className="text-xs text-[#d8b4fe] block font-mono">SEU PRÊMIO REVELADO:</span>
                <span className="font-pixel text-base sm:text-lg text-[#34d399] font-bold block mt-1">
                  {revealedCard.rewardText}
                </span>
              </div>
            </div>

            {/* Claim Form */}
            <form onSubmit={handleClaimReward} className="space-y-3 bg-[#130720] border border-[#3b1552] p-4">
              <span className="font-pixel text-[12px] sm:text-[13px] text-[#e9d5ff] block uppercase font-bold">
                RESGATE SEU CUPOM EXCLUSIVO
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="bg-[#0b0413] border border-[#581c87] px-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#a855f7] outline-hidden font-mono"
                />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp / Telefone com DDD *"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-[#0b0413] border border-[#581c87] px-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#a855f7] outline-hidden font-mono"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-[#450a0a] border border-[#ef4444] text-[#fca5a5] text-xs sm:text-sm font-mono">
                  ⚠ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full pixel-btn bg-[#059669] hover:bg-[#10b981] text-white py-3 font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold"
              >
                {loading ? 'GERANDO TOKEN SEGURO...' : 'RESGATAR MEU PRÊMIO AGORA ✨'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
