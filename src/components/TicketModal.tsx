import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PixelClose, PixelSkull, PixelCheck } from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { TicketTier } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTierId?: string | null;
}

type PixStage = 'form' | 'qrcode' | 'approved' | 'error' | 'expired';

interface PixData {
  orderId: string;
  qrCodeBase64: string;
  qrCode: string;
  ticketUrl?: string;
  expiresIn: number;
}

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
    },
    {
      id: 't-normal-10',
      name: 'INGRESSO NORMAL (SEM OPEN)',
      category: 'PISTA',
      price: 10,
      batch: '1º LOTE',
      available: 200,
      total: 200,
      features: ['Acesso ao evento'],
      drinksIncluded: [],
      color: '#2563eb'
    }
  ]);
  const [selectedTierId, setSelectedTierId] = useState<string>('t-open-45');
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const isIntegrationReady = true;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Estado do Pix ──
  const [pixStage, setPixStage] = useState<PixStage>('form');
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          if (data.some(t => t.id === 't-normal-10')) {
             setTiers(data);
          }
        }
      })
      .catch(() => {});
  }, [isOpen, preselectedTierId]);

  // Limpar intervalos ao desmontar ou fechar
  const clearIntervals = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearIntervals();
      // Resetar ao fechar o modal (mas manter dados se aprovado)
      if (pixStage !== 'approved') {
        setPixStage('form');
        setPixData(null);
        setError(null);
      }
    }
    return clearIntervals;
  }, [isOpen, clearIntervals, pixStage]);

  // ── Polling do status do pedido ──
  const startPolling = useCallback((orderId: string, expiresIn: number) => {
    clearIntervals();
    setSecondsLeft(expiresIn);

    // Countdown
    countdownRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearIntervals();
          setPixStage('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Polling a cada 4 segundos
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'aprovado') {
          clearIntervals();
          setAccessToken(data.accessToken || null);
          setPixStage('approved');
          audioManager.playSuccess();
        } else if (data.status === 'recusado') {
          clearIntervals();
          setPixStage('error');
          setError('Pagamento recusado pelo Mercado Pago.');
        } else if (data.status === 'expirado') {
          clearIntervals();
          setPixStage('expired');
        }
      } catch {
        // Falha na rede, continua tentando
      }
    }, 4000);
  }, [clearIntervals]);

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      setError('Por favor, informe um e-mail válido.');
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
          sellerSlug
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar pagamento.');
      }

      // ── Pix Transparente: exibir QR Code inline ──
      if (data.qrCodeBase64 || data.qrCode) {
        setPixData({
          orderId: data.orderId,
          qrCodeBase64: data.qrCodeBase64,
          qrCode: data.qrCode,
          ticketUrl: data.ticketUrl,
          expiresIn: data.expiresIn || 1800
        });
        setPixStage('qrcode');
        startPolling(data.orderId, data.expiresIn || 1800);
      } else {
        throw new Error('QR Code não recebido do servidor.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar o pagamento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPixCode = async () => {
    if (!pixData?.qrCode) return;
    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      audioManager.playClick();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback para mobile
      const ta = document.createElement('textarea');
      ta.value = pixData.qrCode;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNewPurchase = () => {
    clearIntervals();
    setPixStage('form');
    setPixData(null);
    setAccessToken(null);
    setError(null);
    setBuyerName('');
    setBuyerEmail('');
    setBuyerPhone('');
    setQuantity(1);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ══════════════════════════════════════════════
  // TELA: PAGAMENTO APROVADO
  // ══════════════════════════════════════════════
  if (pixStage === 'approved') {
    return (
      <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="relative w-full max-w-xl bg-[#0e0a17] border-2 border-[#22c55e] shadow-[0_0_45px_rgba(34,197,94,0.5)] rounded-xl p-4 sm:p-6 text-[#f3edf9] mt-4 mb-24 sm:my-auto">

          <div className="flex items-center justify-between border-b-2 border-[#14532d] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <PixelCheck size={20} color="#22c55e" />
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#86efac] tracking-wider">
                PAGAMENTO APROVADO!
              </h2>
            </div>
            <button onClick={() => { audioManager.playClick(); onClose(); }} className="p-1 hover:bg-[#14532d] text-[#86efac] cursor-pointer" aria-label="Fechar">
              <PixelClose size={18} />
            </button>
          </div>

          <div className="text-center space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#052e16] border-2 border-[#22c55e] shadow-[0_0_30px_rgba(34,197,94,0.4)] mx-auto animate-pulse">
              <PixelCheck size={40} color="#4ade80" />
            </div>

            <h3 className="font-pixel text-lg text-[#4ade80] font-bold">
              COMPRA CONFIRMADA!
            </h3>

            <p className="text-sm text-[#bbf7d0] font-mono">
              Seus ingressos foram gerados com sucesso.<br />
              Você também receberá um e-mail com o link de acesso.
            </p>

            {accessToken && (
              <a
                href={`/meus-ingressos/${accessToken}`}
                className="inline-block mt-4 px-6 py-3 bg-[#15803d] hover:bg-[#16a34a] text-white font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold border-2 border-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all"
              >
                VER MEUS INGRESSOS
              </a>
            )}

            <button
              onClick={handleNewPurchase}
              className="block mx-auto mt-3 text-xs text-[#6ee7b7] hover:text-white font-mono underline underline-offset-4 cursor-pointer"
            >
              Comprar mais ingressos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // TELA: QR CODE PIX (AGUARDANDO PAGAMENTO)
  // ══════════════════════════════════════════════
  if (pixStage === 'qrcode' && pixData) {
    return (
      <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="relative w-full max-w-md bg-[#0e0a17] border-2 border-[#f59e0b] shadow-[0_0_35px_rgba(245,158,11,0.4)] rounded-xl p-4 sm:p-6 text-[#f3edf9] mt-4 mb-24 sm:my-auto">

          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#78350f] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <div>
                <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#fbbf24] tracking-wider">
                  PAGUE COM PIX
                </h2>
                <span className="font-mono text-[11px] text-[#fde68a]">
                  Escaneie ou copie o código abaixo
                </span>
              </div>
            </div>
            <button onClick={() => { clearIntervals(); setPixStage('form'); audioManager.playClick(); }} className="p-1 hover:bg-[#78350f] text-[#fbbf24] cursor-pointer" aria-label="Voltar">
              <PixelClose size={18} />
            </button>
          </div>

          {/* Valor */}
          <div className="text-center mb-4">
            <span className="text-xs text-[#9ca3af] font-mono block">VALOR TOTAL</span>
            <span className="font-pixel text-2xl text-[#22c55e] font-bold">
              R$ {totalPrice.toFixed(2)}
            </span>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            {pixData.qrCodeBase64 ? (
              <div className="bg-white p-3 rounded-lg shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <img
                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                  alt="QR Code Pix"
                  className="w-52 h-52 sm:w-60 sm:h-60"
                />
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg text-center text-black text-sm">
                <p>QR Code indisponível. Use o código Copia e Cola abaixo.</p>
              </div>
            )}

            {/* Copia e Cola */}
            {pixData.qrCode && (
              <button
                onClick={handleCopyPixCode}
                className={`w-full py-3 px-4 font-pixel text-[11px] sm:text-[12px] tracking-wider font-bold border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  copied
                    ? 'bg-[#052e16] border-[#22c55e] text-[#86efac] shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : 'bg-[#1c1917] border-[#f59e0b] text-[#fde68a] hover:bg-[#292524] shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                }`}
              >
                {copied ? (
                  <>
                    <PixelCheck size={14} color="#4ade80" />
                    CÓDIGO COPIADO!
                  </>
                ) : (
                  <>
                    📋 COPIAR CÓDIGO PIX (COPIA E COLA)
                  </>
                )}
              </button>
            )}

            {/* Countdown & Status */}
            <div className="w-full bg-[#1c1917] border border-[#44403c] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#fbbf24] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#fbbf24] animate-pulse" />
                  AGUARDANDO PAGAMENTO...
                </span>
                <span className={`font-pixel font-bold ${secondsLeft < 120 ? 'text-[#ef4444]' : 'text-[#fde68a]'}`}>
                  {formatTime(secondsLeft)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#292524] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f59e0b] to-[#22c55e] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(0, (secondsLeft / (pixData.expiresIn || 1800)) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#a8a29e] font-mono text-center">
                O status será atualizado automaticamente após o pagamento.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // TELA: PIX EXPIRADO
  // ══════════════════════════════════════════════
  if (pixStage === 'expired') {
    return (
      <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="relative w-full max-w-md bg-[#0e0a17] border-2 border-[#ef4444] shadow-[0_0_35px_rgba(239,68,68,0.4)] rounded-xl p-4 sm:p-6 text-[#f3edf9] mt-4 mb-24 sm:my-auto">
          <div className="text-center space-y-4 py-4">
            <span className="text-5xl block">⏰</span>
            <h3 className="font-pixel text-base text-[#ef4444] font-bold">PIX EXPIRADO</h3>
            <p className="text-sm text-[#fca5a5] font-mono">
              O tempo para pagamento expirou.<br />Nenhuma cobrança foi efetuada.
            </p>
            <button
              onClick={handleNewPurchase}
              className="mt-4 px-6 py-3 bg-[#b91c1c] hover:bg-[#dc2626] text-white font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold border-2 border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // TELA: ERRO
  // ══════════════════════════════════════════════
  if (pixStage === 'error') {
    return (
      <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="relative w-full max-w-md bg-[#0e0a17] border-2 border-[#ef4444] shadow-[0_0_35px_rgba(239,68,68,0.4)] rounded-xl p-4 sm:p-6 text-[#f3edf9] mt-4 mb-24 sm:my-auto">
          <div className="text-center space-y-4 py-4">
            <span className="text-5xl block">❌</span>
            <h3 className="font-pixel text-base text-[#ef4444] font-bold">PAGAMENTO RECUSADO</h3>
            <p className="text-sm text-[#fca5a5] font-mono">
              {error || 'O pagamento foi recusado pelo processador.'}
            </p>
            <button
              onClick={handleNewPurchase}
              className="mt-4 px-6 py-3 bg-[#b91c1c] hover:bg-[#dc2626] text-white font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold border-2 border-[#ef4444] shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // TELA: FORMULÁRIO (padrão)
  // ══════════════════════════════════════════════
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
                Ingresso Open R$ 45,00 • Pagamento via PIX
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
              Pague com segurança via <strong>PIX</strong> pelo Mercado Pago. QR Code gerado na hora.
            </span>
          </div>
          <span className="shrink-0 bg-[#052e16] border border-[#22c55e] text-[#86efac] font-pixel text-[10px] px-2 py-1">
            PIX INSTANTÂNEO
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
                {currentTier?.drinksIncluded?.map((drink: string, i: number) => (
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
          </div>

          {/* 4. Total & Botão Oficial de Checkout */}
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
                    ? 'GERANDO PIX...' 
                    : 'PAGAR COM PIX'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
