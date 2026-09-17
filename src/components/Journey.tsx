import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Trophy, Calendar, CheckCircle2, MapPin } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const Journey: React.FC = () => {
  const { journey } = usePortfolio();

  return (
    <section id="journey" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2">
            CHRONOLOGICAL MILESTONES
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-3">
            MY JOURNEY<span className="text-[#b91c1c]">.</span>
          </h2>
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full" />
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-red-600 space-y-10">
          {journey.map((item, idx) => {
            const isEducation = item.type === 'education';

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative group"
              >
                {/* Timeline Node Icon */}
                <div
                  className={`cursor-target absolute -left-[37px] sm:-left-[45px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white shadow-md ${
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

                {/* Content Box */}
                <div className="cursor-target spydyy-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-50 border border-red-200 text-xs font-mono font-bold text-[#b91c1c]">
                      <Calendar className="w-3 h-3 text-[#b91c1c]" /> {item.period}
                    </span>
                    <span className="text-xs font-mono text-gray-600 font-bold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#b91c1c]" /> {item.institutionOrEvent}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#111827] font-sans mb-1">
                    {item.title}
                  </h3>

                  <p className="text-xs font-semibold text-gray-500 font-sans mb-3">
                    {item.institutionOrEvent}
                  </p>

                  <p className="text-sm text-gray-700 font-sans leading-relaxed mb-4 font-medium">
                    {item.description}
                  </p>

                  {item.details && (
                    <div className="pt-3 border-t border-gray-100 space-y-1.5">
                      {item.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs font-sans text-gray-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#b91c1c] shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
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
