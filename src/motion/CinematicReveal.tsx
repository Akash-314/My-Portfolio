import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  cinematicFadeUpVariants,
  slideRevealLeftVariants,
  slideRevealRightVariants,
  clipPathWipeUpVariants,
  scaleRevealVariants,
  staggerContainerVariants,
  reducedMotionVariants,
  DEFAULT_VIEWPORT,
} from './motionTokens';

export type RevealStyle =
  | 'fade-up'
  | 'slide-left'
  | 'slide-right'
  | 'clip-up'
  | 'scale'
  | 'stagger-container';

interface CinematicRevealProps {
  children: React.ReactNode;
  revealStyle?: RevealStyle;
  delay?: number;
  className?: string;
  as?: keyof typeof motion;
  once?: boolean;
}

export const CinematicReveal: React.FC<CinematicRevealProps> = ({
  children,
  revealStyle = 'fade-up',
  delay = 0,
  className = '',
  as = 'div',
  once = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: DEFAULT_VIEWPORT.amount,
  });

  const getVariant = () => {
    if (shouldReduceMotion) return reducedMotionVariants;
    switch (revealStyle) {
      case 'slide-left':
        return slideRevealLeftVariants;
      case 'slide-right':
        return slideRevealRightVariants;
      case 'clip-up':
        return clipPathWipeUpVariants;
      case 'scale':
        return scaleRevealVariants;
      case 'stagger-container':
        return staggerContainerVariants;
      case 'fade-up':
      default:
        return cinematicFadeUpVariants;
    }
  };

  const Component = motion[as as 'div'] || motion.div;

  return (
    <Component
      ref={ref}
      variants={getVariant()}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Component>
  );
};

