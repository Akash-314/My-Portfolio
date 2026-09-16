import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'ABOUT', href: '#about' },
    { name: 'SKILLS', href: '#skills' },
    { name: 'PROJECTS', href: '#projects' },
    { name: 'ACHIEVEMENTS', href: '#achievements' },
    { name: 'CODING', href: '#coding' },
    { name: 'CONTACT', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0f0f12] border-b border-gray-800/80 shadow-md'
          : 'bg-transparent border-b border-transparent backdrop-blur-[2px]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo: SP4RK. */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center gap-1 group focus:outline-none"
          aria-label="Akash Kumar Portfolio Home"
        >
          <span
            className={`font-extrabold italic text-2xl sm:text-3xl tracking-tighter font-sans transition-colors ${
              scrolled ? 'text-white' : 'text-[#111827]'
            }`}
          >
            SP<span className="text-[#b91c1c]">4</span>RK<span className="text-[#b91c1c]">.</span>
          </span>
        </a>

        {/* Desktop Links with Feature 10: Navigation Web Trail */}
        <nav className="hidden md:flex items-center gap-8 relative py-2">
          {/* Subtle thin connecting web trail strand */}
          <div
            className={`absolute bottom-0 left-2 right-2 h-[1px] pointer-events-none transition-colors duration-300 ${
              scrolled ? 'bg-red-500/20' : 'bg-red-500/25'
            }`}
          />

          {navLinks.map((link) => {
            const sectionId = link.href.substring(1);
            const isActive = activeSection === sectionId;

            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                data-web-target="nav-item"
                className={`relative py-1 text-xs font-black tracking-widest transition-colors font-sans uppercase ${
                  isActive
                    ? 'text-[#b91c1c]'
                    : scrolled
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-800 hover:text-[#b91c1c]'
                }`}
              >
                {link.name}

                {/* Gliding active node on web trail */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-web-node"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                    <span className="absolute w-4 h-[1px] bg-[#b91c1c]/60 -z-10" />
                  </motion.div>
                )}
              </a>
            );
          })}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-lg focus:outline-none transition-colors ${
            scrolled ? 'text-gray-300 hover:text-white' : 'text-[#111827]'
          }`}
          aria-label="Toggle Menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-red-500" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0f0f12] border-b border-gray-800 px-6 py-4"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const sectionId = link.href.substring(1);
                const isActive = activeSection === sectionId;

                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`py-2 text-sm font-black tracking-widest ${
                      isActive ? 'text-[#b91c1c]' : 'text-gray-300'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
