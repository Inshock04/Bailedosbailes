import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * POP ART COMIC VECTOR ICONS
 * Replaces simple blocky shapes with sharp, inked Pop Art illustrations
 * featuring heavy black comic outlines (#000000), hard offset shadows, and vibrant fills.
 */

export const PixelSkull: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Hard Black Comic Shadow */}
    <path d="M13 3 C7.5 3 4 6.5 4 11.5 C4 14 5.5 16 7 17 V22 H19 V17 C20.5 16 22 14 22 11.5 C22 6.5 18.5 3 13 3 Z" fill="#000000" />
    {/* Pop Art Star / Skull Badge */}
    <path
      d="M11.5 2 C6.5 2 3 5.5 3 10.5 C3 13 4.5 15 6 16 V20.5 H17 V16 C18.5 15 20 13 20 10.5 C20 5.5 16.5 2 11.5 2 Z"
      fill={color === 'currentColor' ? '#facc15' : color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Angular Pop Art Sunglasses on Skull */}
    <polygon points="4.5,9 11,9 10,13 5.5,13" fill="#000000" />
    <polygon points="12,9 18.5,9 17.5,13 13,13" fill="#000000" />
    <line x1="6" y1="10" x2="8" y2="12" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="13.5" y1="10" x2="15.5" y2="12" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
    {/* Nose & Jaw */}
    <polygon points="11.5,13 10,15.5 13,15.5" fill="#000000" />
    <line x1="9" y1="17.5" x2="9" y2="20" stroke="#000000" strokeWidth="2" />
    <line x1="11.5" y1="17.5" x2="11.5" y2="20" stroke="#000000" strokeWidth="2" />
    <line x1="14" y1="17.5" x2="14" y2="20" stroke="#000000" strokeWidth="2" />
  </svg>
);

export const PixelBat: React.FC<IconProps> = ({ className = '', size = 20, color = '#ff1e38' }) => (
  <svg width={size} height={size} viewBox="0 0 24 16" fill="none" className={`inline-block shrink-0 ${className}`}>
    <path
      d="M1 3 L6 1 L9 5 L11 2 L12 4 L13 2 L15 5 L18 1 L23 3 L20 9 L15 8 L12 14 L9 8 L4 9 Z"
      fill={color}
      stroke="#000000"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const PixelMoon: React.FC<IconProps> = ({ className = '', size = 32, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <path
      d="M19 15.5 A7.5 7.5 0 0 1 10.5 4 A8.5 8.5 0 1 0 19 15.5 Z"
      fill={color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const PixelPin: React.FC<IconProps> = ({ className = '', size = 16, color = '#ff1e38' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Hard Black Comic Shadow */}
    <path d="M13.5 3 C9 3 5.5 6.5 5.5 11 C5.5 16.5 13.5 23 13.5 23 C13.5 23 21.5 16.5 21.5 11 C21.5 6.5 18 3 13.5 3 Z" fill="#000000" />
    {/* Pin Body */}
    <path
      d="M12 2 C7.5 2 4 5.5 4 10 C4 15.5 12 22 12 22 C12 22 20 15.5 20 10 C20 5.5 16.5 2 12 2 Z"
      fill={color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="3.5" fill="#facc15" stroke="#000000" strokeWidth="2" />
  </svg>
);

export const PixelVolume: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <polygon points="3,9 8,9 14,4 14,20 8,15 3,15" fill={color} stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M17 8 L21 6 M17 12 L22 12 M17 16 L21 18" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const PixelVolumeMute: React.FC<IconProps> = ({ className = '', size = 16, color = '#9ca3af' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <polygon points="3,9 8,9 14,4 14,20 8,15 3,15" fill={color} stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M17 9 L22 15 M22 9 L17 15" stroke="#ff1e38" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

export const PixelCardIcon: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <rect x="6" y="3" width="14" height="19" rx="2" fill="#000000" />
    <rect x="4" y="2" width="14" height="19" rx="2" fill="#a855f7" stroke="#000000" strokeWidth="2.2" />
    <polygon points="11,6 13,10 17,10.5 14,13 15,17 11,15 7,17 8,13 5,10.5 9,10" fill={color} stroke="#000000" strokeWidth="1.5" />
  </svg>
);

export const PixelTicketIcon: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Hard Black Shadow */}
    <path d="M3 7 H23 V12 A2.5 2.5 0 0 0 23 16 V20 H3 V16 A2.5 2.5 0 0 0 3 12 Z" fill="#000000" />
    {/* Pop Art Ticket Body */}
    <path
      d="M2 5 H21 V9.5 A2.5 2.5 0 0 0 21 14.5 V19 H2 V14.5 A2.5 2.5 0 0 0 2 9.5 Z"
      fill={color === 'currentColor' ? '#facc15' : color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <line x1="15" y1="6" x2="15" y2="18" stroke="#000000" strokeWidth="2" strokeDasharray="2.5 2" />
    <polygon points="8.5,8.5 9.8,11 12.5,11.3 10.5,13 11,15.5 8.5,14.2 6,15.5 6.5,13 4.5,11.3 7.2,11" fill="#ff1e38" stroke="#000000" strokeWidth="1.2" />
  </svg>
);

export const PixelCocktail: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Hard Shadow */}
    <polygon points="4,5 22,5 13,15" fill="#000000" />
    {/* Olive Pick */}
    <line x1="18" y1="1.5" x2="11" y2="11" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="15.5" cy="5" r="2.5" fill="#84cc16" stroke="#000000" strokeWidth="1.8" />
    {/* Martini Glass */}
    <polygon points="3,4 21,4 12,14" fill="#38bdf8" stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
    <polygon points="6,7 18,7 12,14" fill={color === 'currentColor' ? '#ff1e38' : color} stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
    <line x1="12" y1="14" x2="12" y2="21" stroke="#000000" strokeWidth="2.6" strokeLinecap="round" />
    <line x1="7" y1="21" x2="17" y2="21" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

export const PixelWardrobe: React.FC<IconProps> = ({ className = '', size = 16, color = '#c084fc' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Pop Art Masquerade Mask */}
    <path
      d="M2 10 C2 5 8 5 12 8 C16 5 22 5 22 10 C22 16 16 19 13 15 L12 18 L11 15 C8 19 2 16 2 10 Z"
      fill={color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <polygon points="5,10 8,8.5 10,10.5 7.5,12" fill="#000000" />
    <polygon points="19,10 16,8.5 14,10.5 16.5,12" fill="#000000" />
  </svg>
);

export const PixelClose: React.FC<IconProps> = ({ className = '', size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <path d="M6 6 L19 19 M19 6 L6 19" stroke="#000000" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M5 5 L18 18 M18 5 L5 18" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

export const PixelArrow: React.FC<IconProps> = ({ className = '', size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <polygon points="4,9 13,9 13,4 22,12 13,20 13,15 4,15" fill={color} stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

export const PixelCheck: React.FC<IconProps> = ({ className = '', size = 16, color = '#22c55e' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <path d="M4 13 L10 19 L21 6" stroke="#000000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12 L9 18 L20 5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PixelCrown: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <polygon
      points="2,18 4,6 9,12 12,4 15,12 20,6 22,18"
      fill={color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <rect x="2" y="18" width="20" height="3.5" fill="#ff1e38" stroke="#000000" strokeWidth="2" />
  </svg>
);

export const PixelEye: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <path
      d="M2 12 C5 6 19 6 22 12 C19 18 5 18 2 12 Z"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="4" fill={color === 'currentColor' ? '#38bdf8' : color} stroke="#000000" strokeWidth="2" />
    <circle cx="12" cy="12" r="1.5" fill="#000000" />
  </svg>
);

export const PixelKey: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <circle cx="8" cy="12" r="5.5" fill={color} stroke="#000000" strokeWidth="2.2" />
    <circle cx="8" cy="12" r="2" fill="#000000" />
    <path d="M13.5 12 H22 V16 H19 V12 M16.5 12 V15" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.5 12 H22 V16 H19 V12 M16.5 12 V15" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PixelSparkles: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Comic Pop Art Starburst */}
    <polygon
      points="12,1 15,8 22,6 17,12 22,18 15,16 12,23 9,16 2,18 7,12 2,6 9,8"
      fill={color}
      stroke="#000000"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2.5" fill="#ff1e38" />
  </svg>
);

export const PixelCursor: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <polygon points="4,2 20,11 12,13 16,21 12,22 8,14 4,18" fill={color} stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

export const PixelPrinter: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <rect x="6" y="3" width="12" height="5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
    <rect x="3" y="8" width="18" height="9" rx="1.5" fill={color} stroke="#000000" strokeWidth="2.2" />
    <rect x="6" y="14" width="12" height="7" fill="#facc15" stroke="#000000" strokeWidth="2" />
  </svg>
);

export const PixelChart: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <rect x="3" y="12" width="4.5" height="9" fill="#a855f7" stroke="#000000" strokeWidth="2" />
    <rect x="9.75" y="7" width="4.5" height="14" fill="#facc15" stroke="#000000" strokeWidth="2" />
    <rect x="16.5" y="3" width="4.5" height="18" fill="#22c55e" stroke="#000000" strokeWidth="2" />
    <line x1="2" y1="21" x2="22" y2="21" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const PixelWarning: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <polygon points="13,3 23,21 3,21" fill="#000000" />
    <polygon points="12,2 22,20 2,20" fill={color} stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
    <line x1="12" y1="8" x2="12" y2="14" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
    <circle cx="12" cy="17.2" r="1.5" fill="#000000" />
  </svg>
);

export const PixelDoor: React.FC<IconProps> = ({ className = '', size = 16, color = '#ff1e38' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <rect x="5" y="2" width="14" height="20" fill={color} stroke="#000000" strokeWidth="2.2" />
    <circle cx="15.5" cy="12" r="1.8" fill="#facc15" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

export const PixelGhost: React.FC<IconProps> = ({ className = '', size = 24, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <polygon
      points="12,2 15,8 22,6 17,12 22,18 15,16 12,22 9,16 2,18 7,12 2,6 9,8"
      fill={color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const PixelHome: React.FC<IconProps> = ({ className = '', size = 16, color = '#ff1e38' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <polygon points="12,2 22,11 19,11 19,21 5,21 5,11 2,11" fill={color} stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
    <rect x="9.5" y="13" width="5" height="8" fill="#facc15" stroke="#000000" strokeWidth="2" />
  </svg>
);

export const PixelInfo: React.FC<IconProps> = ({ className = '', size = 16, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <circle cx="13" cy="13" r="9.5" fill="#000000" />
    <circle cx="12" cy="12" r="9.5" fill={color} stroke="#000000" strokeWidth="2.2" />
    <line x1="12" y1="11" x2="12" y2="17" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
    <circle cx="12" cy="7.5" r="1.6" fill="#000000" />
  </svg>
);

export const PixelUserPlus: React.FC<IconProps> = ({ className = '', size = 16, color = '#38bdf8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <circle cx="9" cy="8" r="4" fill={color} stroke="#000000" strokeWidth="2.2" />
    <path d="M3 20 C3 15.5 6 13.5 9 13.5 C12 13.5 15 15.5 15 20 Z" fill={color} stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M19 8 V14 M16 11 H22" stroke="#22c55e" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

export const PixelExternalLink: React.FC<IconProps> = ({ className = '', size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <path d="M14 3 H21 V10 M21 3 L10 14 M19 14 V20 H4 V5 H10" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PixelStar: React.FC<IconProps> = ({ className = '', size = 14, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Hard Black Shadow */}
    <polygon points="13,3 16,9.5 23,10.2 17.8,14.8 19.3,21.8 13,18.2 6.7,21.8 8.2,14.8 3,10.2 10,9.5" fill="#000000" />
    {/* Pop Art Star */}
    <polygon
      points="12,2 15,8.5 22,9.2 16.8,13.8 18.3,20.8 12,17.2 5.7,20.8 7.2,13.8 2,9.2 9,8.5"
      fill={color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const PixelFlame: React.FC<IconProps> = ({ className = '', size = 14, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Pop Art Lightning Bolt / Flash ("Oferta Relâmpago") */}
    <polygon points="14.5,3 6,14 13,14 10.5,23 20,11 13,11" fill="#000000" />
    <polygon
      points="13.5,2 5,13 12,13 9.5,22 19,10 12,10"
      fill={color}
      stroke="#000000"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const PixelPumpkin: React.FC<IconProps> = ({ className = '', size = 15, color = '#ff1e38' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Pop Art Starburst Badge */}
    <polygon
      points="12,2 15,8 22,7 17,12 21,18 14,17 12,22 10,17 3,18 7,12 2,7 9,8"
      fill={color}
      stroke="#000000"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" fill="#facc15" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

export const PixelShuffle: React.FC<IconProps> = ({ className = '', size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <path d="M16 3 H21 V8 M4 20 L21 3 M21 16 V21 H16 M15 15 L21 21 M4 4 L9 9" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PixelTrain: React.FC<IconProps> = ({ className = '', size = 15, color = '#84cc16' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <rect x="4" y="3" width="16" height="15" rx="2.5" fill={color} stroke="#000000" strokeWidth="2.2" />
    <rect x="6.5" y="5.5" width="11" height="5" fill="#0f172a" stroke="#000000" strokeWidth="1.8" />
    <circle cx="8.5" cy="14.5" r="1.6" fill="#facc15" stroke="#000000" strokeWidth="1.2" />
    <circle cx="15.5" cy="14.5" r="1.6" fill="#facc15" stroke="#000000" strokeWidth="1.2" />
    <path d="M6 21 L8 18 M18 21 L16 18" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const PixelCar: React.FC<IconProps> = ({ className = '', size = 15, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    <path d="M5 11 L7.5 5.5 H16.5 L19 11 L21.5 12 V17.5 H2.5 V12 Z" fill={color} stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
    <polygon points="7,10.5 8.5,7 15.5,7 17,10.5" fill="#38bdf8" stroke="#000000" strokeWidth="1.6" />
    <circle cx="7" cy="17.5" r="2.8" fill="#000000" stroke="#ffffff" strokeWidth="1.2" />
    <circle cx="17" cy="17.5" r="2.8" fill="#000000" stroke="#ffffff" strokeWidth="1.2" />
  </svg>
);

export const PixelBeer: React.FC<IconProps> = ({ className = '', size = 15, color = '#facc15' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`inline-block shrink-0 ${className}`}>
    {/* Handle */}
    <path d="M16 9 H20 V17 H16" stroke="#000000" strokeWidth="4" strokeLinejoin="round" />
    <path d="M16 9 H20 V17 H16" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    {/* Mug Body */}
    <rect x="4" y="7" width="12" height="14" rx="1.5" fill={color} stroke="#000000" strokeWidth="2.2" />
    {/* Pop Art Foam */}
    <path
      d="M3 7 C3 4 6 3 8 5 C10 2.5 13 3.5 14 5 C16 4 17.5 6 16.5 8 H3.5 Z"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <line x1="7.5" y1="10.5" x2="7.5" y2="17.5" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="11.5" y1="10.5" x2="11.5" y2="17.5" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
