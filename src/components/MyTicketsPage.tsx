import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { PixelSkull } from './PixelIcons';
import triplexBgMobile from '../assets/images/triplex_bg_mobile.jpg';

export const MyTicketsPage: React.FC<{ token: string }> = ({ token }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${token}`);
        if (!res.ok) {
          throw new Error('Pedido não encontrado ou indisponível.');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar ingressos.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [token]);

  const bgStyle: React.CSSProperties = {
    backgroundImage: `url(${triplexBgMobile})`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#1a3a08] text-[#eae5f5] flex items-center justify-center p-4" style={bgStyle}>
        <div className="p-6 bg-gradient-to-b from-[#052e16]/95 via-[#065f46]/95 to-[#16a34a]/95 border-2 border-[#ef4444] rounded-xl font-pixel text-[#fef08a] animate-pulse text-lg shadow-[0_0_30px_rgba(239,68,68,0.45)]">
          Carregando Ingressos...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#1a3a08] text-[#eae5f5] flex flex-col items-center justify-center p-4" style={bgStyle}>
        <div className="p-6 bg-gradient-to-b from-[#052e16]/95 via-[#065f46]/95 to-[#16a34a]/95 border-2 border-[#ef4444] rounded-xl flex flex-col items-center max-w-md w-full shadow-[0_0_35px_rgba(239,68,68,0.5)]">
          <PixelSkull size={48} color="#ef4444" />
          <h1 className="font-pixel text-xl text-[#fef08a] mt-4 mb-2 text-center">Acesso Negado</h1>
          <p className="font-pixel text-sm text-white text-center max-w-md">{error}</p>
          <button onClick={() => window.location.href = '/'} className="mt-6 px-6 py-2 bg-[#991b1b] text-white font-pixel border-2 border-[#ef4444] hover:bg-[#b91c1c] rounded transition-colors cursor-pointer">
            VOLTAR AO INÍCIO
          </button>
        </div>
      </div>
    );
  }

  const { order, tickets } = data;

  return (
    <div className="min-h-[100dvh] w-full bg-[#1a3a08] text-[#eae5f5] flex flex-col items-center justify-center py-8 px-4" style={bgStyle}>
      <div className="w-full max-w-md bg-gradient-to-b from-[#052e16]/95 via-[#065f46]/95 to-[#16a34a]/95 border-2 border-[#ef4444] rounded-xl p-4 sm:p-6 shadow-[0_0_40px_rgba(239,68,68,0.5),0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
        <div className="text-center border-b-2 border-[#ef4444]/60 pb-4 mb-6">
          <h1 className="font-pixel text-xl sm:text-2xl text-white font-black">Carnatal</h1>
          <p className="font-pixel text-xs sm:text-sm text-[#facc15] tracking-widest uppercase mt-0.5">THE TRIPLEX</p>
          <p className="font-pixel text-xs text-[#fef08a] mt-2">Pedido: #{order.id.split('-')[0].toUpperCase()}</p>
          <p className="font-pixel text-xs text-[#dcfce7] mt-1">{order.buyer_name}</p>
        </div>

        <div className="space-y-6">
          {tickets.map((ticket: any, index: number) => {
            const rawUrl = ticket.publicUrl || '';
            const urlParts = rawUrl.split('qrcode=');
            const qrValue = urlParts.length > 1
              ? urlParts[1]
              : rawUrl || `${window.location.origin}/ingresso/${ticket.token || ticket.publicCode || ticket.codigo}`;
            return (
              <div key={ticket.id} className="bg-gradient-to-br from-[#042411]/95 via-[#064e3b]/90 to-[#15803d]/85 border-2 border-[#ef4444] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-5 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                <div className="bg-white p-2.5 rounded-lg border-2 border-[#ef4444] shrink-0">
                  <QRCode value={qrValue} size={130} level="H" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h2 className="font-pixel text-lg text-[#fef08a]">Ingresso {index + 1}</h2>
                  <div className="font-pixel text-sm text-white px-2.5 py-1 inline-block border bg-[#052e16] border-[#ef4444] rounded">
                    {ticket.ticketType === 'OPEN_BAR' || ticket.ticketName === 'INGRESSO OPEN' ? 'INGRESSO OPEN' : 'PÓS OPEN'}
                  </div>
                  <p className="font-mono text-xs text-[#dcfce7]">
                    19 de Dezembro • Das 21:00 às 06:00
                  </p>
                  <div className="font-mono text-xs text-[#fef08a] mt-2 bg-[#042411] p-2 border border-[#ef4444]/60 rounded break-all">
                    {ticket.codigo || ticket.publicCode}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="font-pixel text-xs text-[#fef08a] leading-relaxed max-w-md mx-auto">
            Apresente os QR Codes acima na portaria.
            Tire print desta tela ou salve o link para facilitar o acesso.
          </p>
          <button onClick={() => window.location.href = '/'} className="mt-6 px-6 py-2 bg-[#991b1b] text-white font-pixel text-sm border-2 border-[#ef4444] rounded hover:bg-[#b91c1c] transition-colors cursor-pointer">
            IR PARA O SITE DO EVENTO
          </button>
        </div>
      </div>
    </div>
  );
};
