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

export const OracleModal: React.FC<OracleModalProps> = ({ isOpen, onClose }) => {
  const [cards, setCards] = useState<OracleCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [revealedCard, setRevealedCard] = useState<OracleCard | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [claimedCoupon, setClaimedCoupon] = useState<Coupon | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    fetch('/api/oracle/cards')
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(() => {});
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
        particleCount: 40,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#a855f7', '#d97706', '#dc2626']
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
          // Already claimed, show existing
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0d0716] border-2 border-[#9333ea] shadow-[0_0_35px_rgba(147,51,234,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#3b0764] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelCardIcon size={20} color="#c084fc" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#d8b4fe] tracking-wider">
              ORÁCULO DO HOTEL CORTEZ
            </h2>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#2e1065] text-[#d8b4fe] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {claimedCoupon ? (
          /* Claimed Reward Coupon */
          <div className="space-y-4 text-center">
            <div className="bg-[#1b0d2d] border-2 border-[#d97706] p-4 sm:p-5 shadow-[0_0_20px_rgba(217,119,6,0.4)]">
              <span className="font-pixel text-[10px] sm:text-[11px] text-[#fbbf24] uppercase tracking-widest block mb-1 font-bold">
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
                  <p><span className="text-[#a855f7]">CÓDIGO:</span> <strong className="text-[#fbbf24] font-pixel text-[10px]">{claimedCoupon.token}</strong></p>
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
              className="pixel-btn bg-[#9333ea] hover:bg-[#a855f7] text-white px-6 py-3 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold"
            >
              FECHAR E SALVAR CUPOM
            </button>
          </div>
        ) : !revealedCard ? (
          /* Step 1: Pick a Tarot Card */
          <div className="space-y-4 text-center">
            <p className="font-mono text-xs sm:text-sm text-[#d8b4fe] leading-relaxed">
              As sombras do Cortez guardam bênçãos e maldições. Escolha uma das 3 cartas arcanas para revelar sua oferenda da noite:
            </p>

            <div className="grid grid-cols-3 gap-3 py-3">
              {(cards.length > 0 ? cards.slice(0, 3) : [
                { id: '1', title: 'ARCANA I', symbol: 'SKULL' },
                { id: '2', title: 'ARCANA II', symbol: 'EYE' },
                { id: '3', title: 'ARCANA III', symbol: 'CHALICE' }
              ]).map((c: any, index) => (
                <div
                  key={c.id || index}
                  onClick={() => handleCardClick(c)}
                  className={`group cursor-pointer relative h-40 bg-[#1e0a35] border-2 border-[#7e22ce] p-2 flex flex-col items-center justify-between transition-all duration-300 hover:border-[#f59e0b] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] ${
                    isFlipping && selectedCardId === c.id ? 'scale-110 rotate-6 border-[#f59e0b]' : ''
                  }`}
                >
                  <div className="w-full h-2 bg-[#581c87] border-b border-[#a855f7]"></div>
                  
                  {/* Occult Pixel Back Emblem */}
                  <div className="w-14 h-18 bg-[#130623] border border-[#a855f7] flex flex-col items-center justify-center gap-1">
                    <span className="font-pixel text-[14px] text-[#e9d5ff]">✦</span>
                    <span className="font-pixel text-[9px] text-[#c084fc]">CORTEZ</span>
                  </div>

                  <span className="font-pixel text-[9px] sm:text-[10px] text-[#e9d5ff] group-hover:text-[#fde047] font-bold">
                    ESCOLHER
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xs font-mono text-[#9ca3af] border-t border-[#2d124d] pt-2">
              Regra: 1 carta e cupom por número de telefone por evento.
            </div>
          </div>
        ) : (
          /* Step 2: Revealed Reward + Claim Form */
          <div className="space-y-4">
            <div className="bg-[#1c0c2e] border-2 border-[#a855f7] p-4 text-center">
              <span className="font-pixel text-[10px] sm:text-[11px] text-[#f43f5e] uppercase tracking-widest block mb-1 font-bold">
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
                <span className="font-pixel text-sm sm:text-base text-[#34d399] font-bold block mt-1">
                  {revealedCard.rewardText}
                </span>
              </div>
            </div>

            {/* Claim Form */}
            <form onSubmit={handleClaimReward} className="space-y-3 bg-[#130720] border border-[#3b1552] p-4">
              <span className="font-pixel text-[10px] sm:text-[11px] text-[#e9d5ff] block uppercase font-bold">
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
                className="w-full pixel-btn bg-[#059669] hover:bg-[#10b981] text-white py-3 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold"
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
