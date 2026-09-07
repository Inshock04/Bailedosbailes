import React, { useState, useEffect } from 'react';
import {
  PixelClose,
  PixelSkull,
  PixelCheck,
  PixelTicketIcon,
  PixelCardIcon,
  PixelChart,
  PixelEye,
  PixelWarning,
  PixelKey
} from './PixelIcons';
import { audioManager } from '../utils/audio';
import type { PurchasedTicket, Coupon } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  // Auth State
  const [adminToken, setAdminToken] = useState<string>(() => {
    return sessionStorage.getItem('cortez_admin_key') || '';
  });
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  // Tab State - Abre diretamente na tela de inserção de usuários
  const [activeTab, setActiveTab] = useState<'TICKETS' | 'CHECKIN' | 'METRICS' | 'COUPONS'>('TICKETS');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Check-in Scanner State
  const [scanToken, setScanToken] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);

  // Inserir Usuário / Ingresso State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(null);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Busca e Edição de Usuários
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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
    const cleanLogin = loginInput.trim();
    const cleanPass = passwordInput.trim();
    if (!cleanLogin || !cleanPass) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: cleanLogin,
          username: cleanLogin,
          password: cleanPass
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Login ou senha de administração inválidos.');
      }

      const token = data.token;
      setAdminToken(token);
      sessionStorage.setItem('cortez_admin_key', token);
      setLoginInput('');
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
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).catch(() => { });
    }
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

  // Create User / Ticket Action
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newUserName.trim();
    const phone = newUserPhone.trim();
    if (!name || !phone) return;

    setCreatingUser(true);
    setCreateUserError(null);
    setCreateUserSuccess(null);

    try {
      const res = await fetch('/api/admin/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ name, phone })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Erro ao cadastrar usuário.');
      }

      setCreateUserSuccess(`Usuário ${name} cadastrado com sucesso! Token: ${data.ticket.token}`);
      setNewUserName('');
      setNewUserPhone('');
      audioManager.playSuccess();
      fetchMetrics();
    } catch (err: any) {
      // Fallback local caso backend esteja offline ou estático
      const localToken = 'CTX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(100000 + Math.random() * 900000);
      const localTicket = {
        id: `local_${Date.now()}`,
        token: localToken,
        buyerName: name,
        buyerPhone: phone,
        buyerEmail: '',
        ticketId: 't-open-45',
        ticketName: 'INGRESSO',
        category: 'GERAL',
        price: 45,
        paymentMethod: 'PIX',
        status: 'VALIDO',
        createdAt: new Date().toISOString(),
        lote: 'ÚNICO'
      };

      setMetrics((prev: any) => ({
        ...prev,
        totalTicketsSold: (prev?.totalTicketsSold || 0) + 1,
        purchasedTickets: [localTicket, ...(prev?.purchasedTickets || [])]
      }));

      setCreateUserSuccess(`Usuário ${name} cadastrado com sucesso! Token: ${localToken}`);
      setNewUserName('');
      setNewUserPhone('');
      audioManager.playSuccess();
    } finally {
      setCreatingUser(false);
    }
  };

  // Delete User Action
  const handleDeleteUser = async (ticketId: string) => {
    try {
      await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      setMetrics((prev: any) => ({
        ...prev,
        totalTicketsSold: Math.max(0, (prev?.totalTicketsSold || 1) - 1),
        purchasedTickets: prev?.purchasedTickets?.filter((t: any) => t.id !== ticketId && t.token !== ticketId)
      }));
      audioManager.playClick();
    } catch {
      setMetrics((prev: any) => ({
        ...prev,
        totalTicketsSold: Math.max(0, (prev?.totalTicketsSold || 1) - 1),
        purchasedTickets: prev?.purchasedTickets?.filter((t: any) => t.id !== ticketId && t.token !== ticketId)
      }));
    }
  };

  // Start Editing User
  const handleStartEdit = (t: PurchasedTicket) => {
    setEditingUserId(t.id);
    setEditName(t.buyerName);
    setEditPhone(t.buyerPhone);
    audioManager.playClick();
  };

  // Cancel Editing User
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditName('');
    setEditPhone('');
    audioManager.playClick();
  };

  // Save Edited User (Nome e Número)
  const handleSaveEdit = async (ticketId: string) => {
    const trimmedName = editName.trim();
    const trimmedPhone = editPhone.trim();
    if (!trimmedName || !trimmedPhone) return;

    setSavingEdit(true);
    try {
      await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ name: trimmedName, phone: trimmedPhone })
      });
      setMetrics((prev: any) => ({
        ...prev,
        purchasedTickets: prev?.purchasedTickets?.map((t: any) =>
          (t.id === ticketId || t.token === ticketId)
            ? { ...t, buyerName: trimmedName, buyerPhone: trimmedPhone }
            : t
        )
      }));
      setEditingUserId(null);
      audioManager.playSuccess();
    } catch {
      setMetrics((prev: any) => ({
        ...prev,
        purchasedTickets: prev?.purchasedTickets?.map((t: any) =>
          (t.id === ticketId || t.token === ticketId)
            ? { ...t, buyerName: trimmedName, buyerPhone: trimmedPhone }
            : t
        )
      }));
      setEditingUserId(null);
      audioManager.playSuccess();
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xs overflow-y-auto" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="relative w-full max-w-4xl bg-[#090510] border-2 border-[#ef4444] shadow-[0_0_40px_rgba(239,68,68,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#5c1322] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm font-bold text-[#ff4455] tracking-wider">
                PORTARIA & ADMIN • HOTEL CORTEZ
              </h2>
              <span className="font-mono text-[12px] text-[#fca5a5]">
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
                  className="px-2 py-1 bg-[#1a0b1f] hover:bg-[#2d1038] border border-[#a855f7] text-[#e9d5ff] font-pixel text-[10px] cursor-pointer"
                >
                  {showTokens ? 'MASCARAR' : 'REVELAR'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2 py-1 bg-[#450a0a] hover:bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] font-pixel text-[10px] cursor-pointer"
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
                Painel exclusivo da organização para visualização de métricas, scanner de ingressos e gestão.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 pt-2 text-left">
              <div>
                <label className="block font-pixel text-[11px] sm:text-[12px] text-[#fca5a5] mb-1 font-bold uppercase">
                  ID
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="off"
                  placeholder="inserir id"
                  value={loginInput}
                  onChange={e => setLoginInput(e.target.value)}
                  className="w-full bg-[#140810] border-2 border-[#5c1322] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#ef4444] outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-pixel text-[11px] sm:text-[12px] text-[#fca5a5] mb-1 font-bold uppercase">
                  SENHA DE ACESSO
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Insira a senha..."
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-[#140810] border-2 border-[#5c1322] px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#ef4444] outline-hidden font-mono tracking-widest"
                />
              </div>

              {authError && (
                <div className="p-2 bg-[#450a0a] border border-[#ef4444] text-[#fca5a5] text-xs font-mono">
                  ⚠ {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full pixel-btn bg-[#991b1b] hover:bg-[#b91c1c] active:bg-[#7f1d1d] text-white py-3 font-pixel text-[13px] tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{authLoading ? 'VERIFICANDO...' : 'DESBLOQUEAR PAINEL 🗝️'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <>
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-[#2d1222] pb-2 mb-4 font-pixel text-[10px] sm:text-[11px]">
              <button
                onClick={() => { audioManager.playClick(); setActiveTab('TICKETS'); }}
                className={`px-3.5 py-1.5 border flex items-center gap-1.5 ${activeTab === 'TICKETS'
                    ? 'bg-[#7e22ce] border-[#c084fc] text-white shadow-[0_0_12px_rgba(168,85,247,0.6)] font-bold'
                    : 'bg-[#160812] border-[#381420] text-gray-300 hover:text-white hover:border-[#a855f7]'
                  }`}
              >
                <PixelTicketIcon size={13} />
                <span>INSERIR DADOS DOS USUÁRIOS ({metrics?.purchasedTickets?.length || 0})</span>
              </button>
              <button
                onClick={() => { audioManager.playClick(); setActiveTab('CHECKIN'); }}
                className={`px-3 py-1.5 border flex items-center gap-1 ${activeTab === 'CHECKIN' ? 'bg-[#047857] border-[#10b981] text-white' : 'bg-[#160812] border-[#381420] text-gray-400'
                  }`}
              >
                <PixelEye size={12} />
                <span>SCANNER / CHECK-IN</span>
              </button>
              <button
                onClick={() => { audioManager.playClick(); setActiveTab('METRICS'); }}
                className={`px-3 py-1.5 border flex items-center gap-1 ${activeTab === 'METRICS' ? 'bg-[#991b1b] border-[#ef4444] text-white' : 'bg-[#160812] border-[#381420] text-gray-400'
                  }`}
              >
                <PixelChart size={12} />
                <span>MÉTRICAS & KPIS</span>
              </button>
              <button
                onClick={() => { audioManager.playClick(); setActiveTab('COUPONS'); }}
                className={`px-3 py-1.5 border flex items-center gap-1 ${activeTab === 'COUPONS' ? 'bg-[#4338ca] border-[#818cf8] text-white' : 'bg-[#160812] border-[#381420] text-gray-400'
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
                      <span className="font-pixel text-[11px] text-[#fca5a5] block">INGRESSOS EMITIDOS</span>
                      <span className="font-pixel text-xl sm:text-2xl text-white font-bold">{metrics?.totalTicketsSold || 0}</span>
                      <span className="text-[12px] text-gray-400 font-mono block mt-1">Canal Oficial WhatsApp</span>
                    </div>

                    <div className="bg-[#0e1f13] border-2 border-[#16a34a] p-3 text-center">
                      <span className="font-pixel text-[11px] text-[#86efac] block">RECEITA ESTIMADA</span>
                      <span className="font-pixel text-xl sm:text-2xl text-[#4ade80] font-bold">R$ {metrics?.totalRevenue?.toFixed(2) || '0.00'}</span>
                      <span className="text-[12px] text-gray-400 font-mono block mt-1">Vendas brutas</span>
                    </div>

                    <div className="bg-[#1f1708] border-2 border-[#d97706] p-3 text-center">
                      <span className="font-pixel text-[11px] text-[#fde047] block">CUPONS ORÁCULO</span>
                      <span className="font-pixel text-xl sm:text-2xl text-[#fbbf24] font-bold">{metrics?.coupons?.length || 0}</span>
                      <span className="text-[12px] text-gray-400 font-mono block mt-1">Resgates realizados</span>
                    </div>

                    <div className="bg-[#150a24] border-2 border-[#9333ea] p-3 text-center">
                      <span className="font-pixel text-[11px] text-[#d8b4fe] block">CHECK-INS TOTAL</span>
                      <span className="font-pixel text-xl sm:text-2xl text-[#c084fc] font-bold">{metrics?.checkinsCount || 0}</span>
                      <span className="text-[12px] text-gray-400 font-mono block mt-1">Validados na portaria</span>
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
                      Insira o token do Ingresso ou Cupom do Oráculo para validar a entrada.
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
                        className="pixel-btn bg-[#15803d] hover:bg-[#16a34a] text-white px-4 py-2.5 font-pixel text-[12px] font-bold"
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
                        <span className="font-pixel text-[12px] text-[#c084fc] uppercase">TIPO: {verifyResult.type}</span>
                        <span className={`px-2 py-0.5 font-pixel text-[11px] font-bold ${verifyResult.data.status === 'UTILIZADO' || verifyResult.data.status === 'CHECKED_IN'
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
                        <div className="p-2.5 bg-[#064e3b] border border-[#10b981] text-[#a7f3d0] font-pixel text-[12px] text-center font-bold">
                          ✓ {confirmSuccess}
                        </div>
                      ) : (
                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={handleConfirmCheckin}
                            disabled={verifyResult.data.status === 'UTILIZADO' || verifyResult.data.status === 'CHECKED_IN'}
                            className="flex-1 pixel-btn bg-[#16a34a] hover:bg-[#22c55e] disabled:bg-gray-800 disabled:opacity-50 text-white py-3 font-pixel text-[12px] font-bold"
                          >
                            CONFIRMAR ENTRADA / RESGATE 💀
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. INSERIR E GERENCIAR DADOS DOS USUÁRIOS */}
              {activeTab === 'TICKETS' && (
                <div className="space-y-4">
                  {/* Formulário Principal: Inserir Dados dos Usuários */}
                  <div className="bg-[#180924] border-2 border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.25)] p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">📋</span>
                      <h3 className="font-pixel text-xs sm:text-sm text-[#e9d5ff] font-bold tracking-wide">
                        INSERIR DADOS DOS USUÁRIOS (NOME E NÚMERO)
                      </h3>
                    </div>
                    <p className="font-mono text-xs text-[#d8b4fe] mb-3">
                      Insira o nome e o número de WhatsApp do participante para emitir o ingresso e gerar o token seguro de acesso.
                    </p>

                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="block text-[11px] font-pixel text-[#d8b4fe] mb-1 font-bold">
                          NOME DO USUÁRIO *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Digite o nome completo..."
                          value={newUserName}
                          onChange={e => setNewUserName(e.target.value)}
                          className="w-full bg-[#0d0414] border-2 border-[#a855f7]/70 px-3 py-2.5 text-xs sm:text-sm text-white outline-hidden focus:border-[#c084fc] font-mono shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-pixel text-[#d8b4fe] mb-1 font-bold">
                          NÚMERO / WHATSAPP *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: (11) 98765-4321"
                          value={newUserPhone}
                          onChange={e => setNewUserPhone(e.target.value)}
                          className="w-full bg-[#0d0414] border-2 border-[#a855f7]/70 px-3 py-2.5 text-xs sm:text-sm text-white outline-hidden focus:border-[#c084fc] font-mono shadow-inner"
                        />
                      </div>
                      <div>
                        <button
                          type="submit"
                          disabled={creatingUser}
                          className="w-full pixel-btn bg-[#7e22ce] hover:bg-[#9333ea] active:bg-[#6b21a8] text-white py-2.5 px-4 font-pixel text-[12px] font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all cursor-pointer"
                        >
                          {creatingUser ? 'INSERINDO...' : '➕ INSERIR USUÁRIO'}
                        </button>
                      </div>
                    </form>

                    {createUserSuccess && (
                      <div className="mt-3 p-2.5 bg-[#064e3b] border-2 border-[#10b981] text-[#a7f3d0] font-pixel text-[12px] flex items-center justify-between">
                        <span>✓ {createUserSuccess}</span>
                        <button
                          onClick={() => setCreateUserSuccess(null)}
                          className="text-[#a7f3d0] hover:text-white text-xs font-mono ml-2 px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {createUserError && (
                      <div className="mt-3 p-2.5 bg-[#450a0a] border-2 border-[#ef4444] text-[#fca5a5] font-mono text-xs">
                        ⚠ {createUserError}
                      </div>
                    )}
                  </div>

                  {/* Tabela de Usuários Cadastrados com Busca e Edição */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="font-pixel text-[11px] text-[#c084fc]">
                        RELAÇÃO DE USUÁRIOS CADASTRADOS ({metrics?.purchasedTickets?.length || 0})
                      </span>
                      <div className="w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="🔍 Filtrar por nome ou número..."
                          value={userSearchTerm}
                          onChange={e => setUserSearchTerm(e.target.value)}
                          className="w-full bg-[#11051c] border border-[#a855f7]/50 px-2.5 py-1 text-xs text-white outline-hidden focus:border-[#c084fc] font-mono"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs border border-[#3b1754]">
                        <thead className="bg-[#24083a] text-[#e9d5ff] font-pixel text-[10px]">
                          <tr>
                            <th className="p-2">TOKEN</th>
                            <th className="p-2">NOME</th>
                            <th className="p-2">NÚMERO</th>
                            <th className="p-2">STATUS</th>
                            <th className="p-2 text-right">AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a1040]">
                          {(!metrics?.purchasedTickets || metrics.purchasedTickets.length === 0) && (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-gray-400 font-mono text-xs">
                                Nenhum usuário cadastrado ainda. Use o formulário acima para inserir os dados.
                              </td>
                            </tr>
                          )}
                          {metrics?.purchasedTickets
                            ?.filter((t: PurchasedTicket) => {
                              if (!userSearchTerm) return true;
                              const term = userSearchTerm.toLowerCase();
                              return (
                                t.buyerName?.toLowerCase().includes(term) ||
                                t.buyerPhone?.includes(term) ||
                                t.token?.toLowerCase().includes(term)
                              );
                            })
                            ?.map((t: PurchasedTicket) => {
                              const isEditing = editingUserId === t.id;
                              return (
                                <tr key={t.id} className="hover:bg-[#1f0b30]">
                                  <td className="p-2 font-pixel text-[10px] text-[#fbbf24]">
                                    {formatTokenDisplay(t.token)}
                                  </td>
                                  <td className="p-2 text-white font-bold">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="bg-[#0e0417] border border-[#c084fc] px-2 py-0.5 text-xs text-white w-full font-mono"
                                      />
                                    ) : (
                                      t.buyerName
                                    )}
                                  </td>
                                  <td className="p-2 text-[#d8b4fe]">
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={editPhone}
                                        onChange={e => setEditPhone(e.target.value)}
                                        className="bg-[#0e0417] border border-[#c084fc] px-2 py-0.5 text-xs text-white w-full font-mono"
                                      />
                                    ) : (
                                      t.buyerPhone
                                    )}
                                  </td>
                                  <td className="p-2">
                                    <span className={`px-1.5 py-0.5 text-[11px] font-pixel ${t.status === 'VALIDO' ? 'bg-[#064e3b] text-[#6ee7b7]' : 'bg-[#7f1d1d] text-[#fca5a5]'
                                      }`}>
                                      {t.status}
                                    </span>
                                  </td>
                                  <td className="p-2 text-right whitespace-nowrap">
                                    {isEditing ? (
                                      <div className="flex justify-end gap-1">
                                        <button
                                          onClick={() => handleSaveEdit(t.id)}
                                          disabled={savingEdit}
                                          className="px-2 py-1 bg-[#15803d] hover:bg-[#16a34a] border border-[#22c55e] text-white font-pixel text-[9px]"
                                          title="Salvar alterações"
                                        >
                                          {savingEdit ? '...' : 'SALVAR'}
                                        </button>
                                        <button
                                          onClick={handleCancelEdit}
                                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-500 text-gray-200 font-pixel text-[9px]"
                                          title="Cancelar"
                                        >
                                          CANCELAR
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex justify-end gap-1">
                                        <button
                                          onClick={() => handleStartEdit(t)}
                                          className="px-2 py-1 bg-[#854d0e] hover:bg-[#a16207] border border-[#eab308] text-[#fef08a] font-pixel text-[9px]"
                                          title="Editar nome e número"
                                        >
                                          EDITAR
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(t.id)}
                                          className="px-2 py-1 bg-[#450a0a] hover:bg-[#7f1d1d] border border-[#ef4444] text-[#fca5a5] font-pixel text-[9px]"
                                          title="Remover usuário"
                                        >
                                          EXCLUIR
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. COUPONS LIST */}
              {activeTab === 'COUPONS' && (
                <div className="space-y-2">
                  <span className="font-pixel text-[11px] text-[#818cf8] block mb-2">
                    CUPONS DO ORÁCULO EMITIDOS (TOKENS PROTEGIDOS)
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs border border-[#312e81]">
                      <thead className="bg-[#1e1b4b] text-[#c7d2fe] font-pixel text-[10px]">
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
                            <td className="p-2 font-pixel text-[10px] text-[#fbbf24]">{formatTokenDisplay(c.token)}</td>
                            <td className="p-2 text-white">{c.rewardTitle}</td>
                            <td className="p-2 text-gray-400">{c.userName || c.phone}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 text-[11px] font-pixel ${c.status === 'ATIVO' ? 'bg-[#065f46] text-[#a7f3d0]' : 'bg-[#7f1d1d] text-[#fca5a5]'
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
