import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trophy, Globe } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { GithubIcon } from './Icons';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';
import { StandingSpiderMan } from './SpiderManSuspensions';
import type { Project } from '../data/portfolio';

// Individual Project Card with subtle 3D Tilt and Corner Web Capture
const ProjectCard: React.FC<{ project: Project; idx: number }> = ({ project, idx }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const touch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0);
    setIsTouch(touch);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Max 2.5 degrees tilt
    const rotateX = -((y / rect.height) - 0.5) * 5;
    const rotateY = ((x / rect.width) - 0.5) * 5;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: idx * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-web-target="project-card"
      style={{
        transform: !isTouch
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${isHovered ? 6 : 0}px)`
          : undefined,
        transition: isHovered
          ? 'transform 0.1s ease-out'
          : 'transform 0.4s ease-out, box-shadow 0.3s ease'
      }}
      className={`cursor-target spydyy-card p-6 flex flex-col justify-between group relative overflow-hidden transition-shadow ${
        isHovered ? 'shadow-xl shadow-red-950/5 border-red-200/80' : ''
      }`}
    >
      {/* Corner Web Capture Strands (Feature 11) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        {/* Top-Left Web Corner */}
        <svg
          viewBox="0 0 40 40"
          className="absolute top-0 left-0 w-8 h-8 stroke-red-600/35 fill-none"
        >
          <line x1="0" y1="0" x2="35" y2="0" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="35" strokeWidth="1" />
          <path d="M0,15 Q15,15 15,0" strokeWidth="0.8" />
          <path d="M0,28 Q28,28 28,0" strokeWidth="0.8" />
          <line x1="0" y1="0" x2="25" y2="25" strokeWidth="0.8" strokeDasharray="2 2" />
        </svg>

        {/* Top-Right Web Corner */}
        <svg
          viewBox="0 0 40 40"
          className="absolute top-0 right-0 w-8 h-8 stroke-red-600/35 fill-none transform scale-x-[-1]"
        >
          <line x1="0" y1="0" x2="35" y2="0" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="35" strokeWidth="1" />
          <path d="M0,15 Q15,15 15,0" strokeWidth="0.8" />
          <path d="M0,28 Q28,28 28,0" strokeWidth="0.8" />
          <line x1="0" y1="0" x2="25" y2="25" strokeWidth="0.8" strokeDasharray="2 2" />
        </svg>

        {/* Bottom-Right Web Corner */}
        <svg
          viewBox="0 0 40 40"
          className="absolute bottom-0 right-0 w-8 h-8 stroke-red-600/35 fill-none transform scale-x-[-1] scale-y-[-1]"
        >
          <line x1="0" y1="0" x2="35" y2="0" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="35" strokeWidth="1" />
          <path d="M0,15 Q15,15 15,0" strokeWidth="0.8" />
          <path d="M0,28 Q28,28 28,0" strokeWidth="0.8" />
          <line x1="0" y1="0" x2="25" y2="25" strokeWidth="0.8" strokeDasharray="2 2" />
        </svg>
      </div>

      <div>
        {project.featured && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#b91c1c] text-[10px] font-mono font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            ARJUNA 2.0 WINNER (NIT AGARTALA)
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-extrabold text-[#111827] font-sans group-hover:text-[#b91c1c] transition-colors">
            {project.title}
          </h3>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#b91c1c] transition-colors"
              aria-label={`${project.title} GitHub Repository`}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>

        <p className="text-xs font-mono font-semibold text-gray-500 mb-4">
          {project.subtitle}
        </p>

        <p className="text-sm text-gray-600 font-sans leading-relaxed mb-6 font-medium">
          {project.description}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-gray-100 text-gray-700 border border-gray-200"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} GitHub Repository`}
              className="text-xs font-extrabold text-[#111827] hover:text-[#b91c1c] flex items-center gap-1.5 transition-colors"
            >
              <GithubIcon className="w-4 h-4" /> CODE REPO
            </a>
          ) : (
            <span className="text-xs font-mono text-gray-400">REPO PLACEHOLDER</span>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} Live Demo`}
              className="text-xs font-extrabold text-[#b91c1c] hover:text-[#991b1b] flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" /> LIVE DEMO
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const Projects: React.FC = () => {
  const { projects } = usePortfolio();

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      {/* Decorative Character Entrance from Left Edge (Feature 6) */}
      <div className="hidden 2xl:block absolute -left-12 top-48 z-0 pointer-events-none opacity-40">
        <StandingSpiderMan entranceSide="left" className="w-44" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2 flex items-center justify-center gap-1.5">
            <span>PROVEN ENGINEERING WORK</span>
            <AdminShieldTrigger className="opacity-20 hover:opacity-100 text-[#b91c1c]" iconSize={12} />
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-3">
            PROJECTS<span className="text-[#b91c1c]">.</span>
          </h2>
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full" />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};
