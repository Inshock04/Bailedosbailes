import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, MapPin, Calendar, Clock, RefreshCw, ExternalLink } from 'lucide-react';
import { PixelTicketIcon, PixelFlame } from './PixelIcons';
import triplexBgMobile from '../assets/images/triplex_bg_mobile.jpg';

/* ── Halloween QR Code com abóbora (mesmo estilo do Admin) ── */

const QR_CANVAS_SIZE = 1024;
const QR_QUIET_ZONE = 4;

function isFinderModule(row: number, column: number, size: number): boolean {
  return (row < 7 && column < 7)
    || (row < 7 && column >= size - 7)
    || (row >= size - 7 && column < 7);
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number): void {
  const patternSize = moduleSize * 7;
  ctx.fillStyle = '#120b08';
  ctx.beginPath();
  ctx.roundRect(x, y, patternSize, patternSize, moduleSize * 0.35);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);

  ctx.fillStyle = '#120b08';
  ctx.beginPath();
  ctx.roundRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3, moduleSize * 0.18);
  ctx.fill();
}

function drawJackOLantern(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number): void {
  const pumpkinWidth = size * 0.62;
  const pumpkinHeight = size * 0.48;
  const pumpkinTop = centerY - pumpkinHeight * 0.3;

  ctx.fillStyle = '#5b2a0a';
  ctx.fillRect(centerX - size * 0.05, pumpkinTop - size * 0.16, size * 0.1, size * 0.18);
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, pumpkinWidth * 0.5, pumpkinHeight * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.ellipse(centerX - pumpkinWidth * 0.2, centerY, pumpkinWidth * 0.22, pumpkinHeight * 0.45, 0, 0, Math.PI * 2);
  ctx.ellipse(centerX + pumpkinWidth * 0.2, centerY, pumpkinWidth * 0.22, pumpkinHeight * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a0f0a';
  ctx.beginPath();
  ctx.moveTo(centerX - pumpkinWidth * 0.3, centerY - pumpkinHeight * 0.08);
  ctx.lineTo(centerX - pumpkinWidth * 0.12, centerY - pumpkinHeight * 0.2);
  ctx.lineTo(centerX - pumpkinWidth * 0.05, centerY - pumpkinHeight * 0.02);
  ctx.closePath();
  ctx.moveTo(centerX + pumpkinWidth * 0.3, centerY - pumpkinHeight * 0.08);
  ctx.lineTo(centerX + pumpkinWidth * 0.12, centerY - pumpkinHeight * 0.2);
  ctx.lineTo(centerX + pumpkinWidth * 0.05, centerY - pumpkinHeight * 0.02);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX - pumpkinWidth * 0.28, centerY + pumpkinHeight * 0.16);
  ctx.lineTo(centerX - pumpkinWidth * 0.12, centerY + pumpkinHeight * 0.08);
  ctx.lineTo(centerX, centerY + pumpkinHeight * 0.18);
  ctx.lineTo(centerX + pumpkinWidth * 0.12, centerY + pumpkinHeight * 0.08);
  ctx.lineTo(centerX + pumpkinWidth * 0.28, centerY + pumpkinHeight * 0.16);
  ctx.lineTo(centerX + pumpkinWidth * 0.12, centerY + pumpkinHeight * 0.3);
  ctx.lineTo(centerX, centerY + pumpkinHeight * 0.22);
  ctx.lineTo(centerX - pumpkinWidth * 0.12, centerY + pumpkinHeight * 0.3);
  ctx.closePath();
  ctx.fill();
}

async function generateHalloweenQr(url: string): Promise<string> {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const moduleCount = qr.modules.size;
  const moduleSize = Math.floor(QR_CANVAS_SIZE / (moduleCount + QR_QUIET_ZONE * 2));
  const qrSize = moduleSize * (moduleCount + QR_QUIET_ZONE * 2);
  const offset = Math.floor((QR_CANVAS_SIZE - qrSize) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = QR_CANVAS_SIZE;
  canvas.height = QR_CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível preparar o QR Code.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE);
  ctx.fillStyle = '#120b08';
  const centerStart = Math.floor((moduleCount - 9) / 2);

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      const inCenter = row >= centerStart && row < centerStart + 9 && col >= centerStart && col < centerStart + 9;
      if (!qr.modules.get(row, col) || isFinderModule(row, col, moduleCount) || inCenter) continue;
      const x = offset + (col + QR_QUIET_ZONE) * moduleSize;
      const y = offset + (row + QR_QUIET_ZONE) * moduleSize;
      ctx.beginPath();
      ctx.roundRect(x + moduleSize * 0.08, y + moduleSize * 0.08, moduleSize * 0.84, moduleSize * 0.84, moduleSize * 0.22);
      ctx.fill();
    }
  }

  drawFinderPattern(ctx, offset + QR_QUIET_ZONE * moduleSize, offset + QR_QUIET_ZONE * moduleSize, moduleSize);
  drawFinderPattern(ctx, offset + (QR_QUIET_ZONE + moduleCount - 7) * moduleSize, offset + QR_QUIET_ZONE * moduleSize, moduleSize);
  drawFinderPattern(ctx, offset + QR_QUIET_ZONE * moduleSize, offset + (QR_QUIET_ZONE + moduleCount - 7) * moduleSize, moduleSize);

  const cx = offset + (QR_QUIET_ZONE + centerStart + 4.5) * moduleSize;
  const cy = cx;
  const badgeSize = moduleSize * 8.3;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cx - badgeSize / 2, cy - badgeSize / 2, badgeSize, badgeSize, moduleSize * 0.7);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = Math.max(3, moduleSize * 0.14);
  ctx.stroke();
  drawJackOLantern(ctx, cx, cy, moduleSize * 7.2);

  return canvas.toDataURL('image/png');
}

/* ── Componente ── */

interface TicketData {
  nome: string;
  codigo: string;
  evento: string;
  local: string;
  data: string;
  horario: string;
  status: 'VALIDO' | 'UTILIZADO' | 'CANCELADO' | 'BLOQUEADO';
  item?: string;
  tipo_ingresso?: 'OPEN_BAR' | 'POS_OPEN';
}

interface IngressoPublicPageProps {
  token: string;
}

export const IngressoPublicPage: React.FC<IngressoPublicPageProps> = ({ token }) => {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const fetchTicket = async () => {
    if (!token) {
      setError('Código do ingresso não fornecido.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ingresso/${encodeURIComponent(token.trim())}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || 'Ingresso não encontrado ou inválido.');
      }

      setTicket(data);

      // Gera o QR Code Halloween com abóbora no centro
      const publicUrl = window.location.href;
      const qrImage = await generateHalloweenQr(publicUrl);
      setQrDataUrl(qrImage);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do ingresso.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [token]);

  return (
    <div
      className="min-h-screen bg-[#1a3a08] text-gray-100 flex flex-col justify-between selection:bg-[#991b1b] selection:text-white relative overflow-hidden font-sans"
      style={{
        backgroundImage: `url(${triplexBgMobile})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Top Bar */}
      <header className="border-b-2 border-[#ef4444] bg-gradient-to-r from-[#052e16]/95 via-[#064e3b]/95 to-[#15803d]/95 backdrop-blur-md px-4 py-3 sticky top-0 z-20 shadow-[0_2px_15px_rgba(0,0,0,0.6)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="font-pixel text-[11px] text-[#fef08a] tracking-wider uppercase">CARNATAL</span>
          </div>
          <button
            onClick={fetchTicket}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-white hover:text-[#fef08a] px-2.5 py-1 rounded bg-[#052e16] border border-[#ef4444] transition-colors cursor-pointer"
            title="Atualizar status"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="font-mono text-[11px] normal-case">Atualizar</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-4 py-6 flex-1 flex flex-col justify-center relative z-10">
        {loading && (
          <div className="p-8 text-center bg-gradient-to-b from-[#052e16]/95 via-[#064e3b]/95 to-[#15803d]/95 border-2 border-[#ef4444] rounded-xl shadow-[0_0_35px_rgba(239,68,68,0.45)] backdrop-blur-sm">
            <div className="w-10 h-10 border-3 border-[#ef4444] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-pixel text-xs text-[#fef08a] tracking-wider">CONSULTANDO INGRESSO...</p>
            <p className="text-xs text-[#bbf7d0] font-mono mt-1">Verificando autenticidade oficial</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-6 bg-gradient-to-b from-[#052e16]/95 via-[#064e3b]/95 to-[#15803d]/95 border-2 border-[#ef4444] rounded-xl shadow-[0_0_35px_rgba(239,68,68,0.5)] text-center space-y-4 backdrop-blur-sm">
            <div className="w-14 h-14 bg-[#450a0a] rounded-full flex items-center justify-center mx-auto border-2 border-[#ef4444]">
              <XCircle className="text-[#fca5a5]" size={32} />
            </div>
            <div>
              <h2 className="font-pixel text-sm text-[#fef08a] uppercase">INGRESSO NÃO ENCONTRADO</h2>
              <p className="text-xs text-white font-mono mt-2">{error}</p>
            </div>
            <p className="text-[11px] text-[#dcfce7]">
              Certifique-se de que o link ou QR Code escaneado corresponde ao ingresso original emitido pela organização do Carnatal.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block w-full py-2.5 px-4 bg-[#991b1b] hover:bg-[#b91c1c] text-white font-pixel text-xs tracking-wider rounded border-2 border-[#ef4444] transition-all cursor-pointer"
            >
              IR PARA O SITE OFICIAL
            </button>
          </div>
        )}

        {!loading && ticket && (
          <div className="bg-gradient-to-b from-[#052e16]/95 via-[#065f46]/95 to-[#16a34a]/95 border-2 border-[#ef4444] rounded-xl overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.5),0_10px_30px_rgba(0,0,0,0.8)] relative backdrop-blur-sm">
            {/* Ticket Header & Status */}
            <div className="p-5 border-b-2 border-[#ef4444]/60 bg-gradient-to-b from-[#031d0e]/90 to-[#064e3b]/70 text-center relative">
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-pixel tracking-widest uppercase mb-2 bg-[#052e16] text-[#fef08a] border border-[#ef4444]">
                INGRESSO OFICIAL
              </div>
              <h1 className="font-pixel text-xl sm:text-2xl text-white tracking-wider leading-tight">
                Carnatal
              </h1>
              <p className="font-pixel text-xs sm:text-sm text-[#facc15] tracking-widest uppercase mt-0.5">
                THE TRIPLEX
              </p>

              {/* Status Badge */}
              <div className="mt-4">
                {ticket.status === 'VALIDO' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#052e16] border-2 border-[#22c55e] text-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.35)] animate-pulse">
                    <CheckCircle2 size={18} />
                    <span className="font-pixel text-xs sm:text-sm tracking-wider font-bold">INGRESSO VÁLIDO</span>
                  </div>
                )}
                {ticket.status === 'UTILIZADO' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#450a0a] border-2 border-[#ef4444] text-[#fca5a5] shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <AlertTriangle size={18} />
                    <span className="font-pixel text-xs sm:text-sm tracking-wider font-bold">JÁ UTILIZADO NA PORTARIA</span>
                  </div>
                )}
                {ticket.status === 'CANCELADO' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#431407] border-2 border-[#f97316] text-[#fdba74]">
                    <XCircle size={18} />
                    <span className="font-pixel text-xs sm:text-sm tracking-wider font-bold">INGRESSO CANCELADO</span>
                  </div>
                )}
                {ticket.status === 'BLOQUEADO' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b0764] border-2 border-[#c084fc] text-[#e9d5ff]">
                    <ShieldCheck size={18} />
                    <span className="font-pixel text-xs sm:text-sm tracking-wider font-bold">INGRESSO BLOQUEADO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Guest & Code Information */}
            <div className="p-5 space-y-4">
              <div className="bg-gradient-to-br from-[#042411]/95 via-[#064e3b]/90 to-[#15803d]/85 p-3.5 rounded-lg border border-[#ef4444]">
                <span className="text-[10px] font-mono text-[#bbf7d0] block">Titular do Ingresso</span>
                <span className="text-base sm:text-lg font-bold text-white tracking-wide block capitalize mt-0.5">
                  {ticket.nome}
                </span>
                <div className="mt-2 pt-2 border-t border-[#ef4444]/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#bbf7d0]">Código de Acesso:</span>
                  <span className="font-pixel text-sm text-[#fbbf24] tracking-widest font-bold">
                    {ticket.codigo}
                  </span>
                </div>
              </div>

              {/* ═══ TICKET TYPE VISUAL BADGE ═══ */}
              {ticket.tipo_ingresso === 'OPEN_BAR' || ticket.item === 'INGRESSO OPEN' ? (
                <div className="bg-gradient-to-b from-[#042411] via-[#065f46] to-[#16a34a] p-4 rounded-xl border-2 border-[#ef4444] shadow-[0_0_25px_rgba(239,68,68,0.35)] text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5">
                    <PixelTicketIcon size={18} color="#fbbf24" />
                    <span className="font-pixel text-sm sm:text-base text-[#fef08a] tracking-widest font-bold">
                      INGRESSO OPEN
                    </span>
                  </div>
                  <p className="text-xs text-[#dcfce7] font-mono mt-1">
                    Open Bar • Das 21:00 às 06:00
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-b from-[#042411] via-[#065f46] to-[#16a34a] p-4 rounded-xl border-2 border-[#ef4444] shadow-[0_0_25px_rgba(239,68,68,0.35)] text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5">
                    <PixelTicketIcon size={18} color="#4ade80" />
                    <span className="font-pixel text-sm sm:text-base text-[#4ade80] tracking-widest font-bold">
                      PÓS OPEN
                    </span>
                  </div>
                  <p className="text-xs text-[#dcfce7] font-mono mt-1">
                    Entrada liberada • Das 21:00 às 06:00
                  </p>
                </div>
              )}

              {/* QR Code Presentation */}
              <div className="bg-gradient-to-b from-[#042411]/95 via-[#064e3b]/90 to-[#15803d]/85 p-4 rounded-lg border border-[#ef4444] flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-lg border-2 border-[#ef4444] shadow-[0_0_25px_rgba(220,38,38,0.35)]">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code ${ticket.codigo}`}
                      className="w-52 h-52 sm:w-56 sm:h-56 object-contain"
                    />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center text-gray-800 text-xs">
                      Gerando QR...
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#fef08a] font-pixel tracking-wider mt-3">
                  APRESENTE ESTE QR CODE NA ENTRADA
                </p>
                <p className="text-[11px] text-[#dcfce7] font-mono mt-1">
                  O fiscal da portaria escaneará este código para autorizar o acesso.
                </p>
              </div>

              {/* Event Details */}
              <div className="space-y-2 text-xs font-mono text-gray-100 bg-gradient-to-br from-[#042411]/95 via-[#064e3b]/90 to-[#15803d]/85 p-3.5 rounded-lg border border-[#ef4444]">
                <div className="flex items-start gap-2.5">
                  <Calendar size={15} className="text-[#ef4444] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">19 de Dezembro de 2026 (Sábado)</span>
                    <span className="text-[#bbf7d0] text-[11px]">Carnatal • The Triplex</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-[#ef4444] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">
                      Das 21:00 às 06:00
                    </span>
                    <span className="text-[#bbf7d0] text-[11px]">
                      Abertura às 21h • Evento até 06:00
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-[#ef4444] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">The Triplex</span>
                    <span className="text-[#bbf7d0] text-[11px]">R. Manuel de Castilho, 201 - Itaim Paulista, São Paulo - SP</span>
                  </div>
                </div>
              </div>

              {/* Security & Rules Alert */}
              <div className="p-3 bg-gradient-to-r from-[#042411]/95 to-[#064e3b]/90 rounded-lg border border-[#ef4444] text-[11px] font-mono text-[#dcfce7] space-y-1">
                <p className="text-[#fef08a] font-bold">Avisos Importantes:</p>
                <p className="flex flex-wrap items-center gap-1">
                  <span>• <strong className="text-white">Fantasia opcional</strong> — Sem pressão: venha de fantasia, produzidão, básico ou do jeito que quiser.</span>
                  <PixelFlame size={13} />
                </p>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="p-3 bg-[#042411]/95 border-t border-[#ef4444]/60 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#fef08a] hover:text-white font-mono"
              >
                <span>Acessar portal oficial do evento</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#ef4444] bg-gradient-to-r from-[#052e16]/95 via-[#064e3b]/95 to-[#15803d]/95 py-3 text-center text-[10px] font-mono text-[#bbf7d0] relative z-10">
        Carnatal • The Triplex • 2026 • Todos os Direitos Reservados
      </footer>
    </div>
  );
};
