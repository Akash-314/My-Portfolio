import React from 'react';
import { ArrowUp, Mail } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { GithubIcon, LinkedinIcon } from './Icons';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { personal } = portfolioData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-[#0f0f12] text-white border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src="/assets/favicon.ico"
            alt="Spider Logo"
            className="w-8 h-8 object-contain rounded-full drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
          />
          <h3 className="font-normal font-display text-4xl tracking-tight text-white uppercase">
            AKASH<span className="text-[#b91c1c]">.</span>
          </h3>
        </div>

        <p className="font-display text-sm tracking-[0.25em] uppercase text-[#b91c1c] font-normal mb-6">
          BUILD. SOLVE. LEARN. REPEAT.
        </p>

        {/* Social Links Bar */}
        <div className="flex items-center gap-3 mb-8">
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
            aria-label="Send Email"
          >
            <Mail className="w-4 h-4" />
          </a>

          <button
            onClick={scrollToTop}
            className="p-3 rounded-full bg-white/10 text-gray-200 hover:text-white hover:bg-[#b91c1c] transition-colors ml-2"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full max-w-xs h-px bg-gray-800 mb-4" />

        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <span>© 2026 Akash Kumar. Built with curiosity and code.</span>
          <AdminShieldTrigger onClick={onOpenAdmin} className="text-gray-600 hover:text-red-500 opacity-40 hover:opacity-100" iconSize={14} />
        </div>
      </div>
    </footer>
  );
};
