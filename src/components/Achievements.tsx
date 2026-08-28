import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { portfolioData } from '../data/portfolio';

export const Achievements: React.FC = () => {
  const { achievements } = portfolioData;
  const featured = achievements.find((a) => a.featured) || achievements[0];

  return (
    <section id="achievements" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2">
            HACKATHON PODIUM VICTORIES
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-3">
            ACHIEVEMENTS<span className="text-[#b91c1c]">.</span>
          </h2>
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full" />
        </div>

        {/* Featured Achievement Spotlight Card */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="spydyy-card p-8 sm:p-12 border-2 border-amber-400/60 relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 flex justify-center">
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/60 border-2 border-amber-400 flex flex-col items-center justify-center p-4 shadow-md">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-700 mb-2">
                    GOLD MEDALIST
                  </span>
                  <Trophy className="w-16 h-16 text-amber-500 drop-shadow" />
                  <span className="text-xs font-mono font-black text-[#111827] mt-3 uppercase tracking-wider">
                    {featured.position}
                  </span>
                  <span className="text-[11px] font-mono text-gray-600 font-bold">
                    NIT AGARTALA • {featured.year}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span className="px-3 py-1 rounded-md bg-[#b91c1c] text-white font-mono text-xs font-black uppercase">
                    1ST PLACE WINNER
                  </span>
                  <span className="text-xs font-mono text-gray-500 font-bold">
                    NATIONAL HACKATHON
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-sans tracking-tight mb-2">
                  {featured.title}
                </h3>

                <p className="text-sm font-bold text-[#b91c1c] font-mono mb-4">
                  {featured.organizer} — {featured.year}
                </p>

                <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-sans font-medium mb-6">
                  {featured.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {featured.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-1.5"
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
      </div>
    </section>
  );
};
