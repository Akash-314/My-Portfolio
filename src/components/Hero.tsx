import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Compass } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { usePortfolio } from '../context/PortfolioContext';
import { CornerWebTopLeft, CornerWebBottomRight } from './SpiderManSuspensions';
import { SpiderMaskReveal } from './SpiderMaskReveal';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';
import { WebMagneticButton } from './WebMagneticButton';
import { ElasticLettering } from './ElasticLettering';
import { SPIDER_EFFECTS_CONFIG } from '../config/spiderEffectsConfig';
import { globalScrollPhysics, type ScrollPhysicsState } from '../utils/scrollPhysics';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  const { personal } = portfolioData;
  const { resumeUrl, resumeSettings } = usePortfolio();
  const effectiveResumePath = resumeUrl || personal.contact.resumePath;
  const isExternalUrl =
    effectiveResumePath.startsWith('http://') || effectiveResumePath.startsWith('https://');

  const heroRef = useRef<HTMLElement | null>(null);
  const heroSuitWrapperRef = useRef<HTMLDivElement | null>(null);
  const cornerWebsWrapperRef = useRef<HTMLDivElement | null>(null);

  // Subtle Hero Parallax (Section 10: 5–20px total, 0° rotation strictly grounded)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !heroRef.current) return;

    let unsubscribeScroll: (() => void) | null = null;

    const onScrollPhysics = (state: ScrollPhysicsState) => {
      const scrollY = state.scrollY;
      if (scrollY <= window.innerHeight * 1.3) {
        const heroY = Math.min(SPIDER_EFFECTS_CONFIG.HERO_PARALLAX_MAX, scrollY * 0.035);
        const webY = Math.min(10, scrollY * 0.02);
        if (heroSuitWrapperRef.current) {
          heroSuitWrapperRef.current.style.transform = `translate3d(0, ${heroY.toFixed(1)}px, 0)`;
        }
        if (cornerWebsWrapperRef.current) {
          cornerWebsWrapperRef.current.style.transform = `translate3d(0, ${webY.toFixed(1)}px, 0)`;
        }
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!unsubscribeScroll) {
            unsubscribeScroll = globalScrollPhysics.subscribe(onScrollPhysics);
          }
        } else {
          if (unsubscribeScroll) {
            unsubscribeScroll();
            unsubscribeScroll = null;
          }
        }
      },
      { rootMargin: '100px 0px' }
    );

    observer.observe(heroRef.current);

    return () => {
      observer.disconnect();
      if (unsubscribeScroll) {
        unsubscribeScroll();
      }
    };
  }, []);

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
      ref={heroRef}
      id="hero"
      className="relative w-screen h-screen min-h-screen flex items-center justify-center pt-16 bg-[#fcfcfc] overflow-hidden"
    >
      {/* Full Page 100vw x 100vh Spider-Man Suit Background with subtle parallax */}
      <div
        ref={heroSuitWrapperRef}
        className="absolute inset-0 w-full h-full z-0 will-change-transform"
        style={{ transition: 'transform 0.05s linear' }}
      >
        <SpiderMaskReveal
          spidermanImage="/assets/spider/hero.png"
          className="w-full h-full"
        />
      </div>

      {/* Corner Spider Web Graphic SVGs with subtle parallax */}
      <div
        ref={cornerWebsWrapperRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 will-change-transform"
        style={{ transition: 'transform 0.05s linear' }}
      >
        <CornerWebTopLeft className="w-80 sm:w-[500px]" />
        <CornerWebBottomRight className="w-80 sm:w-[500px]" />
      </div>

      {/* Foreground Hero Text Content & Action Buttons */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20 pointer-events-none">
        <div className="lg:col-span-7 flex flex-col items-start text-left pointer-events-auto">
          {/* Eyebrow Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-3 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] animate-pulse" />
            <span>YOUR FRIENDLY NEIGHBORHOOD ENGINEER</span>
            <AdminShieldTrigger className="opacity-25 hover:opacity-100 text-[#b91c1c] ml-0.5" iconSize={12} />
          </motion.div>

          {/* Strong Superhero Display Heading with Elastic Lettering */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <ElasticLettering
              as="h1"
              text={"AKASH\nKUMAR."}
              align="left"
              tensionColor="#b91c1c"
              dotColor="#b91c1c"
              tensionTint={0.85}
              tension={0.65}
              stiffness={1.1}
              bounce={0.65}
              reach={3.8}
              squash={0.45}
              tilt={0.5}
              lift={0.4}
              throwable={true}
              pluckOnClick={true}
              pluckStrength={1.2}
              hint={true}
              className="text-6xl sm:text-8xl lg:text-9xl font-normal uppercase tracking-tight text-[#111827] font-display leading-[0.88]"
            />
          </motion.div>

          {/* Action Capsule Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
          >
            {/* Solid Red Primary Capsule Button */}
            <WebMagneticButton>
              <button
                onClick={onExploreClick}
                data-web-target="cta-button"
                className="cursor-target px-8 py-3.5 rounded-full text-base sm:text-lg font-normal font-display uppercase tracking-wider text-white bg-[#b91c1c] hover:bg-[#a71919] shadow-lg shadow-red-900/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                EXPLORE PROJECTS
              </button>
            </WebMagneticButton>

            {/* Solid Dark Secondary Capsule Button */}
            <WebMagneticButton>
              <a
                href={effectiveResumePath}
                target={isExternalUrl ? '_blank' : undefined}
                rel={isExternalUrl ? 'noopener noreferrer' : undefined}
                download={isExternalUrl ? undefined : (resumeSettings?.fileName || 'Akash_Kumar_Resume.pdf')}
                onClick={handleResumeClick}
                data-web-target="cta-button"
                className="cursor-target px-8 py-3.5 rounded-full text-base sm:text-lg font-normal font-display uppercase tracking-wider text-white bg-[#111827] hover:bg-[#1f2937] shadow-lg shadow-gray-900/20 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-red-500" />
                SDE_RESUME.PDF
              </a>
            </WebMagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
