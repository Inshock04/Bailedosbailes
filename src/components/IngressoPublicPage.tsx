import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, MapPin, Calendar, Clock, Wine, RefreshCw, ExternalLink } from 'lucide-react';

interface TicketData {
  nome: string;
  codigo: string;
  evento: string;
  local: string;
  data: string;
  horario: string;
  status: 'VALIDO' | 'UTILIZADO' | 'CANCELADO' | 'BLOQUEADO';
  item?: string;
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

      // Gera o QR Code com a URL desta própria página para apresentação na portaria
      const publicUrl = window.location.href;
      const qrImage = await QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
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
    <div className="min-h-screen bg-[#070208] text-gray-100 flex flex-col justify-between selection:bg-[#991b1b] selection:text-white relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(153,27,27,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#7f1d1d]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#450a0a]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="border-b border-[#2a0e19] bg-[#0c040d]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] animate-pulse" />
            <span className="font-pixel text-[11px] text-[#fca5a5] tracking-wider uppercase">HOTEL CORTEZ</span>
          </div>
          <button
            onClick={fetchTicket}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded bg-[#1f0914] border border-[#3b1525] transition-colors"
            title="Atualizar status"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="font-mono text-[11px]">ATUALIZAR</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-4 py-6 flex-1 flex flex-col justify-center relative z-10">
        {loading && (
          <div className="p-8 text-center bg-[#130612]/80 border border-[#381120] rounded-lg shadow-2xl">
            <div className="w-10 h-10 border-3 border-[#dc2626] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-pixel text-xs text-[#fca5a5] tracking-wider">CONSULTANDO INGRESSO...</p>
            <p className="text-xs text-gray-400 font-mono mt-1">Verificando autenticidade oficial</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-6 bg-[#20070d] border-2 border-[#ef4444] rounded-lg shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-[#450a0a] rounded-full flex items-center justify-center mx-auto border border-[#ef4444]">
              <XCircle className="text-[#fca5a5]" size={32} />
            </div>
            <div>
              <h2 className="font-pixel text-sm text-[#fca5a5] uppercase">INGRESSO NÃO ENCONTRADO</h2>
              <p className="text-xs text-gray-300 font-mono mt-2">{error}</p>
            </div>
            <p className="text-[11px] text-gray-400">
              Certifique-se de que o link ou QR Code escaneado corresponde ao ingresso original emitido pela organização do Hotel Cortez.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block w-full py-2.5 px-4 bg-[#7f1d1d] hover:bg-[#991b1b] text-white font-pixel text-xs tracking-wider rounded border border-[#ef4444] transition-all"
            >
              IR PARA O SITE OFICIAL
            </button>
          </div>
        )}

        {!loading && ticket && (
          <div className="bg-[#120511] border-2 border-[#3d1222] rounded-xl overflow-hidden shadow-[0_0_40px_rgba(153,27,27,0.25)] relative">
            {/* Ticket Header & Status */}
            <div className="p-5 border-b border-[#2d0f1b] bg-gradient-to-b from-[#210715] to-[#120511] text-center relative">
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-pixel tracking-widest uppercase mb-2 bg-[#2d0b1a] text-[#fca5a5] border border-[#7f1d1d]">
                INGRESSO OFICIAL
              </div>
              <h1 className="font-pixel text-base sm:text-lg text-white tracking-wider leading-snug">
                HOTEL CORTEZ HALLOWEEN PARTY
              </h1>
              <p className="text-[11px] font-mono text-[#f87171] mt-0.5 tracking-wide">
                AMERICAN HORROR STORY • 2026
              </p>

              {/* Status Badge */}
              <div className="mt-4">
                {ticket.status === 'VALIDO' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#052e16] border-2 border-[#22c55e] text-[#4ade80] shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse">
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
              <div className="bg-[#1a0817] p-3.5 rounded-lg border border-[#3e1327]">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">TITULAR DO INGRESSO</span>
                <span className="text-base sm:text-lg font-bold text-white tracking-wide block capitalize mt-0.5">
                  {ticket.nome}
                </span>
                <div className="mt-2 pt-2 border-t border-[#311020] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400">CÓDIGO DE ACESSO:</span>
                  <span className="font-pixel text-sm text-[#fbbf24] tracking-widest font-bold">
                    {ticket.codigo}
                  </span>
                </div>
              </div>

              {/* QR Code Presentation */}
              <div className="bg-[#180715] p-4 rounded-lg border border-[#3b1225] flex flex-col items-center text-center">
                <div className="p-3 bg-white rounded-lg border-2 border-[#b91c1c] shadow-[0_0_25px_rgba(220,38,38,0.3)]">
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

                <p className="text-xs text-[#fca5a5] font-pixel tracking-wider mt-3">
                  APRESENTE ESTE QR CODE NA ENTRADA
                </p>
                <p className="text-[11px] text-gray-400 font-mono mt-1">
                  O fiscal da portaria escaneará este código para autorizar o acesso.
                </p>
              </div>

              {/* Event Details */}
              <div className="space-y-2 text-xs font-mono text-gray-300 bg-[#160613] p-3.5 rounded-lg border border-[#331021]">
                <div className="flex items-start gap-2.5">
                  <Calendar size={15} className="text-[#f87171] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">31 DE OUTUBRO DE 2026 (SÁBADO)</span>
                    <span className="text-gray-400 text-[11px]">Noite de Halloween</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-[#f87171] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">A PARTIR DAS 21:00</span>
                    <span className="text-gray-400 text-[11px]">Portões abrem pontualmente às 21h</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-[#f87171] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">THE TRIPLEX</span>
                    <span className="text-gray-400 text-[11px]">Rua Manoel Castilho, 201 - Itaim Paulista, São Paulo - SP</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-1 border-t border-[#290d1b]">
                  <Wine size={15} className="text-[#f87171] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold block">OPEN BAR PREMIUM INCLUSO</span>
                    <span className="text-gray-400 text-[11px]">Gin, Vodka, Energético, Caipirinha, Canelinha & ???</span>
                  </div>
                </div>
              </div>

              {/* Security & Rules Alert */}
              <div className="p-3 bg-[#1e0712] rounded border border-[#481427] text-[11px] font-mono text-gray-400 space-y-1">
                <p className="text-[#fca5a5] font-bold">AVISOS IMPORTANTES:</p>
                <p>• <span className="text-white font-bold">Fantasia opcional</span> — Sem pressão: venha de fantasia, produzidão, básico ou do jeito que quiser. O importante é não perder o Halloween. 🎃🔥</p>
                <p>• Este ingresso é pessoal e intransferível após a validação na portaria.</p>
              </div>
            </div>

            {/* Ticket Footer */}
            <div className="p-3 bg-[#0d030c] border-t border-[#2a0e19] text-center">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#f87171] hover:text-[#fca5a5] font-mono"
              >
                <span>Acessar portal oficial do evento</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#210a14] bg-[#0a030b] py-3 text-center text-[10px] font-mono text-gray-500 relative z-10">
        HOTEL CORTEZ HALLOWEEN PARTY © 2026 • TODOS OS DIREITOS RESERVADOS
      </footer>
    </div>
  );
};
