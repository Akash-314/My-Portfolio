import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { HangingSpiderMan } from './SpiderManSuspensions';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';
import { SplitWordReveal } from '../motion/SplitWordReveal';
import { CinematicReveal } from '../motion/CinematicReveal';
import { EASINGS } from '../motion/motionTokens';
import type { SkillItem } from '../data/portfolio';

export const Skills: React.FC = () => {
  const { skills } = usePortfolio();

  // Extract unique categories
  const categories = Array.from(new Set(skills.map((s) => s.category)));
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [hoveredSkill, setHoveredSkill] = useState<SkillItem | null>(null);

  const filteredSkills =
    selectedCategory === 'ALL'
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

  return (
    <section id="skills" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-14 text-center">
          <CinematicReveal revealStyle="fade-up">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-2 flex items-center justify-center gap-1.5">
              <span>ARSENAL & EXPERTISE</span>
              <AdminShieldTrigger className="opacity-20 hover:opacity-100 text-[#b91c1c]" iconSize={12} />
            </div>
          </CinematicReveal>

          <SplitWordReveal
            text="TECHNICAL SKILLS."
            as="h2"
            className="text-5xl sm:text-7xl lg:text-8xl font-normal uppercase tracking-tight text-[#111827] font-display mb-3 leading-[0.95] justify-center"
            highlightWords={['SKILLS.']}
          />
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full mb-3" />
          <p className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-gray-500 max-w-lg">
            INTERCONNECTED COMPETENCY NODES & SYSTEM MASTERY
          </p>
        </div>

        {/* Category Network Filter Bar */}
        <CinematicReveal revealStyle="scale" delay={0.15} className="mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-white rounded-2xl border border-gray-200/80 shadow-sm max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`cursor-target px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#b91c1c] text-white shadow-md shadow-red-950/20 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ALL ARSENAL ({skills.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-target px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#111827] text-white shadow-md scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CinematicReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Interactive Skill Node Cards */}
          <div className="lg:col-span-8">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredSkills.map((skill, idx) => {
                  const isHovered = hoveredSkill?.id === skill.id;
                  return (
                    <motion.div
                      layout
                      key={skill.id || skill.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, delay: idx * 0.03, ease: EASINGS.cinematic }}
                      onMouseEnter={() => setHoveredSkill(skill)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      className={`cursor-target p-5 rounded-2xl border bg-white flex items-center justify-between group transition-all duration-300 ${
                        isHovered
                          ? 'border-[#b91c1c] shadow-lg shadow-red-950/10 -translate-y-1'
                          : 'border-gray-200/80 shadow-sm hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 transition-transform ${
                            skill.highlight
                              ? 'bg-[#b91c1c] ring-4 ring-red-100 group-hover:scale-125'
                              : 'bg-gray-400 group-hover:bg-[#111827]'
                          }`}
                        />
                        <div>
                          <h3 className="text-sm font-extrabold text-[#111827] font-sans tracking-wide flex items-center gap-2">
                            {skill.name}
                            {skill.highlight && (
                              <span className="text-[9px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                                CORE
                              </span>
                            )}
                          </h3>
                          <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider block">
                            {skill.category}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        {skill.level}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column: Suspended Hanging Spider-Man Anchor + Node Diagnostic Panel */}
          <div className="lg:col-span-4 hidden lg:flex flex-col items-center sticky top-28 space-y-6">
            <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-xl backdrop-blur-sm w-full flex flex-col items-center relative overflow-hidden">
              <HangingSpiderMan className="w-52 h-auto drop-shadow-2xl" />

              <div className="mt-4 text-center w-full pt-4 border-t border-gray-100">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#b91c1c] block mb-1">
                  {hoveredSkill ? `INSPECTING // ${hoveredSkill.name}` : 'NETWORK ACTIVE'}
                </span>
                <span className="text-xs text-gray-600 font-sans block">
                  {hoveredSkill
                    ? `Level: ${hoveredSkill.level} • Category: ${hoveredSkill.category}`
                    : 'Hover skill nodes to inspect parameters'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
