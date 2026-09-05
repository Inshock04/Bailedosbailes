import React, { useState } from 'react';
import { PixelClose, PixelSkull, PixelCheck } from './PixelIcons';
import { audioManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTickets: () => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose, onOpenTickets }) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedGuest, setConfirmedGuest] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      setErrorMsg('Informe nome e telefone para entrar na lista.');
      audioManager.playError();
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/guestlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar na lista.');
      }

      setConfirmedGuest(data.guest);
      audioManager.playSuccess();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#f59e0b', '#22c55e']
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão.');
      audioManager.playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e0814] border-2 border-[#dc2626] shadow-[0_0_35px_rgba(220,38,38,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#450a0a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#ff4455] tracking-wider">
              {confirmedGuest ? 'NOME CONFIRMADO NA LISTA' : 'RSVP / LISTA VIP HOTEL CORTEZ'}
            </h2>
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

        {confirmedGuest ? (
          <div className="space-y-4 text-center">
            <div className="bg-[#180911] border-2 border-[#16a34a] p-4 sm:p-5">
              <div className="w-10 h-10 mx-auto mb-2 bg-[#15803d] border border-[#86efac] flex items-center justify-center">
                <PixelCheck size={22} color="#ffffff" />
              </div>
              <h3 className="font-pixel text-base sm:text-lg text-[#86efac] mb-1 font-bold">
                NOME CONFIRMADO
              </h3>
              <p className="font-mono text-xs sm:text-sm text-[#d1fae5] mb-2">
                Seu nome foi adicionado à lista do Hotel Cortez.
              </p>
              <div className="bg-[#0b0409] border border-[#22c55e] p-3 font-mono text-xs sm:text-sm text-left space-y-1.5">
                <p><span className="text-[#86efac]">CONVIDADO:</span> <strong className="text-white">{confirmedGuest.name}</strong></p>
                <p><span className="text-[#86efac]">STATUS:</span> <span className="bg-[#14532d] text-[#bbf7d0] px-2 py-0.5 text-xs font-bold">CONFIRMADO VIP</span></p>
                <p><span className="text-[#86efac]">TOKEN DA LISTA:</span> <code className="bg-[#1e293b] text-[#facc15] px-1.5 py-0.5 font-pixel text-[10px]">{confirmedGuest.token}</code></p>
                <p className="text-xs text-[#9ca3af] mt-1">Validade até 00:00 da noite do evento na bilheteria.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  audioManager.playClick();
                  onClose();
                  onOpenTickets();
                }}
                className="flex-1 pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white py-3 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold"
              >
                COMPRAR INGRESSO ANTECIPADO 💀
              </button>
              <button
                onClick={() => {
                  audioManager.playClick();
                  onClose();
                }}
                className="pixel-btn bg-[#1f2937] hover:bg-[#374151] text-gray-200 px-5 py-3 font-pixel text-[10px] sm:text-[11px] font-bold"
              >
                FECHAR
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="font-mono text-xs sm:text-sm text-[#d1d5db] leading-relaxed">
              Coloque seu nome na lista oficial do evento para garantir desconto especial e entrada prioritária até 00:00 na noite de 31 de Outubro.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-pixel text-[10px] sm:text-[11px] text-[#fca5a5] mb-1 font-bold uppercase">
                  NOME COMPLETO *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beatriz Albuquerque"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#140810] border-2 border-[#5c1322] px-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#dc2626] outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-pixel text-[10px] sm:text-[11px] text-[#fca5a5] mb-1 font-bold uppercase">
                  WHATSAPP / TELEFONE COM DDD *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#140810] border-2 border-[#5c1322] px-3 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-[#dc2626] outline-hidden font-mono"
                />
                <span className="text-xs text-[#9ca3af] font-mono block mt-1">
                  * Seus dados são protegidos e nunca ficarão publicamente expostos.
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-[#450a0a] border border-[#ef4444] text-[#fca5a5] text-xs sm:text-sm font-mono">
                ⚠ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white py-3.5 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold"
            >
              {loading ? 'ENVIANDO...' : 'ENTRAR NA LISTA VIP 💀'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
