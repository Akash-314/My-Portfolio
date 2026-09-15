import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, ChevronRight, Zap } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import type { Achievement } from '../data/portfolio';

export const Achievements: React.FC = () => {
  const { achievements } = usePortfolio();

  // Selected achievement for spotlight inspection
  const [selectedId, setSelectedId] = useState<string>(
    achievements.find((a) => a.featured)?.id || achievements[0]?.id || ''
  );

  const selectedAchievement: Achievement =
    achievements.find((a) => a.id === selectedId) || achievements[0];

  return (
    <section id="achievements" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#b91c1c]" /> CONNECTED HACKATHON & CODING PODIUMS
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-3">
            ACHIEVEMENTS<span className="text-[#b91c1c]">.</span>
          </h2>
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full mb-3" />
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 max-w-lg">
            INTERCONNECTED WEB OF VICTORIES & COMPETITIVE BENCHMARKS
          </p>
        </div>

        {/* 1. Spider-Web Constellation Chain (Interactive Node Graph) */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-md relative overflow-hidden">
          {/* Subtle Spider Web Background Watermark */}
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none w-72 h-72">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-black fill-none">
              <circle cx="50" cy="50" r="45" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="30" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="15" strokeWidth="0.5" />
              <line x1="5" y1="50" x2="95" y2="50" strokeWidth="0.5" />
              <line x1="50" y1="5" x2="50" y2="95" strokeWidth="0.5" />
              <line x1="18" y1="18" x2="82" y2="82" strokeWidth="0.5" />
              <line x1="18" y1="82" x2="82" y2="18" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 mb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-black uppercase text-[#b91c1c] tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#b91c1c] animate-ping" />
                SPIDER-WEB CHAIN MATRIX
              </span>
              <p className="text-[11px] font-mono text-gray-500 font-semibold">
                Click any milestone node in the webbed chain to inspect details
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-red-50 text-[#b91c1c] border border-red-200">
              {achievements.length} CHAINED PODIUMS
            </span>
          </div>

          {/* Interactive Webbed Chain Track */}
          <div className="relative py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {achievements.map((ach, idx) => {
                const isSelected = ach.id === selectedId;
                return (
                  <motion.div
                    key={ach.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedId(ach.id)}
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                      isSelected
                        ? 'border-[#b91c1c] bg-red-50/50 shadow-lg shadow-red-900/10'
                        : 'border-gray-200 bg-gray-50/70 hover:border-red-300 hover:bg-white'
                    }`}
                  >
                    {/* Node Web Badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-black ${
                            isSelected
                              ? 'bg-[#b91c1c] text-white'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500">
                          WEB LINK #{idx + 1}
                        </span>
                      </div>
                      {ach.featured && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Trophy className="w-2.5 h-2.5 text-amber-600" /> TOP PODIUM
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-[#111827] font-sans line-clamp-1 mb-1">
                      {ach.title}
                    </h4>

                    <div className="text-[11px] font-mono text-[#b91c1c] font-bold mb-2">
                      {ach.position} • {ach.year}
                    </div>

                    {/* Chain indicator */}
                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px] font-mono text-gray-500 font-semibold">
                      <span>{ach.organizer}</span>
                      <span className="text-[#b91c1c] font-bold flex items-center">
                        INSPECT <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Featured / Selected Achievement Spotlight Card */}
        <AnimatePresence mode="wait">
          {selectedAchievement && (
            <motion.div
              key={selectedAchievement.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="spydyy-card p-8 sm:p-12 border-2 border-red-500/60 relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50/30"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Trophy/Medal Badge */}
                <div className="lg:col-span-4 flex justify-center">
                  <div className="w-48 h-48 rounded-3xl bg-gradient-to-b from-amber-50 via-white to-amber-100/70 border-2 border-amber-400 flex flex-col items-center justify-center p-4 shadow-xl relative group">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-700 mb-2">
                      {selectedAchievement.featured ? 'GOLD MEDALIST' : 'HONOR RECOGNITION'}
                    </span>
                    {selectedAchievement.featured ? (
                      <Trophy className="w-16 h-16 text-amber-500 drop-shadow-md group-hover:scale-110 transition-transform" />
                    ) : (
                      <Award className="w-16 h-16 text-red-600 drop-shadow-md group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs font-mono font-black text-[#111827] mt-3 uppercase tracking-wider text-center">
                      {selectedAchievement.position}
                    </span>
                    <span className="text-[11px] font-mono text-gray-600 font-bold mt-1 text-center">
                      {selectedAchievement.organizer} • {selectedAchievement.year}
                    </span>
                  </div>
                </div>

                {/* Right Detailed Narrative */}
                <div className="lg:col-span-8 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="px-3 py-1 rounded-md bg-[#b91c1c] text-white font-mono text-xs font-black uppercase tracking-wider">
                      {selectedAchievement.position}
                    </span>
                    <span className="text-xs font-mono text-gray-600 font-bold flex items-center gap-1">
                      EVENT: {selectedAchievement.event}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-extrabold text-[#111827] font-sans tracking-tight mb-2">
                    {selectedAchievement.title}
                  </h3>

                  <p className="text-sm font-bold text-[#b91c1c] font-mono mb-4">
                    ORGANIZER: {selectedAchievement.organizer} — {selectedAchievement.year}
                  </p>

                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-sans font-medium mb-6">
                    {selectedAchievement.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedAchievement.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-white text-gray-800 border border-gray-300 flex items-center gap-1.5 shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
