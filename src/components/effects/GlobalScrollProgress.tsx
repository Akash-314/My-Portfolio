import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const GlobalScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none select-none bg-black/5"
      aria-hidden="true"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#ef4444] origin-left shadow-[0_0_8px_rgba(220,38,38,0.4)]"
        style={{ scaleX }}
      />
    </div>
  );
};

