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
    id: 't-pista',
    name: 'PISTA CORTEZ - OPEN BAR',
    category: 'PISTA',
    price: 50,
    originalPrice: 70,
    batch: '1º LOTE',
    available: 200,
    total: 200,
    features: [
      'Acesso ao Lobby e Salão Principal',
      'Open Bar até 04:00 da manhã',
      'Copo oficial colecionável Hotel Cortez',
      'Acesso a todas as pistas e atrações'
    ],
    drinksIncluded: ['Gin & Tônica', 'Vodka Smirnoff', 'Energético Baly', 'Caipirinha Velho Barreiro'],
    color: '#991b1b'
  },
  {
    id: 't-vip',
    name: 'VIP SUITE 64 - OPEN BAR PREMIUM',
    category: 'VIP',
    price: 110,
    originalPrice: 140,
    batch: '1º LOTE',
    available: 80,
    total: 80,
    features: [
      'Entrada prioritária sem filas',
      'Acesso ao Mezanino VIP Suite 64',
      'Open Bar Premium completo',
      'Barbearia e maquiagem temática cortesia',
      '1 Welcome Shot Sangue da Condessa'
    ],
    drinksIncluded: ['Whisky Red Label', 'Gin Tanqueray', 'Vodka Absolut', 'Cerveja Heineken', 'Energético Monster'],
    color: '#9333ea'
  },
  {
    id: 't-camarote',
    name: 'CAMAROTE COUNTESS - ALL INCLUSIVE',
    category: 'CAMAROTE',
    price: 180,
    originalPrice: 220,
    batch: 'ÚLTIMOS',
    available: 30,
    total: 30,
    features: [
      'Área reservada com visão panorâmica do palco',
      'Garçom exclusivo no camarote',
      'Open Food Finger foods & petiscos gourmet',
      'Open Bar Super Premium',
      'Brinde comemorativo AHS'
    ],
    drinksIncluded: ['Gin Hendricks', 'Vodka Ciroc', 'Whisky Black Label', 'Espumante Chandon', 'Drinks Autorais'],
    color: '#d97706'
  },
  {
    id: 't-lounge',
    name: 'LOUNGE PRIVATIVO PARA 10 PESSOAS',
    category: 'LOUNGE',
    price: 1200,
    originalPrice: 1500,
    batch: 'EXCLUSIVO',
    available: 4,
    total: 4,
    features: [
      'Espaço privativo com sofás e segurança dedicada',
      '10 Ingressos VIP inclusos',
      '3 Garrafas de Destilados Premium à escolha',
      '12 Red Bulls + 12 Águas',
      'Atendimento de maître particular'
    ],
    drinksIncluded: ['Cardápio All Inclusive Super Premium + Garrafas'],
    color: '#dc2626'
  }
];

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, preselectedTierId }) => {
  const [tiers, setTiers] = useState<TicketTier[]>(DEFAULT_TIERS);
  const [selectedTierId, setSelectedTierId] = useState<string>('t-pista');
  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>('');

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTiers(data);
        }
        if (preselectedTierId) {
          setSelectedTierId(preselectedTierId);
        }
      })
      .catch(() => {
        if (preselectedTierId) {
          setSelectedTierId(preselectedTierId);
        }
      });
  }, [isOpen, preselectedTierId]);

  if (!isOpen) return null;

  const currentTier = tiers.find(t => t.id === selectedTierId) || tiers[0] || DEFAULT_TIERS[0];
  const totalPrice = currentTier ? currentTier.price * quantity : 0;

  const handleWhatsAppRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    audioManager.playSuccess();

    const tierName = currentTier?.name || 'Ingresso Hotel Cortez';
    const batch = currentTier?.batch || '1º Lote';
    const totalFormatted = totalPrice.toFixed(2);
    const nameLine = buyerName.trim() ? `\n👤 *Nome:* ${buyerName.trim()}` : '';

    const message =
      `Olá! Gostaria de garantir meu ingresso para o *Halloween Hotel Cortez 2026* no *The Triplex*:\n\n` +
      `🎫 *Ingresso:* ${tierName}\n` +
      `📦 *Lote:* ${batch}\n` +
      `🔢 *Quantidade:* ${quantity} ingresso(s)\n` +
      `💰 *Total:* R$ ${totalFormatted}${nameLine}\n` +
      `📍 *Local:* The Triplex (Rua Manoel Castilho, 201 - Itaim Paulista, SP)\n\n` +
      `Poderia me passar a chave PIX oficial e as instruções para confirmação da reserva?`;

    const whatsappUrl = `https://wa.me/5511943963952?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0a17] border-2 border-[#ff3344] shadow-[0_0_35px_rgba(255,51,68,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-[#450a0a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#ff4455] tracking-wider">
                BILHETERIA OFICIAL • THE TRIPLEX
              </h2>
              <span className="font-mono text-[10px] text-[#fca5a5]">
                Atendimento Direto & Aquisição Segura via WhatsApp
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
            <WhatsAppIcon className="text-[#22c55e]" size={16} />
            <span className="text-xs text-[#fca5a5] font-mono leading-tight">
              Escolha seu ingresso abaixo e finalize diretamente no <strong>WhatsApp Oficial</strong> sem formulários de pagamento ou taxas ocultas.
            </span>
          </div>
          <span className="shrink-0 bg-[#052e16] border border-[#22c55e] text-[#86efac] font-pixel text-[8px] px-2 py-1">
            CANAL OFICIAL
          </span>
        </div>

        <form onSubmit={handleWhatsAppRedirect} className="space-y-4">
          
          {/* 1. Escolha de Ingressos */}
          <div>
            <label className="block font-pixel text-[10px] sm:text-[11px] text-[#fca5a5] mb-2 uppercase font-bold">
              1. SELECIONE A MODALIDADE DO INGRESSO
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
                        ? 'border-[#22c55e] bg-[#0c2414] shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                        : 'border-[#381622] bg-[#14080e] hover:border-[#7f1d1d]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-pixel text-[10px] sm:text-[11px] text-white font-bold">
                        {tier.name}
                      </span>
                      <span className="font-pixel text-xs text-[#fbbf24] font-bold">
                        R$ {tier.price}
                      </span>
                    </div>
                    <p className="text-xs text-[#d1d5db] my-1.5 font-mono">
                      {tier.features[0]}
                    </p>
                    <div className="flex justify-between items-center text-[9px] font-pixel mt-1 text-[#9ca3af]">
                      <span className="bg-[#240c1e] text-[#fca5a5] px-1.5 py-0.5 border border-[#581c2b]">
                        {tier.batch}
                      </span>
                      <span className="text-[#86efac] font-bold">
                        {isSelected ? '✓ SELECIONADO' : 'CLIQUE P/ ESCOLHER'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Benefícios & Open Bar do Ingresso Selecionado */}
          {currentTier && (
            <div className="bg-[#12071a] border border-[#4c1d95] p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-pixel text-[9px] sm:text-[10px] text-[#c084fc] font-bold uppercase">
                  ITENS & BENEFÍCIOS DO {currentTier.category}:
                </span>
                <span className="font-mono text-[10px] text-[#86efac]">
                  Local: THE TRIPLEX (Itaim Paulista)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono text-[#e9d5ff]">
                {currentTier.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <PixelCheck size={11} color="#34d399" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#3b1754]">
                <span className="font-pixel text-[9px] text-[#d8b4fe] block mb-1 font-bold">
                  BEBIDAS INCLUSAS NO OPEN BAR:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentTier.drinksIncluded.map((drink, i) => (
                    <span key={i} className="bg-[#2e1065] text-[#e9d5ff] text-[11px] px-2 py-0.5 border border-[#6b21a8]">
                      ✓ {drink}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Quantidade & Nome do Titular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Quantidade */}
            <div>
              <label className="block font-pixel text-[10px] text-[#fca5a5] mb-1 uppercase font-bold">
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

            {/* Nome Opcional */}
            <div>
              <label className="block font-pixel text-[10px] text-[#fca5a5] mb-1 uppercase font-bold">
                NOME DO TITULAR (OPCIONAL)
              </label>
              <input
                type="text"
                placeholder="Seu nome para a mensagem"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="w-full bg-[#120718] border-2 border-[#431424] px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#22c55e] outline-hidden font-mono h-11"
              />
            </div>
          </div>

          {/* 4. Total & Botão Oficial WhatsApp */}
          <div className="pt-3 border-t-2 border-[#381622] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[#9ca3af] block font-mono">VALOR TOTAL ESTIMADO</span>
              <span className="font-pixel text-lg sm:text-xl text-[#22c55e] font-bold">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto pixel-btn bg-[#15803d] hover:bg-[#16a34a] active:bg-[#14532d] text-white px-6 py-3.5 font-pixel text-[11px] sm:text-[12px] tracking-wider font-bold flex items-center justify-center gap-2 border-2 border-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.6)] cursor-pointer transition-all"
            >
              <WhatsAppIcon className="text-white" size={18} />
              <span>GARANTIR NO WHATSAPP OFICIAL</span>
            </button>
          </div>

          {/* Direct Security Notice */}
          <div className="p-3 bg-[#0a140d] border border-[#166534] text-[#86efac] font-mono text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <span>🛡️</span>
              <span>ATENDIMENTO 100% SEGURO & DIRETO COM A ORGANIZAÇÃO</span>
            </div>
            <p className="text-[#bbf7d0] leading-relaxed">
              Não realizamos simulações ou cobranças automatizadas de cartão no site. Seu pedido é confirmado diretamente pelo número oficial <strong>+55 11 94396-3952</strong> com chave PIX e envio imediato do comprovante para entrada na portaria.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
