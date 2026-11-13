import React from 'react';
import { ArrowUp, Mail } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { GithubIcon, LinkedinIcon } from './Icons';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';
import { CinematicReveal } from '../motion/CinematicReveal';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { personal } = portfolioData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-[#0f0f12] text-white border-t border-gray-800 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <CinematicReveal revealStyle="fade-up">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-2 justify-center">
            <img
              src="/assets/favicon.ico"
              alt="Spider Logo"
              className="w-8 h-8 object-contain rounded-full drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
            />
            <h3 className="font-normal font-display text-4xl tracking-tight text-white uppercase">
              AKASH<span className="text-[#b91c1c]">.</span>
            </h3>
          </div>
        </CinematicReveal>

        <CinematicReveal revealStyle="fade-up" delay={0.1}>
          <p className="font-display text-sm tracking-[0.25em] uppercase text-[#b91c1c] font-normal mb-8">
            BUILD. SOLVE. LEARN. REPEAT.
          </p>
        </CinematicReveal>

        {/* Social Links Bar */}
        <CinematicReveal revealStyle="fade-up" delay={0.2} className="flex items-center gap-3 mb-8">
          <a
            href={personal.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-white/10 text-gray-200 hover:text-white hover:bg-[#b91c1c] transition-colors"
            aria-label="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <a
            href={personal.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full bg-white/10 text-gray-200 hover:text-white hover:bg-[#b91c1c] transition-colors"
            aria-label="LinkedIn Profile"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>

          <a
            href={`mailto:${personal.contact.email}`}
            className="p-3 rounded-full bg-white/10 text-gray-200 hover:text-white hover:bg-[#b91c1c] transition-colors"
            aria-label="Email Me"
          >
            <Mail className="w-4 h-4" />
          </a>
        </CinematicReveal>

        {/* Copyright and Stealth Admin Shield Trigger */}
        <CinematicReveal revealStyle="fade-up" delay={0.3}>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-6">
            <span>© {new Date().getFullYear()} AKASH KUMAR. ALL RIGHTS RESERVED.</span>
            <AdminShieldTrigger onClick={onOpenAdmin} className="opacity-20 hover:opacity-100 text-gray-400" />
          </div>
        </CinematicReveal>

        {/* Back to Top Capsule Button */}
        <CinematicReveal revealStyle="scale" delay={0.35}>
          <button
            onClick={scrollToTop}
            className="cursor-target inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-gray-800 text-xs font-mono font-bold tracking-wider text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase"
          >
            <ArrowUp className="w-3.5 h-3.5 text-red-500" />
            <span>RETURN TO SUMMIT</span>
          </button>
        </CinematicReveal>
      </div>
    </footer>
  );
};
