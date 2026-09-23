import React, { useState, useEffect } from 'react';
import { PixelClose, PixelSkull, PixelCheck } from './PixelIcons';
import { WhatsAppIcon } from './OfficialSocialButtons';
import { audioManager } from '../utils/audio';
import type { TicketTier } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTierId?: string | null;
}

const DEFAULT_TIERS: TicketTier[] = [
  {
    id: 't-open-45',
    name: 'INGRESSO OPEN',
    category: 'OPEN',
    price: 45,
    originalPrice: 65,
    batch: '1º LOTE',
    available: 200,
    total: 200,
    features: [
      'Open Bar das 21:00 às 00:00'
    ],
    drinksIncluded: ['Gin', 'Vodka', 'Energético', 'Caipirinha', 'Canelinha', '???'],
    color: '#991b1b'
  }
];

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, preselectedTierId }) => {
  const [tiers, setTiers] = useState<TicketTier[]>([
    {
      id: 't-open-45',
      name: 'INGRESSO OPEN BAR',
      category: 'OPEN',
      price: 45,
      batch: '1º LOTE',
      available: 200,
      total: 200,
      features: ['Open Bar das 21:00 às 00:00'],
      drinksIncluded: ['Gin', 'Vodka', 'Energético', 'Caipirinha', 'Canelinha', '???'],
      color: '#991b1b'
    }
  ]);
  const [selectedTierId, setSelectedTierId] = useState<string>('t-open-45');
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('cartao');
  const [pixData, setPixData] = useState<{ qrCodeBase64: string, qrCode: string, orderId: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const isIntegrationReady = true; // Habilita a integração Mercado Pago

  useEffect(() => {
    // Tiers are now hardcoded or fetched, but we initialize with both options.
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // If backend has the updated tickets, use them, otherwise use the local ones
          if (data.some(t => t.id === 't-normal-10')) {
             setTiers(data);
          }
        }
      })
      .catch(() => {});
  }, [isOpen, preselectedTierId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (pixData?.orderId && paymentStatus !== 'aprovado') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/orders/${pixData.orderId}/status`);
          const data = await res.json();
          if (data.status === 'aprovado' && data.accessToken) {
            setPaymentStatus('aprovado');
            audioManager.playSuccess();
            clearInterval(interval);
            setTimeout(() => {
              window.location.href = `/meus-ingressos/${data.accessToken}`;
            }, 2000);
          }
        } catch (e) {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [pixData?.orderId, paymentStatus]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = tiers.find(t => t.id === selectedTierId) || tiers[0] || {} as any;
  const totalPrice = currentTier?.price ? currentTier.price * quantity : 0;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!buyerName || !buyerEmail || !buyerPhone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isIntegrationReady) {
      setError('O pagamento ainda não está disponível. Tente novamente mais tarde.');
      return;
    }

    setIsLoading(true);
    audioManager.playClick();

    try {
      const sellerSlug = localStorage.getItem('referral_seller') || undefined;

      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: currentTier?.id,
          quantity,
          buyerName,
          buyerEmail,
          buyerPhone,
          sellerSlug,
          paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar pagamento.');
      }

      if (paymentMethod === 'cartao' && data.checkoutUrl) {
        audioManager.playSuccess();
        window.location.href = data.checkoutUrl;
      } else if (paymentMethod === 'pix' && data.qrCodeBase64) {
        audioManager.playSuccess();
        setPixData({ qrCodeBase64: data.qrCodeBase64, qrCode: data.qrCode, orderId: data.orderId });
      } else {
        throw new Error('Link ou código de pagamento não recebido.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar o pagamento.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pixData) {
    return (
      <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="relative w-full max-w-md bg-[#0e0a17] border-2 border-[#22c55e] shadow-[0_0_35px_rgba(34,197,94,0.5)] rounded-xl p-4 sm:p-6 text-[#f3edf9] mt-4 mb-24 sm:my-auto text-center">
          <div className="flex items-center justify-between border-b-2 border-[#14532d] pb-3 mb-4">
             <div className="flex items-center gap-2">
               <PixelCheck size={20} color="#22c55e" />
               <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#4ade80] tracking-wider">
                 PAGAMENTO VIA PIX
               </h2>
             </div>
             <button onClick={() => { audioManager.playClick(); onClose(); }} className="p-1 hover:bg-[#14532d] text-[#86efac] cursor-pointer"><PixelClose size={18} /></button>
          </div>
          <p className="font-mono text-sm text-gray-300 mb-4">Escaneie o QR Code abaixo ou utilize o código Copia e Cola para finalizar a compra de <strong>{currentTier.name}</strong>.</p>
          <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
             <img src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} alt="QR Code Pix" className="w-48 h-48 object-contain" />
          </div>
          <div className="bg-[#120718] border border-[#14532d] p-3 mb-4 rounded text-left overflow-hidden">
             <span className="block font-pixel text-[10px] text-[#4ade80] mb-1">CÓDIGO COPIA E COLA</span>
             <code className="text-xs text-gray-300 break-all select-all">{pixData.qrCode}</code>
          </div>
          <button onClick={() => { 
            navigator.clipboard.writeText(pixData.qrCode); 
            audioManager.playClick();
          }} className="pixel-btn w-full bg-[#15803d] hover:bg-[#16a34a] text-white border-[#4ade80] shadow-[0_0_15px_rgba(34,197,94,0.4)] py-3 font-pixel text-xs transition-all cursor-pointer">
            COPIAR CÓDIGO PIX
          </button>
          {paymentStatus === 'aprovado' ? (
             <div className="mt-4 p-3 bg-[#064e3b] border-2 border-[#34d399] text-[#a7f3d0] font-pixel text-xs animate-pulse">
               PAGAMENTO CONFIRMADO! REDIRECIONANDO...
             </div>
          ) : (
             <div className="mt-4 text-[10px] font-mono text-gray-400 flex items-center justify-center gap-2">
               <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
               AGUARDANDO PAGAMENTO...
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="relative w-full max-w-xl bg-[#0e0a17] border-2 border-[#ff3344] shadow-[0_0_35px_rgba(255,51,68,0.5)] rounded-xl p-4 sm:p-6 text-[#f3edf9] mt-4 mb-24 sm:my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#450a0a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#ff4455] tracking-wider">
                BILHETERIA OFICIAL • THE TRIPLEX
              </h2>
              <span className="font-mono text-[12px] text-[#fca5a5]">
                Ingresso Open R$ 45,00 • Atendimento Direto via WhatsApp
              </span>
            </div>
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

        {/* Informative Banner */}
        <div className="mb-4 bg-[#1b0814] border border-[#7f1d1d] p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#fca5a5] font-mono leading-tight">
              Pague com segurança através do <strong>Mercado Pago</strong> (PIX ou Cartão).
            </span>
          </div>
          <span className="shrink-0 bg-[#052e16] border border-[#22c55e] text-[#86efac] font-pixel text-[10px] px-2 py-1">
            CHECKOUT OFICIAL
          </span>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/50 border border-red-500 p-3 text-red-200 text-xs font-mono rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-4">
          
          {/* 1. Modalidade do Ingresso */}
          <div>
            <label className="block font-pixel text-[12px] sm:text-[13px] text-[#fca5a5] mb-2 uppercase font-bold">
              MODALIDADE DO INGRESSO
            </label>
            <div className="grid grid-cols-1 gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setSelectedTierId(tier.id);
                  }}
                  className={`p-3.5 border-2 text-left flex justify-between items-center transition-all cursor-pointer ${
                    selectedTierId === tier.id
                      ? 'border-[#22c55e] bg-[#0c2414] shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'border-[#431424] bg-[#120718] hover:border-[#fca5a5]/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                    <span className="font-pixel text-xs sm:text-sm text-white font-bold">
                      {tier.name}
                    </span>
                    <span className="bg-[#240c1e] text-[#fca5a5] px-1.5 py-0.5 border border-[#581c2b] font-pixel text-[11px] w-fit">
                      {tier.batch}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-pixel text-base sm:text-lg font-bold ${
                      selectedTierId === tier.id ? 'text-[#22c55e]' : 'text-gray-400'
                    }`}>
                      R$ {tier.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Bebidas Inclusas no Open (Se selecionado) */}
          {currentTier?.category === 'OPEN' && (
            <div className="bg-[#12071a] border border-[#4c1d95] p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-1 border-b border-[#3b1754] pb-2">
                <span className="font-pixel text-[12px] text-[#d8b4fe] font-bold uppercase">
                  BEBIDAS INCLUSAS NO OPEN:
                </span>
                <span className="font-mono text-[12px] text-[#86efac]">
                  A partir das 21:00 • THE TRIPLEX
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentTier?.drinksIncluded?.map((drink, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-1 border font-mono ${
                      drink === '???'
                        ? 'bg-[#581c87] text-[#fef08a] border-[#eab308] font-pixel text-[12px] font-bold shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                        : 'bg-[#2e1065] text-[#e9d5ff] border-[#6b21a8]'
                    }`}
                  >
                    ✓ {drink}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3. Dados do Comprador */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 uppercase font-bold">
                  NOME COMPLETO *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do titular"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="w-full bg-[#120718] border-2 border-[#431424] px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono h-11"
                />
              </div>
              <div>
                <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 uppercase font-bold">
                  E-MAIL *
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                  className="w-full bg-[#120718] border-2 border-[#431424] px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono h-11"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 uppercase font-bold">
                  NÚMERO DE TELEFONE *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  className="w-full bg-[#120718] border-2 border-[#431424] px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono h-11"
                />
              </div>
            {/* Quantidade */}
            <div>
              <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 uppercase font-bold">
                QUANTIDADE DE INGRESSOS
              </label>
              <div className="flex items-center gap-2 bg-[#120718] border-2 border-[#431424] p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setQuantity(prev => Math.max(1, prev - 1));
                  }}
                  className="w-8 h-8 bg-[#2d0f1b] hover:bg-[#431424] text-white font-pixel text-xs flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="flex-1 text-center font-pixel text-sm text-white font-bold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setQuantity(prev => Math.min(10, prev + 1));
                  }}
                  className="w-8 h-8 bg-[#2d0f1b] hover:bg-[#431424] text-white font-pixel text-xs flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 5. Total & Botão Oficial de Checkout */}
          <div className="pt-3 border-t-2 border-[#381622] flex flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs text-[#9ca3af] block font-mono">VALOR TOTAL</span>
              <span className="font-pixel text-base sm:text-xl text-[#22c55e] font-bold">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={!isIntegrationReady || isLoading}
              className={`flex-1 sm:flex-none pixel-btn ${(!isIntegrationReady || isLoading) ? 'bg-gray-700 border-gray-500 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#15803d] hover:bg-[#16a34a] active:bg-[#14532d] text-white border-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.6)] cursor-pointer'} px-3 sm:px-6 py-2.5 sm:py-3.5 font-pixel text-[10px] sm:text-[13px] tracking-wider font-bold flex items-center justify-center gap-1.5 sm:gap-2 border-2 transition-all whitespace-nowrap`}
            >
              <span>
                {!isIntegrationReady 
                  ? 'PAGAMENTO INDISPONÍVEL' 
                  : isLoading 
                    ? 'GERANDO...' 
                    : 'COMPRAR INGRESSO'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
