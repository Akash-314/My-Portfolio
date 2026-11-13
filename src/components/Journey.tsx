import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Trophy, MapPin, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SplitWordReveal } from '../motion/SplitWordReveal';
import { CinematicReveal } from '../motion/CinematicReveal';
import { EASINGS } from '../motion/motionTokens';

export const Journey: React.FC = () => {
  const { journey } = usePortfolio();

  return (
    <section id="journey" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <CinematicReveal revealStyle="fade-up">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-2">
              CHRONOLOGICAL MILESTONES
            </div>
          </CinematicReveal>

          <SplitWordReveal
            text="MY JOURNEY."
            as="h2"
            className="text-5xl sm:text-7xl font-normal uppercase tracking-tight text-[#111827] font-display mb-3 leading-[0.95] justify-center"
            highlightWords={['JOURNEY.']}
          />
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full" />
        </div>

        {/* Vertical Timeline with connecting line animation */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-red-600 space-y-12">
          {journey.map((item, idx) => {
            const isEducation = item.type === 'education';

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: EASINGS.cinematic }}
                className="relative group"
              >
                {/* Timeline Node Icon */}
                <div
                  className={`cursor-target absolute -left-[37px] sm:-left-[45px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white shadow-md transition-transform group-hover:scale-110 ${
                    isEducation
                      ? 'border-blue-600 text-blue-600'
                      : 'border-[#b91c1c] text-[#b91c1c]'
                  }`}
                >
                  {isEducation ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : (
                    <Trophy className="w-4 h-4" />
                  )}
                </div>

                {/* Milestone Content Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-100">
                      {item.period}
                    </span>
                    <span className="text-xs font-mono font-semibold text-gray-500 uppercase">
                      {isEducation ? 'ACADEMIC' : 'COMPETITIVE RECORD'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-display font-normal text-[#111827] uppercase tracking-tight mb-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-sans font-bold text-gray-700 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-[#b91c1c]" />
                    <span>{item.institutionOrEvent}</span>
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 font-sans leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Bullet details */}
                  {item.details && item.details.length > 0 && (
                    <ul className="space-y-1.5 pt-3 border-t border-gray-100">
                      {item.details.map((detail, dIdx) => (
                        <li
                          key={dIdx}
                          className="text-xs sm:text-sm text-gray-600 font-sans flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#b91c1c] shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
