import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  isHovered?: boolean;
  isActive?: boolean;
}

/**
 * POP ART COMIC NAVIGATION ICONS — CARNATAL THE TRIPLEX
 * Cohesive set of 5 Pop Art medallions:
 * - Uniform circular Pop Art badge with hard black comic offset shadow & Ben-Day halftone dots
 * - Single bold, unmistakable icon in the center with thick black ink outlines (#000000)
 *   and crisp white comic specular highlights
 */

// 1. HOME PAGE — POP ART HOUSE / TRIPLEX MEDALLION
export const FlyingSleighReindeerIcon: React.FC<IconProps> = ({
  size,
  className = 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 -translate-y-0.5' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    <defs>
      <pattern id="halftone-home" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
        <circle cx="2.5" cy="2.5" r="1.2" fill="#991b1b" />
      </pattern>
    </defs>

    {/* Hard Black Comic Offset Shadow Circle */}
    <circle cx="35" cy="34" r="25" fill="#000000" />

    {/* Pop Art Crimson Medallion Disc */}
    <circle
      cx="32"
      cy="31"
      r="25"
      fill="#ff1e38"
      stroke="#000000"
      strokeWidth="3"
    />
    <circle cx="32" cy="31" r="23" fill="url(#halftone-home)" opacity="0.55" />

    {/* House Hard Black Drop Shadow */}
    <path
      d="M34 14 L53 30 H48 V48 H20 V30 H15 Z"
      fill="#000000"
    />

    {/* Chimney */}
    <rect
      x="40"
      y="14"
      width="6"
      height="11"
      fill="#facc15"
      stroke="#000000"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />

    {/* House Main Walls (Crisp White Pop Art) */}
    <rect
      x="18"
      y="27"
      width="28"
      height="20"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Pop Art Yellow Pitched Roof */}
    <polygon
      points="32,12 52,29 12,29"
      fill="#facc15"
      stroke="#000000"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Door (Pop Art Red) */}
    <rect
      x="23"
      y="34"
      width="8"
      height="13"
      fill="#ff1e38"
      stroke="#000000"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />

    {/* Window (Pop Art Cyan with Glare) */}
    <rect
      x="35"
      y="33"
      width="7"
      height="7"
      fill="#38bdf8"
      stroke="#000000"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <line x1="36.5" y1="38.5" x2="40.5" y2="34.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 2. INFO — POP ART COMIC SPEECH BUBBLE ("i") MEDALLION
export const GrinchIcon: React.FC<IconProps> = ({
  size,
  className = 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 -translate-y-0.5' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    <defs>
      <pattern id="halftone-info" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
        <circle cx="2.5" cy="2.5" r="1.2" fill="#15803d" />
      </pattern>
    </defs>

    {/* Hard Black Comic Offset Shadow Circle */}
    <circle cx="35" cy="34" r="25" fill="#000000" />

    {/* Pop Art Acid Green Medallion Disc */}
    <circle
      cx="32"
      cy="31"
      r="25"
      fill="#84cc16"
      stroke="#000000"
      strokeWidth="3"
    />
    <circle cx="32" cy="31" r="23" fill="url(#halftone-info)" opacity="0.55" />

    {/* Comic Speech Bubble Hard Black Shadow */}
    <path
      d="M35 14 C23 14 15 21 15 30 C15 35 18 39.5 23 42 L19 50 L29 45 C31 45.5 33 45.5 35 45.5 C47 45.5 55 38.5 55 30 C55 21 47 14 35 14 Z"
      fill="#000000"
    />

    {/* Crisp White Comic Speech Bubble */}
    <path
      d="M32 12 C20 12 12 19 12 28 C12 33 15 37.5 20 40 L16 48 L26 43 C28 43.5 30 43.5 32 43.5 C44 43.5 52 36.5 52 28 C52 19 44 12 32 12 Z"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Bold Pop Art "i" Icon Inside Bubble (With Hard Shadow) */}
    <circle cx="33.5" cy="20.5" r="3.2" fill="#000000" />
    <circle cx="32" cy="19.5" r="3.2" fill="#ff1e38" stroke="#000000" strokeWidth="2.2" />

    <rect x="30" y="26" width="6.5" height="12" rx="1.5" fill="#000000" />
    <rect
      x="28.5"
      y="25"
      width="6.5"
      height="12"
      rx="1.5"
      fill="#facc15"
      stroke="#000000"
      strokeWidth="2.2"
    />
  </svg>
);

// 3. INGRESSOS — ROY LICHTENSTEIN POP ART MARTINI & OLIVES MEDALLION
export const CocktailGlassIcon: React.FC<IconProps> = ({
  size,
  className = 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 -rotate-3' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    <defs>
      <pattern id="halftone-drink" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <circle cx="2.5" cy="2.5" r="1.25" fill="#f97316" />
      </pattern>
    </defs>

    {/* Hard Black Comic Shadow Circle */}
    <circle cx="35" cy="34" r="25" fill="#000000" />

    {/* Pop Art Yellow Halftone Sunburst Disc */}
    <circle
      cx="32"
      cy="31"
      r="25"
      fill="#facc15"
      stroke="#000000"
      strokeWidth="3"
    />
    <circle cx="32" cy="31" r="23" fill="url(#halftone-drink)" opacity="0.55" />

    {/* Martini Glass Hard Black Drop Shadow */}
    <path d="M13 18 H55 L34 40 V54 H46 V58 H22 V54 H34 V40 Z" fill="#000000" />

    {/* Skewered Pop Art Olives on Pick */}
    <line x1="47" y1="6" x2="29" y2="30" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
    <circle cx="41" cy="14" r="4.8" fill="#84cc16" stroke="#000000" strokeWidth="2.6" />
    <circle cx="42" cy="13.5" r="1.8" fill="#ff1e38" />
    <circle cx="35" cy="22" r="4.5" fill="#84cc16" stroke="#000000" strokeWidth="2.6" />
    <circle cx="36" cy="21.5" r="1.7" fill="#ff1e38" />

    {/* Martini Bowl (Crisp Cyan & White Comic Reflection) */}
    <polygon
      points="10,16 52,16 31,38"
      fill="#e0f2fe"
      stroke="#000000"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Vibrant Crimson Cocktail Liquid Inside */}
    <polygon
      points="16,22 46,22 31,38"
      fill="#ff1e38"
      stroke="#000000"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />

    {/* Comic White Highlight Slash */}
    <line x1="18" y1="20" x2="27" y2="31" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />

    {/* Stem & Base with Heavy Black Ink */}
    <line x1="31" y1="38" x2="31" y2="54" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
    <polygon
      points="19,55 43,55 40,51 22,51"
      fill="#38bdf8"
      stroke="#000000"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />
  </svg>
);

// 4. CUPONS — POP ART DISCOUNT COUPON TICKET & STAR MEDALLION
export const GiftCarnivalMaskIcon: React.FC<IconProps> = ({
  size,
  className = 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 -rotate-2 -translate-y-0.5' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    <defs>
      <pattern id="halftone-coupon" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
        <circle cx="2.5" cy="2.5" r="1.25" fill="#6b21a8" />
      </pattern>
    </defs>

    {/* Hard Black Comic Offset Shadow Circle */}
    <circle cx="35" cy="34" r="25" fill="#000000" />

    {/* Pop Art Purple/Magenta Medallion Disc */}
    <circle
      cx="32"
      cy="31"
      r="25"
      fill="#a855f7"
      stroke="#000000"
      strokeWidth="3"
    />
    <circle cx="32" cy="31" r="23" fill="url(#halftone-coupon)" opacity="0.55" />

    {/* Tilted Pop Art Coupon Ticket with Notches */}
    <g transform="rotate(-14 32 31)">
      {/* Hard Black Ticket Shadow */}
      <path
        d="M12 20 H56 V27 A4.5 4.5 0 0 0 56 36 V43 H12 V36 A4.5 4.5 0 0 0 12 27 Z"
        fill="#000000"
      />

      {/* Golden Yellow Pop Art Coupon Body */}
      <path
        d="M10 18 H54 V25 A4.5 4.5 0 0 0 54 34 V41 H10 V34 A4.5 4.5 0 0 0 10 25 Z"
        fill="#facc15"
        stroke="#000000"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Perforation Dashed Line */}
      <line
        x1="41"
        y1="20"
        x2="41"
        y2="39"
        stroke="#000000"
        strokeWidth="2.5"
        strokeDasharray="3.5 3"
      />

      {/* Bold Pop Art Red Star Inside Coupon */}
      <polygon
        points="26,21.5 28.5,26.5 34,27.2 30,31 31,36.5 26,33.8 21,36.5 22,31 18,27.2 23.5,26.5"
        fill="#ff1e38"
        stroke="#000000"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// 5. ADMIN — POP ART MASTER KEY MEDALLION
export const VintageKeyIcon: React.FC<IconProps> = ({
  size,
  className = 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
  isHovered = false,
  isActive = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    overflow="visible"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 overflow-visible ${
      isHovered ? 'scale-115 rotate-6 -translate-y-0.5' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    <defs>
      <pattern id="halftone-key" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx="2.5" cy="2.5" r="1.25" fill="#0369a1" />
      </pattern>
    </defs>

    {/* Hard Black Shadow Circle */}
    <circle cx="35" cy="34" r="25" fill="#000000" />

    {/* Pop Art Cyan Medallion Disc */}
    <circle
      cx="32"
      cy="31"
      r="25"
      fill="#38bdf8"
      stroke="#000000"
      strokeWidth="3"
    />
    <circle cx="32" cy="31" r="23" fill="url(#halftone-key)" opacity="0.55" />

    {/* Key Hard Black Drop Shadow */}
    <path
      d="M28 19 A11 11 0 1 0 28 35 L33 35 L49 51 L56 44 L48 36 L52 32 L46 26 L42 30 L34 22 Z"
      fill="#000000"
    />

    {/* Heavy Pop Art Gold Key Bow */}
    <circle
      cx="22"
      cy="22"
      r="11"
      fill="#facc15"
      stroke="#000000"
      strokeWidth="3"
    />
    <circle
      cx="22"
      cy="22"
      r="4.5"
      fill="#ff1e38"
      stroke="#000000"
      strokeWidth="2.4"
    />

    {/* Key Shaft & Bit with Bold Black Ink */}
    <path
      d="M30 26 L51 47 L46 52 L41 47 L44 44 L40 40 L36 44 L32 40 L36 36 L26 26 Z"
      fill="#facc15"
      stroke="#000000"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* White Pop Art Specular Highlight */}
    <line x1="16" y1="16" x2="21" y2="13" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
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
