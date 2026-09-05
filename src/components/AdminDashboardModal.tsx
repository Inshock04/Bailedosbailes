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
  PixelWarning,
  PixelKey
} from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { PurchasedTicket, Promotion, Coupon, GuestListEntry } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  // Auth State
  const [adminToken, setAdminToken] = useState<string>(() => {
    return sessionStorage.getItem('cortez_admin_key') || '';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'METRICS' | 'CHECKIN' | 'TICKETS' | 'PROMOS' | 'GUESTLIST' | 'COUPONS'>('METRICS');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Check-in Scanner State
  const [scanToken, setScanToken] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);

  // Edit promo state
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoPriceInput, setPromoPriceInput] = useState<number>(0);

  const fetchMetrics = (tokenToUse?: string) => {
    const token = tokenToUse || adminToken;
    if (!token) return;

    setLoading(true);
    fetch('/api/admin/metrics', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          setAdminToken('');
          sessionStorage.removeItem('cortez_admin_key');
          throw new Error('Chave de acesso expirada ou inválida.');
        }
        return res.json();
      })
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setAuthError(err.message || 'Erro ao carregar dados administrativos.');
      });
  };

  useEffect(() => {
    if (isOpen && adminToken) {
      fetchMetrics();
    }
  }, [isOpen, adminToken]);

  if (!isOpen) return null;

  // Handle Admin Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Chave de administração inválida.');
      }

      const token = data.token;
      setAdminToken(token);
      sessionStorage.setItem('cortez_admin_key', token);
      setPasswordInput('');
      audioManager.playSuccess();
      fetchMetrics(token);
    } catch (err: any) {
      setAuthError(err.message || 'Erro de autenticação.');
      audioManager.playError();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    audioManager.playClick();
    setAdminToken('');
    sessionStorage.removeItem('cortez_admin_key');
    setMetrics(null);
  };

  // Mask sensitive tokens on screen unless toggled
  const formatTokenDisplay = (token: string) => {
    if (showTokens) return token;
    if (!token) return '••••••••';
    const parts = token.split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}-••••`;
    }
    return token.substring(0, 4) + '••••' + token.substring(token.length - 2);
  };

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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
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
                Ambiente Restrito & Monitoramento Seguro
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {adminToken && (
              <>
                <button
                  type="button"
                  onClick={() => setShowTokens(!showTokens)}
                  title="Ocultar ou exibir tokens reais"
                  className="px-2 py-1 bg-[#1a0b1f] hover:bg-[#2d1038] border border-[#a855f7] text-[#e9d5ff] font-pixel text-[8px] cursor-pointer"
                >
                  {showTokens ? '🔒 MASCARAR' : '👁️ REVELAR'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2 py-1 bg-[#450a0a] hover:bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] font-pixel text-[8px] cursor-pointer"
                >
                  SAIR
                </button>
              </>
            )}
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
        </div>

        {/* NOT AUTHENTICATED GATE */}
        {!adminToken ? (
          <div className="py-8 px-4 max-w-md mx-auto w-full text-center space-y-4">
            <div className="w-14 h-14 mx-auto bg-[#1a0812] border-2 border-[#ff3344] flex items-center justify-center shadow-[0_0_20px_rgba(255,51,68,0.5)]">
              <PixelKey size={26} color="#fbbf24" />
            </div>

            <div>
              <h3 className="font-pixel text-sm sm:text-base text-[#ff4455] font-bold">
                ACESSO RESTRITO À ORGANIZAÇÃO
              </h3>
              <p className="font-mono text-xs text-[#d1d5db] mt-1 leading-relaxed">
                Por motivos de segurança e proteção de dados, o painel de métricas e scanner requer a Chave Mestra do Hotel Cortez.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <input
                type="password"
                required
                autoFocus
                placeholder="Insira a Chave Mestra..."
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full bg-[#140810] border-2 border-[#5c1322] px-3 py-2.5 text-center text-sm text-white placeholder-gray-500 focus:border-[#ef4444] outline-hidden font-mono tracking-widest"
              />

              {authError && (
                <div className="p-2 bg-[#450a0a] border border-[#ef4444] text-[#fca5a5] text-xs font-mono">
                  ⚠ {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full pixel-btn bg-[#991b1b] hover:bg-[#b91c1c] active:bg-[#7f1d1d] text-white py-3 font-pixel text-[11px] tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{authLoading ? 'VERIFICANDO...' : 'DESBLOQUEAR PAINEL 🗝️'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <>
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-[#190915] border-2 border-[#dc2626] p-3 text-center">
                      <span className="font-pixel text-[9px] text-[#fca5a5] block">INGRESSOS EMITIDOS</span>
                      <span className="font-pixel text-xl sm:text-2xl text-white font-bold">{metrics?.totalTicketsSold || 0}</span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-1">Canal Oficial WhatsApp</span>
                    </div>

                    <div className="bg-[#0e1f13] border-2 border-[#16a34a] p-3 text-center">
                      <span className="font-pixel text-[9px] text-[#86efac] block">RECEITA ESTIMADA</span>
                      <span className="font-pixel text-xl sm:text-2xl text-[#4ade80] font-bold">R$ {metrics?.totalRevenue?.toFixed(2) || '0.00'}</span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-1">Vendas brutas</span>
                    </div>

                    <div className="bg-[#1f1708] border-2 border-[#d97706] p-3 text-center">
                      <span className="font-pixel text-[9px] text-[#fde047] block">LISTA VIP (RSVP)</span>
                      <span className="font-pixel text-xl sm:text-2xl text-[#fbbf24] font-bold">{metrics?.guestListCount || 0}</span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-1">Nomes cadastrados</span>
                    </div>

                    <div className="bg-[#150a24] border-2 border-[#9333ea] p-3 text-center">
                      <span className="font-pixel text-[9px] text-[#d8b4fe] block">CHECK-INS TOTAL</span>
                      <span className="font-pixel text-xl sm:text-2xl text-[#c084fc] font-bold">{metrics?.checkinsCount || 0}</span>
                      <span className="text-[10px] text-gray-400 font-mono block mt-1">Validados na portaria</span>
                    </div>
                  </div>

                  {/* Quota Progress */}
                  <div className="bg-[#130718] border border-[#3b1754] p-4">
                    <h3 className="font-pixel text-xs text-[#d8b4fe] mb-3 font-bold">OCUPAÇÃO POR CATEGORIA DE INGRESSO</h3>
                    <div className="space-y-3">
                      {metrics?.tickets?.map((t: any) => {
                        const pct = Math.round(((t.total - t.available) / t.total) * 100) || 0;
                        return (
                          <div key={t.id} className="space-y-1">
                            <div className="flex justify-between font-mono text-xs">
                              <span className="text-white font-bold">{t.name}</span>
                              <span className="text-[#a855f7]">{t.available} disponíveis / {t.total} total</span>
                            </div>
                            <div className="w-full bg-[#200d2e] h-2 border border-[#4c1d95]">
                              <div className="bg-[#dc2626] h-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. LIVE SCANNER & TOKEN VALIDATOR */}
              {activeTab === 'CHECKIN' && (
                <div className="space-y-4">
                  <div className="bg-[#0b1710] border-2 border-[#22c55e] p-4 text-center">
                    <span className="font-pixel text-xs text-[#86efac] block mb-1 font-bold">VALIDAÇÃO DE ENTRADA & RESGATE</span>
                    <p className="font-mono text-xs text-[#d1fae5] mb-3">
                      Insira o token do Ingresso, Cupom do Oráculo ou Lista VIP para validar a entrada.
                    </p>

                    <form onSubmit={handleVerifyToken} className="max-w-md mx-auto flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Digite ou escaneie o token..."
                        value={scanToken}
                        onChange={e => setScanToken(e.target.value)}
                        className="flex-1 bg-[#052e16] border-2 border-[#16a34a] px-3 py-2.5 text-xs sm:text-sm text-white focus:border-[#4ade80] outline-hidden font-mono"
                      />
                      <button
                        type="submit"
                        disabled={verifyLoading}
                        className="pixel-btn bg-[#15803d] hover:bg-[#16a34a] text-white px-4 py-2.5 font-pixel text-[10px] font-bold"
                      >
                        {verifyLoading ? 'BUSCANDO...' : 'VALIDAR'}
                      </button>
                    </form>

                    {verifyError && (
                      <div className="mt-3 p-2 bg-[#450a0a] border border-[#ef4444] text-[#fca5a5] text-xs font-mono">
                        ⚠ {verifyError}
                      </div>
                    )}
                  </div>

                  {/* Verification Card Result */}
                  {verifyResult && (
                    <div className="bg-[#160a22] border-2 border-[#9333ea] p-4 space-y-3 font-mono text-xs sm:text-sm">
                      <div className="flex justify-between items-center border-b border-[#3b1754] pb-2">
                        <span className="font-pixel text-[10px] text-[#c084fc] uppercase">TIPO: {verifyResult.type}</span>
                        <span className={`px-2 py-0.5 font-pixel text-[9px] font-bold ${
                          verifyResult.data.status === 'UTILIZADO' || verifyResult.data.status === 'CHECKED_IN'
                            ? 'bg-[#7f1d1d] text-[#fca5a5]'
                            : 'bg-[#15803d] text-[#bbf7d0]'
                        }`}>
                          STATUS: {verifyResult.data.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-left">
                        <p><span className="text-[#a855f7]">TITULAR:</span> <strong className="text-white">{verifyResult.data.name}</strong></p>
                        <p><span className="text-[#a855f7]">ITEM:</span> {verifyResult.data.item}</p>
                        <p><span className="text-[#a855f7]">TOKEN:</span> <code className="bg-[#24083a] text-[#fbbf24] px-1.5 py-0.5">{formatTokenDisplay(verifyResult.data.token)}</code></p>
                      </div>

                      {confirmSuccess ? (
                        <div className="p-2.5 bg-[#064e3b] border border-[#10b981] text-[#a7f3d0] font-pixel text-[10px] text-center font-bold">
                          ✓ {confirmSuccess}
                        </div>
                      ) : (
                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={handleConfirmCheckin}
                            disabled={verifyResult.data.status === 'UTILIZADO' || verifyResult.data.status === 'CHECKED_IN'}
                            className="flex-1 pixel-btn bg-[#16a34a] hover:bg-[#22c55e] disabled:bg-gray-800 disabled:opacity-50 text-white py-3 font-pixel text-[10px] font-bold"
                          >
                            CONFIRMAR ENTRADA / RESGATE 💀
                          </button>
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
                    RELAÇÃO DE INGRESSOS ADQUIRIDOS (TOKENS PROTEGIDOS)
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
                            <td className="p-2 font-pixel text-[8px] text-[#fbbf24]">{formatTokenDisplay(t.token)}</td>
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
                    LISTA VIP DE CONVIDADOS RSVP (TOKENS PROTEGIDOS)
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
                            <td className="p-2 font-pixel text-[8px] text-[#fde047]">{formatTokenDisplay(g.token)}</td>
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
                          <div className="flex items-center gap-2">
                            <span className="font-pixel text-[10px] text-white font-bold">{p.name}</span>
                            <span className={`px-1.5 py-0.5 text-[7px] font-pixel ${p.active ? 'bg-[#065f46] text-[#a7f3d0]' : 'bg-[#7f1d1d] text-[#fca5a5]'}`}>
                              {p.active ? 'ATIVO' : 'PAUSADO'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{p.description} ({p.quantity})</span>
                        </div>

                        <div>
                          {editingPromoId === p.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={promoPriceInput}
                                onChange={e => setPromoPriceInput(Number(e.target.value))}
                                className="w-20 bg-[#120718] border border-[#d8b4fe] p-1 text-xs text-white font-mono"
                              />
                              <button
                                onClick={() => handleSavePromo(p.id)}
                                className="pixel-btn bg-[#16a34a] text-white px-2 py-1 font-pixel text-[8px]"
                              >
                                SALVAR
                              </button>
                              <button
                                onClick={() => setEditingPromoId(null)}
                                className="pixel-btn bg-[#374151] text-white px-2 py-1 font-pixel text-[8px]"
                              >
                                CANCELAR
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
                    CUPONS DO ORÁCULO EMITIDOS (TOKENS PROTEGIDOS)
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
                            <td className="p-2 font-pixel text-[8px] text-[#fbbf24]">{formatTokenDisplay(c.token)}</td>
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
          </>
        )}

      </div>
    </div>
  );
};
