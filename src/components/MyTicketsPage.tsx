import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { PixelSkull } from './PixelIcons';

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

  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#05030a] text-[#eae5f5] flex items-center justify-center p-4">
        <div className="font-pixel text-[#a855f7] animate-pulse text-lg">Carregando Ingressos...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#05030a] text-[#eae5f5] flex flex-col items-center justify-center p-4">
        <PixelSkull size={48} color="#ef4444" />
        <h1 className="font-pixel text-xl text-[#ef4444] mt-4 mb-2 text-center">Acesso Negado</h1>
        <p className="font-pixel text-sm text-[#9ca3af] text-center max-w-md">{error}</p>
        <button onClick={() => window.location.href = '/'} className="mt-8 px-6 py-2 bg-[#2a133d] text-white font-pixel border border-[#a855f7] hover:bg-[#3b0764] transition-colors">
          VOLTAR AO INÍCIO
        </button>
      </div>
    );
  }

  const { order, tickets } = data;

  return (
    <div className="min-h-[100dvh] w-full bg-[#05030a] text-[#eae5f5] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-[#0c0614] border-2 border-[#ff3344] p-4 sm:p-6 shadow-[0_0_30px_rgba(255,51,68,0.2)]">
        <div className="text-center border-b-2 border-[#2a133d] pb-4 mb-6">
          <h1 className="font-pixel text-xl sm:text-2xl text-[#ff3344] font-black">SEUS INGRESSOS</h1>
          <p className="font-pixel text-sm text-[#a855f7] mt-2">Pedido: #{order.id.split('-')[0].toUpperCase()}</p>
          <p className="font-pixel text-xs text-[#9ca3af] mt-1">{order.buyer_name}</p>
        </div>

        <div className="space-y-6">
          {tickets.map((ticket: any, index: number) => {
            const urlParts = ticket.publicUrl.split('qrcode=');
            const qrValue = urlParts.length > 1 ? urlParts[1] : ticket.codigo;
            return (
              <div key={ticket.id} className="bg-[#12071f] border border-[#a855f7] p-4 flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white p-2 rounded-sm shrink-0">
                  <QRCode value={qrValue} size={130} level="H" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h2 className="font-pixel text-lg text-[#fca5a5]">Ingresso {index + 1}</h2>
                  <div className="font-pixel text-sm text-white bg-[#7f1d1d] px-2 py-1 inline-block">
                    {ticket.category === 'GERAL' && ticket.price > 20 ? 'OPEN BAR' : 'NORMAL'}
                  </div>
                  <div className="font-mono text-xs text-[#9ca3af] mt-2 bg-[#090510] p-2 border border-[#361c4d] break-all">
                    {ticket.codigo}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="font-pixel text-xs text-[#ef4444] leading-relaxed max-w-md mx-auto">
            Apresente os QR Codes acima na portaria.
            Tire print desta tela ou salve o link para facilitar o acesso.
          </p>
          <button onClick={() => window.location.href = '/'} className="mt-6 px-6 py-2 bg-[#2a133d] text-white font-pixel text-sm border border-[#a855f7] hover:bg-[#3b0764] transition-colors">
            IR PARA O SITE DO EVENTO
          </button>
        </div>
      </div>
    </div>
  );
};
