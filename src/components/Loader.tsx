import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoaderProps {
  onFinish: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onFinish }) => {
  const [phase, setPhase] = useState<'initializing' | 'name' | 'done'>('initializing');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('name');
    }, 700);

    const timer2 = setTimeout(() => {
      setPhase('done');
      setTimeout(onFinish, 300);
    }, 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08090d] text-white overflow-hidden"
        >
          {/* Abstract Minimal Spider Symbol SVG */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <svg
              width="70"
              height="70"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="50,10 90,50 50,90 10,50" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" fill="none" />
              <polygon points="50,25 75,50 50,75 25,50" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
              <polygon points="50,38 62,50 50,62 38,50" stroke="#ffffff" strokeWidth="1" fill="none" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="4" fill="#ef4444" />
            </svg>
          </motion.div>

          <div className="h-8 flex flex-col items-center justify-center font-mono">
            {phase === 'initializing' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs uppercase tracking-[0.3em] text-red-500 font-semibold flex items-center gap-2"
              >
                INITIALIZING...
              </motion.div>
            )}

            {phase === 'name' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xl font-bold uppercase tracking-[0.2em] text-white"
              >
                AKASH KUMAR
              </motion.div>
            )}
          </div>

          <div className="w-40 h-0.5 mt-6 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
              className="w-full h-full bg-red-600"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
