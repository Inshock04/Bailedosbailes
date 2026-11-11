import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  isHovered?: boolean;
  isActive?: boolean;
}

// 1. CASARÃO VITORIANO (Victorian Haunted Gothic Mansion - Murder House)
export const VictorianMansionIcon: React.FC<IconProps> = ({
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
    {/* Outer Crimson Glow Halo */}
    <circle cx="24" cy="24" r="22" fill="#ff0033" fillOpacity="0.28" />

    {/* Victorian Roof Gables & Spire Tower */}
    {/* Central Tower */}
    <path
      d="M20 20L24 6L28 20V42H20V20Z"
      fill="#ff0033"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Tower Spire Needle */}
    <line x1="24" y1="2" x2="24" y2="7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="2" r="1.5" fill="#ffffff" />

    {/* Left Victorian Wing with Pointed Gable */}
    <path
      d="M5 42V24L14 13L22 22V42H5Z"
      fill="#dc2626"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Right Victorian Wing */}
    <path
      d="M26 22L34 13L43 24V42H26V22Z"
      fill="#dc2626"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Ornate Gable Roof Trims / Dormers */}
    <path d="M3 25L14 12L24 23" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M24 23L34 12L45 25" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />

    {/* Victorian Wrought Iron Roof Cresting */}
    <path d="M9 18H19" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="11" y1="16" x2="11" y2="18" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="14" y1="15" x2="14" y2="18" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="17" y1="16" x2="17" y2="18" stroke="#ffffff" strokeWidth="1.2" />

    <path d="M29 18H39" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="31" y1="16" x2="31" y2="18" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="34" y1="15" x2="34" y2="18" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="37" y1="16" x2="37" y2="18" stroke="#ffffff" strokeWidth="1.2" />

    {/* Tower Arched Attic Window (Glowing) */}
    <path
      d="M22 17C22 15 23 14 24 14C25 14 26 15 26 17V21H22V17Z"
      fill="#ffffff"
      stroke="#7f1d1d"
      strokeWidth="1"
    />
    <line x1="24" y1="14" x2="24" y2="21" stroke="#ff0033" strokeWidth="1" />

    {/* Left Gothic Windows */}
    <rect x="9" y="24" width="5" height="7" rx="2" fill="#ffffff" stroke="#7f1d1d" strokeWidth="1" />
    <line x1="11.5" y1="24" x2="11.5" y2="31" stroke="#ff0033" strokeWidth="0.8" />
    <line x1="9" y1="27.5" x2="14" y2="27.5" stroke="#ff0033" strokeWidth="0.8" />

    {/* Right Gothic Windows */}
    <rect x="34" y="24" width="5" height="7" rx="2" fill="#ffffff" stroke="#7f1d1d" strokeWidth="1" />
    <line x1="36.5" y1="24" x2="36.5" y2="31" stroke="#ff0033" strokeWidth="0.8" />
    <line x1="34" y1="27.5" x2="39" y2="27.5" stroke="#ff0033" strokeWidth="0.8" />

    {/* Victorian Grand Portico & Entrance Door */}
    <path
      d="M19 42V32C19 30 20.5 29 24 29C27.5 29 29 30 29 32V42H19Z"
      fill="#ffffff"
      stroke="#ff0033"
      strokeWidth="1.8"
    />
    <path d="M21 34V42H27V34C27 33 26 32 24 32C22 32 21 33 21 34Z" fill="#180205" />
    <circle cx="25.5" cy="38" r="0.9" fill="#ff0033" />

    {/* Porch Stone Stairs Base */}
    <line x1="2" y1="42" x2="46" y2="42" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
    <line x1="5" y1="45" x2="43" y2="45" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 2. FACE DA FREIRA CHORANDO LÁGRIMAS (White Nun Crying Tears - Asylum)
export const CryingNunIcon: React.FC<IconProps> = ({
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
    {/* Eerie Crimson Back Glow */}
    <ellipse cx="24" cy="24" rx="20" ry="22" fill="#ff0033" fillOpacity="0.3" />

    {/* Nun Habit / White Cowl Veil Outer */}
    <path
      d="M24 4C13 4 7 12 7 24C7 33 10 44 14 45C17 46 20 44 24 44C28 44 31 46 34 45C38 44 41 33 41 24C41 12 35 4 24 4Z"
      fill="#ffffff"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />

    {/* Inner Cowl Shadow / Black Frame */}
    <path
      d="M24 9C16 9 12 15 12 24C12 33 15 40 18 41C20 42 22 40 24 40C26 40 28 42 30 41C33 40 36 33 36 24C36 15 32 9 24 9Z"
      fill="#120306"
    />

    {/* Pure White Face Oval */}
    <ellipse cx="24" cy="25" rx="9" ry="12.5" fill="#f8f5fc" stroke="#ff0033" strokeWidth="1.2" />

    {/* Forehead Band Wimple */}
    <path
      d="M15 17C17 15 21 14 24 14C27 14 31 15 33 17"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Pale Cheeks Contour */}
    <ellipse cx="18" cy="27" rx="1.5" ry="1" fill="#ff0033" fillOpacity="0.25" />
    <ellipse cx="30" cy="27" rx="1.5" ry="1" fill="#ff0033" fillOpacity="0.25" />

    {/* Hollow Haunting Eyes (Dark Sockets) */}
    <ellipse cx="19" cy="21" rx="2.8" ry="3.2" fill="#000000" stroke="#7f1d1d" strokeWidth="0.8" />
    <circle cx="19.5" cy="20.5" r="0.9" fill="#ffffff" />

    <ellipse cx="29" cy="21" rx="2.8" ry="3.2" fill="#000000" stroke="#7f1d1d" strokeWidth="0.8" />
    <circle cx="28.5" cy="20.5" r="0.9" fill="#ffffff" />

    {/* Thick Dripping Black / Dark Crimson Tears (Iconic AHS Poster) */}
    {/* Left Tear Stream */}
    <path
      d="M18.5 24C18.5 28 17 32 17.5 37C17.8 39.5 19 41 19 43C19 44.5 18 45.5 17.5 45.5C17 45.5 16 44.5 16 43C16 40 17 36 17 31C17 27 18 24 18.5 24Z"
      fill="#000000"
      stroke="#ff0033"
      strokeWidth="0.6"
    />
    {/* Left Secondary Tear Drop */}
    <circle cx="20" cy="29" r="1" fill="#000000" />
    <circle cx="19.8" cy="34" r="0.8" fill="#000000" />

    {/* Right Tear Stream */}
    <path
      d="M29.5 24C29.5 28 31 32 30.5 37C30.2 39.5 29 41 29 43C29 44.5 30 45.5 30.5 45.5C31 45.5 32 44.5 32 43C32 40 31 36 31 31C31 27 30 24 29.5 24Z"
      fill="#000000"
      stroke="#ff0033"
      strokeWidth="0.6"
    />
    {/* Right Secondary Tear Drop */}
    <circle cx="28" cy="29" r="1" fill="#000000" />
    <circle cx="28.2" cy="34" r="0.8" fill="#000000" />

    {/* Delicate Nose */}
    <path d="M24 22V26L23 27H25" stroke="#ff0033" strokeWidth="1" strokeLinecap="round" />

    {/* Melancholic Black / Crimson Lips */}
    <path
      d="M21 31C22.5 30 25.5 30 27 31C25.5 33 22.5 33 21 31Z"
      fill="#1a0205"
      stroke="#ff0033"
      strokeWidth="0.8"
    />
  </svg>
);

// 3. A LONA DE CIRCO LISTRADA (Striped Circus Big Top Tent - Freak Show)
export const CircusTentIcon: React.FC<IconProps> = ({
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
      isHovered ? 'scale-115 -rotate-2' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    {/* Eerie Crimson Aura */}
    <circle cx="24" cy="26" r="21" fill="#ff0033" fillOpacity="0.28" />

    {/* Center Mast Pole & Fluttering Circus Pennant Flag */}
    <line x1="24" y1="2" x2="24" y2="12" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="24" cy="2" r="1.8" fill="#f59e0b" />
    <path
      d="M24 3L35 6.5L24 10V3Z"
      fill="#ff0033"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Circus Roof Cone Structure */}
    {/* Base Red Roof */}
    <path
      d="M24 10L4 26H44L24 10Z"
      fill="#dc2626"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />

    {/* Alternating Classic Ivory / White Stripes on Roof */}
    {/* Center Left White Stripe */}
    <path d="M24 10L17 26H22L24 10Z" fill="#ffffff" />
    {/* Center Right White Stripe */}
    <path d="M24 10L26 26H31L24 10Z" fill="#ffffff" />
    {/* Far Left White Stripe */}
    <path d="M24 10L7 26H11L24 10Z" fill="#ffffff" />
    {/* Far Right White Stripe */}
    <path d="M24 10L37 26H41L24 10Z" fill="#ffffff" />

    {/* Roof Scalloped Decorative Valance Fringe */}
    <path
      d="M4 26C6 28 8 28 10 26C12 28 14 28 16 26C18 28 20 28 22 26C24 28 26 28 28 26C30 28 32 28 34 26C36 28 38 28 40 26C42 28 44 28 44 26"
      stroke="#ffffff"
      strokeWidth="2"
      fill="#ff0033"
    />

    {/* Lower Tent Wall - Red Base */}
    <path
      d="M6 27V42H42V27"
      fill="#ff0033"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Wall Vertical Stripes (Ivory / White) */}
    <rect x="10" y="27" width="4" height="15" fill="#ffffff" stroke="#ff0033" strokeWidth="0.8" />
    <rect x="18" y="27" width="3" height="15" fill="#ffffff" stroke="#ff0033" strokeWidth="0.8" />
    <rect x="27" y="27" width="3" height="15" fill="#ffffff" stroke="#ff0033" strokeWidth="0.8" />
    <rect x="34" y="27" width="4" height="15" fill="#ffffff" stroke="#ff0033" strokeWidth="0.8" />

    {/* Grand Arched Tent Entrance Drapes */}
    <path
      d="M17 42C17 33 21 31 24 31C27 31 31 33 31 42H17Z"
      fill="#120306"
      stroke="#ffffff"
      strokeWidth="1.8"
    />

    {/* Golden/Red Arched Entrance Curtains Tie-backs */}
    <path d="M17 37C20 37 21 40 21 42" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M31 37C28 37 27 40 27 42" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />

    {/* Ground Baseline */}
    <line x1="2" y1="42" x2="46" y2="42" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 4. O CHAPÉU PONTUDO DE BRUXA DE ABAS LARGAS (Pointed Wide-Brim Witch Hat - Coven)
export const WitchHatIcon: React.FC<IconProps> = ({
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
      isHovered ? 'scale-115 -rotate-3 -translate-y-1' : isActive ? 'scale-105' : 'scale-100'
    } ${className}`}
  >
    {/* Eerie Crimson Aura */}
    <circle cx="24" cy="24" r="21" fill="#ff0033" fillOpacity="0.28" />

    {/* Witch Hat Cone / Pointed Crown (Bent Creased Tip) */}
    <path
      d="M24 6C24 6 22 13 19 22C17 28 15 32 15 32H33C33 32 31 28 29 22C26 13 28 8 28 8L24 6Z"
      fill="#ff0033"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />

    {/* Hat Tip Crease / Crooked Bend Shadow */}
    <path
      d="M24 6L28 8C27 11 25 13 23 15"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    {/* Middle Crease in Crown */}
    <path
      d="M18 24C21 26 27 25 30 23"
      stroke="#7f1d1d"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Wide Curving Brim with Gothic Flare (Abas Largas) */}
    <path
      d="M3 37C10 32 17 33 24 33C31 33 38 32 45 37C42 41 33 43 24 43C15 43 6 41 3 37Z"
      fill="#dc2626"
      stroke="#ffffff"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />

    {/* Brim Underside Curvature Line */}
    <path
      d="M6 37C12 34 18 34.5 24 34.5C30 34.5 36 34 42 37"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
    />

    {/* Velvet Hatband (Dark Wine / Black) */}
    <path
      d="M15 32C18 31 22 30.5 24 30.5C26 30.5 30 31 33 32V35C30 34.5 26 34 24 34C22 34 18 34.5 15 35V32Z"
      fill="#120306"
      stroke="#ffffff"
      strokeWidth="1.5"
    />

    {/* Ornate Gold / Ruby Witch Belt Buckle */}
    <rect x="21.5" y="30.5" width="5" height="4.5" rx="1" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
    <rect x="23" y="31.7" width="2" height="2.1" fill="#120306" />

    {/* Mystic Arcane Stars Floating Around Tip */}
    <circle cx="29" cy="5" r="1.5" fill="#ffffff" />
    <circle cx="15" cy="12" r="1.2" fill="#ffffff" />
    <circle cx="34" cy="16" r="1.2" fill="#ffffff" />
  </svg>
);

// 5. CHAVE VINTAGE (Ornate Victorian Skeleton Key - Hotel Room 64)
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
    {/* Eerie Crimson Back Glow */}
    <circle cx="24" cy="24" r="21" fill="#ff0033" fillOpacity="0.28" />

    {/* Vintage Key Ring / Ornate Bow (Gothic Quatrefoil Skull Bow) */}
    {/* Top Outer Clover Ring */}
    <circle cx="14" cy="14" r="8" fill="#ff0033" stroke="#ffffff" strokeWidth="2.2" />
    
    {/* Inner Cutouts in Bow (Vintage Filigree) */}
    <circle cx="14" cy="14" r="4.5" fill="#120306" stroke="#ffffff" strokeWidth="1.5" />
    <circle cx="14" cy="14" r="2" fill="#f59e0b" />
    
    {/* Decorative Bow Lobes / Filigree Bulbs */}
    <circle cx="14" cy="5" r="2" fill="#ffffff" />
    <circle cx="5" cy="14" r="2" fill="#ffffff" />

    {/* Key Collar / Neck Ring */}
    <rect
      x="18"
      y="18"
      width="4"
      height="4"
      rx="1"
      transform="rotate(45 18 18)"
      fill="#ffffff"
    />

    {/* Long Fluted Key Shaft (Diagonal 45 degrees) */}
    <line
      x1="18"
      y1="18"
      x2="38"
      y2="38"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="18"
      x2="38"
      y2="38"
      stroke="#ff0033"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Shaft Decorative Collar Rings */}
    <circle cx="25" cy="25" r="2.8" fill="#ffffff" />
    <circle cx="25" cy="25" r="1.5" fill="#120306" />

    {/* Vintage Key Bit / Teeth (Gothic Castle / Notched Maze Style) */}
    {/* Main Bit Block */}
    <path
      d="M34 34L39 29L43 33L40 36L42 38L38 42L34 38L35 37L34 34Z"
      fill="#ff0033"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* Bit Cross Notch Cutout */}
    <line x1="39" y1="31" x2="41" y2="33" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="36" y1="38" x2="39" y2="41" stroke="#ffffff" strokeWidth="1.5" />

    {/* Hanging Vintage Hotel Room Tag (Room "64") */}
    <path
      d="M10 20L8 28L14 34L18 28L10 20Z"
      fill="#f59e0b"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <circle cx="11" cy="22" r="1" fill="#120306" />
    {/* Tiny Key Ring Loop for Tag */}
    <path d="M11 19C10 18 10 21 11 22" stroke="#ffffff" strokeWidth="1" />
  </svg>
);

// Backward compatibility alias exports
export const MansionAnimatedRed = VictorianMansionIcon;
export const GhostAnimatedRed = CryingNunIcon;
export const PumpkinAnimatedRed = CircusTentIcon;
export const DeckAnimatedRed = WitchHatIcon;
export const GrimoireAnimatedRed = VintageKeyIcon;
