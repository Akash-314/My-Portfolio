import type { Variants, Transition } from 'framer-motion';

/**
 * Standard Motion Easing Curves
 * - cinematic: custom smooth cubic-bezier for editorial entrances
 * - smooth: natural deceleration curve
 * - spring: controlled spring without harsh bouncing
 */
export const EASINGS = {
  cinematic: [0.16, 1, 0.3, 1] as const, // Apple/Editorial style smooth deceleration
  smooth: [0.25, 0.1, 0.25, 1] as const,
  energetic: [0.34, 1.56, 0.64, 1] as const,
  anticipate: [0.68, -0.6, 0.32, 1.6] as const,
};

export const TRANSITIONS = {
  quick: {
    duration: 0.25,
    ease: EASINGS.smooth,
  } satisfies Transition,
  standard: {
    duration: 0.6,
    ease: EASINGS.cinematic,
  } satisfies Transition,
  cinematic: {
    duration: 0.95,
    ease: EASINGS.cinematic,
  } satisfies Transition,
  spring: {
    type: 'spring',
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  } satisfies Transition,
};

/**
 * Common Viewport Trigger Options
 */
export const DEFAULT_VIEWPORT = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -60px 0px',
};

/**
 * 1. Cinematic Fade-Up Variant
 */
export const cinematicFadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: EASINGS.cinematic,
    },
  },
};

/**
 * 2. Directional Slide Reveals
 */
export const slideRevealLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: EASINGS.cinematic,
    },
  },
};

export const slideRevealRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: EASINGS.cinematic,
    },
  },
};

/**
 * 3. Clip Path Mask Reveals
 */
export const clipPathWipeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
    y: 20,
  },
  visible: {
    opacity: 1,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    y: 0,
    transition: {
      duration: 0.9,
      ease: EASINGS.cinematic,
    },
  },
};

export const clipPathDiagonalVariants: Variants = {
  hidden: {
    opacity: 0,
    clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
  },
  visible: {
    opacity: 1,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transition: {
      duration: 0.95,
      ease: EASINGS.cinematic,
    },
  },
};

/**
 * 4. Scale & Reveal
 */
export const scaleRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: EASINGS.cinematic,
    },
  },
};

/**
 * 5. Staggered Container & Children
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 25,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: EASINGS.cinematic,
    },
  },
};

/**
 * Reduced Motion Fallback
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};
