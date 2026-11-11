import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch device to disable custom cursor on touchscreens
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.closest('[role="button"]') ||
          target.closest('.cursor-pointer') ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'A'
        );
        setIsPointer(isInteractive);
      }
    };

    const onMouseDown = () => {
      setIsClicked(true);
    };

    const onMouseUp = () => {
      setIsClicked(false);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  if (isTouch || !isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[99999] pointer-events-none will-change-transform select-none"
      style={{
        transform: 'translate3d(-100px, -100px, 0)',
        transition: 'transform 0.04s linear',
      }}
    >
      {/* Animated Pixel Cursor Container */}
      <div
        className={`relative -top-1 -left-1 transition-all duration-150 ease-out ${
          isClicked
            ? 'scale-90 rotate-[-28deg] translate-y-1'
            : isPointer
            ? 'scale-110 rotate-[-12deg]'
            : 'scale-100 rotate-0'
        }`}
      >
        {isPointer ? (
          /* SKELETON POINTING HAND (PIXEL ART SVG) */
          <div className="relative">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_8px_rgba(255,30,56,0.9)] image-pixelated"
            >
              {/* Pointing Bone Index Finger with Red Glow */}
              <rect x="12" y="2" width="4" height="12" fill="#fff1f2" />
              <rect x="13" y="1" width="2" height="3" fill="#ff0033" />
              <rect x="11" y="6" width="6" height="2" fill="#f43f5e" />
              <rect x="11" y="10" width="6" height="2" fill="#be123c" />

              {/* Palm Bones & Knuckles */}
              <rect x="10" y="14" width="12" height="10" fill="#fecdd3" />
              <rect x="8" y="16" width="3" height="6" fill="#fda4af" />
              <rect x="22" y="16" width="3" height="6" fill="#fda4af" />

              {/* Dark Bone Joint Lines */}
              <rect x="10" y="18" width="12" height="2" fill="#881337" />
              <rect x="12" y="21" width="8" height="2" fill="#4c0519" />

              {/* Wrist Bones */}
              <rect x="12" y="24" width="8" height="6" fill="#fff1f2" />
              <rect x="14" y="26" width="4" height="4" fill="#9f1239" />

              {/* Pixel Art Black Outline */}
              <path
                d="M12 0H16V2H18V14H22V16H25V22H22V24H20V30H12V24H10V22H7V16H10V14H12V0Z"
                stroke="#000000"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>

            {/* Glowing Slash / Spark Effect on Click */}
            {isClicked && (
              <div className="absolute -top-2 -left-2 w-10 h-10 pointer-events-none">
                <div className="absolute top-1 left-2 w-6 h-0.5 bg-[#ff0033] rotate-45 animate-ping opacity-90 shadow-[0_0_10px_#ff0033]" />
                <div className="absolute top-3 left-0 w-8 h-0.5 bg-[#f59e0b] -rotate-12 animate-pulse shadow-[0_0_8px_#f59e0b]" />
              </div>
            )}
          </div>
        ) : (
          /* RETRO PIXEL ART HORROR DAGGER / BLADE */
          <div className="relative">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] image-pixelated"
            >
              {/* Blade Tip & Edge */}
              <polygon points="2,2 6,2 14,10 14,14 10,14 2,6" fill="#e2e8f0" />
              <polygon points="2,2 4,2 10,8 10,10 8,10 2,4" fill="#ffffff" />
              <polygon points="6,4 12,10 10,12 4,6" fill="#94a3b8" />

              {/* Blood Stains on Blade Edge */}
              <rect x="3" y="3" width="3" height="3" fill="#dc2626" />
              <rect x="5" y="5" width="2" height="2" fill="#991b1b" />
              <rect x="7" y="7" width="2" height="2" fill="#ef4444" />

              {/* Crossguard (Bronze / Gold Art Deco) */}
              <rect x="11" y="15" width="8" height="3" fill="#f59e0b" />
              <rect x="15" y="11" width="3" height="8" fill="#d97706" />
              <rect x="13" y="13" width="4" height="4" fill="#78350f" />

              {/* Dagger Handle / Hilt */}
              <rect x="17" y="17" width="4" height="4" fill="#7f1d1d" />
              <rect x="19" y="19" width="4" height="4" fill="#450a0a" />

              {/* Pommel with Skull Ruby */}
              <rect x="22" y="22" width="5" height="5" fill="#b91c1c" />
              <rect x="23" y="23" width="3" height="3" fill="#ef4444" />
              <rect x="24" y="24" width="1" height="1" fill="#ffffff" />

              {/* Crisp Pixel Outline */}
              <path
                d="M1 1H7L15 9V11H18V14H21V17H24V21H27V27H21V24H17V21H14V18H11V15H9V14L1 6V1Z"
                stroke="#000000"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>

            {/* Click Slash Spark */}
            {isClicked && (
              <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
                <div className="w-6 h-0.5 bg-[#ef4444] rotate-45 shadow-[0_0_8px_#ef4444]" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
