import React from 'react';
import { motion } from 'framer-motion';
import { Download, Compass } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { usePortfolio } from '../context/PortfolioContext';
import { CornerWebTopLeft, CornerWebBottomRight } from './SpiderManSuspensions';
import { SpiderMaskReveal } from './SpiderMaskReveal';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  const { personal } = portfolioData;
  const { resumeUrl, resumeSettings } = usePortfolio();
  const effectiveResumePath = resumeUrl || personal.contact.resumePath;
  const isExternalUrl =
    effectiveResumePath.startsWith('http://') || effectiveResumePath.startsWith('https://');

  const handleResumeClick = () => {
    if (!isExternalUrl && !effectiveResumePath.startsWith('data:')) {
      fetch(effectiveResumePath, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) {
            console.log('Resume ready at ' + effectiveResumePath);
          }
        })
        .catch(() => {
          console.log('Resume configured at ' + effectiveResumePath);
        });
    }
  };

  return (
    <section
      id="hero"
      className="relative w-screen h-screen min-h-screen flex items-center justify-center pt-16 bg-[#fcfcfc] overflow-hidden"
    >
      {/* Full Page 100vw x 100vh Spider-Man Suit Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <SpiderMaskReveal
          spidermanImage="/assets/spider/hero.png"
          className="w-full h-full"
        />
      </div>

      {/* Corner Spider Web Graphic SVGs */}
      <CornerWebTopLeft className="w-80 sm:w-[500px]" />
      <CornerWebBottomRight className="w-80 sm:w-[500px]" />

      {/* Foreground Hero Text Content & Action Buttons */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20 pointer-events-none">
        <div className="lg:col-span-7 flex flex-col items-start text-left pointer-events-auto">
          {/* Eyebrow Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-3 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] animate-pulse" />
            <span>YOUR FRIENDLY NEIGHBORHOOD ENGINEER</span>
            <AdminShieldTrigger className="opacity-25 hover:opacity-100 text-[#b91c1c] ml-0.5" iconSize={12} />
          </motion.div>

          {/* Heading with Comic 3D Text Shadow */}
          <motion.h1
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-8 leading-[0.95]"
          >
            AKASH<br />KUMAR<span className="text-[#b91c1c]">.</span>
          </motion.h1>

          {/* Action Capsule Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
          >
            {/* Solid Red Primary Capsule Button */}
            <button
              onClick={onExploreClick}
              className="px-8 py-4 rounded-full text-xs font-black uppercase tracking-wider text-white bg-[#b91c1c] hover:bg-[#a71919] shadow-lg shadow-red-900/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2.5"
            >
              <Compass className="w-4 h-4" />
              EXPLORE PROJECTS
            </button>

            {/* Solid Dark Secondary Capsule Button */}
            <a
              href={effectiveResumePath}
              target={isExternalUrl ? '_blank' : undefined}
              rel={isExternalUrl ? 'noopener noreferrer' : undefined}
              download={isExternalUrl ? undefined : (resumeSettings?.fileName || 'Akash_Kumar_Resume.pdf')}
              onClick={handleResumeClick}
              className="px-8 py-4 rounded-full text-xs font-black uppercase tracking-wider text-white bg-[#111827] hover:bg-[#1f2937] shadow-lg shadow-gray-900/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2.5"
            >
              <Download className="w-4 h-4 text-red-500" />
              SDE_RESUME.PDF
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
