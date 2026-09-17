import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface WebMagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Distance in px from button center where magnetic pull begins (default: 120) */
  magneticRadius?: number;
  /** Maximum distance button can be displaced in px (default: 12, recommended: 8-14) */
  maxButtonOffset?: number;
  /** Distance from button center where web snaps (default: 145) */
  snapDistance?: number;
  /** Resistance factor for magnetic displacement (default: 3.5) */
  magnetStrength?: number;
  /** Duration of snap animation in ms (default: 320) */
  snapDuration?: number;
  /** Cooldown in ms after snap before magnet can re-engage (default: 350) */
  snapCooldown?: number;
  /** Whether the effect is disabled (default: false) */
  disabled?: boolean;
  wrapperClassName?: string;
  innerClassName?: string;
}

interface WebState {
  anchorX: number;
  anchorY: number;
  cursorX: number;
  cursorY: number;
  dist: number;
  tension: number;
}

interface SnapState {
  anchorX: number;
  anchorY: number;
  snapX: number;
  snapY: number;
  progress: number;
}

export const WebMagneticButton: React.FC<WebMagneticButtonProps> = ({
  children,
  magneticRadius = 120,
  maxButtonOffset = 12,
  snapDistance = 145,
  magnetStrength = 3.5,
  snapDuration = 320,
  snapCooldown = 350,
  disabled = false,
  wrapperClassName = '',
  innerClassName = '',
  className = '',
  style,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [webState, setWebState] = useState<WebState | null>(null);
  const [snapState, setSnapState] = useState<SnapState | null>(null);

  const isCooldownedRef = useRef(false);
  const wasActiveRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const snapRafRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Position reference to avoid stale closures in event listeners
  const currentPosRef = useRef({ x: 0, y: 0 });
  currentPosRef.current = position;

  // Check for touch / reduced motion environment
  const isInteractiveSupported = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !isTouch && !isReduced;
  }, []);

  // Trigger web snap animation
  const triggerSnap = useCallback(
    (anchorX: number, anchorY: number, snapX: number, snapY: number) => {
      setIsActive(false);
      wasActiveRef.current = false;
      setWebState(null);
      isCooldownedRef.current = true;

      // Spring back button to neutral position
      setPosition({ x: 0, y: 0 });

      // Begin snap recoil animation
      const startTime = performance.now();

      const animateSnap = (now: number) => {
        if (!isMountedRef.current) return;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / snapDuration);

        setSnapState({
          anchorX,
          anchorY,
          snapX,
          snapY,
          progress,
        });

        if (progress < 1) {
          snapRafRef.current = requestAnimationFrame(animateSnap);
        } else {
          setSnapState(null);
          // Enter post-snap cooldown
          setTimeout(() => {
            if (isMountedRef.current) {
              isCooldownedRef.current = false;
            }
          }, snapCooldown);
        }
      };

      if (snapRafRef.current) cancelAnimationFrame(snapRafRef.current);
      snapRafRef.current = requestAnimationFrame(animateSnap);
    },
    [snapDuration, snapCooldown]
  );

  useEffect(() => {
    isMountedRef.current = true;

    if (disabled || !isInteractiveSupported()) {
      setPosition({ x: 0, y: 0 });
      setIsActive(false);
      setWebState(null);
      setSnapState(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!innerRef.current || !containerRef.current) return;

      const cursorX = e.clientX;
      const cursorY = e.clientY;

      const rect = innerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = cursorX - centerX;
      const dy = cursorY - centerY;
      const distFromCenter = Math.hypot(dx, dy);

      // 1. If currently in snap cooldown, wait until cooldown clears
      if (isCooldownedRef.current) {
        if (distFromCenter > magneticRadius) {
          // Cursor has backed away
        }
        return;
      }

      // 2. Check if cursor was active and pulled beyond snap distance
      if (wasActiveRef.current && distFromCenter >= snapDistance) {
        // Calculate anchor point on button edge before snap
        const hw = rect.width / 2;
        const hh = rect.height / 2;
        const scale = Math.min(
          hw / (Math.abs(dx) || 0.001),
          hh / (Math.abs(dy) || 0.001),
          1
        );
        const anchorX = centerX + dx * scale;
        const anchorY = centerY + dy * scale;

        triggerSnap(anchorX, anchorY, cursorX, cursorY);
        return;
      }

      // 3. Cursor is within magnetic radius
      if (distFromCenter <= magneticRadius) {
        if (!wasActiveRef.current) {
          setIsActive(true);
          wasActiveRef.current = true;
        }

        // Calculate magnetic displacement (subtle elastic pull)
        const pullFactor = Math.min(maxButtonOffset, distFromCenter / magnetStrength);
        const dirX = distFromCenter > 0 ? dx / distFromCenter : 0;
        const dirY = distFromCenter > 0 ? dy / distFromCenter : 0;

        const offsetX = dirX * pullFactor;
        const offsetY = dirY * pullFactor;

        // Button edge anchor point towards cursor
        const hw = rect.width / 2;
        const hh = rect.height / 2;
        const scale = Math.min(
          hw / (Math.abs(dx) || 0.001),
          hh / (Math.abs(dy) || 0.001),
          1
        );
        const anchorX = centerX + dx * scale;
        const anchorY = centerY + dy * scale;

        const tension = Math.min(1, distFromCenter / snapDistance);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          if (!isMountedRef.current) return;
          setPosition({ x: offsetX, y: offsetY });
          setWebState({
            anchorX,
            anchorY,
            cursorX,
            cursorY,
            dist: distFromCenter,
            tension,
          });
        });
      } else {
        // 4. Cursor left magnetic radius normally without exceeding snap distance
        if (wasActiveRef.current) {
          setIsActive(false);
          wasActiveRef.current = false;
          setPosition({ x: 0, y: 0 });
          setWebState(null);
        }
      }
    };

    const handleScrollOrResize = () => {
      if (wasActiveRef.current) {
        setIsActive(false);
        wasActiveRef.current = false;
        setPosition({ x: 0, y: 0 });
        setWebState(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (snapRafRef.current) cancelAnimationFrame(snapRafRef.current);
    };
  }, [
    disabled,
    magneticRadius,
    maxButtonOffset,
    snapDistance,
    magnetStrength,
    triggerSnap,
    isInteractiveSupported,
  ]);

  // Transition dynamics
  const transitionStyle = snapState
    ? 'transform 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    : isActive
    ? 'transform 0.12s ease-out'
    : 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';

  // Build the SVG web elements when active
  const renderWebStrands = () => {
    if (!webState) return null;

    const { anchorX, anchorY, cursorX, cursorY, dist, tension } = webState;
    const midX = (anchorX + cursorX) / 2;
    const midY = (anchorY + cursorY) / 2;

    const vLen = Math.hypot(cursorX - anchorX, cursorY - anchorY) || 1;
    const nx = -(cursorY - anchorY) / vLen;
    const ny = (cursorX - anchorX) / vLen;

    // Natural organic web sag that straightens with tension
    const sagAmount = Math.sin((dist / snapDistance) * Math.PI) * 9 * (1 - tension * 0.7);
    const gravityDrop = 3 * (1 - tension);

    const cpX = midX + nx * sagAmount;
    const cpY = midY + ny * sagAmount + gravityDrop;

    // Main web strand (dark charcoal navy)
    const mainPath = `M ${anchorX} ${anchorY} Q ${cpX} ${cpY} ${cursorX} ${cursorY}`;

    // Secondary strand 1 (subtle Spider-Man crimson accent)
    const sub1Path = `M ${anchorX} ${anchorY} Q ${cpX + nx * 3.5} ${cpY + ny * 3.5} ${cursorX} ${cursorY}`;

    // Secondary strand 2 (delicate slate gray fiber)
    const sub2Path = `M ${anchorX} ${anchorY} Q ${cpX - nx * 2.8} ${cpY - ny * 2.8} ${cursorX} ${cursorY}`;

    const mainOpacity = 0.55 + tension * 0.25;
    const mainWidth = 1.3 - tension * 0.3;

    return (
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-40 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <filter id="web-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Anchor point node on button surface */}
        <circle
          cx={anchorX}
          cy={anchorY}
          r="1.8"
          fill="#dc2626"
          opacity="0.85"
        />

        {/* Secondary Fiber 2 */}
        <path
          d={sub2Path}
          fill="none"
          stroke="#475569"
          strokeWidth="0.75"
          strokeOpacity={0.35 + tension * 0.15}
          strokeLinecap="round"
        />

        {/* Secondary Fiber 1 (Spider-Man Red Accent) */}
        <path
          d={sub1Path}
          fill="none"
          stroke="#dc2626"
          strokeWidth="0.85"
          strokeOpacity={0.4 + tension * 0.2}
          strokeLinecap="round"
        />

        {/* Main Central Web Strand */}
        <path
          d={mainPath}
          fill="none"
          stroke="#0f172a"
          strokeWidth={mainWidth}
          strokeOpacity={mainOpacity}
          strokeLinecap="round"
          filter="url(#web-soft-glow)"
        />

        {/* Cursor Web Contact Spark */}
        <circle
          cx={cursorX}
          cy={cursorY}
          r="1.5"
          fill="#0f172a"
          opacity={0.6 + tension * 0.3}
        />
      </svg>
    );
  };

  // Build the SVG snap recoil burst when snapped
  const renderSnapBurst = () => {
    if (!snapState) return null;

    const { anchorX, anchorY, snapX, snapY, progress } = snapState;
    const recoilFactor = 1 - progress;
    const fadeOpacity = Math.max(0, 1 - progress);

    // End point of the recoiling strand returning to the button
    const currentTipX = anchorX + (snapX - anchorX) * recoilFactor;
    const currentTipY = anchorY + (snapY - anchorY) * recoilFactor;

    // Small radial snap break sparks at break position
    const sparkRadius = 6 * (1 - progress);

    return (
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-40 overflow-visible"
        aria-hidden="true"
      >
        {/* Recoiling web strand pulling back to button anchor */}
        <line
          x1={anchorX}
          y1={anchorY}
          x2={currentTipX}
          y2={currentTipY}
          stroke="#dc2626"
          strokeWidth={1.1 * recoilFactor}
          strokeOpacity={fadeOpacity * 0.7}
          strokeLinecap="round"
        />

        {/* Tiny snap spark at the break location */}
        {progress < 0.65 && (
          <g transform={`translate(${snapX}, ${snapY})`}>
            <line
              x1={-sparkRadius}
              y1={-sparkRadius}
              x2={sparkRadius}
              y2={sparkRadius}
              stroke="#dc2626"
              strokeWidth="1"
              strokeOpacity={fadeOpacity}
            />
            <line
              x1={-sparkRadius}
              y1={sparkRadius}
              x2={sparkRadius}
              y2={-sparkRadius}
              stroke="#0f172a"
              strokeWidth="1"
              strokeOpacity={fadeOpacity}
            />
            <circle
              cx="0"
              cy="0"
              r={2 * (1 - progress)}
              fill="#dc2626"
              opacity={fadeOpacity}
            />
          </g>
        )}
      </svg>
    );
  };

  const isPortalReady = typeof document !== 'undefined';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${wrapperClassName} ${className}`}
      style={{ display: className?.includes('w-full') ? 'block' : 'inline-block', ...style }}
      {...props}
    >
      <div
        ref={innerRef}
        className={innerClassName}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: transitionStyle,
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Render SVG web strands or snap recoil via Portal on document.body to prevent clipping */}
      {isPortalReady &&
        (isActive && webState
          ? createPortal(renderWebStrands(), document.body)
          : snapState
          ? createPortal(renderSnapBurst(), document.body)
          : null)}
    </div>
  );
};

export default WebMagneticButton;
