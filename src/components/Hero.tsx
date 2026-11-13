import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Download, Compass } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { usePortfolio } from '../context/PortfolioContext';
import { CornerWebTopLeft, CornerWebBottomRight } from './SpiderManSuspensions';
import { SpiderMaskReveal } from './SpiderMaskReveal';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';
import { WebMagneticButton } from './WebMagneticButton';
import { ElasticLettering } from './ElasticLettering';
import { EASINGS } from '../motion/motionTokens';

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
  const shouldReduceMotion = useReducedMotion();

  // Scroll-linked depth parallax for Hero layers
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Layer 1: Distant background Spider Suit: subtle move down + gentle scale
  const bgY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, shouldReduceMotion ? 1 : 1.05]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.9, 0.4]);

  // Layer 2: Decorative Corner Webs move at a different rate
  const webY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 40]);

  // Layer 3: Foreground Headline & Content gently drifts up and fades cleanly
  const contentY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -50]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.85, 0]);

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
      {/* 1. Cinematic Starting Signal Node */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] shadow-[0_0_14px_#b91c1c]" />
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 40 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASINGS.cinematic }}
          className="w-[1.5px] bg-gradient-to-b from-[#b91c1c] to-transparent"
        />
      </motion.div>

      {/* Layer 1: Spider-Man Suit Background with Scroll-Linked Depth Parallax */}
      <motion.div
        style={{ y: bgY, scale: bgScale, opacity: bgOpacity }}
        className="absolute inset-0 w-full h-full z-0 will-change-transform"
      >
        <SpiderMaskReveal
          spidermanImage="/assets/spider/hero.png"
          className="w-full h-full"
        />
      </motion.div>

      {/* Layer 2: Corner Spider Web Graphic SVGs with Distinct Parallax Layering */}
      <motion.div
        style={{ y: webY }}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 will-change-transform"
      >
        <CornerWebTopLeft className="w-80 sm:w-[500px]" />
        <CornerWebBottomRight className="w-80 sm:w-[500px]" />
      </motion.div>

      {/* Layer 3: Foreground Content with Counter-Motion & Smooth Viewport Exit */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20 pointer-events-none will-change-transform"
      >
        <div className="lg:col-span-7 flex flex-col items-start text-left pointer-events-auto">
          {/* Eyebrow Tagline with staged entrance */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: EASINGS.cinematic }}
            className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-3 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c] animate-pulse" />
            <span>YOUR FRIENDLY NEIGHBORHOOD ENGINEER</span>
            <AdminShieldTrigger className="opacity-25 hover:opacity-100 text-[#b91c1c] ml-0.5" iconSize={12} />
          </motion.div>

          {/* Superhero Display Heading with Elastic Lettering */}
          <motion.div
            initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.35, ease: EASINGS.cinematic }}
            className="mb-6"
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

          {/* Supporting Headline text */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASINGS.cinematic }}
            className="text-xs sm:text-sm font-mono uppercase tracking-[0.18em] text-gray-600 mb-8 max-w-lg"
          >
            {personal.role}
          </motion.p>

          {/* Action Capsule Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: EASINGS.cinematic }}
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
      </motion.div>
    </section>
  );
};
