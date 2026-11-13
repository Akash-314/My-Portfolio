import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useSpring } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SplitWordReveal } from '../motion/SplitWordReveal';
import { CinematicReveal } from '../motion/CinematicReveal';
import { EASINGS } from '../motion/motionTokens';
import type { Achievement } from '../data/portfolio';

export const Achievements: React.FC = () => {
  const { achievements } = usePortfolio();
  const sectionRef = useRef<HTMLElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isSpotlightInView = useInView(spotlightRef, { once: true, amount: 0.25 });
  const [unlockPhase, setUnlockPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Scroll timeline progress for drawing central line
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center'],
  });
  const lineProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    restDelta: 0.001,
  });

  // Selected achievement for spotlight inspection
  const [selectedId, setSelectedId] = useState<string>(
    achievements.find((a) => a.featured)?.id || achievements[0]?.id || ''
  );

  const selectedAchievement: Achievement =
    achievements.find((a) => a.id === selectedId) || achievements[0];

  useEffect(() => {
    if (isSpotlightInView && selectedAchievement?.featured && unlockPhase === 0) {
      setUnlockPhase(1);
      const t1 = setTimeout(() => setUnlockPhase(2), 250);
      const t2 = setTimeout(() => setUnlockPhase(3), 600);
      const t3 = setTimeout(() => setUnlockPhase(4), 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isSpotlightInView, selectedAchievement?.featured, unlockPhase]);

  return (
    <section
      ref={sectionRef}
      id="achievements"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <CinematicReveal revealStyle="fade-up">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-2 flex items-center gap-1.5 justify-center">
              <Zap className="w-3.5 h-3.5 text-[#b91c1c]" /> CONNECTED HACKATHON & CODING PODIUMS
            </div>
          </CinematicReveal>

          <SplitWordReveal
            text="ACHIEVEMENTS."
            as="h2"
            className="text-5xl sm:text-7xl lg:text-8xl font-normal uppercase tracking-tight text-[#111827] font-display mb-3 leading-[0.95] justify-center"
            highlightWords={['ACHIEVEMENTS.']}
          />
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full mb-3" />
          <p className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-gray-500 max-w-lg">
            INTERCONNECTED WEB OF VICTORIES & COMPETITIVE BENCHMARKS
          </p>
        </div>

        {/* Constellation Web Connection Bar */}
        <CinematicReveal revealStyle="scale" delay={0.15} className="mb-12">
          <div className="p-4 rounded-2xl border border-red-200/80 bg-red-50/40 backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase text-red-900 tracking-wider">
                PODIUM CONSTELLATION MESH:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {achievements.map((ach) => (
                <button
                  key={ach.id}
                  onClick={() => setSelectedId(ach.id)}
                  className={`cursor-target px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                    selectedId === ach.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/20 scale-105'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'
                  }`}
                >
                  {ach.year} • {ach.title.split('—')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </CinematicReveal>

        {/* 2-Column Responsive Layout: Left Timeline, Right Spotlight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Achievement List with Scroll-drawn Thread */}
          <div className="lg:col-span-5 relative pl-6 sm:pl-8 border-l-2 border-red-200 space-y-6">
            {/* Animated Red Fill Overlay */}
            <motion.div
              style={{ scaleY: lineProgress }}
              className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-[#b91c1c] origin-top pointer-events-none"
            />

            {achievements.map((ach, idx) => {
              const isSelected = selectedId === ach.id;
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: EASINGS.cinematic }}
                  onClick={() => setSelectedId(ach.id)}
                  className={`cursor-target p-6 rounded-2xl border transition-all duration-300 relative group ${
                    isSelected
                      ? 'border-red-600 bg-red-50/40 shadow-xl ring-1 ring-red-600/30 -translate-y-0.5'
                      : 'border-gray-200 bg-white hover:border-red-300 hover:bg-gray-50/50 shadow-sm'
                  }`}
                >
                  {/* Timeline Anchor Node */}
                  <div
                    className={`absolute -left-[35px] sm:-left-[43px] top-6 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-600 text-white scale-110 shadow-md'
                        : 'border-red-400 bg-white text-red-600'
                    }`}
                  >
                    <Trophy className="w-3 h-3" />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600">
                      {ach.year} • {ach.organizer}
                    </span>
                    {ach.featured && (
                      <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                        FEATURED
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-display font-normal text-[#111827] uppercase tracking-tight mb-2">
                    {ach.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-gray-600 line-clamp-2 leading-relaxed">
                    {ach.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Holographic Spotlight Display Card */}
          <div ref={spotlightRef} className="lg:col-span-7 sticky top-28">
            <AnimatePresence mode="wait">
              {selectedAchievement && (
                <motion.div
                  key={selectedAchievement.id}
                  initial={{ opacity: 0, y: 25, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -25, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: EASINGS.cinematic }}
                  className="bg-white border-2 border-red-600 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden"
                >
                  {/* Subtle Spider Badge Corner Watermark */}
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-40 h-40 rounded-full bg-red-500/10 pointer-events-none blur-xl" />

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-red-600" />
                      <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-600">
                        {selectedAchievement.position || 'TOP PODIUM'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-500 uppercase">
                      YEAR {selectedAchievement.year}
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-5xl font-display font-normal text-[#111827] uppercase tracking-tight mb-4">
                    {selectedAchievement.title}
                  </h3>

                  <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 mb-6">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
                      ORGANIZER / EVENT:
                    </p>
                    <p className="text-sm sm:text-base font-bold text-gray-800 font-sans">
                      {selectedAchievement.organizer} ({selectedAchievement.event})
                    </p>
                  </div>

                  <p className="text-base sm:text-lg text-gray-700 font-sans leading-relaxed mb-6 font-normal">
                    {selectedAchievement.description}
                  </p>

                  {/* Tags */}
                  {selectedAchievement.tags && selectedAchievement.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      {selectedAchievement.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-red-50 text-red-700 border border-red-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
