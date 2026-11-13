import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ExternalLink, Trophy, Globe, Code2, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { GithubIcon } from './Icons';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';
import { StandingSpiderMan } from './SpiderManSuspensions';
import { SplitWordReveal } from '../motion/SplitWordReveal';
import { CinematicReveal } from '../motion/CinematicReveal';
import { SpotlightCard } from './effects/SpotlightCard';
import { WebMagneticButton } from './WebMagneticButton';
import type { Project } from '../data/portfolio';

// Individual Featured Project Showcase Panel
const FeaturedProjectPanel: React.FC<{ project: Project; index: number; total: number }> = ({
  project,
  index,
  total,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll-linked image scale reveal
  const { scrollYProgress } = useScroll({
    target: panelRef,
    offset: ['start end', 'end start'],
  });

  const cardScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.96]);
  const cardY = useTransform(scrollYProgress, [0, 1], [shouldReduceMotion ? 0 : 30, shouldReduceMotion ? 0 : -30]);

  return (
    <motion.div
      ref={panelRef}
      style={{ scale: cardScale, y: cardY }}
      className="relative w-full mb-12 will-change-transform"
    >
      <SpotlightCard
        spotlightColor="rgba(185, 28, 28, 0.08)"
        borderColor="rgba(185, 28, 28, 0.5)"
        className={`p-6 sm:p-10 lg:p-12 border transition-all duration-300 ${
          project.featured
            ? 'bg-gradient-to-br from-white via-white to-red-50/30 border-red-600 shadow-2xl ring-1 ring-red-600/30'
            : 'bg-white border-gray-200 shadow-lg'
        }`}
      >
        {/* Corner index watermark */}
        <div className="absolute top-4 right-8 font-display text-7xl sm:text-9xl text-gray-100 select-none pointer-events-none font-bold">
          0{index + 1}
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Mission Briefing */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    project.featured ? 'bg-[#b91c1c] animate-pulse' : 'bg-gray-400'
                  }`}
                />
                <span className="text-xs font-mono font-bold tracking-wider text-red-600 uppercase">
                  MISSION {index + 1} OF {total} • {project.featured ? 'FEATURED BENCHMARK' : 'PRODUCTION ARCHIVE'}
                </span>

                {project.featured && (
                  <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full ml-auto">
                    <Trophy className="w-3.5 h-3.5 text-red-600" />
                    ARJUNA 2.0 1ST PLACE
                  </span>
                )}
              </div>

              <h3 className="text-3xl sm:text-5xl font-display font-normal text-[#111827] tracking-tight uppercase mb-3 flex items-center gap-2 group-hover:text-[#b91c1c] transition-colors">
                <span>{project.title}</span>
                <ArrowUpRight className="w-6 h-6 text-[#b91c1c] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>

              <p className="text-xs sm:text-sm font-sans font-bold text-[#b91c1c] uppercase tracking-wider mb-6">
                {project.subtitle}
              </p>

              <p className="text-sm sm:text-base text-gray-700 font-sans leading-relaxed mb-6 font-normal">
                {project.description}
              </p>

              {/* Highlights List */}
              {project.highlights && project.highlights.length > 0 && (
                <ul className="mb-6 space-y-2.5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                  {project.highlights.map((hl, i) => (
                    <li key={i} className="text-xs sm:text-sm text-gray-700 font-sans flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] mt-1.5 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              {/* Tech Stack Pills with Micro-Interactions */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="cursor-target px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-white text-gray-800 border border-gray-200 shadow-sm hover:border-[#b91c1c] hover:text-[#b91c1c] transition-all"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Link Action CTAs with Magnetic Pull */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                {project.githubUrl && (
                  <WebMagneticButton>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-target inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#111827] text-white hover:bg-black transition-all shadow-md shadow-gray-900/10"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>VIEW REPOSITORY</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </WebMagneticButton>
                )}

                {project.liveUrl && (
                  <WebMagneticButton>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-target inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#b91c1c] text-white hover:bg-[#a71919] transition-all shadow-md shadow-red-950/20"
                    >
                      <Globe className="w-4 h-4" />
                      <span>LIVE DEMO</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </WebMagneticButton>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Telemetry Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full aspect-[4/3] rounded-2xl bg-[#0f0f12] border-2 border-red-600/60 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl group transition-transform duration-500 hover:scale-[1.02]">
              {/* Corner Decorative Webs */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1.5 text-red-500 font-bold">
                  <Code2 className="w-4 h-4" />
                  <span>SPEC // {project.id.toUpperCase()}</span>
                </span>
                <span>PROD_ACTIVE</span>
              </div>

              <div className="my-auto text-center py-6">
                <span className="text-4xl sm:text-5xl font-display font-normal text-white uppercase tracking-tight block mb-2">
                  {project.title}
                </span>
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                  VERIFIED ARCHITECTURE
                </span>
              </div>

              <div className="text-[10px] font-mono text-gray-500 pt-3 border-t border-gray-800 flex justify-between">
                <span>SECURITY: PASSED</span>
                <span>CONTAINER: READY</span>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
};

export const Projects: React.FC = () => {
  const { projects } = usePortfolio();

  return (
    <section id="projects" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <CinematicReveal revealStyle="fade-up">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-2 flex items-center justify-center gap-1.5">
              <span>FEATURED WORK & MISSIONS</span>
              <AdminShieldTrigger className="opacity-20 hover:opacity-100 text-[#b91c1c]" iconSize={12} />
            </div>
          </CinematicReveal>

          <SplitWordReveal
            text="PROJECTS."
            as="h2"
            className="text-5xl sm:text-7xl lg:text-8xl font-normal uppercase tracking-tight text-[#111827] font-display mb-3 leading-[0.95] justify-center"
            highlightWords={['PROJECTS.']}
          />
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full mb-3" />
          <p className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-gray-500 max-w-lg">
            HIGH-IMPACT ENGINEERING, HACKATHON WINNERS & PERFORMANCE ARCHITECTURES
          </p>
        </div>

        {/* Scroll-Driven Immersive Mission Panels */}
        <div className="space-y-8 mb-16">
          {projects.map((project, idx) => (
            <FeaturedProjectPanel
              key={project.id}
              project={project}
              index={idx}
              total={projects.length}
            />
          ))}
        </div>

        {/* Standing Spider-Man Anchor */}
        <div className="flex justify-center mt-12">
          <StandingSpiderMan className="w-36 h-auto drop-shadow-lg opacity-90" />
        </div>
      </div>
    </section>
  );
};
