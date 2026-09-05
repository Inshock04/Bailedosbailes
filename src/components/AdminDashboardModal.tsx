import React, { useState, useEffect } from 'react';
import { 
  PixelClose, 
  PixelSkull, 
  PixelCheck, 
  PixelTicketIcon, 
  PixelCocktail, 
  PixelCardIcon, 
  PixelChart, 
  PixelEye, 
  PixelWarning 
} from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { PurchasedTicket, Promotion, Coupon, GuestListEntry } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'CHECKIN' | 'TICKETS' | 'PROMOS' | 'GUESTLIST' | 'COUPONS'>('METRICS');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check-in Scanner State
  const [scanToken, setScanToken] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);

  // Edit promo state
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoPriceInput, setPromoPriceInput] = useState<number>(0);

  const fetchMetrics = () => {
    setLoading(true);
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Token Verification
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanToken.trim()) return;

    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyResult(null);
    setConfirmSuccess(null);

    try {
      const res = await fetch('/api/checkin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: scanToken.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Código não encontrado.');
      }

      setVerifyResult(data);
      if (data.data.status === 'UTILIZADO' || data.data.status === 'CHECKED_IN') {
        audioManager.playError();
      } else {
        audioManager.playSuccess();
      }
    } catch (err: any) {
      setVerifyError(err.message || 'Código inválido.');
      audioManager.playError();
    } finally {
      setVerifyLoading(false);
    }
  };

  // Confirm check-in action
  const handleConfirmCheckin = async () => {
    if (!verifyResult) return;

    try {
      const res = await fetch('/api/checkin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verifyResult.data.token,
          type: verifyResult.type
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao confirmar.');
      }

      setConfirmSuccess(data.message || 'Confirmado com sucesso!');
      audioManager.playSuccess();
      // Refresh verification and metrics
      setVerifyResult((prev: any) => ({
        ...prev,
        data: { ...prev.data, status: prev.type === 'GUEST_LIST' ? 'CHECKED_IN' : 'UTILIZADO' }
      }));
      fetchMetrics();
    } catch (err: any) {
      setVerifyError(err.message || 'Erro ao confirmar.');
      audioManager.playError();
    }
  };

  // Save Promo price edit
  const handleSavePromo = async (promoId: string) => {
    try {
      const res = await fetch('/api/promotions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promoId, price: promoPriceInput })
      });
      if (res.ok) {
        setEditingPromoId(null);
        fetchMetrics();
        audioManager.playSuccess();
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#090510] border-2 border-[#ef4444] shadow-[0_0_40px_rgba(239,68,68,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#5c1322] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#ff4455] tracking-wider">
                PORTARIA & ADMIN • HOTEL CORTEZ
              </h2>
              <span className="font-mono text-[10px] text-[#fca5a5]">
                Sistema de Gestão, Métricas em Tempo Real e Validador QR Code
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#3b0710] text-[#fca5a5] cursor-pointer"
          >
            <PixelClose size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-[#2d1222] pb-2 mb-4 font-pixel text-[8px] sm:text-[9px]">
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('METRICS'); }}
            className={`px-3 py-1.5 border flex items-center gap-1 ${
              activeTab === 'METRICS' ? 'bg-[#991b1b] border-[#ef4444] text-white' : 'bg-[#160812] border-[#381420] text-gray-400'
            }`}
          >
            <PixelChart size={12} />
            <span>MÉTRICAS & KPIS</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('CHECKIN'); }}
            className={`px-3 py-1.5 border flex items-center gap-1 ${
              activeTab === 'CHECKIN' ? 'bg-[#047857] border-[#10b981] text-white' : 'bg-[#160812] border-[#381420] text-gray-400'
            }`}
          >
            <PixelEye size={12} />
            <span>SCANNER / CHECK-IN</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('TICKETS'); }}
            className={`px-3 py-1.5 border flex items-center gap-1 ${
              activeTab === 'TICKETS' ? 'bg-[#6b21a8] border-[#a855f7] text-white' : 'bg-[#160812] border-[#381420] text-gray-400'
            }`}
          >
            <PixelTicketIcon size={12} />
            <span>INGRESSOS VENDIDOS ({metrics?.purchasedTickets?.length || 0})</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('GUESTLIST'); }}
            className={`px-3 py-1.5 border flex items-center gap-1 ${
              activeTab === 'GUESTLIST' ? 'bg-[#b45309] border-[#f59e0b] text-white' : 'bg-[#160812] border-[#381420] text-gray-400'
            }`}
          >
            <PixelCheck size={12} color="#fbbf24" />
            <span>LISTA VIP ({metrics?.guestList?.length || 0})</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('PROMOS'); }}
            className={`px-3 py-1.5 border flex items-center gap-1 ${
              activeTab === 'PROMOS' ? 'bg-[#d97706] border-[#fbbf24] text-black font-bold' : 'bg-[#160812] border-[#381420] text-gray-400'
            }`}
          >
            <PixelCocktail size={12} />
            <span>PREÇOS DO BAR</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('COUPONS'); }}
            className={`px-3 py-1.5 border flex items-center gap-1 ${
              activeTab === 'COUPONS' ? 'bg-[#4338ca] border-[#818cf8] text-white' : 'bg-[#160812] border-[#381420] text-gray-400'
            }`}
          >
            <PixelCardIcon size={12} />
            <span>CUPONS ORÁCULO ({metrics?.coupons?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {/* 1. METRICS & KPIS */}
          {activeTab === 'METRICS' && (
            <div className="space-y-4">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#180914] border-2 border-[#991b1b] p-3 text-center">
                  <span className="font-pixel text-[8px] text-[#fca5a5] block">INGRESSOS EMITIDOS</span>
                  <span className="font-pixel text-lg sm:text-xl text-white font-bold block mt-1">
                    {metrics?.totalTicketsSold || 0}
                  </span>
                  <span className="text-[10px] text-[#a855f7] font-mono">100% autênticos</span>
                </div>

                <div className="bg-[#180914] border-2 border-[#d97706] p-3 text-center">
                  <span className="font-pixel text-[8px] text-[#fef08a] block">RECEITA TOTAL</span>
                  <span className="font-pixel text-lg sm:text-xl text-[#34d399] font-bold block mt-1">
                    R$ {(metrics?.totalRevenue || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#9ca3af] font-mono">PIX & Cartões</span>
                </div>

                <div className="bg-[#180914] border-2 border-[#059669] p-3 text-center">
                  <span className="font-pixel text-[8px] text-[#86efac] block">CHECK-INS NA PORTARIA</span>
                  <span className="font-pixel text-lg sm:text-xl text-[#86efac] font-bold block mt-1">
                    {metrics?.checkinsCount || 0}
                  </span>
                  <span className="text-[10px] text-[#9ca3af] font-mono">Entradas validadas</span>
                </div>

                <div className="bg-[#180914] border-2 border-[#9333ea] p-3 text-center">
                  <span className="font-pixel text-[8px] text-[#d8b4fe] block">CUPONS DO ORÁCULO</span>
                  <span className="font-pixel text-lg sm:text-xl text-[#c084fc] font-bold block mt-1">
                    {metrics?.couponsGenerated || 0}
                  </span>
                  <span className="text-[10px] text-[#fbbf24] font-mono">{metrics?.couponsUsed || 0} resgatados</span>
                </div>
              </div>

              {/* Graphical Visualizer */}
              <div className="bg-[#14081c] border-2 border-[#4c1d95] p-4 space-y-3">
                <span className="font-pixel text-[9px] text-[#e9d5ff] flex items-center gap-1.5 uppercase">
                  <PixelChart size={12} color="#c084fc" />
                  <span>Lotação dos Lotes do Hotel Cortez</span>
                </span>
                {metrics?.tickets?.map((t: any) => {
                  const sold = t.total - t.available;
                  const pct = Math.min(100, Math.round((sold / t.total) * 100));
                  return (
                    <div key={t.id} className="space-y-1">
                      <div className="flex justify-between font-mono text-xs text-[#d1d5db]">
                        <span>{t.name} (R$ {t.price})</span>
                        <span>{sold} / {t.total} vendidos ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-[#090310] border border-[#581c87] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#dc2626] to-[#9333ea]"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. LIVE SCANNER & TOKEN VALIDATOR */}
          {activeTab === 'CHECKIN' && (
            <div className="space-y-4">
              <div className="bg-[#101b12] border-2 border-[#059669] p-4 text-center">
                <span className="font-pixel text-[9px] text-[#86efac] block mb-2 uppercase">
                  VALIDADOR OFICIAL DE ENTRADAS E PROMOÇÕES
                </span>
                
                <form onSubmit={handleVerifyToken} className="max-w-md mx-auto flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Digite ou escaneie o token (ex: AHS-TK-883921)"
                    value={scanToken}
                    onChange={e => setScanToken(e.target.value)}
                    className="flex-1 bg-[#09100a] border-2 border-[#15803d] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#34d399] outline-hidden font-mono uppercase"
                  />
                  <button
                    type="submit"
                    disabled={verifyLoading}
                    className="pixel-btn bg-[#059669] hover:bg-[#10b981] text-white px-4 py-2 font-pixel text-[9px]"
                  >
                    {verifyLoading ? 'VERIFICANDO...' : 'BUSCAR'}
                  </button>
                </form>

                {verifyError && (
                  <div className="mt-3 p-2 bg-[#450a0a] border border-[#ef4444] text-[#fca5a5] text-xs font-mono flex items-center justify-center gap-1.5">
                    <PixelWarning size={14} color="#ef4444" />
                    <span>{verifyError}</span>
                  </div>
                )}
              </div>

              {/* Verification Result Card */}
              {verifyResult && (
                <div className={`p-4 border-2 ${
                  verifyResult.data.status === 'UTILIZADO' || verifyResult.data.status === 'CHECKED_IN'
                    ? 'bg-[#29080e] border-[#ef4444]'
                    : 'bg-[#0f2415] border-[#22c55e]'
                }`}>
                  <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-2">
                    <div>
                      <span className="font-pixel text-[8px] text-gray-300 block uppercase">
                        TIPO: {verifyResult.type}
                      </span>
                      <h3 className="font-pixel text-sm text-white mt-1">
                        {verifyResult.data.name}
                      </h3>
                      <p className="font-mono text-xs text-[#a7f3d0]">
                        Item: {verifyResult.data.item}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`font-pixel text-[9px] px-2 py-1 block ${
                        verifyResult.data.status === 'UTILIZADO' || verifyResult.data.status === 'CHECKED_IN'
                          ? 'bg-[#7f1d1d] text-[#fca5a5]'
                          : 'bg-[#15803d] text-[#bbf7d0]'
                      }`}>
                        {verifyResult.data.status}
                      </span>
                      {verifyResult.data.usedAt && (
                        <span className="text-[10px] text-[#fca5a5] font-mono block mt-1">
                          Usado em: {new Date(verifyResult.data.usedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {verifyResult.data.status === 'VALIDO' || verifyResult.data.status === 'ATIVO' || verifyResult.data.status === 'CONFIRMADO' ? (
                    <button
                      onClick={handleConfirmCheckin}
                      className="w-full pixel-btn bg-[#16a34a] hover:bg-[#22c55e] text-white py-3 font-pixel text-[10px] tracking-wider flex items-center justify-center gap-2"
                    >
                      <PixelCheck size={14} color="#ffffff" />
                      <span>
                        {verifyResult.type === 'TICKET' ? 'CONFIRMAR ENTRADA DO HÓSPEDE' :
                         verifyResult.type === 'COUPON' ? 'LIBERAR DRINK / PROMOÇÃO NO BAR' :
                         'CONFIRMAR ENTRADA LISTA VIP'}
                      </span>
                    </button>
                  ) : (
                    <div className="text-center font-pixel text-xs text-[#ef4444] py-2 bg-[#450a0a] border border-[#ef4444] flex items-center justify-center gap-1.5">
                      <PixelWarning size={14} color="#ef4444" />
                      <span>ATENÇÃO: ESTE CÓDIGO JÁ FOI UTILIZADO! ENTRADA RECUSADA.</span>
                    </div>
                  )}

                  {confirmSuccess && (
                    <div className="mt-2 p-2 bg-[#14532d] text-[#86efac] text-xs font-mono text-center flex items-center justify-center gap-1.5">
                      <PixelCheck size={14} color="#86efac" />
                      <span>{confirmSuccess}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. TICKETS TABLE */}
          {activeTab === 'TICKETS' && (
            <div className="space-y-2">
              <span className="font-pixel text-[9px] text-[#c084fc] block mb-2">
                RELAÇÃO DE INGRESSOS ADQUIRIDOS
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-[#3b1754]">
                  <thead className="bg-[#24083a] text-[#e9d5ff] font-pixel text-[8px]">
                    <tr>
                      <th className="p-2">TOKEN</th>
                      <th className="p-2">COMPRADOR</th>
                      <th className="p-2">CATEGORIA</th>
                      <th className="p-2">VALOR</th>
                      <th className="p-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a1040]">
                    {(!metrics?.purchasedTickets || metrics.purchasedTickets.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-400 font-mono text-xs">
                          Nenhum ingresso emitido no banco ainda. Vendas direcionadas ao WhatsApp Oficial (+55 11 94396-3952).
                        </td>
                      </tr>
                    )}
                    {metrics?.purchasedTickets?.map((t: PurchasedTicket) => (
                      <tr key={t.id} className="hover:bg-[#1f0b30]">
                        <td className="p-2 font-pixel text-[8px] text-[#fbbf24]">{t.token}</td>
                        <td className="p-2 text-white font-bold">{t.buyerName}<br/><span className="text-[10px] text-gray-400">{t.buyerPhone}</span></td>
                        <td className="p-2 text-[#d8b4fe]">{t.ticketName}</td>
                        <td className="p-2 text-[#34d399]">R$ {t.price.toFixed(2)}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 text-[9px] font-pixel ${
                            t.status === 'VALIDO' ? 'bg-[#064e3b] text-[#6ee7b7]' : 'bg-[#7f1d1d] text-[#fca5a5]'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. GUEST LIST */}
          {activeTab === 'GUESTLIST' && (
            <div className="space-y-2">
              <span className="font-pixel text-[9px] text-[#fbbf24] block mb-2">
                LISTA VIP DE CONVIDADOS RSVP
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-[#451a03]">
                  <thead className="bg-[#381404] text-[#fef08a] font-pixel text-[8px]">
                    <tr>
                      <th className="p-2">TOKEN</th>
                      <th className="p-2">NOME</th>
                      <th className="p-2">TELEFONE</th>
                      <th className="p-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d1205]">
                    {(!metrics?.guestList || metrics.guestList.length === 0) && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400 font-mono text-xs">
                          Nenhum convidado na lista ainda. Formulário público de RSVP aberto.
                        </td>
                      </tr>
                    )}
                    {metrics?.guestList?.map((g: GuestListEntry) => (
                      <tr key={g.id} className="hover:bg-[#240e04]">
                        <td className="p-2 font-pixel text-[8px] text-[#fde047]">{g.token}</td>
                        <td className="p-2 text-white">{g.name}</td>
                        <td className="p-2 text-gray-400">{g.phone}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 text-[9px] font-pixel ${
                            g.status === 'CONFIRMADO' ? 'bg-[#15803d] text-[#bbf7d0]' : 'bg-[#854d0e] text-[#fef08a]'
                          }`}>
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. PROMOTIONS & PRICES CRUD */}
          {activeTab === 'PROMOS' && (
            <div className="space-y-3">
              <span className="font-pixel text-[9px] text-[#fbbf24] block">
                GERENCIAMENTO DE PREÇOS E PROMOÇÕES (BANCO EM TEMPO REAL)
              </span>
              <div className="space-y-2">
                {metrics?.promotions?.map((p: Promotion) => (
                  <div key={p.id} className="bg-[#180c18] border border-[#581c87] p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                      <span className="font-pixel text-[9px] text-[#fef08a]">{p.name}</span>
                      <p className="font-mono text-[11px] text-gray-400">{p.description} ({p.quantity})</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {editingPromoId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={promoPriceInput}
                            onChange={e => setPromoPriceInput(Number(e.target.value))}
                            className="w-20 bg-[#0c0512] border border-[#f59e0b] px-2 py-1 text-xs text-white"
                          />
                          <button
                            onClick={() => handleSavePromo(p.id)}
                            className="pixel-btn bg-[#15803d] text-white px-2 py-1 font-pixel text-[8px]"
                          >
                            SALVAR
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-xs text-[#34d399]">R$ {p.price}</span>
                          <button
                            onClick={() => {
                              setEditingPromoId(p.id);
                              setPromoPriceInput(p.price);
                            }}
                            className="pixel-btn bg-[#2e1065] text-white px-2 py-1 font-pixel text-[7px]"
                          >
                            EDITAR PREÇO
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. COUPONS LIST */}
          {activeTab === 'COUPONS' && (
            <div className="space-y-2">
              <span className="font-pixel text-[9px] text-[#818cf8] block mb-2">
                CUPONS DO ORÁCULO EMITIDOS
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-[#312e81]">
                  <thead className="bg-[#1e1b4b] text-[#c7d2fe] font-pixel text-[8px]">
                    <tr>
                      <th className="p-2">CÓDIGO</th>
                      <th className="p-2">RECOMPENSA</th>
                      <th className="p-2">PORTADOR</th>
                      <th className="p-2">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1b4b]">
                    {(!metrics?.coupons || metrics.coupons.length === 0) && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400 font-mono text-xs">
                          Nenhum cupom resgatado ainda. Oráculo místico ativo para os visitantes.
                        </td>
                      </tr>
                    )}
                    {metrics?.coupons?.map((c: Coupon) => (
                      <tr key={c.id} className="hover:bg-[#18153e]">
                        <td className="p-2 font-pixel text-[8px] text-[#fbbf24]">{c.token}</td>
                        <td className="p-2 text-white">{c.rewardTitle}</td>
                        <td className="p-2 text-gray-400">{c.userName || c.phone}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 text-[9px] font-pixel ${
                            c.status === 'ATIVO' ? 'bg-[#065f46] text-[#a7f3d0]' : 'bg-[#7f1d1d] text-[#fca5a5]'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

