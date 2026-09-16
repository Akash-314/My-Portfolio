import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SPIDER_EFFECTS_CONFIG } from '../config/spiderEffectsConfig';

interface CharacterSuspensionProps {
  className?: string;
  entranceSide?: 'left' | 'right';
  enableTension?: boolean;
}

// Hanging upside down Spider-Man visual with entrance slide & subtle cursor tension
export const HangingSpiderMan: React.FC<CharacterSuspensionProps> = ({
  className = "w-44 sm:w-56",
  entranceSide = 'right',
  enableTension = true
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tensionOffset, setTensionOffset] = useState({ x: 0, y: 0 });
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    if (!enableTension) return;

    // Check touch and reduced motion
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
        // Move very slightly AWAY from the cursor (1-2.5px max)
        const factor = (1 - dist / radius) * maxDisp;
        setTensionOffset({
          x: -(dx / dist) * factor,
          y: -(dy / dist) * factor
        });
        setIsNear(dist < 120);
      } else {
        setTensionOffset({ x: 0, y: 0 });
        setIsNear(false);
      }
    };

    const handlePointerLeave = () => {
      setTensionOffset({ x: 0, y: 0 });
      setIsNear(false);
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
      className={`relative flex flex-col items-center select-none pointer-events-none transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: `translate3d(${tensionOffset.x}px, ${tensionOffset.y}px, 0)`
      }}
    >
      {/* Hanging Web Thread Line from Header */}
      <div className="w-0.5 h-32 sm:h-44 bg-gradient-to-b from-[#111827] via-gray-400 to-[#b91c1c] shadow-sm" />

      {/* Subtle Proximity Wake-up Glow Pulse */}
      {isNear && (
        <div className="absolute top-28 w-24 h-24 rounded-full bg-red-600/15 blur-xl pointer-events-none animate-pulse" />
      )}

      {/* Real Hanging Spider-Man Image spydy_hang.png with Pendulum Sway */}
      <div className="animate-spider-hang w-full">
        <img
          src="/assets/spider/spydy_hang.png"
          alt="Hanging Spider-Man"
          className="w-full h-auto drop-shadow-2xl"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    </motion.div>
  );
};

// Standing Spider-Man character visual with entrance slide & subtle tension
export const StandingSpiderMan: React.FC<CharacterSuspensionProps> = ({
  className = "w-48 sm:w-60",
  entranceSide = 'left',
  enableTension = true
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tensionOffset, setTensionOffset] = useState({ x: 0, y: 0 });

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
        setTensionOffset({
          x: -(dx / dist) * factor,
          y: -(dy / dist) * factor
        });
      } else {
        setTensionOffset({ x: 0, y: 0 });
      }
    };

    const handlePointerLeave = () => {
      setTensionOffset({ x: 0, y: 0 });
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
      className={`relative flex flex-col items-center select-none pointer-events-none transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: `translate3d(${tensionOffset.x}px, ${tensionOffset.y}px, 0)`
      }}
    >
      <img
        src="/assets/spider/spydy_stand.png"
        alt="Standing Spider-Man"
        className="w-full h-auto drop-shadow-2xl"
      />
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
