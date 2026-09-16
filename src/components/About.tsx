import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolio';

export const About: React.FC = () => {
  const { personal } = portfolioData;

  const techStack = [
    'C++',
    'Data Structures',
    'Algorithms',
    'React',
    'JavaScript',
    'Node.js',
    'MongoDB',
    'SQL'
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      {/* Hanging Vertical Web Thread from Header */}
      <div className="hanging-thread right-1/4 h-32 hidden lg:block" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Narrative Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Tag */}
            <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2 flex items-center gap-2">
              <span className="w-3 h-2 bg-[#b91c1c] rounded-sm" />
              BEHIND THE MASK
            </div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-6">
              AKASH KUMAR<span className="text-[#b91c1c]">.</span>
            </h2>

            <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed font-sans font-medium mb-8">
              <p>{personal.bio.intro}</p>
              <p>{personal.bio.skillsFocus}</p>
              <p>{personal.bio.webFocus}</p>
            </div>

            {/* Primary Tech Stack Pills */}
            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-gray-500 block mb-3">
                PRIMARY TECH STACK
              </span>
              <div className="flex flex-wrap gap-2.5">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-2xl bg-white border border-gray-200 text-xs font-bold text-[#b91c1c] shadow-sm hover:border-[#b91c1c] transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Circular Avatar Frame with hero.png Suspended by Red Thread Line */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center relative"
          >
            {/* Suspended Red Thread Line */}
            <div className="w-0.5 h-24 bg-[#b91c1c] absolute -top-24 left-1/2 -translate-x-1/2" />

            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-[#b91c1c] shadow-2xl p-2 bg-white overflow-hidden group">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/spider/hero.png"
                  alt="Akash Kumar Profile"
                  loading="lazy"
                  decoding="async"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
