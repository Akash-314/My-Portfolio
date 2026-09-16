import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trophy, Globe } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { GithubIcon } from './Icons';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';

export const Projects: React.FC = () => {
  const { projects } = usePortfolio();

  return (
    <section id="projects" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
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
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="spydyy-card p-6 flex flex-col justify-between group"
            >
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
                      aria-label="GitHub Repository"
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
          ))}
        </div>
      </div>
    </section>
  );
};
