import React, { useState, useEffect } from 'react';
import { PixelClose, PixelSkull, PixelTicketIcon, PixelCheck, PixelArrow } from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { TicketTier, PurchasedTicket } from '../types';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTierId?: string | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, preselectedTierId }) => {
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>('t-pista');
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARTAO'>('PIX');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [issuedTicket, setIssuedTicket] = useState<PurchasedTicket | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        setTiers(data);
        if (preselectedTierId) {
          setSelectedTierId(preselectedTierId);
        } else if (data.length > 0 && !selectedTierId) {
          setSelectedTierId(data[0].id);
        }
      })
      .catch(() => {});
  }, [isOpen, preselectedTierId]);

  if (!isOpen) return null;

  const currentTier = tiers.find(t => t.id === selectedTierId) || tiers[0];
  const totalPrice = currentTier ? currentTier.price * quantity : 0;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail || !buyerPhone) {
      setErrorMsg('Preencha todos os dados para emissão do ingresso.');
      audioManager.playError();
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTierId,
          buyerName,
          buyerEmail,
          buyerPhone,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar compra.');
      }

      setIssuedTicket(data.ticket);
      audioManager.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#9333ea', '#f59e0b']
      });

      // Generate QR Code with token
      const qr = await QRCode.toDataURL(data.ticket.token, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
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
      <div className="relative w-full max-w-2xl bg-[#0e0a17] border-2 border-[#991b1b] shadow-[0_0_30px_rgba(220,38,38,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#450a0a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#ff4455] tracking-wider">
              {issuedTicket ? 'INGRESSO CONFIRMADO' : 'BILHETERIA DO HOTEL CORTEZ'}
            </h2>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#3b0710] text-[#fca5a5] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Issued Ticket View */}
        {issuedTicket ? (
          <div className="space-y-4">
            <div className="bg-[#180e24] border-2 border-[#9333ea] p-4 sm:p-5 text-center relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-[#22c55e] text-[#07050d] font-pixel text-[10px] px-2.5 py-1 font-bold">
                {issuedTicket.status}
              </div>

              <span className="font-pixel text-[10px] sm:text-[11px] text-[#c084fc] uppercase tracking-widest">
                HOTEL CORTEZ • 31 DE OUTUBRO
              </span>
              <h3 className="font-pixel text-base sm:text-lg text-[#fef08a] mt-1 mb-2 font-bold">
                {issuedTicket.ticketName}
              </h3>

              <div className="my-3 flex flex-col sm:flex-row items-center justify-center gap-4 bg-[#0a0512] p-4 border border-[#3b1754]">
                {qrCodeDataUrl && (
                  <div className="p-2 bg-white border-2 border-[#000]">
                    <img src={qrCodeDataUrl} alt="QR Code Ingresso" className="w-32 h-32 sm:w-36 sm:h-36 image-rendering-pixelated" />
                  </div>
                )}
                <div className="text-left space-y-1.5 font-mono text-xs sm:text-sm">
                  <p><span className="text-[#a855f7]">TITULAR:</span> <strong className="text-white">{issuedTicket.buyerName}</strong></p>
                  <p><span className="text-[#a855f7]">LOTE:</span> {issuedTicket.lote}</p>
                  <p><span className="text-[#a855f7]">VALOR PAGO:</span> <strong className="text-[#86efac]">R$ {issuedTicket.price.toFixed(2)}</strong></p>
                  <p><span className="text-[#a855f7]">TOKEN ÚNICO:</span> <code className="bg-[#24083a] text-[#f43f5e] px-1.5 py-0.5 font-pixel text-[10px]">{issuedTicket.token}</code></p>
                  <p className="text-xs text-[#9ca3af] mt-1">Apresente este QR Code na portaria do Hotel Cortez.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  audioManager.playClick();
                  window.print();
                }}
                className="flex-1 pixel-btn bg-[#2e1065] hover:bg-[#3b0764] text-white py-3 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold"
              >
                🖨 IMPRIMIR / SALVAR PDF
              </button>
              <button
                onClick={() => {
                  audioManager.playClick();
                  setIssuedTicket(null);
                  onClose();
                }}
                className="flex-1 pixel-btn bg-[#991b1b] hover:bg-[#b91c1c] text-white py-3 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold"
              >
                CONCLUÍDO
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePurchase} className="space-y-4">
            
            {/* Tier Selector */}
            <div>
              <label className="block font-pixel text-[10px] sm:text-[11px] text-[#fca5a5] mb-2 uppercase font-bold">
                1. ESCOLHA SEU INGRESSO
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tiers.map(tier => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => {
                        audioManager.playClick();
                        setSelectedTierId(tier.id);
                      }}
                      className={`cursor-pointer p-3 border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#ef4444] bg-[#2a0e16] shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                          : 'border-[#381622] bg-[#14080e] hover:border-[#7f1d1d]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-pixel text-[10px] sm:text-[11px] text-white font-bold">{tier.name}</span>
                        <span className="font-pixel text-xs text-[#fbbf24] font-bold">R$ {tier.price}</span>
                      </div>
                      <p className="text-xs text-[#d1d5db] my-1.5 font-mono">{tier.features[0]}</p>
                      <div className="flex justify-between items-center text-[9px] font-pixel mt-1 text-[#9ca3af]">
                        <span>{tier.batch}</span>
                        <span className="text-[#fca5a5]">{tier.available} RESTANTES</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Included Drinks Info */}
            {currentTier && (
              <div className="bg-[#170914] border border-[#581c87] p-3">
                <span className="font-pixel text-[9px] sm:text-[10px] text-[#d8b4fe] block mb-1.5 font-bold">
                  BEBIDAS INCLUSAS NO {currentTier.category}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentTier.drinksIncluded.map((drink, i) => (
                    <span key={i} className="bg-[#2e1065] text-[#e9d5ff] text-xs px-2.5 py-1 border border-[#6b21a8]">
                      ✓ {drink}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Buyer Details */}
            <div className="space-y-2.5">
              <label className="block font-pixel text-[10px] sm:text-[11px] text-[#fca5a5] uppercase font-bold">
                2. DADOS DO PORTADOR
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="w-full bg-[#120718] border-2 border-[#431424] px-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#ef4444] outline-hidden font-mono"
                />
                <input
                  type="email"
                  required
                  placeholder="E-mail para recebimento"
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                  className="w-full bg-[#120718] border-2 border-[#431424] px-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#ef4444] outline-hidden font-mono"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp / Telefone com DDD"
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  className="w-full bg-[#120718] border-2 border-[#431424] px-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#ef4444] outline-hidden font-mono"
                />
                <div className="flex items-center gap-2">
                  <label className="font-pixel text-[9px] text-[#9ca3af]">PAGAMENTO:</label>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`flex-1 py-2 font-pixel text-[9px] sm:text-[10px] border cursor-pointer ${
                      paymentMethod === 'PIX' ? 'bg-[#047857] border-[#10b981] text-white font-bold' : 'bg-[#180c20] border-[#381a42] text-gray-400'
                    }`}
                  >
                    PIX
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARTAO')}
                    className={`flex-1 py-2 font-pixel text-[9px] sm:text-[10px] border cursor-pointer ${
                      paymentMethod === 'CARTAO' ? 'bg-[#991b1b] border-[#ef4444] text-white font-bold' : 'bg-[#180c20] border-[#381a42] text-gray-400'
                    }`}
                  >
                    CARTÃO
                  </button>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-[#450a0a] border border-[#ef4444] text-[#fca5a5] text-xs sm:text-sm font-mono">
                ⚠ {errorMsg}
              </div>
            )}

            {/* Total & Submit */}
            <div className="pt-3 border-t-2 border-[#381622] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#9ca3af] block font-mono">TOTAL DO PEDIDO</span>
                <span className="font-pixel text-base sm:text-lg text-[#fef08a] font-bold">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white px-5 py-3 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold flex items-center gap-2"
              >
                {loading ? 'EMITINDO...' : 'FINALIZAR COMPRA 💀'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
