import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Smart sticky navbar behavior:
      // Hide on scroll down after 150px, show on scroll up
      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollYRef.current && currentScrollY - lastScrollYRef.current > 6) {
          setVisible(false);
        } else if (lastScrollYRef.current - currentScrollY > 6) {
          setVisible(true);
        }
      } else {
        setVisible(true);
      }

      setScrolled(currentScrollY > 30);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'ABOUT', href: '#about', id: 'about' },
    { name: 'SKILLS', href: '#skills', id: 'skills' },
    { name: 'PROJECTS', href: '#projects', id: 'projects' },
    { name: 'ACHIEVEMENTS', href: '#achievements', id: 'achievements' },
    { name: 'CODING', href: '#coding', id: 'coding' },
    { name: 'JOURNEY', href: '#journey', id: 'journey' },
    { name: 'CONTACT', href: '#contact', id: 'contact' },
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
        visible ? 'translate-y-0' : '-translate-y-full'
      } ${
        scrolled
          ? 'bg-[#0f0f12]/95 backdrop-blur-md border-b border-gray-800/80 shadow-[0_4px_24px_rgba(0,0,0,0.4)] py-3'
          : 'bg-[#0f0f12]/40 backdrop-blur-[4px] border-b border-white/5 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name: SP4RK. */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="cursor-target flex items-center gap-2.5 group focus:outline-none"
          aria-label="Akash Kumar Portfolio Home"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <img
              src="/assets/favicon.ico"
              alt="SP4RK Logo"
              className="w-7 h-7 object-contain rounded-full transition-transform group-hover:scale-110 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]"
            />
          </div>
          <span className="font-display text-2xl sm:text-3xl tracking-tight text-white uppercase transition-colors">
            SP<span className="text-[#b91c1c]">4</span>RK<span className="text-[#b91c1c]">.</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`cursor-target relative px-3 py-1.5 text-xs font-bold tracking-[0.14em] font-sans uppercase transition-colors ${
                  isActive
                    ? 'text-[#b91c1c]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#b91c1c] rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="cursor-target p-2 rounded-lg text-gray-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (Dark Themed) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#0f0f12] border-b border-gray-800 px-4 pt-2 pb-6 space-y-1 shadow-2xl overflow-hidden"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`block px-3 py-2 rounded-md text-sm font-bold tracking-wider font-sans uppercase transition-colors ${
                    isActive
                      ? 'text-[#b91c1c] bg-red-950/30 border-l-2 border-[#b91c1c]'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
