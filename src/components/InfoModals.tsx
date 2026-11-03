import React, { useState, useEffect } from 'react';
import { PixelClose, PixelSkull, PixelCheck, PixelArrow } from './PixelIcons';
import { OfficialSocialButtons } from './OfficialSocialButtons';
import { audioManager } from '../utils/audio';
import { syncContactToSupabase } from '../utils/supabase';

const useBodyScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);
};

// 1. SOBRE MODAL
export const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel max-w-xl bg-[#0e0a17] border-2 border-[#9333ea] shadow-[0_0_35px_rgba(147,51,234,0.5)] rounded-xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 flex items-center justify-between border-b-2 border-[#3b0764] px-4 sm:px-6 py-3 bg-[#0e0a17]">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#c084fc" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#d8b4fe] tracking-wider">
              SOBRE O HOTEL CORTEZ
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#2e1065] text-[#d8b4fe] cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-4 space-y-3 font-mono text-xs sm:text-sm text-[#d1d5db] leading-relaxed">
          <p>
            Construído na década de 1920 pelo visionário excêntrico <strong className="text-white">James Patrick March</strong>, o Hotel Cortez nasceu como uma obra-prima da arquitetura Art Déco, projetado com labirintos secretos, corredores sem saída e aposentos privados indevassáveis.
          </p>
          <div className="bg-[#180d24] border border-[#581c87] p-3.5 text-[#e9d5ff]">
            <p className="italic">
              "Algumas noites terminam. Outras deixam histórias que merecem uma continuação. A mansão abre novamente suas portas para mais uma noite histórica no THE TRIPLEX."
            </p>
          </div>
          <p>
            <strong className="text-[#fbbf24]">Hotel Cortez — The Return</strong> acontece no dia <strong className="text-white">07 de Novembro, das 22:00 às 06:00</strong>, reunindo line-up de DJs, Concurso de Fantasias (Parte 2), decoração temática imersiva e promoções especiais.
          </p>
        </div>

        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-[#3b0764] bg-[#0b0712] flex justify-end">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="pixel-btn bg-[#9333ea] hover:bg-[#a855f7] text-white px-5 py-2.5 font-pixel text-[12px] sm:text-[13px] font-bold cursor-pointer"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. FAQ MODAL
export const FaqModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Qual é a data, horário e censura do evento?',
      a: 'O evento acontece no dia 07 de Novembro, das 22:00 às 06:00, no THE TRIPLEX. A classificação etária é rigorosamente 18 anos com apresentação obrigatória de documento oficial com foto.'
    },
    {
      q: 'Quais são os valores e combos de ingresso?',
      a: 'Trabalhamos com modalidade única ("Ingresso") antecipada: 1 por R$ 10, 3 por R$ 20 e 5 por R$ 30. A partir de 5 ingressos, cada ingresso adicional sai por R$ 5 (6 por R$ 35, 7 por R$ 40 e assim por diante).'
    },
    {
      q: 'Como é feita a compra do ingresso?',
      a: 'A compra é realizada diretamente aqui pelo site com checkout seguro via Mercado Pago (PIX ou Cartão). Após a confirmação, seus ingressos individuais com QR Code são enviados automaticamente por e-mail. Após a compra, não realizamos estorno.'
    },
    {
      q: 'O uso de fantasia é obrigatório?',
      a: 'Não é obrigatório, mas é super incentivado! Teremos o Concurso de Fantasias — Parte 2 durante a festa para quem caprichar na produção.'
    },
    {
      q: 'Já fui ao evento passado. Posso usar meu código anterior?',
      a: 'Sim! Quem já foi ao evento passado pode reutilizar o mesmo código na portaria.'
    },
    {
      q: 'Como funciona o Oráculo e o resgate de promoções?',
      a: 'No Chapéu de Bruxa (Oráculo), você sorteia uma carta promocional de bebidas com QR Code único para apresentar e validar diretamente no bar do evento. Apenas as novas promoções desta edição são válidas (todos os cupons de edições anteriores foram cancelados).'
    }
  ];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel max-w-xl bg-[#0e0a17] border-2 border-[#d97706] shadow-[0_0_35px_rgba(217,119,6,0.5)] rounded-xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 flex items-center justify-between border-b-2 border-[#451a03] px-4 sm:px-6 py-3 bg-[#0e0a17]">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#fbbf24" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#fef08a] tracking-wider">
              PERGUNTAS FREQUENTES (FAQ)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#3b1c04] text-[#fbbf24] cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-4 space-y-2.5">
          {faqs.map((faq, idx) => {
            const isItemOpen = openIdx === idx;
            return (
              <div key={idx} className="bg-[#180e1a] border border-[#582006]">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setOpenIdx(isItemOpen ? null : idx);
                  }}
                  className="w-full p-3 text-left flex justify-between items-center gap-2 cursor-pointer hover:bg-[#251408]"
                >
                  <span className="font-pixel text-[12px] sm:text-[13px] text-[#fef08a] font-bold leading-snug">
                    {faq.q}
                  </span>
                  <PixelArrow
                    size={12}
                    color="#fbbf24"
                    className={`shrink-0 transition-transform duration-200 ${isItemOpen ? '-rotate-90' : 'rotate-90'}`}
                  />
                </button>
                {isItemOpen && (
                  <div className="p-3 pt-2 font-mono text-xs sm:text-sm text-[#d1d5db] border-t border-[#381404] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-[#451a03] bg-[#0b0712] flex justify-end">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="pixel-btn bg-[#d97706] hover:bg-[#f59e0b] text-black px-5 py-2.5 font-pixel text-[12px] sm:text-[13px] font-bold cursor-pointer"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. CONTATO MODAL
export const ContactModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioManager.playSuccess();
    syncContactToSupabase({ name, email, message });
    setSent(true);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel max-w-lg bg-[#0e0a17] border-2 border-[#ef4444] shadow-[0_0_35px_rgba(239,68,68,0.5)] rounded-xl text-[#f3edf9]"
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 flex items-center justify-between border-b-2 border-[#450a0a] px-4 sm:px-6 py-3 bg-[#0e0a17]">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#fca5a5] tracking-wider">
              FALE COM A RECEPÇÃO
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#3b0710] text-[#fca5a5] cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        <div className="modal-scroll-body custom-scrollbar px-4 sm:px-6 py-4">
          {sent ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-10 h-10 mx-auto bg-[#15803d] border border-[#86efac] flex items-center justify-center">
                <PixelCheck size={24} color="#ffffff" />
              </div>
              <h3 className="font-pixel text-base text-[#86efac] font-bold">MENSAGEM TRANSMITIDA</h3>
              <p className="font-mono text-xs sm:text-sm text-[#d1d5db]">
                Nossa equipe da recepção do Hotel Cortez retornará em breve.
              </p>
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  setSent(false);
                  onClose();
                }}
                className="pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white px-5 py-2.5 font-pixel text-[12px] sm:text-[13px] font-bold cursor-pointer"
              >
                CONCLUÍDO
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs sm:text-sm">
              <div>
                <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 font-bold">
                  SEU NOME
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gabriel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#140810] border border-[#5c1322] px-3 py-2.5 text-white focus:border-[#ef4444] outline-hidden text-base sm:text-sm"
                />
              </div>
              <div>
                <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 font-bold">
                  E-MAIL
                </label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#140810] border border-[#5c1322] px-3 py-2.5 text-white focus:border-[#ef4444] outline-hidden text-base sm:text-sm"
                />
              </div>
              <div>
                <label className="block font-pixel text-[12px] text-[#fca5a5] mb-1 font-bold">
                  MENSAGEM / DÚVIDA
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Como podemos te ajudar?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#140810] border border-[#5c1322] px-3 py-2.5 text-white focus:border-[#ef4444] outline-hidden resize-none text-base sm:text-sm"
                />
              </div>

              <div className="bg-[#1a0c16] p-3 border border-[#451020] space-y-2">
                <div className="text-[12px] font-pixel text-[#fca5a5] font-bold">
                  CANAIS OFICIAIS DE ATENDIMENTO
                </div>
                <OfficialSocialButtons />
              </div>

              <button
                type="submit"
                className="w-full pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white py-3 font-pixel text-[12px] sm:text-[13px] tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ENVIAR MENSAGEM</span>
                <PixelSkull size={13} color="#ffffff" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
