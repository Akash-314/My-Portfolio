import React, { useEffect, useState, useCallback } from 'react';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

/**
 * Tactical Spider-Web Click Ripple Feedback (Feature 24)
 * Fires a lightweight 8-strand web ripple when clicking anywhere on the page.
 */
export const GlobalCursor: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [clickRipples, setClickRipples] = useState<ClickRipple[]>([]);

  // Detect touch devices
  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);
    setIsTouchDevice(isTouch);
  }, []);

  // Click Shockwave Feedback everywhere on page
  const handlePointerDown = useCallback((e: PointerEvent) => {
    const newRipple: ClickRipple = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY
    };
    setClickRipples((prev) => [...prev.slice(-4), newRipple]);
    setTimeout(() => {
      setClickRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 450);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isTouchDevice, handlePointerDown]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Tactile Spider-Web Click Ripples */}
      {clickRipples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 select-none"
          style={{ left: ripple.x, top: ripple.y }}
        >
          <div
            className="relative w-12 h-12 flex items-center justify-center animate-ping"
            style={{ animationDuration: '380ms' }}
          >
            <svg viewBox="0 0 48 48" className="w-full h-full stroke-red-600/80 fill-none">
              <circle cx="24" cy="24" r="10" strokeWidth="0.8" strokeDasharray="3 2" />
              <circle cx="24" cy="24" r="18" strokeWidth="0.8" />
              <line x1="24" y1="4" x2="24" y2="44" strokeWidth="0.8" />
              <line x1="4" y1="24" x2="44" y2="24" strokeWidth="0.8" />
              <line x1="10" y1="10" x2="38" y2="38" strokeWidth="0.8" />
              <line x1="10" y1="38" x2="38" y2="10" strokeWidth="0.8" />
            </svg>
          </div>
        </div>
      ))}
    </>
  );
};

export default GlobalCursor;
