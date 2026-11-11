import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  isHovered?: boolean;
  isActive?: boolean;
}

// 1. TRENÓ COM RENAS VOANDO (Home Page)
export const FlyingSleighReindeerIcon: React.FC<IconProps> = ({
  size,
  className = 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 -translate-y-0.5' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    {/* Festive Warm Glow Halo */}
    <circle cx="24" cy="24" r="22" fill="#f59e0b" fillOpacity="0.22" />

    {/* Sparkling Stars in Night Sky */}
    <circle cx="9" cy="10" r="1.4" fill="#fef08a" />
    <circle cx="24" cy="7" r="1.6" fill="#ffffff" />
    <circle cx="40" cy="9" r="1.3" fill="#fef08a" />

    {/* Golden Magic Trail / Sleigh Runners */}
    <path
      d="M3 36C7 38 16 38 23 35"
      stroke="#fbbf24"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M21 35C23 35 25 33 24 31"
      stroke="#fbbf24"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line x1="8" y1="33" x2="8" y2="37" stroke="#fbbf24" strokeWidth="1.8" />
    <line x1="17" y1="32" x2="17" y2="36" stroke="#fbbf24" strokeWidth="1.8" />

    {/* Gift Sack in Back of Sleigh */}
    <circle cx="8.5" cy="24" r="4.5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.4" />
    <rect x="11" y="21" width="4.5" height="4.5" rx="0.8" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.2" />

    {/* Santa's Red Sleigh Body (Left Side, Flying Upward Right) */}
    <path
      d="M4 25C4 22 6 21 8 23L11 26H19C21 26 22 24 23 22C23.5 25 22 31 19 32H7C4.5 32 4 29 4 25Z"
      fill="#dc2626"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Gold Trim on Sleigh */}
    <path d="M6 28.5H19" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />

    {/* Golden Reins Connecting Sleigh to Flying Reindeer */}
    <path
      d="M22 24C26 23 30 21 34 19"
      stroke="#fde047"
      strokeWidth="1.5"
      strokeDasharray="2 1.5"
      strokeLinecap="round"
    />

    {/* Flying Reindeer (Right Side, Leaping Upward) */}
    {/* Reindeer Hind & Front Legs (Leaping pose) */}
    <path d="M29 25L25 30" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M32 25L30 31" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M39 22L43 26" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M40 21L45 22" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />

    {/* Reindeer Body & Neck */}
    <ellipse
      cx="34.5"
      cy="22"
      rx="6"
      ry="3.6"
      transform="rotate(-14 34.5 22)"
      fill="#d97706"
      stroke="#ffffff"
      strokeWidth="1.5"
    />
    {/* White Tail */}
    <circle cx="28" cy="21.5" r="1.6" fill="#ffffff" />

    {/* Reindeer Neck & Head */}
    <path
      d="M37 20L40 14L45 15.5L43 18.5L39 21Z"
      fill="#d97706"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Reindeer Antlers (Chifres) */}
    <path
      d="M39.5 14L37 9M38.2 11.5L35.5 11.5M41 13.5L40.5 8.5M40.7 10.5L43 9.5"
      stroke="#fef08a"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* Glowing Red Rudolph Nose & Eye */}
    <circle cx="45.5" cy="16" r="1.8" fill="#ff0033" stroke="#ffffff" strokeWidth="0.8" />
    <circle cx="41.5" cy="15.5" r="0.9" fill="#ffffff" />
  </svg>
);

// 2. GRINCH (Info)
export const GrinchIcon: React.FC<IconProps> = ({
  size,
  className = 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 -translate-y-1' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    {/* Neon Green Grinch Aura */}
    <circle cx="24" cy="25" r="21" fill="#22c55e" fillOpacity="0.25" />

    {/* Santa Hat on Grinch */}
    <path
      d="M12 16C14 7 24 4 35 8C38 9 41 13 42 17L36 16C31 13 20 14 12 16Z"
      fill="#dc2626"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Hat White Pom-Pom */}
    <circle cx="42.5" cy="17.5" r="3.2" fill="#ffffff" stroke="#dc2626" strokeWidth="1" />
    {/* Fluffy White Hat Trim */}
    <rect
      x="10"
      y="13"
      width="26"
      height="5"
      rx="2.5"
      fill="#ffffff"
      stroke="#14532d"
      strokeWidth="1.4"
    />

    {/* Grinch Shaggy Green Fur Face (Pear-shaped with tufted cheeks) */}
    <path
      d="M13 18C11 22 11 26 9 29L12 30C10 33 13 37 17 39C20 41 22 43 24 43C26 43 28 41 31 39C35 37 38 33 36 30L39 29C37 26 37 22 35 18H13Z"
      fill="#4ade80"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Mischievous Fur Brow Ridge */}
    <path
      d="M15 21L22 24M33 21L26 24"
      stroke="#14532d"
      strokeWidth="2.6"
      strokeLinecap="round"
    />

    {/* Iconic Slanted Yellow Grinch Eyes with Red Pupils */}
    <path
      d="M14.5 24.5C16 22.5 20 23.5 21.5 26C19.5 27.5 16 27 14.5 24.5Z"
      fill="#fde047"
      stroke="#14532d"
      strokeWidth="1.4"
    />
    <circle cx="18.5" cy="25.2" r="1.3" fill="#dc2626" />

    <path
      d="M33.5 24.5C32 22.5 28 23.5 26.5 26C28.5 27.5 32 27 33.5 24.5Z"
      fill="#fde047"
      stroke="#14532d"
      strokeWidth="1.4"
    />
    <circle cx="29.5" cy="25.2" r="1.3" fill="#dc2626" />

    {/* Grinch Wrinkled Nose */}
    <path
      d="M22.5 28.5C23.5 27.5 24.5 27.5 25.5 28.5L24 30.5L22.5 28.5Z"
      fill="#15803d"
      stroke="#14532d"
      strokeWidth="1.2"
    />

    {/* Iconic Wide Sly Grinch Smirk */}
    <path
      d="M14 33C17 38 31 38 34 33"
      stroke="#14532d"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Smirk Corner Creases */}
    <path d="M12.5 32C13 33.5 14 34.5 15.5 34.5" stroke="#14532d" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M35.5 32C35 33.5 34 34.5 32.5 34.5" stroke="#14532d" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// 3. TAÇA DE DRINK (Ingressos)
export const CocktailGlassIcon: React.FC<IconProps> = ({
  size,
  className = 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 -rotate-3' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    {/* Festive Cocktail Glow */}
    <circle cx="24" cy="24" r="21" fill="#f59e0b" fillOpacity="0.25" />

    {/* Citrus / Lime Wheel Garnish on Left Rim */}
    <circle cx="10" cy="12" r="5" fill="#4ade80" stroke="#ffffff" strokeWidth="1.6" />
    <circle cx="10" cy="12" r="2" fill="#fef08a" />

    {/* Cocktail Skewered Olives / Cherry Pick */}
    <line x1="35" y1="5" x2="23" y2="23" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="31" cy="11" r="2.8" fill="#84cc16" stroke="#ffffff" strokeWidth="1.2" />
    <circle cx="31.5" cy="10.8" r="1" fill="#ef4444" />
    <circle cx="27" cy="17" r="2.6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.2" />

    {/* Martini / Cocktail Glass Bowl Outer */}
    <path
      d="M8 13H40L24 29L8 13Z"
      fill="#1e1b4b"
      fillOpacity="0.45"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />

    {/* Vibrant Drink Liquid Inside Glass */}
    <path
      d="M12.5 17.5H35.5L24 29L12.5 17.5Z"
      fill="#ff0033"
      stroke="#fde047"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />

    {/* Fizzy Bubbles */}
    <circle cx="22" cy="21" r="1.2" fill="#ffffff" />
    <circle cx="26" cy="23" r="1" fill="#fef08a" />
    <circle cx="24" cy="15" r="1.1" fill="#ffffff" />

    {/* Glass Stem */}
    <line x1="24" y1="29" x2="24" y2="42" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />

    {/* Glass Base */}
    <path
      d="M15 42H33"
      stroke="#ffffff"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <path
      d="M18 40L24 38L30 40"
      stroke="#fde047"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

// 4. CAIXA DE PRESENTES E MÁSCARA DE CARNAVAL (Cupons)
export const GiftCarnivalMaskIcon: React.FC<IconProps> = ({
  size,
  className = 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 -rotate-2 -translate-y-0.5' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    {/* Carnatal Festive Aura */}
    <circle cx="24" cy="25" r="21" fill="#a855f7" fillOpacity="0.28" />

    {/* Carnival Plume Feathers Rising from Top */}
    <path
      d="M24 14C22 8 18 5 15 6C17 9 19 12 22 15"
      fill="#22c55e"
      stroke="#ffffff"
      strokeWidth="1.2"
    />
    <path
      d="M24 14C24 7 26 4 28 4C28 8 27 11 25 15"
      fill="#f59e0b"
      stroke="#ffffff"
      strokeWidth="1.2"
    />
    <path
      d="M26 15C29 9 33 7 36 8C34 11 31 13 27 16"
      fill="#ec4899"
      stroke="#ffffff"
      strokeWidth="1.2"
    />

    {/* Present / Gift Box (Bottom Half) */}
    <rect
      x="10"
      y="25"
      width="28"
      height="18"
      rx="2"
      fill="#dc2626"
      stroke="#ffffff"
      strokeWidth="2"
    />
    {/* Gift Box Lid */}
    <rect
      x="8"
      y="21"
      width="32"
      height="5"
      rx="1.5"
      fill="#ef4444"
      stroke="#ffffff"
      strokeWidth="1.8"
    />
    {/* Golden Vertical & Horizontal Ribbon on Gift Box */}
    <rect x="21.5" y="21" width="5" height="22" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />
    <rect x="10" y="32" width="28" height="4" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />

    {/* Carnival Mask (Máscara de Carnaval) Perched Over Top of Gift Box */}
    <path
      d="M7 16C7 11 14 10 19 13C22 15 26 15 29 13C34 10 41 11 41 16C41 21 36 25 30 24C27 23.5 25.5 21 24 21C22.5 21 21 23.5 18 24C12 25 7 21 7 16Z"
      fill="#9333ea"
      stroke="#fde047"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Mask Cat-Eye Cutouts */}
    <path
      d="M12 16.5C14 14.5 18 15 19.5 17C17.5 18.5 14 18.5 12 16.5Z"
      fill="#120306"
      stroke="#ffffff"
      strokeWidth="1.2"
    />
    <path
      d="M36 16.5C34 14.5 30 15 28.5 17C30.5 18.5 34 18.5 36 16.5Z"
      fill="#120306"
      stroke="#ffffff"
      strokeWidth="1.2"
    />
    {/* Center Crown Jewel on Mask */}
    <circle cx="24" cy="15.5" r="2" fill="#fde047" stroke="#ffffff" strokeWidth="0.8" />
  </svg>
);

// 5. CHAVE / ADMIN (Área de ADM)
export const VintageKeyIcon: React.FC<IconProps> = ({
  size,
  className = 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 rotate-6 -translate-y-0.5' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    <circle cx="24" cy="24" r="21" fill="#f59e0b" fillOpacity="0.25" />
    <circle cx="14" cy="14" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.2" />
    <circle cx="14" cy="14" r="4.5" fill="#120306" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="14" cy="14" r="2" fill="#ef4444" />
    <line
      x1="19"
      y1="19"
      x2="38"
      y2="38"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <line
      x1="19"
      y1="19"
      x2="38"
      y2="38"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M34 34L39 29L43 33L40 36L42 38L38 42L34 38L35 37L34 34Z"
      fill="#f59e0b"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

// Backward compatibility alias exports
export const VictorianMansionIcon = FlyingSleighReindeerIcon;
export const CryingNunIcon = GrinchIcon;
export const CircusTentIcon = CocktailGlassIcon;
export const WitchHatIcon = GiftCarnivalMaskIcon;
export const MansionAnimatedRed = FlyingSleighReindeerIcon;
export const GhostAnimatedRed = GrinchIcon;
export const PumpkinAnimatedRed = CocktailGlassIcon;
export const DeckAnimatedRed = GiftCarnivalMaskIcon;
export const GrimoireAnimatedRed = VintageKeyIcon;
