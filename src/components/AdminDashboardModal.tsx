import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
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

const QR_CANVAS_SIZE = 1024;
const QR_QUIET_ZONE = 4;

function isFinderModule(row: number, column: number, size: number): boolean {
  return (row < 7 && column < 7)
    || (row < 7 && column >= size - 7)
    || (row >= size - 7 && column < 7);
}

function drawFinderPattern(context: CanvasRenderingContext2D, x: number, y: number, moduleSize: number): void {
  const patternSize = moduleSize * 7;
  context.fillStyle = '#120b08';
  context.beginPath();
  context.roundRect(x, y, patternSize, patternSize, moduleSize * 0.35);
  context.fill();

  context.fillStyle = '#ffffff';
  context.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);

  context.fillStyle = '#120b08';
  context.beginPath();
  context.roundRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3, moduleSize * 0.18);
  context.fill();
}

function drawJackOLantern(context: CanvasRenderingContext2D, centerX: number, centerY: number, size: number): void {
  const pumpkinWidth = size * 0.62;
  const pumpkinHeight = size * 0.48;
  const pumpkinTop = centerY - pumpkinHeight * 0.3;

  context.fillStyle = '#5b2a0a';
  context.fillRect(centerX - size * 0.05, pumpkinTop - size * 0.16, size * 0.1, size * 0.18);
  context.fillStyle = '#d97706';
  context.beginPath();
  context.ellipse(centerX, centerY, pumpkinWidth * 0.5, pumpkinHeight * 0.5, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#f59e0b';
  context.beginPath();
  context.ellipse(centerX - pumpkinWidth * 0.2, centerY, pumpkinWidth * 0.22, pumpkinHeight * 0.45, 0, 0, Math.PI * 2);
  context.ellipse(centerX + pumpkinWidth * 0.2, centerY, pumpkinWidth * 0.22, pumpkinHeight * 0.45, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#1a0f0a';
  context.beginPath();
  context.moveTo(centerX - pumpkinWidth * 0.3, centerY - pumpkinHeight * 0.08);
  context.lineTo(centerX - pumpkinWidth * 0.12, centerY - pumpkinHeight * 0.2);
  context.lineTo(centerX - pumpkinWidth * 0.05, centerY - pumpkinHeight * 0.02);
  context.closePath();
  context.moveTo(centerX + pumpkinWidth * 0.3, centerY - pumpkinHeight * 0.08);
  context.lineTo(centerX + pumpkinWidth * 0.12, centerY - pumpkinHeight * 0.2);
  context.lineTo(centerX + pumpkinWidth * 0.05, centerY - pumpkinHeight * 0.02);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(centerX - pumpkinWidth * 0.28, centerY + pumpkinHeight * 0.16);
  context.lineTo(centerX - pumpkinWidth * 0.12, centerY + pumpkinHeight * 0.08);
  context.lineTo(centerX, centerY + pumpkinHeight * 0.18);
  context.lineTo(centerX + pumpkinWidth * 0.12, centerY + pumpkinHeight * 0.08);
  context.lineTo(centerX + pumpkinWidth * 0.28, centerY + pumpkinHeight * 0.16);
  context.lineTo(centerX + pumpkinWidth * 0.12, centerY + pumpkinHeight * 0.3);
  context.lineTo(centerX, centerY + pumpkinHeight * 0.22);
  context.lineTo(centerX - pumpkinWidth * 0.12, centerY + pumpkinHeight * 0.3);
  context.closePath();
  context.fill();
}

async function generateHalloweenTicketQr(token: string): Promise<string> {
  const qr = QRCode.create(token, { errorCorrectionLevel: 'H' });
  const moduleCount = qr.modules.size;
  const moduleSize = Math.floor(QR_CANVAS_SIZE / (moduleCount + QR_QUIET_ZONE * 2));
  const qrSize = moduleSize * (moduleCount + QR_QUIET_ZONE * 2);
  const offset = Math.floor((QR_CANVAS_SIZE - qrSize) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = QR_CANVAS_SIZE;
  canvas.height = QR_CANVAS_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível preparar o QR Code.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE);
  context.fillStyle = '#120b08';
  const centerStart = Math.floor((moduleCount - 9) / 2);

  for (let row = 0; row < moduleCount; row += 1) {
    for (let column = 0; column < moduleCount; column += 1) {
      const inCenter = row >= centerStart && row < centerStart + 9 && column >= centerStart && column < centerStart + 9;
      if (!qr.modules.get(row, column) || isFinderModule(row, column, moduleCount) || inCenter) continue;
      const x = offset + (column + QR_QUIET_ZONE) * moduleSize;
      const y = offset + (row + QR_QUIET_ZONE) * moduleSize;
      context.beginPath();
      context.roundRect(x + moduleSize * 0.08, y + moduleSize * 0.08, moduleSize * 0.84, moduleSize * 0.84, moduleSize * 0.22);
      context.fill();
    }
  }

  drawFinderPattern(context, offset + QR_QUIET_ZONE * moduleSize, offset + QR_QUIET_ZONE * moduleSize, moduleSize);
  drawFinderPattern(context, offset + (QR_QUIET_ZONE + moduleCount - 7) * moduleSize, offset + QR_QUIET_ZONE * moduleSize, moduleSize);
  drawFinderPattern(context, offset + QR_QUIET_ZONE * moduleSize, offset + (QR_QUIET_ZONE + moduleCount - 7) * moduleSize, moduleSize);

  const centerX = offset + (QR_QUIET_ZONE + centerStart + 4.5) * moduleSize;
  const centerY = centerX;
  const badgeSize = moduleSize * 8.3;
  context.fillStyle = '#ffffff';
  context.beginPath();
  context.roundRect(centerX - badgeSize / 2, centerY - badgeSize / 2, badgeSize, badgeSize, moduleSize * 0.7);
  context.fill();
  context.strokeStyle = '#d97706';
  context.lineWidth = Math.max(3, moduleSize * 0.14);
  context.stroke();
  drawJackOLantern(context, centerX, centerY, moduleSize * 7.2);

  return canvas.toDataURL('image/png');
}

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
  const [showPassword, setShowPassword] = useState(false);
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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Inserir Usuário / Ingresso State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(null);
  const [createUserError, setCreateUserError] = useState<string | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<{ code: string; token: string; name: string; qrDataUrl: string } | null>(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setScannerOpen(false);
  };

  const startScanner = async () => {
    setScannerError(null);
    const BarcodeDetectorConstructor = (window as Window & {
      BarcodeDetector?: new (options?: { formats?: string[] }) => {
        detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
      };
    }).BarcodeDetector;
    if (!BarcodeDetectorConstructor) {
      setScannerError('Este navegador não oferece leitura automática. Digite o token abaixo.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      setScannerOpen(true);
      const detector = new BarcodeDetectorConstructor({ formats: ['qr_code'] });
      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;
        const codes = await detector.detect(videoRef.current);
        if (codes[0]?.rawValue) {
          setScanToken(codes[0].rawValue.trim());
          stopScanner();
          return;
        }
        window.requestAnimationFrame(scan);
      };
      await new Promise<void>(resolve => window.setTimeout(resolve, 100));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        scan();
      }
    } catch {
      stopScanner();
      setScannerError('Não foi possível abrir a câmera. Verifique a permissão e use HTTPS.');
    }
  };

  // Busca e Edição de Usuários
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<PurchasedTicket[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const term = userSearchTerm.trim();
    if (!term || !adminToken) {
      setSearchedUsers(null);
      setSearchLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/admin/tickets/search?q=${encodeURIComponent(term)}`, {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) throw new Error('Não foi possível buscar os usuários.');
        const data = await response.json();
        setSearchedUsers(data.tickets || []);
      } catch {
        setSearchedUsers([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [userSearchTerm, adminToken]);

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

      const token = data.accessToken || data.token;
      if (!token) {
        throw new Error('O servidor não retornou um token de sessão.');
      }
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
          token: scanToken.trim(),
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
        console.error('[Tickets] Falha ao cadastrar ingresso', { operation: 'POST /api/admin/tickets/create', status: res.status, response: data });
        throw new Error(data?.error || 'Erro ao cadastrar usuário.');
      }

      const code = data.ticket.codigo || data.ticket.publicCode;
      const qrDataUrl = await generateHalloweenTicketQr(data.ticket.token);
      setGeneratedTicket({ code, token: data.ticket.token, name, qrDataUrl });
      setCreateUserSuccess(`Usuário ${name} cadastrado com sucesso! Código público: ${data.ticket.codigo || data.ticket.publicCode}`);
      setNewUserName('');
      setNewUserPhone('');
      audioManager.playSuccess();
      fetchMetrics();
    } catch (err: any) {
      setCreateUserError(err.message || 'Não foi possível cadastrar o ingresso.');
      audioManager.playError();
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Insira a senha..."
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="w-full bg-[#140810] border-2 border-[#5c1322] px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:border-[#ef4444] outline-hidden font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(current => !current)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#fca5a5] hover:text-white cursor-pointer"
                  >
                    <PixelEye size={15} />
                  </button>
                </div>
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
                <span>{authLoading ? 'VERIFICANDO...' : 'DESBLOQUEAR PAINEL'}</span>
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

                    <div className="max-w-md mx-auto mt-3 flex gap-2">
                      {!scannerOpen ? (
                        <button type="button" onClick={startScanner} className="flex-1 pixel-btn bg-[#065f46] hover:bg-[#047857] text-white py-3 font-pixel text-[12px] font-bold">
                          ABRIR CÂMERA QR
                        </button>
                      ) : (
                        <button type="button" onClick={stopScanner} className="flex-1 pixel-btn bg-[#7f1d1d] hover:bg-[#991b1b] text-white py-3 font-pixel text-[12px] font-bold">
                          FECHAR CÂMERA
                        </button>
                      )}
                    </div>

                    {scannerOpen && (
                      <div className="max-w-md mx-auto mt-3 border-2 border-[#10b981] bg-black p-2">
                        <video ref={videoRef} className="w-full aspect-square object-cover" muted playsInline />
                        <p className="font-mono text-[11px] text-[#a7f3d0] mt-2">Aponte a câmera para o QR Code.</p>
                      </div>
                    )}

                    {scannerError && (
                      <div className="mt-3 p-2 bg-[#3b1708] border border-[#f59e0b] text-[#fde68a] text-xs font-mono">
                        {scannerError}
                      </div>
                    )}

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
                        <span className="font-pixel text-[12px] text-[#c084fc] uppercase">{verifyResult.data.status === 'VALIDO' ? '🟢 INGRESSO VÁLIDO' : verifyResult.data.status === 'UTILIZADO' ? '🟠 INGRESSO JÁ UTILIZADO' : '🔴 INGRESSO CANCELADO'}</span>
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
                        <p><span className="text-[#a855f7]">CÓDIGO:</span> <code className="bg-[#24083a] text-[#fbbf24] px-1.5 py-0.5">{verifyResult.data.code || verifyResult.data.token}</code></p>
                        {verifyResult.data.usedAt && <p><span className="text-[#a855f7]">UTILIZADO EM:</span> {new Date(verifyResult.data.usedAt).toLocaleString('pt-BR')}</p>}
                      </div>

                      {confirmSuccess ? (
                        <div className="p-2.5 bg-[#064e3b] border border-[#10b981] text-[#a7f3d0] font-pixel text-[12px] text-center font-bold">
                          ✓ {confirmSuccess}
                        </div>
                      ) : (
                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={handleConfirmCheckin}
                            disabled={verifyResult.data.status === 'UTILIZADO' || verifyResult.data.status === 'CHECKED_IN' || verifyResult.data.status === 'CANCELADO'}
                            className="flex-1 pixel-btn bg-[#16a34a] hover:bg-[#22c55e] disabled:bg-gray-800 disabled:opacity-50 text-white py-3 font-pixel text-[12px] font-bold"
                          >
                            CONFIRMAR ENTRADA / RESGATE 💀
                          </button>
                          <button
                            onClick={() => { setScanToken(''); setVerifyResult(null); setVerifyError(null); setConfirmSuccess(null); startScanner(); }}
                            className="px-3 py-3 border border-[#10b981] text-[#a7f3d0] font-pixel text-[11px] font-bold"
                          >
                            PRÓXIMO QR
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
                    {generatedTicket && (
                      <div className="mt-3 p-4 bg-[#071b12] border-2 border-[#22c55e] flex flex-col items-center gap-3 text-center">
                        <p className="font-pixel text-[#4ade80] text-sm">INGRESSO CRIADO COM SUCESSO</p>
                        <p className="font-mono text-xs text-[#bbf7d0]">Nome: <strong>{generatedTicket.name}</strong></p>
                        <div className="p-2 bg-white border-2 border-[#d97706] shadow-[0_0_18px_rgba(245,158,11,0.35)]">
                          <img src={generatedTicket.qrDataUrl} alt={`QR Code do ingresso ${generatedTicket.code}`} className="w-56 h-56 sm:w-64 sm:h-64 max-w-full" />
                        </div>
                        <p className="font-pixel text-lg sm:text-xl text-[#fbbf24] tracking-widest">{generatedTicket.code}</p>
                        <p className="font-mono text-xs text-[#86efac]">QR Code seguro, pronto para leitura.</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <a
                              href={generatedTicket.qrDataUrl}
                              download={`${generatedTicket.code}-QRCode.png`}
                              className="px-4 py-2.5 bg-[#15803d] border border-[#4ade80] text-white font-pixel text-xs shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                            >
                              BAIXAR QR CODE
                            </a>
                            <button type="button" onClick={() => setGeneratedTicket(null)} className="px-4 py-2.5 border border-[#22c55e] text-[#bbf7d0] font-pixel text-xs">FECHAR QR</button>
                          </div>
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
                        RELAÇÃO DE USUÁRIOS CADASTRADOS ({(searchedUsers || metrics?.purchasedTickets || []).length})
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
                          {searchLoading && (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-gray-400 font-mono text-xs">
                                BUSCANDO...
                              </td>
                            </tr>
                          )}
                          {!searchLoading && (searchedUsers || metrics?.purchasedTickets || []).length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-gray-400 font-mono text-xs">
                                Nenhum usuário cadastrado ainda. Use o formulário acima para inserir os dados.
                              </td>
                            </tr>
                          )}
                          {!searchLoading && (searchedUsers || metrics?.purchasedTickets || [])
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
