import React from 'react';
import { motion } from 'framer-motion';
import { HangingSpiderMan } from './SpiderManSuspensions';

export const Skills: React.FC = () => {
  const skillCards = [
    {
      title: 'C++ & ALGORITHMS',
      category: 'LANGUAGES & PROBLEM SOLVING',
      level: 'ADVANCED',
      highlight: true
    },
    {
      title: 'DATA STRUCTURES',
      category: 'PROBLEM SOLVING',
      level: 'ADVANCED',
      highlight: true
    },
    {
      title: 'REACT & JAVASCRIPT',
      category: 'FRONTEND DEVELOPMENT',
      level: 'ADVANCED'
    },
    {
      title: 'NODE.JS & EXPRESS',
      category: 'BACKEND DEVELOPMENT',
      level: 'PROFICIENT'
    },
    {
      title: 'MONGODB & SQL',
      category: 'DATABASE MANAGEMENT',
      level: 'PROFICIENT'
    },
    {
      title: 'GIT & GITHUB',
      category: 'VERSION CONTROL & TOOLS',
      level: 'ADVANCED'
    },
    {
      title: 'CORE CS (OOP, OS, DBMS)',
      category: 'COMPUTER SCIENCE CORE',
      level: 'ADVANCED',
      highlight: true
    },
    {
      title: 'PYTHON & SCRIPTS',
      category: 'LANGUAGES & SCRIPTS',
      level: 'PROFICIENT'
    }
  ];

  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2">
            ARSENAL & EXPERTISE
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-3">
            TECHNICAL SKILLS<span className="text-[#b91c1c]">.</span>
          </h2>
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: 2-Column Skill Cards Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {skillCards.map((skill, idx) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="spydyy-card p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] shrink-0" />
                  <div>
                    <h3 className="text-sm font-extrabold text-[#111827] font-sans tracking-wide">
                      {skill.title}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider block">
                      {skill.category}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full ${
                    skill.level === 'ADVANCED'
                      ? 'bg-red-50 text-[#b91c1c] border border-red-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {skill.level}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Upside Down Hanging Spider-Man (Matching Reference Screenshot 3) */}
          <div className="lg:col-span-4 hidden lg:flex justify-center relative -mt-20">
            <HangingSpiderMan className="w-48 xl:w-56" />
          </div>
        </div>
      </div>
    </section>
  );
};
