import React from 'react';

/**
 * Ícone SVG Oficial do WhatsApp (sem dependência externa, sem emoji, sem imagem externa)
 */
export const WhatsAppIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-3.5 h-3.5 sm:w-4 sm:h-4',
  size = 15,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.476-.15-.676.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.075-.3-.151-1.27-.468-2.419-1.493-.894-.798-1.498-1.784-1.674-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.526.151-.176.201-.301.301-.502.1-.2.05-.376-.025-.526-.075-.151-.677-1.631-.928-2.235-.245-.588-.493-.509-.676-.518-.175-.01-.376-.01-.577-.01-.201 0-.526.075-.802.376-.275.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.278.496 1.715.635.722.23 1.378.197 1.897.12.578-.087 1.78-.727 2.03-1.429.251-.702.251-1.304.176-1.43-.076-.125-.276-.2-.577-.35zM12.04 2C6.518 2 2.037 6.476 2.037 11.996c0 1.93.551 3.734 1.505 5.263L2 22l4.908-1.503c1.472.88 3.189 1.385 5.132 1.385 5.522 0 10.003-4.477 10.003-9.997 0-5.52-4.481-9.985-10.003-9.985zm0 18.232c-1.69 0-3.26-.525-4.568-1.424l-.328-.225-2.915.894.909-2.839-.247-.358a8.212 8.212 0 0 1-1.282-4.3c0-4.542 3.696-8.235 8.431-8.235 4.735 0 8.431 3.693 8.431 8.235 0 4.542-3.696 8.252-8.431 8.252z" />
  </svg>
);

/**
 * Ícone SVG Oficial do Instagram (sem dependência externa, sem emoji, sem imagem externa)
 */
export const InstagramIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-3.5 h-3.5 sm:w-4 sm:h-4',
  size = 15,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

/**
 * Componente Fixo do Sistema: Botões de WhatsApp e Instagram Oficiais
 * 
 * REGRAS FIXAS CUMPRIDAS RIGOROSAMENTE:
 * - WhatsApp Link: https://wa.me/5511943963952 (Número: +55 11 94396-3952)
 * - Instagram Link: https://instagram.com/bailedosbailes_ (Usuário: @bailedosbailes_)
 * - Totalmente fixo, sem parâmetros externos, sem campos editáveis
 * - Exclusivamente ícones SVG inline, sem emojis, sem imagens externas
 * - Abre em nova aba segura (target="_blank" rel="noopener noreferrer")
 */
export const OfficialSocialButtons: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-2 gap-1.5 pt-1 ${className}`}>
      {/* Botão Fixo WhatsApp */}
      <a
        href="https://wa.me/5511943963952"
        target="_blank"
        rel="noopener noreferrer"
        title="Falar no WhatsApp: +55 11 94396-3952"
        aria-label="Falar no WhatsApp oficial"
        className="group relative px-2 py-1.5 bg-[#062914] hover:bg-[#0b3d1f] active:bg-[#062914] border border-[#22c55e] hover:border-[#4ade80] text-[#86efac] hover:text-white font-pixel text-[8px] sm:text-[9px] tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(34,197,94,0.25)] hover:shadow-[0_0_18px_rgba(34,197,94,0.6)] cursor-pointer text-center select-none"
      >
        <WhatsAppIcon className="text-[#22c55e] group-hover:text-[#4ade80] group-hover:scale-110 transition-transform" />
        <span className="font-bold">WHATSAPP</span>
      </a>

      {/* Botão Fixo Instagram */}
      <a
        href="https://instagram.com/bailedosbailes_"
        target="_blank"
        rel="noopener noreferrer"
        title="Seguir no Instagram: @bailedosbailes_"
        aria-label="Acessar Instagram oficial @bailedosbailes_"
        className="group relative px-2 py-1.5 bg-[#20081d] hover:bg-[#340d2f] active:bg-[#20081d] border border-[#d946ef] hover:border-[#f472b6] text-[#f5d0fe] hover:text-white font-pixel text-[8px] sm:text-[9px] tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(217,70,239,0.25)] hover:shadow-[0_0_18px_rgba(217,70,239,0.6)] cursor-pointer text-center select-none"
      >
        <InstagramIcon className="text-[#e879f9] group-hover:text-[#f472b6] group-hover:scale-110 transition-transform" />
        <span className="font-bold">INSTAGRAM</span>
      </a>
    </div>
  );
};
