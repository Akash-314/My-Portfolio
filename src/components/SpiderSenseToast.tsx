import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface SpiderSenseToastProps {
  active: boolean;
}

export const SpiderSenseToast: React.FC<SpiderSenseToastProps> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#0d0f17] border border-red-500/40 text-xs font-mono text-white shadow-xl">
            <Zap className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="text-[10px] uppercase text-red-400 font-bold tracking-wider">
              SPIDER SENSE • ONLINE
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
