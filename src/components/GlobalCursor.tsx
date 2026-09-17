import React, { useEffect, useState, useCallback, useRef } from 'react';

/**
 * ==========================================================
 * SPIDER-MAN WEB CLICK BURST CONFIGURATION (Specification 21)
 * ==========================================================
 */
const BURST_CONFIG = {
  BURST_SIZE: 34,
  BURST_DURATION: 400,
  STRAND_COUNT: 8,
  STRAND_LENGTH: 17,
  STRAND_OPACITY: 0.85,
  BURST_COLOR: '#0f172a',
  BURST_ACCENT_COLOR: '#dc2626',
  MAX_ACTIVE_BURSTS: 5,
};

type BurstProfileType = 'admin' | 'cta' | 'project' | 'coding' | 'nav' | 'default';

interface StrandData {
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

interface ArcData {
  d: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

interface WebBurstInstance {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  strands: StrandData[];
  arcs: ArcData[];
  centerDotColor: string;
}

/**
 * Pure generator for miniature Spider-Man web fragment geometry
 */
function generateWebGeometry(
  radius: number,
  strandCount: number,
  primaryColor: string,
  accentColor: string,
  dirX: number,
  dirY: number,
  biasMag: number
): { strands: StrandData[]; arcs: ArcData[] } {
  const strands: StrandData[] = [];
  const coords: { x: number; y: number }[] = [];

  for (let i = 0; i < strandCount; i++) {
    // Subtle organic angle jitter so the web looks hand-spun, not artificial
    const angleJitter = Math.sin(i * 3.7) * 0.08;
    const angle = (2 * Math.PI * i) / strandCount + angleJitter;

    // Organic strand length variation (78% to 105% of base radius)
    const lengthMult = 0.8 + 0.22 * Math.abs(Math.sin(i * 2.3));
    let strandLen = radius * lengthMult;

    // Directional bias elongation based on cursor velocity at moment of click (Specification 10)
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const dotMotion = cosA * dirX + sinA * dirY;
    if (dotMotion > 0) {
      strandLen += dotMotion * biasMag;
    }

    const tipX = strandLen * cosA + dirX * biasMag * 0.25;
    const tipY = strandLen * sinA + dirY * biasMag * 0.25;

    coords.push({ x: tipX, y: tipY });

    // Spider-Man color logic: thin dark charcoal filaments with crimson accent fiber
    const isAccentStrand = i === 1 || (strandCount >= 8 && i === 5);
    const stroke = isAccentStrand ? accentColor : primaryColor;
    const strokeWidth = isAccentStrand ? 0.9 : 0.85;

    strands.push({
      x2: Number(tipX.toFixed(2)),
      y2: Number(tipY.toFixed(2)),
      stroke,
      strokeWidth,
      opacity: BURST_CONFIG.STRAND_OPACITY,
    });
  }

  // Inter-strand curved web arcs (authentic spider-web cross filaments)
  const arcs: ArcData[] = [];
  const arcRatio = 0.52;

  for (let i = 0; i < strandCount; i++) {
    const nextIdx = (i + 1) % strandCount;
    // Leave slight gaps for an authentic broken web fragment
    if (strandCount >= 8 && (i === 3 || i === 7)) continue;

    const p1 = coords[i];
    const p2 = coords[nextIdx];

    const ax = p1.x * arcRatio;
    const ay = p1.y * arcRatio;
    const bx = p2.x * arcRatio;
    const by = p2.y * arcRatio;

    // Control point pulled inward towards center (0, 0)
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const cpx = mx * 0.72;
    const cpy = my * 0.72;

    const d = `M ${ax.toFixed(2)} ${ay.toFixed(2)} Q ${cpx.toFixed(2)} ${cpy.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)}`;
    const isRedArc = i === 0 && accentColor !== primaryColor;

    arcs.push({
      d,
      stroke: isRedArc ? accentColor : '#475569',
      strokeWidth: 0.65,
      opacity: isRedArc ? 0.65 : 0.5,
    });
  }

  return { strands, arcs };
}

/**
 * Filter and categorize meaningful interactive targets (Specification 3 & 11)
 * Plain text, paragraphs, divs, and decorative elements return null.
 */
function getInteractiveTarget(
  element: Element | null
): { element: HTMLElement; profile: BurstProfileType } | null {
  if (!element) return null;

  const target = element.closest<HTMLElement>(
    'button, a, [role="button"], [data-web-target], .cursor-target, input[type="submit"], input[type="button"]'
  );

  if (!target) return null;

  const webTarget = target.getAttribute('data-web-target') || '';
  const ariaLabel = target.getAttribute('aria-label') || '';
  const href = target.getAttribute('href') || '';
  const textContent = target.textContent?.trim().toUpperCase() || '';

  // 1. Admin Shield / Spider-HQ Security Trigger
  if (
    webTarget === 'admin-trigger' ||
    ariaLabel.includes('Security Token') ||
    target.classList.contains('admin-shield') ||
    target.closest('[data-web-target="admin-trigger"]')
  ) {
    return { element: target, profile: 'admin' };
  }

  // 2. Primary CTA / Resume / Explore Buttons
  if (
    webTarget === 'cta-button' ||
    textContent.includes('EXPLORE PROJECTS') ||
    textContent.includes('RESUME') ||
    target.closest('[data-web-target="cta-button"]')
  ) {
    return { element: target, profile: 'cta' };
  }

  // 3. Project Cards & GitHub Links
  if (
    webTarget === 'project-card' ||
    target.closest('[data-web-target="project-card"]') ||
    href.includes('github.com')
  ) {
    return { element: target, profile: 'project' };
  }

  // 4. Coding Profile Cards
  if (
    webTarget === 'coding-card' ||
    target.closest('[data-web-target="coding-card"]') ||
    webTarget === 'contact-card' ||
    target.closest('[data-web-target="contact-card"]')
  ) {
    return { element: target, profile: 'coding' };
  }

  // 5. Navigation Items & SP4RK Header Logo
  if (
    webTarget === 'nav-item' ||
    target.closest('header nav') ||
    target.closest('header')
  ) {
    return { element: target, profile: 'nav' };
  }

  return { element: target, profile: 'default' };
}

/**
 * Spider-Man Web Click Burst (React Bits Click Spark Adaptation)
 * Single global click listener mounted in App.tsx.
 * Provides miniature web burst feedback on meaningful interactions.
 */
export const GlobalCursor: React.FC = () => {
  const [bursts, setBursts] = useState<WebBurstInstance[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const activeTimersRef = useRef<number[]>([]);

  // Pointer velocity tracking for subtle directional bias (Specification 10)
  const lastPointerRef = useRef({
    x: 0,
    y: 0,
    time: 0,
    vx: 0,
    vy: 0,
  });

  // Detect touch environment
  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);
    setIsTouchDevice(isTouch);
  }, []);

  // Track cursor velocity on fine pointer movement
  const handlePointerMove = useCallback((e: PointerEvent) => {
    const now = performance.now();
    const dt = Math.max(1, now - lastPointerRef.current.time);
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;

    // Velocity in px/10ms
    const vx = (dx / dt) * 12;
    const vy = (dy / dt) * 12;

    lastPointerRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: now,
      vx: vx * 0.4 + lastPointerRef.current.vx * 0.6,
      vy: vy * 0.4 + lastPointerRef.current.vy * 0.6,
    };
  }, []);

  // Handle pointerdown on window (reusing existing global architecture)
  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      const targetMatch = getInteractiveTarget(e.target as Element | null);
      if (!targetMatch) {
        // Plain text, paragraph, div, background click -> intentional restraint (no burst)
        return;
      }

      const { element, profile } = targetMatch;

      // Specification 12: Admin Shield Micro-Pulse without blocking authentication
      if (profile === 'admin') {
        element.classList.remove('animate-shield-pulse');
        // Trigger reflow to restart animation smoothly
        void element.offsetWidth;
        element.classList.add('animate-shield-pulse');
        const pulseTimer = window.setTimeout(() => {
          element.classList.remove('animate-shield-pulse');
        }, 500);
        activeTimersRef.current.push(pulseTimer);
      }

      // Determine size and profile parameters (Specification 8 & 11)
      let size = BURST_CONFIG.BURST_SIZE;
      let duration = BURST_CONFIG.BURST_DURATION;
      let strandCount = BURST_CONFIG.STRAND_COUNT;
      let primaryColor = BURST_CONFIG.BURST_COLOR;
      let accentColor = BURST_CONFIG.BURST_ACCENT_COLOR;
      let centerDotColor = BURST_CONFIG.BURST_ACCENT_COLOR;

      switch (profile) {
        case 'admin':
          size = 32;
          duration = 420;
          strandCount = 8;
          primaryColor = '#dc2626';
          accentColor = '#991b1b';
          centerDotColor = '#dc2626';
          break;
        case 'cta':
          size = 36;
          duration = 400;
          strandCount = 8;
          primaryColor = '#0f172a';
          accentColor = '#dc2626';
          centerDotColor = '#dc2626';
          break;
        case 'project':
        case 'coding':
          size = 40;
          duration = 410;
          strandCount = 8;
          primaryColor = '#0f172a';
          accentColor = '#dc2626';
          centerDotColor = '#0f172a';
          break;
        case 'nav':
          size = 24;
          duration = 340;
          strandCount = 6;
          primaryColor = '#334155';
          accentColor = '#dc2626';
          centerDotColor = '#dc2626';
          break;
        default:
          size = 30;
          duration = 380;
          strandCount = 7;
          primaryColor = '#0f172a';
          accentColor = '#dc2626';
          centerDotColor = '#dc2626';
          break;
      }

      // Mobile / Touch Adaptation (Specification 16)
      if (isTouchDevice) {
        size = Math.max(22, Math.round(size * 0.8));
        strandCount = Math.min(6, strandCount);
      }

      // Calculate directional bias (Specification 10)
      let dirX = 0;
      let dirY = 0;
      let biasMag = 0;

      if (!isTouchDevice) {
        const speed = Math.hypot(
          lastPointerRef.current.vx,
          lastPointerRef.current.vy
        );
        if (speed > 0.2) {
          dirX = lastPointerRef.current.vx / speed;
          dirY = lastPointerRef.current.vy / speed;
          biasMag = Math.min(3.5, speed * 1.5);
        }
      }

      // Check reduced motion preference (Specification 17)
      const isReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isReducedMotion) {
        duration = 160;
      }

      const radius = size / 2;
      const { strands, arcs } = generateWebGeometry(
        radius,
        strandCount,
        primaryColor,
        accentColor,
        dirX,
        dirY,
        biasMag
      );

      const burstId = Date.now() + Math.random();
      const newBurst: WebBurstInstance = {
        id: burstId,
        x: e.clientX,
        y: e.clientY,
        size,
        duration,
        strands,
        arcs,
        centerDotColor,
      };

      // Burst limit: Drop oldest if exceeding MAX_ACTIVE_BURSTS (Specification 19)
      setBursts((prev) => [
        ...prev.slice(-(BURST_CONFIG.MAX_ACTIVE_BURSTS - 1)),
        newBurst,
      ]);

      // Self-cleaning timer to remove completed effect (Specification 18)
      const timer = window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, duration + 50);

      activeTimersRef.current.push(timer);
    },
    [isTouchDevice]
  );

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerdown', handlePointerDown, {
      passive: true,
    });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      // Clean up timers
      activeTimersRef.current.forEach((t) => clearTimeout(t));
      activeTimersRef.current = [];
    };
  }, [handlePointerMove, handlePointerDown]);

  if (bursts.length === 0) return null;

  return (
    <div
      className="web-click-burst-layer fixed inset-0 pointer-events-none z-[9998] overflow-hidden select-none"
      aria-hidden="true"
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="web-click-burst fixed pointer-events-none select-none"
          style={{
            left: burst.x,
            top: burst.y,
            width: burst.size,
            height: burst.size,
            transform: 'translate(-50%, -50%)',
            animation: `webBurstFilament ${burst.duration}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            transformOrigin: 'center center',
          }}
        >
          <svg
            viewBox={`${-burst.size / 2} ${-burst.size / 2} ${burst.size} ${burst.size}`}
            width={burst.size}
            height={burst.size}
            className="overflow-visible"
            style={{
              filter: 'drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.15))',
            }}
          >
            {/* Radial Spider-Web Strands */}
            {burst.strands.map((s, idx) => (
              <line
                key={`strand-${idx}`}
                x1="0"
                y1="0"
                x2={s.x2}
                y2={s.y2}
                stroke={s.stroke}
                strokeWidth={s.strokeWidth}
                strokeLinecap="round"
                opacity={s.opacity}
              />
            ))}

            {/* Inward-Curving Web Cross Filaments */}
            {burst.arcs.map((a, idx) => (
              <path
                key={`arc-${idx}`}
                d={a.d}
                fill="none"
                stroke={a.stroke}
                strokeWidth={a.strokeWidth}
                strokeLinecap="round"
                opacity={a.opacity}
              />
            ))}

            {/* Central Web Node Contact Dot */}
            <circle
              cx="0"
              cy="0"
              r="1.4"
              fill={burst.centerDotColor}
              style={{
                animation: `webCenterNode ${burst.duration}ms ease-out forwards`,
              }}
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default GlobalCursor;
