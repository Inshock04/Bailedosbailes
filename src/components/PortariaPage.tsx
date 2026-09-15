import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ShieldCheck, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  LogOut, 
  Search, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  UserCheck,
  RefreshCw,
  Lock
} from 'lucide-react';

interface VerifiedTicket {
  id: string;
  codigo: string;
  nome: string;
  telefone?: string;
  item?: string;
  categoria?: string;
  status: 'VALIDO' | 'UTILIZADO' | 'CANCELADO' | 'BLOQUEADO';
  criadoEm?: string;
  usadoEm?: string;
  validadoPor?: string;
  qrToken?: string;
}

// Web Audio API Synthesizer for instant feedback sounds
class SoundFx {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext muted/unsupported
    }
  }

  playConfirmed() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  }

  playError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }
}

const sfx = new SoundFx();

export const PortariaPage: React.FC = () => {
  // Auth state
  const [token, setToken] = useState<string>(() => {
    return sessionStorage.getItem('cortez_portaria_token') || sessionStorage.getItem('cortez_admin_key') || '';
  });
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Ticket inspection & action state
  const [inspecting, setInspecting] = useState(false);
  const [ticket, setTicket] = useState<VerifiedTicket | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Stats in current session
  const [confirmedCount, setConfirmedCount] = useState<number>(() => {
    const saved = sessionStorage.getItem('cortez_portaria_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const html5QrRef = useRef<Html5Qrcode | null>(null);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: loginUser.trim(), password: loginPass.trim() }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Credenciais da portaria incorretas.');
      }

      const authToken = data.token;
      sessionStorage.setItem('cortez_portaria_token', authToken);
      setToken(authToken);
      sfx.playSuccess();
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao realizar login.');
      sfx.playError();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cortez_portaria_token');
    setToken('');
    stopScanner();
    setTicket(null);
  };

  // Helper to extract clean token from URL or raw string
  const parseTokenFromInput = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.includes('/ingresso/')) {
      const part = trimmed.split('/ingresso/')[1];
      return (part || '').split('/')[0].split('?')[0].trim();
    }
    return trimmed;
  };

  // Verify ticket with backend
  const verifyToken = async (rawInput: string) => {
    const clean = parseTokenFromInput(rawInput);
    if (!clean) return;

    setInspecting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/portaria/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qrToken: clean })
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || 'Não foi possível verificar este ingresso.');
      }

      if (!json.found || !json.data) {
        throw new Error('Ingresso não encontrado ou inválido.');
      }

      const loadedTicket: VerifiedTicket = json.data;
      setTicket(loadedTicket);

      if (loadedTicket.status === 'VALIDO') {
        sfx.playSuccess();
      } else {
        sfx.playError();
      }

      // Stop camera while inspecting ticket to avoid duplicate scan triggers
      if (isScanning) {
        stopScanner();
      }
    } catch (err: any) {
      setActionError(err.message || 'Erro ao consultar ingresso.');
      setTicket(null);
      sfx.playError();
    } finally {
      setInspecting(false);
    }
  };

  // Confirm Admission
  const handleConfirmAdmission = async () => {
    if (!ticket) return;

    setConfirming(true);
    setActionError(null);

    try {
      const res = await fetch('/api/portaria/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ qrToken: ticket.qrToken || ticket.codigo })
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || 'Erro ao confirmar entrada.');
      }

      // Successful confirmation
      sfx.playConfirmed();
      setActionSuccess(`ENTRADA CONFIRMADA: ${ticket.nome.toUpperCase()} (${ticket.codigo})`);
      setTicket((prev) => prev ? { ...prev, status: 'UTILIZADO', usadoEm: new Date().toISOString(), validadoPor: 'portaria' } : null);

      const newCount = confirmedCount + 1;
      setConfirmedCount(newCount);
      sessionStorage.setItem('cortez_portaria_count', newCount.toString());
    } catch (err: any) {
      setActionError(err.message || 'Falha ao confirmar entrada.');
      sfx.playError();
    } finally {
      setConfirming(false);
    }
  };

  // Reset to scan next
  const handleNextScan = () => {
    setTicket(null);
    setActionError(null);
    setActionSuccess(null);
    setManualCode('');
    startScanner();
  };

  // Start Camera QR Scanner
  const startScanner = async () => {
    setScannerError(null);
    setIsScanning(true);

    // Give DOM a tick to render scanner div
    setTimeout(async () => {
      try {
        if (!html5QrRef.current) {
          html5QrRef.current = new Html5Qrcode('portaria-camera-reader');
        }

        await html5QrRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success QR read
            verifyToken(decodedText);
          },
          () => {
            // Ignore scan parse errors per frame
          }
        );
      } catch (err: any) {
        console.error('Falha ao abrir câmera:', err);
        setScannerError('Não foi possível acessar a câmera. Verifique as permissões do navegador ou digite o código manualmente.');
        setIsScanning(false);
      }
    }, 100);
  };

  // Stop Camera Scanner
  const stopScanner = async () => {
    if (html5QrRef.current && isScanning) {
      try {
        await html5QrRef.current.stop();
      } catch (e) {
        console.warn('Erro ao fechar scanner:', e);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrRef.current && html5QrRef.current.isScanning) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-[#070309] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(185,28,28,0.2),transparent_70%)] pointer-events-none" />

        <div className="max-w-sm w-full bg-[#120512] border-2 border-[#5b162f] rounded-2xl p-6 shadow-[0_0_50px_rgba(153,27,27,0.3)] relative z-10">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#3b0d1e] border-2 border-[#dc2626] rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <Lock className="text-[#fca5a5]" size={26} />
            </div>
            <h1 className="font-pixel text-base text-white tracking-wider uppercase">PORTARIA OFICIAL</h1>
            <p className="text-xs text-[#f87171] font-mono mt-1">HOTEL CORTEZ HALLOWEEN PARTY</p>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">Validação de Ingressos & Controle de Acesso</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-pixel text-[#fca5a5] uppercase mb-1">
                USUÁRIO / IDENTIFICAÇÃO
              </label>
              <input
                type="text"
                required
                placeholder="Digite seu usuário..."
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full bg-[#1b071a] border border-[#58172f] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:border-[#dc2626] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-pixel text-[#fca5a5] uppercase mb-1">
                SENHA DE ACESSO
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full bg-[#1b071a] border border-[#58172f] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:border-[#dc2626] outline-hidden"
              />
            </div>

            {authError && (
              <div className="p-3 bg-[#380b15] border border-[#ef4444] rounded-lg text-xs font-mono text-[#fca5a5] flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0 text-[#ef4444]" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#b91c1c] hover:bg-[#dc2626] active:bg-[#991b1b] text-white font-pixel text-xs tracking-wider uppercase rounded-lg border border-[#ef4444] shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer font-bold"
            >
              {authLoading ? 'CONECTANDO...' : 'ENTRAR NA PORTARIA'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#2d0e1b] text-center">
            <a href="/" className="text-[11px] font-mono text-gray-500 hover:text-gray-300">
              ← Voltar ao site oficial
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN PORTARIA INTERFACE
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070208] text-gray-100 flex flex-col font-sans selection:bg-[#dc2626] selection:text-white">
      {/* Portaria Header */}
      <header className="bg-[#120512] border-b border-[#3b1225] px-4 py-3 sticky top-0 z-30 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3b0c1d] border border-[#dc2626] flex items-center justify-center">
              <ShieldCheck className="text-[#fca5a5]" size={18} />
            </div>
            <div>
              <h1 className="font-pixel text-xs text-white tracking-wider leading-none">PORTARIA CORTEZ</h1>
              <span className="text-[10px] font-mono text-[#f87171]">CONTROLE DE ACESSO AO VIVO</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !audioEnabled;
                setAudioEnabled(next);
                sfx.enabled = next;
              }}
              className={`p-2 rounded-lg border transition-colors ${
                audioEnabled
                  ? 'bg-[#1e0717] border-[#591b33] text-[#4ade80]'
                  : 'bg-[#180612] border-[#381120] text-gray-500'
              }`}
              title={audioEnabled ? 'Som ativado' : 'Som desativado'}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-[#2b0816] border border-[#58172e] text-[#fca5a5] hover:text-white hover:bg-[#450d24] transition-colors"
              title="Encerrar sessão"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Portaria Body */}
      <main className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col space-y-4">
        {/* Top Session Counter Banner */}
        <div className="bg-[#160616] border border-[#3b1227] rounded-xl p-3 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-[#4ade80]" />
            <span className="text-xs font-pixel text-gray-300">ENTRADAS HOJE:</span>
          </div>
          <span className="font-pixel text-lg text-[#4ade80] font-bold">
            {confirmedCount}
          </span>
        </div>

        {/* Action Status Success Alert */}
        {actionSuccess && (
          <div className="bg-[#052e16] border-2 border-[#22c55e] rounded-xl p-4 text-center shadow-[0_0_25px_rgba(34,197,94,0.3)] animate-pulse">
            <CheckCircle2 size={32} className="text-[#4ade80] mx-auto mb-2" />
            <h2 className="font-pixel text-sm text-[#4ade80] font-bold">{actionSuccess}</h2>
            <button
              onClick={handleNextScan}
              className="mt-3 w-full py-2.5 bg-[#15803d] hover:bg-[#16a34a] text-white font-pixel text-xs rounded-lg border border-[#4ade80] transition-all flex items-center justify-center gap-2"
            >
              <span>ESCANEAR PRÓXIMO</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Action Status Error Alert */}
        {actionError && !ticket && (
          <div className="bg-[#3b0815] border-2 border-[#ef4444] rounded-xl p-4 text-center">
            <XCircle size={32} className="text-[#fca5a5] mx-auto mb-2" />
            <h2 className="font-pixel text-xs text-[#fca5a5] font-bold">ATENÇÃO</h2>
            <p className="text-xs text-gray-200 font-mono mt-1">{actionError}</p>
            <button
              onClick={() => setActionError(null)}
              className="mt-3 py-1.5 px-4 bg-[#7f1d1d] hover:bg-[#991b1b] text-white font-pixel text-[10px] rounded border border-[#ef4444]"
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TICKET INSPECTION & ADMISSION CONFIRMATION CARD */}
        {/* ---------------------------------------------------- */}
        {ticket && (
          <div className="bg-[#140513] border-2 border-[#54172f] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in">
            {/* Status Header */}
            <div className={`p-4 text-center border-b ${
              ticket.status === 'VALIDO'
                ? 'bg-[#052e16] border-[#16a34a]'
                : ticket.status === 'UTILIZADO'
                ? 'bg-[#450a0a] border-[#dc2626]'
                : 'bg-[#431407] border-[#ea580c]'
            }`}>
              {ticket.status === 'VALIDO' && (
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14532d] text-[#86efac] font-pixel text-xs border border-[#22c55e]">
                    <CheckCircle2 size={16} />
                    <span>AUTORIZADO PARA ENTRADA</span>
                  </div>
                  <h2 className="font-pixel text-base sm:text-lg text-white font-bold mt-2">
                    INGRESSO VÁLIDO
                  </h2>
                </div>
              )}

              {ticket.status === 'UTILIZADO' && (
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7f1d1d] text-[#fca5a5] font-pixel text-xs border border-[#ef4444]">
                    <AlertTriangle size={16} />
                    <span>JÁ REGISTRADO NA PORTARIA</span>
                  </div>
                  <h2 className="font-pixel text-base sm:text-lg text-white font-bold mt-2">
                    ENTRADA JÁ UTILIZADA
                  </h2>
                  {ticket.usadoEm && (
                    <p className="text-xs font-mono text-gray-300">
                      Entrada registrada em: {new Date(ticket.usadoEm).toLocaleString('pt-BR')}
                    </p>
                  )}
                  {ticket.validadoPor && (
                    <p className="text-[11px] font-mono text-gray-400">
                      Validado por: {ticket.validadoPor}
                    </p>
                  )}
                </div>
              )}

              {(ticket.status === 'CANCELADO' || ticket.status === 'BLOQUEADO') && (
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7c2d12] text-[#fdba74] font-pixel text-xs border border-[#f97316]">
                    <XCircle size={16} />
                    <span>ACESSO RECUSADO</span>
                  </div>
                  <h2 className="font-pixel text-base sm:text-lg text-white font-bold mt-2">
                    INGRESSO {ticket.status}
                  </h2>
                </div>
              )}
            </div>

            {/* Ticket Attendee Details */}
            <div className="p-4 space-y-3">
              <div className="bg-[#1b081a] p-3 rounded-xl border border-[#3e1428]">
                <span className="text-[10px] font-mono text-gray-400 block uppercase">NOME DO CONVIDADO</span>
                <span className="text-lg font-bold text-white block capitalize">{ticket.nome}</span>
                {ticket.telefone && (
                  <span className="text-xs font-mono text-[#d8b4fe] block mt-0.5">{ticket.telefone}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#1b081a] p-2.5 rounded-xl border border-[#3e1428]">
                  <span className="text-[10px] font-mono text-gray-400 block">CÓDIGO AHS</span>
                  <span className="font-pixel text-sm text-[#fbbf24] font-bold">{ticket.codigo}</span>
                </div>
                <div className="bg-[#1b081a] p-2.5 rounded-xl border border-[#3e1428]">
                  <span className="text-[10px] font-mono text-gray-400 block">TIPO</span>
                  <span className="font-pixel text-xs text-[#86efac]">{ticket.item || 'INGRESSO OPEN'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {ticket.status === 'VALIDO' && (
                  <button
                    onClick={handleConfirmAdmission}
                    disabled={confirming}
                    className="w-full py-4 bg-[#15803d] hover:bg-[#16a34a] active:bg-[#14532d] text-white font-pixel text-sm tracking-wider font-bold rounded-xl border-2 border-[#4ade80] shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {confirming ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>REGISTRANDO ENTRADA...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        <span>CONFIRMAR ENTRADA</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleNextScan}
                  className="w-full py-3 bg-[#240a1c] hover:bg-[#340f28] text-gray-300 font-pixel text-xs tracking-wider rounded-xl border border-[#48162c] transition-all flex items-center justify-center gap-2"
                >
                  <span>ESCANEAR OUTRO INGRESSO</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SCANNER & CAMERA CONTROLS */}
        {/* ---------------------------------------------------- */}
        {!ticket && (
          <div className="bg-[#130612] border-2 border-[#3b1226] rounded-2xl p-4 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-[#fca5a5]">LEITOR DE QR CODE</span>
              {isScanning ? (
                <button
                  onClick={stopScanner}
                  className="flex items-center gap-1.5 text-xs text-[#fca5a5] hover:text-white px-3 py-1.5 rounded-lg bg-[#450a0a] border border-[#ef4444]"
                >
                  <CameraOff size={14} />
                  <span>PARAR CÂMERA</span>
                </button>
              ) : (
                <button
                  onClick={startScanner}
                  className="flex items-center gap-1.5 text-xs text-white px-3.5 py-1.5 rounded-lg bg-[#047857] hover:bg-[#059669] border border-[#10b981] font-pixel text-[11px] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <Camera size={14} />
                  <span>ABRIR CÂMERA</span>
                </button>
              )}
            </div>

            {/* Video Box */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-[#3b1225] min-h-[260px] flex items-center justify-center">
              <div id="portaria-camera-reader" className="w-full h-full" />

              {!isScanning && (
                <div className="p-6 text-center text-gray-400 space-y-3">
                  <div className="w-14 h-14 bg-[#230919] rounded-full flex items-center justify-center mx-auto border border-[#4a162d]">
                    <Camera size={26} className="text-[#f87171]" />
                  </div>
                  <p className="font-pixel text-xs text-gray-300">CÂMERA EM PAUSA</p>
                  <p className="text-[11px] font-mono text-gray-500 max-w-xs">
                    Pressione "ABRIR CÂMERA" para escanear o QR Code de ingressos na entrada do evento.
                  </p>
                  <button
                    onClick={startScanner}
                    className="py-2.5 px-5 bg-[#b91c1c] hover:bg-[#dc2626] text-white font-pixel text-xs rounded-lg border border-[#ef4444] shadow-lg transition-all"
                  >
                    ATIVAR CÂMERA AGORA
                  </button>
                </div>
              )}
            </div>

            {scannerError && (
              <div className="p-3 bg-[#380b15] border border-[#ef4444] rounded-lg text-xs font-mono text-[#fca5a5]">
                {scannerError}
              </div>
            )}

            {/* Manual Code Input Option */}
            <div className="pt-2 border-t border-[#290d1c]">
              <span className="text-[10px] font-mono text-gray-400 block mb-1.5 uppercase">
                OU DIGITE O CÓDIGO / TOKEN MANUALMENTE:
              </span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyToken(manualCode);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Ex: AHS-1234 ou link/token"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full bg-[#1b081b] border border-[#48152b] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-mono focus:border-[#dc2626] outline-hidden uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={inspecting || !manualCode.trim()}
                  className="px-4 py-2 bg-[#b91c1c] hover:bg-[#dc2626] text-white font-pixel text-xs rounded-lg border border-[#ef4444] transition-all disabled:opacity-50 font-bold shrink-0"
                >
                  {inspecting ? '...' : 'CONSULTAR'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="bg-[#0b030c] border-t border-[#2a0e19] px-4 py-3 text-center text-xs font-mono text-gray-500">
        <div className="max-w-md mx-auto flex items-center justify-between text-[11px]">
          <a href="/" className="hover:text-gray-300">
            ← Site do Evento
          </a>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400 font-pixel text-[10px]">SISTEMA DE ENTRADA CORTEZ</span>
        </div>
      </footer>
    </div>
  );
};
