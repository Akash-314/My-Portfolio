import React, { useEffect, useRef, useState, useId } from 'react';
import { motion } from 'framer-motion';
import { SPIDER_EFFECTS_CONFIG } from '../config/spiderEffectsConfig';
import { globalScrollPhysics, type ScrollPhysicsState } from '../utils/scrollPhysics';

interface CharacterSuspensionProps {
  className?: string;
  entranceSide?: 'left' | 'right';
  enableTension?: boolean;
}

// Hanging upside down Spider-Man visual with entrance slide, scroll pendulum swing & dynamic web tension
export const HangingSpiderMan: React.FC<CharacterSuspensionProps> = ({
  className = "w-44 sm:w-56",
  entranceSide = 'right',
  enableTension = true
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const swingWrapperRef = useRef<HTMLDivElement | null>(null);
  const webPathRef = useRef<SVGPathElement | null>(null);
  const gradientId = useId().replace(/:/g, '_') + '_web_grad';

  const [isNear, setIsNear] = useState(false);
  const tensionRef = useRef({ x: 0, y: 0 });
  const currentAngleRef = useRef(0);
  const isIntersectingRef = useRef(false);

  // Apply coordinated transform to inner swing wrapper (avoids Framer Motion entrance conflicts)
  const updateTransform = (angle: number, tensionX: number, tensionY: number) => {
    if (!swingWrapperRef.current) return;
    swingWrapperRef.current.style.transform = `translate3d(${tensionX.toFixed(2)}px, ${tensionY.toFixed(2)}px, 0) rotate(${angle.toFixed(2)}deg)`;
  };

  // 1. Scroll-reactive pendulum swing & dynamic web tension
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !containerRef.current) return;

    let unsubscribeScroll: (() => void) | null = null;

    const onScrollPhysics = (state: ScrollPhysicsState) => {
      currentAngleRef.current = state.swingAngle;

      // Update physical pendulum swing
      updateTransform(state.swingAngle, tensionRef.current.x, tensionRef.current.y);

      // Update dynamic web flex / tension sag
      if (webPathRef.current) {
        const flex = -state.normalizedVelocity * SPIDER_EFFECTS_CONFIG.WEB_TENSION_SAG;
        webPathRef.current.setAttribute(
          'd',
          `M 20 0 Q ${(20 + flex).toFixed(2)} 50 20 100`
        );
      }
    };

    // IntersectionObserver: only subscribe when character section is near/inside viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (!unsubscribeScroll) {
            unsubscribeScroll = globalScrollPhysics.subscribe(onScrollPhysics);
          }
        } else {
          if (unsubscribeScroll) {
            unsubscribeScroll();
            unsubscribeScroll = null;
          }
          // Smoothly reset to neutral when out of viewport
          currentAngleRef.current = 0;
          updateTransform(0, tensionRef.current.x, tensionRef.current.y);
          if (webPathRef.current) {
            webPathRef.current.setAttribute('d', 'M 20 0 Q 20 50 20 100');
          }
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (unsubscribeScroll) {
        unsubscribeScroll();
      }
    };
  }, []);

  // 2. Cursor proximity tension (moves subtly away when hovered)
  useEffect(() => {
    if (!enableTension) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);

    if (prefersReducedMotion || isTouch) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      const radius = SPIDER_EFFECTS_CONFIG.CHARACTER_TENSION_RADIUS;
      const maxDisp = SPIDER_EFFECTS_CONFIG.CHARACTER_TENSION_MAX_DISPLACEMENT;

      if (dist < radius && dist > 0) {
        const factor = (1 - dist / radius) * maxDisp;
        tensionRef.current = {
          x: -(dx / dist) * factor,
          y: -(dy / dist) * factor
        };
        const near = dist < 120;
        setIsNear((prev) => (prev !== near ? near : prev));
      } else {
        tensionRef.current = { x: 0, y: 0 };
        setIsNear((prev) => (prev ? false : prev));
      }

      updateTransform(currentAngleRef.current, tensionRef.current.x, tensionRef.current.y);
    };

    const handlePointerLeave = () => {
      tensionRef.current = { x: 0, y: 0 };
      setIsNear(false);
      updateTransform(currentAngleRef.current, 0, 0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [enableTension]);

  const initialX = entranceSide === 'right' ? 90 : -90;
  const initialRotate = entranceSide === 'right' ? 6 : -6;

  return (
    <motion.div
      ref={containerRef}
      initial={{ x: initialX, opacity: 0, rotate: initialRotate }}
      whileInView={{ x: 0, opacity: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 85,
        duration: 0.8
      }}
      className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}
    >
      {/* Inner Swing Wrapper: coordinates physical pendulum swing with transform-origin at ceiling anchor */}
      <div
        ref={swingWrapperRef}
        className="w-full flex flex-col items-center will-change-transform"
        style={{
          transformOrigin: 'top center',
          transition: 'transform 0.06s linear'
        }}
      >
        {/* Dynamic Hanging Web SVG Strand with tension curvature */}
        <svg
          className="w-12 h-32 sm:h-44 overflow-visible pointer-events-none -mb-1"
          viewBox="0 0 40 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="50%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <filter id={`${gradientId}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="rgba(0,0,0,0.25)" />
            </filter>
          </defs>
          {/* Ceiling anchor node */}
          <circle cx="20" cy="1" r="2.2" fill="#111827" />
          {/* Reactive Web Line */}
          <path
            ref={webPathRef}
            d="M 20 0 Q 20 50 20 100"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.8"
            strokeLinecap="round"
            filter={`url(#${gradientId}-glow)`}
          />
        </svg>

        {/* Subtle Proximity Wake-up Glow Pulse */}
        {isNear && (
          <div className="absolute top-28 w-24 h-24 rounded-full bg-red-600/15 blur-xl pointer-events-none animate-pulse" />
        )}

        {/* Real Hanging Spider-Man Image spydy_hang.png (No perpetual loop; idle when still) */}
        <div className="w-full">
          <img
            src="/assets/spider/spydy_hang.png"
            alt="Hanging Spider-Man"
            className="w-full h-auto drop-shadow-2xl pointer-events-none"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Standing Spider-Man character visual with entrance slide & subtle scroll parallax (0° rotation)
export const StandingSpiderMan: React.FC<CharacterSuspensionProps> = ({
  className = "w-48 sm:w-60",
  entranceSide = 'left',
  enableTension = true
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const parallaxWrapperRef = useRef<HTMLDivElement | null>(null);
  const tensionRef = useRef({ x: 0, y: 0 });
  const parallaxYRef = useRef(0);

  const updateTransform = (py: number, tx: number, ty: number) => {
    if (!parallaxWrapperRef.current) return;
    parallaxWrapperRef.current.style.transform = `translate3d(${tx.toFixed(2)}px, ${(py + ty).toFixed(2)}px, 0)`;
  };

  // 1. Subtle vertical scroll parallax (5–10px, 0° rotation strictly grounded)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !containerRef.current) return;

    let unsubscribeScroll: (() => void) | null = null;

    const onScrollPhysics = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const winH = window.innerHeight;
      const progress = (winH - rect.top) / (winH + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      // Subtle parallax range: -PROJECTS_PARALLAX_MAX to +PROJECTS_PARALLAX_MAX
      parallaxYRef.current = (clamped - 0.5) * SPIDER_EFFECTS_CONFIG.PROJECTS_PARALLAX_MAX * 2;
      updateTransform(parallaxYRef.current, tensionRef.current.x, tensionRef.current.y);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!unsubscribeScroll) {
            unsubscribeScroll = globalScrollPhysics.subscribe(onScrollPhysics);
          }
        } else {
          if (unsubscribeScroll) {
            unsubscribeScroll();
            unsubscribeScroll = null;
          }
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (unsubscribeScroll) {
        unsubscribeScroll();
      }
    };
  }, []);

  // 2. Cursor proximity tension
  useEffect(() => {
    if (!enableTension) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);

    if (prefersReducedMotion || isTouch) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      const radius = SPIDER_EFFECTS_CONFIG.CHARACTER_TENSION_RADIUS;
      const maxDisp = SPIDER_EFFECTS_CONFIG.CHARACTER_TENSION_MAX_DISPLACEMENT;

      if (dist < radius && dist > 0) {
        const factor = (1 - dist / radius) * maxDisp;
        tensionRef.current = {
          x: -(dx / dist) * factor,
          y: -(dy / dist) * factor
        };
      } else {
        tensionRef.current = { x: 0, y: 0 };
      }

      updateTransform(parallaxYRef.current, tensionRef.current.x, tensionRef.current.y);
    };

    const handlePointerLeave = () => {
      tensionRef.current = { x: 0, y: 0 };
      updateTransform(parallaxYRef.current, 0, 0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [enableTension]);

  const initialX = entranceSide === 'left' ? -90 : 90;
  const initialRotate = entranceSide === 'left' ? -5 : 5;

  return (
    <motion.div
      ref={containerRef}
      initial={{ x: initialX, opacity: 0, rotate: initialRotate }}
      whileInView={{ x: 0, opacity: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 85,
        duration: 0.8
      }}
      className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}
    >
      <div
        ref={parallaxWrapperRef}
        className="w-full will-change-transform"
        style={{
          transformOrigin: 'bottom center',
          transition: 'transform 0.08s linear'
        }}
      >
        <img
          src="/assets/spider/spydy_stand.png"
          alt="Standing Spider-Man"
          className="w-full h-auto drop-shadow-2xl pointer-events-none"
        />
      </div>
    </motion.div>
  );
};

// Spider-Web Corner Images with Hanging Sway Animations
export const CornerWebTopLeft: React.FC<{ className?: string }> = ({ className = "w-72 sm:w-96" }) => (
  <div className={`absolute top-0 left-0 pointer-events-none z-0 opacity-25 animate-web-sway-left ${className}`}>
    <img src="/assets/spider/web.png" alt="Spider Web Corner" className="w-full h-auto" />
  </div>
);

export const CornerWebTopRight: React.FC<{ className?: string }> = ({ className = "w-72 sm:w-96" }) => (
  <div className={`absolute top-0 right-0 pointer-events-none z-0 opacity-25 animate-web-sway-right ${className}`}>
    <img src="/assets/spider/web.png" alt="Spider Web Corner" className="w-full h-auto transform scale-x-[-1]" />
  </div>
);

export const CornerWebBottomRight: React.FC<{ className?: string }> = ({ className = "w-72 sm:w-96" }) => (
  <div className={`absolute bottom-0 right-0 pointer-events-none z-0 opacity-20 animate-web-sway-right ${className}`}>
    <img src="/assets/spider/web.png" alt="Spider Web Corner" className="w-full h-auto transform scale-y-[-1] scale-x-[-1]" />
  </div>
);
