import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';

interface SpiderMaskRevealProps {
  spidermanImage?: string;
  className?: string;
}

interface WebShot {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// ==========================================================
// SPIDER-SENSE PRECISION CONFIGURATION & HEAD SILHOUETTE
// ==========================================================
const HEAD_CONFIG = {
  /** Natural dimensions of hero.png source image */
  NATURAL_WIDTH: 1600,
  NATURAL_HEIGHT: 892,
  /** Natural center X of head in hero.png (exact symmetry at 50%) */
  NATURAL_CENTER_X: 800,
  /** Natural center Y of head (eye/bridge level) in hero.png */
  NATURAL_CENTER_Y: 240,
  /** Natural horizontal radius (half-width) of head silhouette */
  NATURAL_HEAD_RX: 195,
  /** Natural vertical radius of head silhouette */
  NATURAL_HEAD_RY: 230,
  /**
   * Configurable gap outside the visible head silhouette (screen pixels at scale 1.0).
   * Ensures the tingle sits strictly in the surrounding empty air, never touching the character.
   */
  TINGLE_OFFSET_FROM_HEAD: 26,
  /** Default activation zone in screen pixels */
  FACE_TRIGGER_RADIUS: 250,
  /** Controlled subtle physiological tingle amplitude */
  MAX_TINGLE_AMPLITUDE: 2.2,
  /** Base tingle oscillation frequency (rad/s) */
  MIN_TINGLE_FREQUENCY: 3.5,
  /** Peak tingle oscillation frequency at closest proximity */
  MAX_TINGLE_FREQUENCY: 5.8,
  /** Smooth lerp factor for entering/exiting perception zone */
  SMOOTHING_FACTOR: 0.10
};

// Compact, subtle Spider-Verse wavy paths (small, elegant energy bursts: 24px - 32px)
const TINGLE_WAVE_PRIMARY = 'M -15 0 C -10 -5, -5 -5, 0 0 C 5 5, 10 5, 15 0';
const TINGLE_WAVE_SECONDARY = 'M -11 0 C -7 -3.5, -3.5 -3.5, 0 0 C 3.5 3.5, 7 3.5, 11 0';

interface TingleZoneConfig {
  id: string;
  deg: number; // Angle from head center (0 = right, -90 = top, 180 = left, 90 = bottom)
  rScaleX: number;
  rScaleY: number;
  tangentRot: number;
  phase: number;
  primaryColor: string;
  secondaryColor: string;
}

// 7 Natural organic positions around the head silhouette (strictly outside perimeter)
const ZONE_CONFIGS: TingleZoneConfig[] = [
  {
    id: 'upper-left',
    deg: -135,
    rScaleX: 0.95,
    rScaleY: 0.95,
    tangentRot: -135,
    phase: 0,
    primaryColor: '#00a8ff', // Spider Blue
    secondaryColor: '#ff0038' // Electric Red
  },
  {
    id: 'left-temple',
    deg: 180,
    rScaleX: 1.0,
    rScaleY: 1.0,
    tangentRot: 180,
    phase: 1.2,
    primaryColor: '#ff0038', // Electric Red
    secondaryColor: '#00a8ff' // Spider Blue
  },
  {
    id: 'lower-left',
    deg: 145,
    rScaleX: 0.90,
    rScaleY: 0.88,
    tangentRot: 145,
    phase: 2.4,
    primaryColor: '#00a8ff',
    secondaryColor: '#ff0038'
  },
  {
    id: 'crown',
    deg: -90,
    rScaleX: 0.95,
    rScaleY: 1.0,
    tangentRot: -90,
    phase: 1.8,
    primaryColor: '#ef4444',
    secondaryColor: '#00a8ff'
  },
  {
    id: 'upper-right',
    deg: -45,
    rScaleX: 0.95,
    rScaleY: 0.95,
    tangentRot: -45,
    phase: 3.1,
    primaryColor: '#ff0038',
    secondaryColor: '#00a8ff'
  },
  {
    id: 'right-temple',
    deg: 0,
    rScaleX: 1.0,
    rScaleY: 1.0,
    tangentRot: 0,
    phase: 4.3,
    primaryColor: '#00a8ff',
    secondaryColor: '#ff0038'
  },
  {
    id: 'lower-right',
    deg: 35,
    rScaleX: 0.90,
    rScaleY: 0.88,
    tangentRot: 35,
    phase: 5.2,
    primaryColor: '#ff0038',
    secondaryColor: '#00a8ff'
  }
];

interface ComputedZone {
  id: string;
  angle: number;
  phase: number;
  x: number;
  y: number;
  rotation: number;
  primaryColor: string;
  secondaryColor: string;
}

interface HeadLayout {
  w: number;
  h: number;
  centerX: number;
  centerY: number;
  rx: number;
  ry: number;
  offset: number;
  zones: ComputedZone[];
}

export const SpiderMaskReveal: React.FC<SpiderMaskRevealProps> = ({
  spidermanImage = '/assets/spider/hero.png',
  className = ''
}) => {
  const { spiderSenseSettings } = usePortfolio();
  const { triggerRadius, sensitivity, maxAmplitude } = spiderSenseSettings;

  const containerRef = useRef<HTMLDivElement>(null);
  const tingleGroupRef = useRef<SVGGElement>(null);
  const zoneRefs = useRef<{ [key: string]: SVGGElement | null }>({});

  const [spiderImgError, setSpiderImgError] = useState(false);
  const [webShots, setWebShots] = useState<WebShot[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [headLayout, setHeadLayout] = useState<HeadLayout | null>(null);

  const headLayoutRef = useRef<HeadLayout | null>(null);
  headLayoutRef.current = headLayout;

  // Mutable animation refs (eliminates per-frame React state re-renders)
  const cursorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false
  });
  const currentIntensityRef = useRef<number>(0);
  const targetIntensityRef = useRef<number>(0);
  const isNearFaceRef = useRef<boolean>(false);
  const lastNearFaceRef = useRef<boolean>(false);
  const lastDistanceRef = useRef<number>(0);

  // Detect touch devices (disable cursor Spider-Sense on touch)
  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);
    setIsTouchDevice(isTouch);
  }, []);

  // Responsive geometry computation: derives head position and silhouette from actual container and image scaling
  const updateHeadLayout = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;

    if (W === 0 || H === 0) return;

    const naturalAspect = HEAD_CONFIG.NATURAL_WIDTH / HEAD_CONFIG.NATURAL_HEIGHT;
    const containerAspect = W / H;

    let scale: number;
    let imgOffsetX = 0;
    let imgOffsetY = 0;

    if (containerAspect > naturalAspect) {
      scale = W / HEAD_CONFIG.NATURAL_WIDTH;
      const renderedH = W / naturalAspect;
      imgOffsetY = (H - renderedH) / 2;
    } else {
      scale = H / HEAD_CONFIG.NATURAL_HEIGHT;
      const renderedW = H * naturalAspect;
      imgOffsetX = (W - renderedW) / 2;
    }

    const centerX = imgOffsetX + HEAD_CONFIG.NATURAL_CENTER_X * scale;
    const centerY = imgOffsetY + HEAD_CONFIG.NATURAL_CENTER_Y * scale;
    const rx = HEAD_CONFIG.NATURAL_HEAD_RX * scale;
    const ry = HEAD_CONFIG.NATURAL_HEAD_RY * scale;
    const offset = Math.max(18, HEAD_CONFIG.TINGLE_OFFSET_FROM_HEAD * scale);

    const deg2rad = (deg: number) => (deg * Math.PI) / 180;

    const zones: ComputedZone[] = ZONE_CONFIGS.map((cfg) => {
      const rad = deg2rad(cfg.deg);
      // Position strictly OUTSIDE the visible head silhouette in the surrounding air
      const posX = centerX + Math.cos(rad) * (rx * cfg.rScaleX + offset);
      const posY = centerY + Math.sin(rad) * (ry * cfg.rScaleY + offset);
      return {
        id: cfg.id,
        angle: rad,
        phase: cfg.phase,
        x: posX,
        y: posY,
        rotation: cfg.tangentRot,
        primaryColor: cfg.primaryColor,
        secondaryColor: cfg.secondaryColor
      };
    });

    const newLayout: HeadLayout = {
      w: W,
      h: H,
      centerX,
      centerY,
      rx,
      ry,
      offset,
      zones
    };

    setHeadLayout(newLayout);
    headLayoutRef.current = newLayout;
  }, []);

  useEffect(() => {
    updateHeadLayout();
    window.addEventListener('resize', updateHeadLayout, { passive: true });
    return () => window.removeEventListener('resize', updateHeadLayout);
  }, [updateHeadLayout]);

  // Global Pointer Tracking across the entire page (zero dead zones)
  const handleGlobalPointerMove = useCallback((e: PointerEvent) => {
    cursorRef.current.x = e.clientX;
    cursorRef.current.y = e.clientY;
    cursorRef.current.active = true;
  }, []);

  const handleGlobalPointerLeave = useCallback(() => {
    cursorRef.current.active = false;
    targetIntensityRef.current = 0;
    window.dispatchEvent(
      new CustomEvent('spydyy-spider-sense-proximity', {
        detail: { active: false, distance: 0 }
      })
    );
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: true });
    document.addEventListener('mouseleave', handleGlobalPointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      document.removeEventListener('mouseleave', handleGlobalPointerLeave);
    };
  }, [isTouchDevice, handleGlobalPointerMove, handleGlobalPointerLeave]);

  // RequestAnimationFrame Animation Loop: Calculates Proximity, Directional Side Localization & Subtle External Tingle
  useEffect(() => {
    if (isTouchDevice) return;

    let animId: number;

    const animate = (timestamp: number) => {
      const FACE_TRIGGER_RADIUS = triggerRadius || HEAD_CONFIG.FACE_TRIGGER_RADIUS;
      const MAX_AMPLITUDE = maxAmplitude || HEAD_CONFIG.MAX_TINGLE_AMPLITUDE;
      const MIN_FREQ = HEAD_CONFIG.MIN_TINGLE_FREQUENCY;
      const MAX_FREQ = HEAD_CONFIG.MAX_TINGLE_FREQUENCY;
      const DISTANCE_EXPONENT = Math.max(0.65, 2.3 - (sensitivity || 8) * 0.15);
      const SMOOTHING = HEAD_CONFIG.SMOOTHING_FACTOR;

      const layout = headLayoutRef.current;

      if (containerRef.current && cursorRef.current.active && layout) {
        const rect = containerRef.current.getBoundingClientRect();
        // Convert cursor to container coordinates
        const cursorInContainerX = cursorRef.current.x - rect.left;
        const cursorInContainerY = cursorRef.current.y - rect.top;

        const dx = cursorInContainerX - layout.centerX;
        const dy = cursorInContainerY - layout.centerY;
        const distance = Math.hypot(dx, dy);

        // 1. Proximity Calculation with boundary just outside the head silhouette
        if (distance < FACE_TRIGGER_RADIUS) {
          const normalized = distance / FACE_TRIGGER_RADIUS; // 0 (center) -> 1 (boundary)
          const proximity = 1 - normalized;
          targetIntensityRef.current = Math.pow(proximity, DISTANCE_EXPONENT);
          isNearFaceRef.current = true;
        } else {
          targetIntensityRef.current = 0;
          isNearFaceRef.current = false;
        }

        // Broadcast proximity event for GlobalCursor HUD synchronization (throttled to state change or delta > 5px)
        const stateChanged = isNearFaceRef.current !== lastNearFaceRef.current;
        const distDelta = Math.abs(distance - lastDistanceRef.current);
        if (stateChanged || (isNearFaceRef.current && distDelta >= 5)) {
          lastNearFaceRef.current = isNearFaceRef.current;
          lastDistanceRef.current = distance;
          window.dispatchEvent(
            new CustomEvent('spydyy-spider-sense-proximity', {
              detail: {
                active: isNearFaceRef.current,
                distance: Math.round(distance)
              }
            })
          );
        }
      } else {
        targetIntensityRef.current = 0;
        if (lastNearFaceRef.current) {
          lastNearFaceRef.current = false;
          window.dispatchEvent(
            new CustomEvent('spydyy-spider-sense-proximity', {
              detail: { active: false, distance: 0 }
            })
          );
        }
      }

      // 2. Smooth lerp for entering and exiting trigger zone
      currentIntensityRef.current +=
        (targetIntensityRef.current - currentIntensityRef.current) * SMOOTHING;

      if (currentIntensityRef.current < 0.001) {
        currentIntensityRef.current = 0;
      }

      const intensity = currentIntensityRef.current;

      // 3. Update Tingle DOM elements based on intensity, cursor angle, and side direction
      if (tingleGroupRef.current && layout) {
        if (intensity > 0) {
          tingleGroupRef.current.style.opacity = '1';
          tingleGroupRef.current.style.display = 'block';

          const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : { left: 0, top: 0 };
          const cursorInContainerX = cursorRef.current.x - rect.left;
          const cursorInContainerY = cursorRef.current.y - rect.top;

          const dx = cursorInContainerX - layout.centerX;
          const dy = cursorInContainerY - layout.centerY;
          const cursorDist = Math.hypot(dx, dy);
          const cursorAngle = Math.atan2(dy, dx);

          const time = timestamp * 0.001;
          const currentFreq = MIN_FREQ + (MAX_FREQ - MIN_FREQ) * intensity;
          const currentAmp = Math.min(2.2, MAX_AMPLITUDE * intensity * 0.7);

          // Update each external tingle zone independently based on directional proximity
          layout.zones.forEach((zone) => {
            const el = zoneRefs.current[zone.id];
            if (!el) return;

            let diff = Math.abs(cursorAngle - zone.angle);
            while (diff > Math.PI) diff = 2 * Math.PI - diff;

            let zoneWeight = 0;
            if (cursorDist < 48) {
              // Cursor directly near center of face: small subtle perimeter response
              zoneWeight = 0.28;
            } else {
              // Directional localization: only zones facing the cursor activate
              // Angular falloff: 1 at direct alignment, 0 when diff > 72 degrees (1.25 rad)
              if (diff < 1.25) {
                zoneWeight = Math.pow(Math.cos(diff * 1.2), 2.2);
              }
            }

            const zoneOpacity = Math.min(1, intensity * zoneWeight * 1.35);

            // Small, controlled sinusoidal oscillation (strictly zero Math.random jitter)
            const oscX = Math.sin(time * currentFreq + zone.phase) * currentAmp;
            const oscY = Math.cos(time * (currentFreq * 1.12) + zone.phase) * (currentAmp * 0.65);

            el.style.opacity = zoneOpacity.toFixed(3);
            el.style.transform = `translate(${oscX.toFixed(2)}px, ${oscY.toFixed(2)}px)`;
          });
        } else {
          tingleGroupRef.current.style.opacity = '0';
          tingleGroupRef.current.style.display = 'none';
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isTouchDevice, triggerRadius, sensitivity, maxAmplitude]);

  // Web Shooter Blast ("THWIP!") on click within Hero
  const handleShootWeb = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const originX = rect.width / 2;
    const originY = rect.height * 0.85;

    const newShot: WebShot = {
      id: Date.now() + Math.random(),
      startX: originX,
      startY: originY,
      endX: clickX,
      endY: clickY
    };

    setWebShots((prev) => [...prev.slice(-3), newShot]);
    setTimeout(() => {
      setWebShots((prev) => prev.filter((s) => s.id !== newShot.id));
    }, 1100);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleShootWeb}
      className={`relative w-screen h-screen min-h-screen select-none overflow-hidden flex items-center justify-center bg-[#fcfcfc] ${className}`}
    >
      {/* 1. Base Clean White Canvas with Subtle Comic Halftone Dots */}
      <div className="absolute inset-0 bg-[#fcfcfc] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#b91c1c 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* 2. Spider-Man Hero Image (100% Stable, Completely Clean & Unobstructed) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none">
        {!spiderImgError ? (
          <img
            src={spidermanImage}
            alt="Spider-Man Hero Suit"
            className="w-full h-full object-cover object-center pointer-events-none"
            onError={() => setSpiderImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white text-gray-900 p-6 text-center">
            <span className="text-4xl font-extrabold font-sans">AKASH KUMAR</span>
            <span className="text-lg font-mono text-[#b91c1c] uppercase mt-2">B.TECH IT • REC BANDA</span>
          </div>
        )}
      </div>

      {/* 3. Spider-Sense Tingles SVG (Exclusively Outside Head Silhouette, Exclusion Mask Protected) */}
      {headLayout && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-hidden"
          viewBox={`0 0 ${headLayout.w} ${headLayout.h}`}
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            {/* Subtle soft glows (low spread, no excessive neon) */}
            <filter id="tingleRedSubtleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ff0038" floodOpacity="0.45" />
            </filter>
            <filter id="tingleBlueSubtleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#00b0ff" floodOpacity="0.45" />
            </filter>

            {/* Exclusion Mask: Completely blacks out head, face, eyes, mask, and suit area */}
            <mask id="spiderHeadExclusionMask">
              {/* White background: permits tingles only in surrounding empty air */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black head cutout: physically prevents any tingle pixel from overlapping character */}
              <ellipse
                cx={headLayout.centerX}
                cy={headLayout.centerY}
                rx={headLayout.rx + 8}
                ry={headLayout.ry + 8}
                fill="black"
              />
              {/* Black neck/shoulder cutout */}
              <path
                d={`M ${headLayout.centerX - headLayout.rx * 0.9} ${headLayout.centerY + headLayout.ry * 0.65}
                    Q ${headLayout.centerX} ${headLayout.centerY + headLayout.ry * 0.85}, ${headLayout.centerX + headLayout.rx * 0.9} ${headLayout.centerY + headLayout.ry * 0.65}
                    L ${headLayout.centerX + headLayout.rx * 2.5} ${headLayout.h + 20}
                    L ${headLayout.centerX - headLayout.rx * 2.5} ${headLayout.h + 20} Z`}
                fill="black"
              />
            </mask>
          </defs>

          <g ref={tingleGroupRef} mask="url(#spiderHeadExclusionMask)" style={{ opacity: 0, display: 'none' }}>
            {headLayout.zones.map((zone) => (
              <g
                key={zone.id}
                ref={(el) => {
                  zoneRefs.current[zone.id] = el;
                }}
                style={{
                  opacity: 0,
                  transition: 'opacity 0.08s ease-out'
                }}
              >
                {/* Positioned strictly outside head silhouette with configurable TINGLE_OFFSET_FROM_HEAD */}
                <g transform={`translate(${zone.x}, ${zone.y}) rotate(${zone.rotation})`}>
                  {/* Primary Wave: small, crisp energy burst */}
                  <path
                    d={TINGLE_WAVE_PRIMARY}
                    fill="none"
                    stroke={zone.primaryColor}
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    filter={zone.primaryColor === '#ff0038' || zone.primaryColor === '#ef4444' ? 'url(#tingleRedSubtleGlow)' : 'url(#tingleBlueSubtleGlow)'}
                  />
                  {/* Secondary Wave: spaced 8px further outward into surrounding space */}
                  <path
                    d={TINGLE_WAVE_SECONDARY}
                    fill="none"
                    stroke={zone.secondaryColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    transform="translate(0, -8)"
                    filter={zone.secondaryColor === '#ff0038' ? 'url(#tingleRedSubtleGlow)' : 'url(#tingleBlueSubtleGlow)'}
                    opacity="0.8"
                  />
                  {/* Subtle directional action ray pointing into empty space */}
                  <line
                    x1="0"
                    y1="-11"
                    x2="0"
                    y2="-18"
                    stroke={zone.primaryColor}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </g>
              </g>
            ))}
          </g>
        </svg>
      )}

      {/* 4. Interactive Web Shooters ("THWIP!" Dynamic Web Blast on Click) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        <AnimatePresence>
          {webShots.map((shot) => (
            <motion.g
              key={shot.id}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.line
                x1={shot.startX}
                y1={shot.startY}
                x2={shot.endX}
                y2={shot.endY}
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(185, 28, 28, 0.4))' }}
              />
              <motion.line
                x1={shot.startX}
                y1={shot.startY}
                x2={shot.endX}
                y2={shot.endY}
                stroke="#b91c1c"
                strokeWidth="1.2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              />
              <motion.circle
                cx={shot.endX}
                cy={shot.endY}
                r="16"
                fill="none"
                stroke="#b91c1c"
                strokeWidth="1.5"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
              <motion.circle
                cx={shot.endX}
                cy={shot.endY}
                r="5"
                fill="#ffffff"
                stroke="#b91c1c"
                strokeWidth="2"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>

      {/* Floating Comic "THWIP!" Speech Bubbles at Click Points */}
      <AnimatePresence>
        {webShots.map((shot) => (
          <motion.div
            key={`badge-${shot.id}`}
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1, y: -25 }}
            exit={{ scale: 0.8, opacity: 0, y: -40 }}
            transition={{ duration: 0.7 }}
            style={{ left: shot.endX, top: shot.endY }}
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-30"
          >
            <div className="px-3 py-1 rounded-xl bg-white border-2 border-[#b91c1c] text-[#b91c1c] font-black italic tracking-tighter text-xs font-sans shadow-lg shadow-red-950/20 transform -rotate-6 flex items-center gap-1">
              <span className="text-amber-500">💥</span> THWIP!
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 5. Clean Bottom Gradient Fade to Pure White */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};
