import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const GlobalCursor: React.FC = () => {
  const { spiderSenseSettings } = usePortfolio();
  const { reticleEnabled, cursorTargetLock } = spiderSenseSettings;

  const cursorRef = useRef<HTMLDivElement>(null);
  const reticleRingRef = useRef<HTMLDivElement>(null);
  const reticleInnerRef = useRef<HTMLDivElement>(null);
  const reticleDotRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [clickRipples, setClickRipples] = useState<ClickRipple[]>([]);

  // Proximity info from Spider-Sense Hero
  const spiderSenseActiveRef = useRef<{ active: boolean; distance: number }>({
    active: false,
    distance: 0
  });

  // Check touch device
  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);
    setIsTouchDevice(isTouch);
  }, []);

  // Listen to Spider-Sense Proximity events from SpiderMaskReveal
  useEffect(() => {
    const handleSpiderSenseEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ active: boolean; distance: number }>;
      if (customEvent.detail) {
        spiderSenseActiveRef.current = customEvent.detail;
      }
    };

    window.addEventListener('spydyy-spider-sense-proximity', handleSpiderSenseEvent);
    return () => {
      window.removeEventListener('spydyy-spider-sense-proximity', handleSpiderSenseEvent);
    };
  }, []);

  // Handle Global Pointer Movement with Element Inspection
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!cursorRef.current) return;

      const x = e.clientX;
      const y = e.clientY;

      // Position update with 0-latency hardware translate3d
      cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cursorRef.current.style.opacity = '1';

      // 1. Highest Priority: Hero Face Spider-Sense Proximity
      if (spiderSenseActiveRef.current.active) {
        if (reticleRingRef.current) {
          reticleRingRef.current.style.transform = 'scale(1.25)';
          reticleRingRef.current.style.borderColor = '#ef4444';
          reticleRingRef.current.style.borderWidth = '2px';
        }
        if (reticleInnerRef.current) {
          reticleInnerRef.current.style.borderColor = '#0088ff';
          reticleInnerRef.current.style.transform = 'scale(1.2)';
        }
        if (reticleDotRef.current) {
          reticleDotRef.current.style.backgroundColor = '#ef4444';
          reticleDotRef.current.style.transform = 'scale(1.5)';
          reticleDotRef.current.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.8)';
        }
        if (telemetryRef.current) {
          telemetryRef.current.innerText = `SPIDER_SENSE: ACTIVE // ${Math.round(spiderSenseActiveRef.current.distance)}px`;
          telemetryRef.current.className =
            'px-2 py-0.5 rounded-md bg-red-950/90 border border-red-600 text-red-300 shadow-lg text-[8px] font-mono font-black tracking-wider whitespace-nowrap animate-pulse';
        }
        return;
      }

      // 2. Interactive Target-Lock Detection across the entire page
      if (cursorTargetLock) {
        const target = document.elementFromPoint(x, y);
        const interactiveEl = target?.closest(
          'a, button, input, textarea, select, [role="button"], .spydyy-card, .cursor-pointer, [data-interactive]'
        );

        if (interactiveEl) {
          // Locked onto an interactive element
          const ariaLabel = interactiveEl.getAttribute('aria-label');
          const textSnippet = interactiveEl.textContent?.trim().slice(0, 16);
          const tagName = interactiveEl.tagName.toUpperCase();
          const targetName = ariaLabel || textSnippet || tagName || 'INTERACTIVE';

          if (reticleRingRef.current) {
            reticleRingRef.current.style.transform = 'scale(1.35)';
            reticleRingRef.current.style.borderColor = '#dc2626';
            reticleRingRef.current.style.borderWidth = '1.8px';
          }
          if (reticleInnerRef.current) {
            reticleInnerRef.current.style.transform = 'scale(1.3)';
            reticleInnerRef.current.style.borderColor = '#ef4444';
          }
          if (reticleDotRef.current) {
            reticleDotRef.current.style.backgroundColor = '#dc2626';
            reticleDotRef.current.style.transform = 'scale(1.35)';
            reticleDotRef.current.style.boxShadow = '0 0 8px rgba(220, 38, 38, 0.7)';
          }
          if (telemetryRef.current) {
            telemetryRef.current.innerText = `TARGET_LOCKED // ${targetName.toUpperCase()}`;
            telemetryRef.current.className =
              'px-2 py-0.5 rounded-md bg-black/90 border border-red-600 text-red-400 shadow-md text-[8px] font-mono font-bold tracking-wider whitespace-nowrap';
          }
          return;
        }

        // 3. Text Reading / Scan Mode
        const isTextEl = target?.closest('p, h1, h2, h3, h4, code, blockquote');
        if (isTextEl) {
          if (reticleRingRef.current) {
            reticleRingRef.current.style.transform = 'scale(0.9)';
            reticleRingRef.current.style.borderColor = 'rgba(239, 68, 68, 0.35)';
            reticleRingRef.current.style.borderWidth = '1px';
          }
          if (reticleInnerRef.current) {
            reticleInnerRef.current.style.transform = 'scale(0.9)';
            reticleInnerRef.current.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          }
          if (reticleDotRef.current) {
            reticleDotRef.current.style.backgroundColor = '#ef4444';
            reticleDotRef.current.style.transform = 'scale(0.9)';
            reticleDotRef.current.style.boxShadow = 'none';
          }
          if (telemetryRef.current) {
            telemetryRef.current.innerText = 'STARK_OS // SCANNING_DATA';
            telemetryRef.current.className =
              'px-2 py-0.5 rounded-md bg-white/95 border border-gray-200 text-gray-700 shadow-sm text-[8px] font-mono font-bold tracking-wider whitespace-nowrap';
          }
          return;
        }
      }

      // 4. Default Ambient Surveillance Mode
      if (reticleRingRef.current) {
        reticleRingRef.current.style.transform = 'scale(1.0)';
        reticleRingRef.current.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        reticleRingRef.current.style.borderWidth = '1px';
      }
      if (reticleInnerRef.current) {
        reticleInnerRef.current.style.transform = 'scale(1.0)';
        reticleInnerRef.current.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      }
      if (reticleDotRef.current) {
        reticleDotRef.current.style.backgroundColor = '#dc2626';
        reticleDotRef.current.style.transform = 'scale(1.0)';
        reticleDotRef.current.style.boxShadow = 'none';
      }
      if (telemetryRef.current) {
        telemetryRef.current.innerText = 'STARK_OS // SURVEILLANCE';
        telemetryRef.current.className =
          'px-2 py-0.5 rounded-md bg-white/95 border border-gray-200 text-gray-600 shadow-sm text-[8px] font-mono font-bold tracking-wider whitespace-nowrap';
      }
    },
    [cursorTargetLock]
  );

  const handlePointerLeave = useCallback(() => {
    if (cursorRef.current) {
      cursorRef.current.style.opacity = '0';
    }
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
    if (isTouchDevice || !reticleEnabled) return;

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [isTouchDevice, reticleEnabled, handlePointerMove, handlePointerDown, handlePointerLeave]);

  if (isTouchDevice || !reticleEnabled) return null;

  return (
    <>
      {/* 1. Global Stark HUD Reticle */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200"
        style={{
          transform: 'translate3d(-1000px, -1000px, 0)',
          opacity: 0,
          willChange: 'transform'
        }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center">
          {/* Outer Dashed Rotating Ring */}
          <div
            ref={reticleRingRef}
            className="w-full h-full rounded-full border border-red-500/30 border-dashed animate-spin transition-all duration-150"
            style={{ animationDuration: '22s' }}
          />

          {/* Inner Solid Target Ring */}
          <div
            ref={reticleInnerRef}
            className="absolute w-8 h-8 rounded-full border border-red-500/40 transition-all duration-150"
          />

          {/* Center Precision Aim Dot */}
          <div
            ref={reticleDotRef}
            className="absolute w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-150"
          />

          {/* Precision Crosshair Lines */}
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
          <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-red-500/40 to-transparent" />

          {/* Small Floating Telemetry Badge */}
          <div className="absolute top-0 left-full ml-2">
            <div ref={telemetryRef} className="px-2 py-0.5 rounded-md bg-white/95 border border-gray-200 text-gray-600 shadow-sm text-[8px] font-mono font-bold tracking-wider whitespace-nowrap">
              STARK_OS // SURVEILLANCE
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tactile Spider-Web Click Ripples */}
      {clickRipples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 select-none"
          style={{ left: ripple.x, top: ripple.y }}
        >
          <div className="relative w-12 h-12 flex items-center justify-center animate-ping" style={{ animationDuration: '380ms' }}>
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
