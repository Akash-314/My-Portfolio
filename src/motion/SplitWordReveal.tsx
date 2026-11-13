import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { EASINGS } from './motionTokens';

interface SplitWordRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  delay?: number;
  stagger?: number;
  highlightWords?: string[];
  highlightColor?: string;
}

export const SplitWordReveal: React.FC<SplitWordRevealProps> = ({
  text,
  as = 'h2',
  className = '',
  delay = 0,
  stagger = 0.045,
  highlightWords = [],
  highlightColor = '#b91c1c',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.25 });

  const words = text.split(' ');

  const Tag = as;

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag ref={containerRef} className={`${className} flex flex-wrap items-baseline`} aria-label={text}>
      {words.map((word, idx) => {
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
        const isHighlight = highlightWords.includes(cleanWord);

        return (
          <span key={`${word}-${idx}`} className="inline-block overflow-hidden mr-[0.26em] py-0.5">
            <motion.span
              className="inline-block will-change-transform"
              initial={{ y: '110%', opacity: 0, rotateZ: 2 }}
              animate={
                isInView
                  ? { y: '0%', opacity: 1, rotateZ: 0 }
                  : { y: '110%', opacity: 0, rotateZ: 2 }
              }
              transition={{
                duration: 0.75,
                ease: EASINGS.cinematic,
                delay: delay + idx * stagger,
              }}
              style={isHighlight ? { color: highlightColor } : undefined}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
};

