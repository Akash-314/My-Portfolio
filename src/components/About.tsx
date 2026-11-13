import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { portfolioData } from '../data/portfolio';
import { CinematicReveal } from '../motion/CinematicReveal';
import { SplitWordReveal } from '../motion/SplitWordReveal';

export const About: React.FC = () => {
  const { personal } = portfolioData;
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Gentle Parallax for suspended portrait
  const avatarY = useTransform(scrollYProgress, [0, 1], [-20, shouldReduceMotion ? 0 : 25]);
  const avatarRotate = useTransform(scrollYProgress, [0, 1], [-1, shouldReduceMotion ? 0 : 1.5]);

  const techStack = [
    'C++',
    'Data Structures',
    'Algorithms',
    'React',
    'JavaScript',
    'Node.js',
    'MongoDB',
    'SQL',
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative Content */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Tag */}
            <CinematicReveal revealStyle="slide-left">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-3 flex items-center gap-2">
                <span className="w-3 h-2 bg-[#b91c1c] rounded-sm" />
                BEHIND THE MASK
              </div>
            </CinematicReveal>

            {/* Split Word Heading */}
            <SplitWordReveal
              text="AKASH KUMAR."
              as="h2"
              className="text-5xl sm:text-7xl lg:text-8xl font-normal uppercase tracking-tight text-[#111827] font-display mb-6 leading-[0.92]"
              highlightWords={['KUMAR.']}
            />

            {/* Paragraphs with Smooth Reveal */}
            <CinematicReveal revealStyle="fade-up" delay={0.15} className="w-full">
              <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed font-sans font-medium mb-8">
                <p className="border-l-2 border-[#b91c1c] pl-4 text-gray-900 font-semibold">
                  {personal.bio.intro}
                </p>
                <p>{personal.bio.skillsFocus}</p>
                <p>{personal.bio.webFocus}</p>
              </div>
            </CinematicReveal>

            {/* Tech Badges / Primary Arsenal */}
            <CinematicReveal revealStyle="fade-up" delay={0.25} className="w-full">
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                    PRIMARY ARSENAL
                  </span>
                  <span className="text-[10px] font-mono text-[#b91c1c] font-bold tracking-widest uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    CORE STACK
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="cursor-target px-3.5 py-1.5 rounded-full bg-gray-50 hover:bg-red-50/60 border border-gray-200 hover:border-[#b91c1c] text-xs font-mono font-semibold text-gray-800 hover:text-[#b91c1c] shadow-sm transition-all duration-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </CinematicReveal>
          </div>

          {/* Right Column: Circular Avatar Frame Suspended by Web Thread */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex justify-center relative pt-8 lg:pt-0"
          >
            <motion.div
              style={{ y: avatarY, rotate: avatarRotate }}
              className="relative group will-change-transform flex flex-col items-center"
            >
              {/* Suspended Red Web Thread connecting upward */}
              <div className="w-[2px] h-28 sm:h-36 bg-gradient-to-b from-gray-900 via-[#b91c1c] to-[#b91c1c] absolute -top-28 sm:-top-36 left-1/2 -translate-x-1/2 pointer-events-none" />

              {/* Spider Knot / Anchor Point */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#b91c1c] border-2 border-white shadow-md absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none" />

              {/* Subtle Red/Blue Spider Glow on Hover */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-600/30 via-rose-500/20 to-blue-600/30 blur-lg opacity-40 group-hover:opacity-80 transition duration-500 pointer-events-none" />

              {/* Circular Avatar Frame */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-[#b91c1c] shadow-2xl p-2 bg-white overflow-hidden group cursor-target">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-gray-100 via-gray-50 to-gray-200 flex items-center justify-center overflow-hidden relative">
                  <img
                    src="/assets/spider/hero.png"
                    alt="Akash Kumar Profile"
                    loading="lazy"
                    decoding="async"
                    width={320}
                    height={320}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Subtle Inner Spider Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none opacity-80" />

                  {/* Bottom Emblem Badge */}
                  <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#b91c1c] font-bold bg-white/95 px-3.5 py-1 rounded-full border border-red-200/80 shadow-md">
                      ORIGIN // SP4RK
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
