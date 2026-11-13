import { useRef } from 'react';
import { useScroll, useTransform, useReducedMotion, MotionValue } from 'framer-motion';

export interface ParallaxOptions {
  distance?: number; // Distance in pixels to move (-50 to +50)
  clamp?: boolean;
}

/**
 * Hook to apply subtle scroll-driven parallax relative to a section container
 * Foreground moves slightly faster/differently than background.
 * Respects reduced motion and disables excessive transforms.
 */
export function useSectionParallax(
  options: ParallaxOptions = {}
): {
  ref: React.RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
} {
  const { distance = 40 } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax transform: -distance to +distance
  const targetDistance = shouldReduceMotion ? 0 : distance;
  const y = useTransform(scrollYProgress, [0, 1], [-targetDistance, targetDistance]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6]);

  return { ref, y, opacity };
}

