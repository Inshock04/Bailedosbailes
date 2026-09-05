import React, { useState } from 'react';
import { PixelClose, PixelSkull, PixelCheck, PixelPin } from './PixelIcons';
import { OfficialSocialButtons } from './OfficialSocialButtons';
import { audioManager } from '../utils/audio';
import { syncContactToSupabase } from '../utils/supabase';

// 1. SOBRE MODAL
export const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0e0a17] border-2 border-[#9333ea] shadow-[0_0_35px_rgba(147,51,234,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        <div className="flex items-center justify-between border-b-2 border-[#3b0764] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#c084fc" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#d8b4fe] tracking-wider">
              SOBRE O HOTEL CORTEZ
            </h2>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#2e1065] text-[#d8b4fe] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs sm:text-sm text-[#d1d5db] leading-relaxed">
          <p>
            Construído na década de 1920 pelo visionário excêntrico <strong className="text-white">James Patrick March</strong>, o Hotel Cortez nasceu como uma obra-prima da arquitetura Art Déco, projetado com labirintos secretos, corredores sem saída e aposentos privados indevassáveis.
          </p>
          <div className="bg-[#180d24] border border-[#581c87] p-3.5 text-[#e9d5ff]">
            <p className="italic">
              "Aqui, os vivos e os espíritos do passado dançam ao mesmo ritmo sob a luz da lua de Halloween. Uma vez feito o check-in, as memórias se tornam eternas."
            </p>
          </div>
          <p>
            A festa de Halloween do Hotel Cortez é uma celebração anual imersiva que combina música eletrônica de vanguarda, cenografia teatral em pixel art, coquetelaria temática e uma experiência interativa completa.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#3b0764] flex justify-end">
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="pixel-btn bg-[#9333ea] hover:bg-[#a855f7] text-white px-5 py-2.5 font-pixel text-[10px] sm:text-[11px] font-bold"
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

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Qual é a censura do evento?',
      a: 'A classificação etária é rigorosamente 18 anos. É indispensável apresentar documento original oficial com foto (RG, CNH, Passaporte ou E-Título).'
    },
    {
      q: 'O que está incluso no ingresso Open Bar?',
      a: 'O ingresso Open Bar garante consumo liberado de Gin & Tônica, Vodka, Energéticos e Caipirinhas até as 04:00 da manhã, além do copo comemorativo oficial.'
    },
    {
      q: 'O uso de fantasia é obrigatório?',
      a: 'Não é obrigatório, porém é amplamente incentivado. Convidados com fantasias ou trajes sombrios/góticos concorrem a prêmios em dinheiro e garrafas exclusivas.'
    },
    {
      q: 'Como é feita a compra do ingresso?',
      a: 'A compra oficial é realizada diretamente via WhatsApp oficial (+55 11 94396-3952) com nossa equipe organizadora. Não realizamos simulações ou cobranças diretas por formulário no site: você é atendido diretamente, paga com segurança via PIX e recebe seu comprovante com inclusão garantida na lista da portaria.'
    },
    {
      q: 'Posso transferir meu ingresso para outra pessoa?',
      a: 'Sim, a troca de titularidade pode ser solicitada pelo WhatsApp oficial (+55 11 94396-3952) até 48 horas antes do início da festa.'
    },
    {
      q: 'Como funciona o Oráculo e resgate de cupons?',
      a: 'Ao virar uma carta no oráculo, você recebe um cupom com QR Code e token único válido para 1 resgate no bar do evento por pessoa.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0e0a17] border-2 border-[#d97706] shadow-[0_0_35px_rgba(217,119,6,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        <div className="flex items-center justify-between border-b-2 border-[#451a03] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#fbbf24" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#fef08a] tracking-wider">
              PERGUNTAS FREQUENTES (FAQ)
            </h2>
          </div>
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#3b1c04] text-[#fbbf24] cursor-pointer"
            aria-label="Fechar"
          >
            <PixelClose size={18} />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="bg-[#180e1a] border border-[#582006]">
                <button
                  onClick={() => {
                    audioManager.playClick();
                    setOpenIdx(isOpen ? null : idx);
                  }}
                  className="w-full p-3 text-left flex justify-between items-center cursor-pointer hover:bg-[#251408]"
                >
                  <span className="font-pixel text-[10px] sm:text-[11px] text-[#fef08a] font-bold">{faq.q}</span>
                  <span className="font-pixel text-xs text-[#fbbf24]">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="p-3 pt-0 font-mono text-xs sm:text-sm text-[#d1d5db] border-t border-[#381404] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-[#451a03] flex justify-end">
          <button
            onClick={() => {
              audioManager.playClick();
              onClose();
            }}
            className="pixel-btn bg-[#d97706] hover:bg-[#f59e0b] text-black px-5 py-2.5 font-pixel text-[10px] sm:text-[11px] font-bold"
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioManager.playSuccess();
    
    // Envia mensagem para a tabela contacts no Supabase
    syncContactToSupabase({ name, email, message });
    
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0e0a17] border-2 border-[#ef4444] shadow-[0_0_35px_rgba(239,68,68,0.5)] p-4 sm:p-6 text-[#f3edf9] my-auto">
        <div className="flex items-center justify-between border-b-2 border-[#450a0a] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PixelSkull size={20} color="#ef4444" />
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#fca5a5] tracking-wider">
              FALE COM A RECEPÇÃO
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
              onClick={() => {
                audioManager.playClick();
                setSent(false);
                onClose();
              }}
              className="pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white px-5 py-2.5 font-pixel text-[10px] sm:text-[11px] font-bold"
            >
              CONCLUÍDO
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs sm:text-sm">
            <div>
              <label className="block font-pixel text-[10px] text-[#fca5a5] mb-1 font-bold">SEU NOME</label>
              <input
                type="text"
                required
                placeholder="Ex: Gabriel"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#140810] border border-[#5c1322] px-3 py-2.5 text-white focus:border-[#ef4444] outline-hidden text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-pixel text-[10px] text-[#fca5a5] mb-1 font-bold">E-MAIL</label>
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#140810] border border-[#5c1322] px-3 py-2.5 text-white focus:border-[#ef4444] outline-hidden text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block font-pixel text-[10px] text-[#fca5a5] mb-1 font-bold">MENSAGEM / DÚVIDA</label>
              <textarea
                required
                rows={3}
                placeholder="Como podemos te ajudar?"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-[#140810] border border-[#5c1322] px-3 py-2.5 text-white focus:border-[#ef4444] outline-hidden resize-none text-xs sm:text-sm"
              />
            </div>

            <div className="bg-[#1a0c16] p-3 border border-[#451020] space-y-2">
              <div className="text-[10px] font-pixel text-[#fca5a5] font-bold">
                CANAIS OFICIAIS DE ATENDIMENTO
              </div>
              <OfficialSocialButtons />
            </div>

            <button
              type="submit"
              className="w-full pixel-btn bg-[#dc2626] hover:bg-[#ef4444] text-white py-3 font-pixel text-[10px] sm:text-[11px] tracking-wider font-bold flex items-center justify-center gap-2"
            >
              <span>ENVIAR MENSAGEM</span>
              <PixelSkull size={13} color="#ffffff" />
            </button>

          </form>
        )}
      </div>
    </div>
  );
};
