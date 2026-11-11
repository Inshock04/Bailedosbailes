import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const PixelSkull: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="4" y="2" width="8" height="2" fill={color} />
    <rect x="2" y="4" width="12" height="6" fill={color} />
    <rect x="1" y="6" width="14" height="3" fill={color} />
    {/* Eyes */}
    <rect x="4" y="6" width="3" height="3" fill="#07050d" />
    <rect x="9" y="6" width="3" height="3" fill="#07050d" />
    {/* Nose */}
    <rect x="7" y="9" width="2" height="2" fill="#07050d" />
    {/* Jaw */}
    <rect x="4" y="11" width="8" height="3" fill={color} />
    {/* Teeth */}
    <rect x="5" y="12" width="2" height="2" fill="#07050d" />
    <rect x="9" y="12" width="2" height="2" fill="#07050d" />
  </svg>
);

export const PixelBat: React.FC<IconProps> = ({ className = '', size = 20, color = '#120d20' }) => (
  <svg width={size} height={size} viewBox="0 0 24 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="1" y="2" width="2" height="4" fill={color} />
    <rect x="3" y="1" width="3" height="5" fill={color} />
    <rect x="6" y="3" width="3" height="4" fill={color} />
    <rect x="9" y="5" width="2" height="5" fill={color} />
    {/* Body */}
    <rect x="11" y="4" width="2" height="8" fill={color} />
    {/* Ears */}
    <rect x="10" y="2" width="1" height="3" fill={color} />
    <rect x="13" y="2" width="1" height="3" fill={color} />
    {/* Right Wing */}
    <rect x="13" y="5" width="2" height="5" fill={color} />
    <rect x="15" y="3" width="3" height="4" fill={color} />
    <rect x="18" y="1" width="3" height="5" fill={color} />
    <rect x="21" y="2" width="2" height="4" fill={color} />
  </svg>
);

export const PixelMoon: React.FC<IconProps> = ({ className = '', size = 32, color = '#f3e8cb' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    {/* Moon Circle */}
    <rect x="8" y="2" width="16" height="28" fill={color} />
    <rect x="4" y="4" width="24" height="24" fill={color} />
    <rect x="2" y="8" width="28" height="16" fill={color} />
    {/* Moon Craters */}
    <rect x="10" y="8" width="4" height="4" fill="#d9c79f" />
    <rect x="18" y="6" width="3" height="3" fill="#d9c79f" />
    <rect x="20" y="16" width="5" height="5" fill="#d9c79f" />
    <rect x="8" y="20" width="3" height="3" fill="#d9c79f" />
    <rect x="14" y="22" width="4" height="3" fill="#d9c79f" />
  </svg>
);

export const PixelPin: React.FC<IconProps> = ({ className = '', size = 16, color = '#dc2626' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="5" y="1" width="6" height="6" fill={color} />
    <rect x="4" y="2" width="8" height="5" fill={color} />
    <rect x="6" y="3" width="4" height="3" fill="#fef08a" />
    <rect x="6" y="7" width="4" height="3" fill={color} />
    <rect x="7" y="10" width="2" height="3" fill={color} />
    <rect x="7" y="13" width="2" height="2" fill={color} />
  </svg>
);

export const PixelVolume: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="5" width="3" height="6" fill={color} />
    <rect x="5" y="3" width="3" height="10" fill={color} />
    <rect x="9" y="4" width="1" height="8" fill={color} />
    <rect x="11" y="2" width="1" height="12" fill={color} />
    <rect x="13" y="1" width="1" height="14" fill={color} />
  </svg>
);

export const PixelVolumeMute: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="5" width="3" height="6" fill={color} />
    <rect x="5" y="3" width="3" height="10" fill={color} />
    <rect x="10" y="5" width="2" height="2" fill="#ef4444" />
    <rect x="13" y="5" width="2" height="2" fill="#ef4444" />
    <rect x="11.5" y="7" width="2" height="2" fill="#ef4444" />
    <rect x="10" y="9" width="2" height="2" fill="#ef4444" />
    <rect x="13" y="9" width="2" height="2" fill="#ef4444" />
  </svg>
);

export const PixelCardIcon: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="3" y="1" width="10" height="14" fill="#1b122c" />
    <rect x="3" y="1" width="10" height="1" fill={color} />
    <rect x="3" y="14" width="10" height="1" fill={color} />
    <rect x="3" y="1" width="1" height="14" fill={color} />
    <rect x="12" y="1" width="1" height="14" fill={color} />
    <rect x="7" y="6" width="2" height="4" fill="#a855f7" />
    <rect x="6" y="7" width="4" height="2" fill="#c084fc" />
  </svg>
);

export const PixelTicketIcon: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="1" y="4" width="14" height="8" fill={color} />
    <rect x="1" y="7" width="2" height="2" fill="#07050d" />
    <rect x="13" y="7" width="2" height="2" fill="#07050d" />
    <rect x="5" y="6" width="1" height="4" fill="#07050d" />
    <rect x="7" y="6" width="1" height="4" fill="#07050d" />
    <rect x="9" y="6" width="2" height="4" fill="#07050d" />
  </svg>
);

export const PixelCocktail: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="2" width="12" height="2" fill={color} />
    <rect x="3" y="4" width="10" height="2" fill={color} />
    <rect x="5" y="6" width="6" height="2" fill={color} />
    <rect x="7" y="8" width="2" height="5" fill={color} />
    <rect x="4" y="13" width="8" height="2" fill={color} />
    <rect x="10" y="1" width="2" height="2" fill="#ef4444" />
  </svg>
);

export const PixelWardrobe: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="1" width="12" height="14" fill="#1b122c" />
    <rect x="2" y="1" width="12" height="1" fill={color} />
    <rect x="2" y="14" width="12" height="1" fill={color} />
    <rect x="2" y="1" width="1" height="14" fill={color} />
    <rect x="13" y="1" width="1" height="14" fill={color} />
    <rect x="7" y="1" width="2" height="14" fill={color} />
    <rect x="5" y="7" width="1" height="2" fill="#f59e0b" />
    <rect x="10" y="7" width="1" height="2" fill="#f59e0b" />
  </svg>
);

export const PixelClose: React.FC<IconProps> = ({ className = '', size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="4" width="2" height="2" fill={color} />
    <rect x="6" y="6" width="2" height="2" fill={color} />
    <rect x="8" y="4" width="2" height="2" fill={color} />
    <rect x="10" y="2" width="2" height="2" fill={color} />
    <rect x="4" y="8" width="2" height="2" fill={color} />
    <rect x="2" y="10" width="2" height="2" fill={color} />
    <rect x="8" y="8" width="2" height="2" fill={color} />
    <rect x="10" y="10" width="2" height="2" fill={color} />
  </svg>
);

export const PixelArrow: React.FC<IconProps> = ({ className = '', size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="1" y="5" width="8" height="2" fill={color} />
    <rect x="7" y="3" width="2" height="2" fill={color} />
    <rect x="9" y="4" width="2" height="4" fill={color} />
    <rect x="7" y="7" width="2" height="2" fill={color} />
  </svg>
);

export const PixelCheck: React.FC<IconProps> = ({ className = '', size = 16, color = '#22c55e' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="8" width="2" height="3" fill={color} />
    <rect x="4" y="10" width="3" height="3" fill={color} />
    <rect x="7" y="7" width="3" height="3" fill={color} />
    <rect x="10" y="4" width="3" height="3" fill={color} />
    <rect x="13" y="1" width="2" height="3" fill={color} />
  </svg>
);

export const PixelCrown: React.FC<IconProps> = ({ className = '', size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="4" width="2" height="3" fill={color} />
    <rect x="7" y="2" width="2" height="3" fill={color} />
    <rect x="12" y="4" width="2" height="3" fill={color} />
    <rect x="2" y="7" width="12" height="4" fill={color} />
    <rect x="1" y="11" width="14" height="3" fill={color} />
    <rect x="4" y="12" width="2" height="1" fill="#dc2626" />
    <rect x="7" y="12" width="2" height="1" fill="#3b82f6" />
    <rect x="10" y="12" width="2" height="1" fill="#22c55e" />
  </svg>
);

export const PixelEye: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="4" y="4" width="8" height="2" fill={color} />
    <rect x="2" y="6" width="12" height="4" fill={color} />
    <rect x="4" y="10" width="8" height="2" fill={color} />
    <rect x="6" y="6" width="4" height="4" fill="#07050d" />
    <rect x="7" y="7" width="2" height="2" fill="#ef4444" />
  </svg>
);

export const PixelKey: React.FC<IconProps> = ({ className = '', size = 16, color = '#fbbf24' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="4" width="6" height="6" fill={color} />
    <rect x="4" y="6" width="2" height="2" fill="#07050d" />
    <rect x="8" y="6" width="6" height="2" fill={color} />
    <rect x="11" y="8" width="2" height="2" fill={color} />
    <rect x="13" y="8" width="1" height="3" fill={color} />
  </svg>
);

export const PixelSparkles: React.FC<IconProps> = ({ className = '', size = 16, color = '#fef08a' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="7" y="1" width="2" height="3" fill={color} />
    <rect x="7" y="12" width="2" height="3" fill={color} />
    <rect x="1" y="7" width="3" height="2" fill={color} />
    <rect x="12" y="7" width="3" height="2" fill={color} />
    <rect x="6" y="6" width="4" height="4" fill={color} />
    <rect x="2" y="2" width="2" height="2" fill={color} />
    <rect x="12" y="12" width="2" height="2" fill={color} />
  </svg>
);

export const PixelCursor: React.FC<IconProps> = ({ className = '', size = 16, color = '#d8b4fe' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="1" width="2" height="12" fill={color} />
    <rect x="4" y="3" width="2" height="8" fill={color} />
    <rect x="6" y="5" width="2" height="6" fill={color} />
    <rect x="8" y="7" width="2" height="6" fill={color} />
    <rect x="10" y="9" width="2" height="4" fill={color} />
    <rect x="6" y="11" width="4" height="2" fill={color} />
  </svg>
);

export const PixelPrinter: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="4" y="2" width="8" height="3" fill={color} />
    <rect x="2" y="5" width="12" height="6" fill={color} />
    <rect x="4" y="9" width="8" height="5" fill="#fef08a" />
    <rect x="5" y="11" width="6" height="1" fill="#07050d" />
    <rect x="11" y="6" width="2" height="1" fill="#ef4444" />
  </svg>
);

export const PixelChart: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="13" width="12" height="2" fill={color} />
    <rect x="2" y="2" width="2" height="12" fill={color} />
    <rect x="5" y="8" width="2" height="5" fill="#a855f7" />
    <rect x="8" y="5" width="2" height="8" fill="#f59e0b" />
    <rect x="11" y="3" width="2" height="10" fill="#22c55e" />
  </svg>
);

export const PixelWarning: React.FC<IconProps> = ({ className = '', size = 16, color = '#ef4444' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="7" y="1" width="2" height="2" fill={color} />
    <rect x="6" y="3" width="4" height="2" fill={color} />
    <rect x="5" y="5" width="6" height="4" fill={color} />
    <rect x="4" y="9" width="8" height="2" fill={color} />
    <rect x="2" y="11" width="12" height="3" fill={color} />
    <rect x="7" y="5" width="2" height="4" fill="#07050d" />
    <rect x="7" y="10" width="2" height="2" fill="#07050d" />
  </svg>
);

export const PixelDoor: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="1" width="12" height="14" fill="#1b122c" />
    <rect x="2" y="1" width="12" height="1" fill={color} />
    <rect x="2" y="1" width="1" height="14" fill={color} />
    <rect x="13" y="1" width="1" height="14" fill={color} />
    <rect x="2" y="14" width="12" height="1" fill={color} />
    <rect x="10" y="7" width="2" height="2" fill="#fbbf24" />
  </svg>
);

export const PixelGhost: React.FC<IconProps> = ({ className = '', size = 24, color = '#e0e7ff' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    {/* Head dome */}
    <rect x="5" y="1" width="6" height="2" fill={color} />
    <rect x="3" y="2" width="10" height="3" fill={color} />
    <rect x="2" y="4" width="12" height="7" fill={color} />
    {/* Spooky black eyes */}
    <rect x="4" y="5" width="2" height="3" fill="#05030a" />
    <rect x="10" y="5" width="2" height="3" fill="#05030a" />
    {/* Glow inside eye */}
    <rect x="4" y="6" width="1" height="1" fill="#60a5fa" />
    <rect x="10" y="6" width="1" height="1" fill="#60a5fa" />
    {/* Mouth */}
    <rect x="7" y="8" width="2" height="2" fill="#05030a" />
    {/* Wavy bottom tentacle hem */}
    <rect x="2" y="11" width="2" height="3" fill={color} />
    <rect x="6" y="11" width="4" height="2" fill={color} />
    <rect x="12" y="11" width="2" height="3" fill={color} />
    <rect x="3" y="14" width="2" height="1" fill={color} />
    <rect x="7" y="13" width="2" height="1" fill={color} />
    <rect x="11" y="14" width="2" height="1" fill={color} />
  </svg>
);

export const PixelHome: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="7" y="1" width="2" height="2" fill={color} />
    <rect x="5" y="3" width="6" height="2" fill={color} />
    <rect x="3" y="5" width="10" height="2" fill={color} />
    <rect x="1" y="7" width="14" height="2" fill={color} />
    <rect x="2" y="9" width="12" height="6" fill={color} />
    {/* Doorway */}
    <rect x="6" y="10" width="4" height="5" fill="#07050d" />
  </svg>
);

export const PixelInfo: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="2" y="2" width="12" height="12" fill="#180b29" />
    <rect x="2" y="2" width="12" height="1" fill={color} />
    <rect x="2" y="13" width="12" height="1" fill={color} />
    <rect x="2" y="2" width="1" height="12" fill={color} />
    <rect x="13" y="2" width="1" height="12" fill={color} />
    {/* Info Dot */}
    <rect x="7" y="4" width="2" height="2" fill={color} />
    {/* Info Bar */}
    <rect x="7" y="7" width="2" height="5" fill={color} />
    <rect x="6" y="7" width="1" height="2" fill={color} />
  </svg>
);

export const PixelUserPlus: React.FC<IconProps> = ({ className = '', size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    {/* Head */}
    <rect x="4" y="2" width="4" height="4" fill={color} />
    {/* Body */}
    <rect x="2" y="7" width="8" height="6" fill={color} />
    {/* Plus Sign */}
    <rect x="12" y="5" width="2" height="6" fill="#22c55e" />
    <rect x="10" y="7" width="6" height="2" fill="#22c55e" />
  </svg>
);

export const PixelExternalLink: React.FC<IconProps> = ({ className = '', size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={`inline-block ${className}`} shapeRendering="crispEdges">
    <rect x="5" y="1" width="6" height="2" fill={color} />
    <rect x="9" y="3" width="2" height="4" fill={color} />
    <rect x="7" y="4" width="2" height="2" fill={color} />
    <rect x="5" y="6" width="2" height="2" fill={color} />
    <rect x="1" y="3" width="2" height="8" fill={color} />
    <rect x="3" y="9" width="8" height="2" fill={color} />
  </svg>
);

export const PixelStar: React.FC<IconProps> = ({ className = '', size = 14, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`} shapeRendering="crispEdges">
    <rect x="7" y="1" width="2" height="3" fill={color} />
    <rect x="6" y="4" width="4" height="2" fill={color} />
    <rect x="1" y="7" width="14" height="2" fill={color} />
    <rect x="4" y="6" width="8" height="4" fill={color} />
    <rect x="6" y="10" width="4" height="2" fill={color} />
    <rect x="7" y="12" width="2" height="3" fill={color} />
    <rect x="7" y="7" width="2" height="2" fill="#ffffff" />
  </svg>
);

export const PixelFlame: React.FC<IconProps> = ({ className = '', size = 14, color = '#f97316' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`} shapeRendering="crispEdges">
    <rect x="8" y="1" width="2" height="2" fill={color} />
    <rect x="7" y="3" width="3" height="2" fill={color} />
    <rect x="5" y="5" width="6" height="3" fill={color} />
    <rect x="4" y="7" width="8" height="4" fill={color} />
    <rect x="3" y="9" width="10" height="3" fill={color} />
    <rect x="5" y="12" width="6" height="2" fill="#dc2626" />
    {/* Inner bright core */}
    <rect x="7" y="8" width="2" height="2" fill="#fef08a" />
    <rect x="6" y="10" width="4" height="3" fill="#fbbf24" />
  </svg>
);

export const PixelPumpkin: React.FC<IconProps> = ({ className = '', size = 15, color = '#f97316' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`} shapeRendering="crispEdges">
    {/* Stem */}
    <rect x="7" y="1" width="2" height="3" fill="#22c55e" />
    <rect x="8" y="1" width="2" height="1" fill="#15803d" />
    {/* Body */}
    <rect x="4" y="4" width="8" height="10" fill={color} />
    <rect x="2" y="5" width="12" height="8" fill={color} />
    <rect x="1" y="6" width="14" height="6" fill={color} />
    {/* Carved eyes & grin */}
    <rect x="4" y="6" width="2" height="2" fill="#1a0805" />
    <rect x="10" y="6" width="2" height="2" fill="#1a0805" />
    <rect x="4" y="10" width="2" height="1" fill="#1a0805" />
    <rect x="6" y="11" width="4" height="1" fill="#1a0805" />
    <rect x="10" y="10" width="2" height="1" fill="#1a0805" />
  </svg>
);

export const PixelShuffle: React.FC<IconProps> = ({ className = '', size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`} shapeRendering="crispEdges">
    <rect x="1" y="4" width="4" height="2" fill={color} />
    <rect x="5" y="6" width="2" height="2" fill={color} />
    <rect x="7" y="8" width="2" height="2" fill={color} />
    <rect x="9" y="10" width="4" height="2" fill={color} />
    <rect x="1" y="10" width="4" height="2" fill={color} />
    <rect x="9" y="4" width="4" height="2" fill={color} />
    <rect x="5" y="8" width="2" height="2" fill={color} />
    <rect x="7" y="6" width="2" height="2" fill={color} />
    {/* Arrowheads */}
    <rect x="12" y="2" width="2" height="6" fill={color} />
    <rect x="14" y="4" width="1" height="2" fill={color} />
    <rect x="12" y="8" width="2" height="6" fill={color} />
    <rect x="14" y="10" width="1" height="2" fill={color} />
  </svg>
);

export const PixelTrain: React.FC<IconProps> = ({ className = '', size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`} shapeRendering="crispEdges">
    <rect x="4" y="1" width="8" height="2" fill={color} />
    <rect x="3" y="3" width="10" height="9" fill={color} />
    <rect x="5" y="4" width="6" height="3" fill="#071305" />
    <rect x="5" y="9" width="2" height="2" fill="#fef08a" />
    <rect x="9" y="9" width="2" height="2" fill="#fef08a" />
    <rect x="4" y="12" width="2" height="2" fill={color} />
    <rect x="10" y="12" width="2" height="2" fill={color} />
    <rect x="2" y="14" width="12" height="1" fill={color} />
  </svg>
);

export const PixelCar: React.FC<IconProps> = ({ className = '', size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`} shapeRendering="crispEdges">
    <rect x="4" y="3" width="8" height="3" fill={color} />
    <rect x="5" y="4" width="6" height="2" fill="#071305" />
    <rect x="2" y="6" width="12" height="5" fill={color} />
    <rect x="3" y="7" width="2" height="2" fill="#fef08a" />
    <rect x="11" y="7" width="2" height="2" fill="#ef4444" />
    <rect x="3" y="11" width="3" height="3" fill="#1f2937" />
    <rect x="10" y="11" width="3" height="3" fill="#1f2937" />
  </svg>
);

export const PixelBeer: React.FC<IconProps> = ({ className = '', size = 15, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={`inline-block shrink-0 ${className}`} shapeRendering="crispEdges">
    {/* Foam */}
    <rect x="3" y="2" width="8" height="2" fill="#ffffff" />
    <rect x="2" y="3" width="10" height="2" fill="#fef9c3" />
    {/* Mug */}
    <rect x="3" y="5" width="8" height="9" fill={color} />
    <rect x="5" y="6" width="1" height="6" fill="#fef08a" />
    {/* Handle */}
    <rect x="11" y="6" width="3" height="2" fill={color} />
    <rect x="12" y="8" width="2" height="3" fill={color} />
    <rect x="11" y="11" width="3" height="2" fill={color} />
    {/* Base */}
    <rect x="2" y="14" width="10" height="1" fill="#b45309" />
  </svg>
);




