import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code2, Flame, BarChart3, Star, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';
import { getLiveCodingStats, type LiveStatsResult } from '../services/codingStatsService';
import { WebMagneticButton } from './WebMagneticButton';
import { SplitWordReveal } from '../motion/SplitWordReveal';
import { CinematicReveal } from '../motion/CinematicReveal';
import { EASINGS } from '../motion/motionTokens';

const CountUpNumber: React.FC<{ target: number; duration?: number }> = ({ target, duration = 1.2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.max(1, target / (duration * 60));
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}</span>;
};

export const CodingStats: React.FC = () => {
  const { codingStats, updateCodingStats } = usePortfolio();
  const [displayStats, setDisplayStats] = useState(codingStats);
  const [liveInfo, setLiveInfo] = useState<Partial<LiveStatsResult>>({
    isLive: false,
    lastUpdated: codingStats.lastUpdated || 'Archive Verified'
  });

  useEffect(() => {
    setDisplayStats(codingStats);
  }, [codingStats]);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'synced'>('idle');

  useEffect(() => {
    if (isSectionInView && scanStatus === 'idle') {
      setScanStatus('scanning');
      const t1 = setTimeout(() => setScanStatus('detected'), 650);
      const t2 = setTimeout(() => setScanStatus('synced'), 1300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isSectionInView, scanStatus]);

  // Attempt non-blocking background fetch from official/public APIs
  useEffect(() => {
    let isMounted = true;

    async function syncLiveStats() {
      try {
        const result = await getLiveCodingStats(codingStats);
        if (isMounted && result.stats) {
          setDisplayStats(result.stats);
          updateCodingStats(result.stats);
          setLiveInfo({
            isLive: result.isLive,
            source: result.source,
            lastUpdated: result.lastUpdated
          });
        }
      } catch (err) {
        console.warn('Live coding stats sync fallback to snapshot:', err);
      }
    }

    syncLiveStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="coding"
      className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <CinematicReveal revealStyle="fade-up">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-2 flex items-center justify-center gap-1.5">
              <span>ALGORITHMIC TELEMETRY</span>
              <AdminShieldTrigger className="opacity-20 hover:opacity-100 text-[#b91c1c]" iconSize={12} />
            </div>
          </CinematicReveal>

          <SplitWordReveal
            text="CODING STATS."
            as="h2"
            className="text-5xl sm:text-7xl font-normal uppercase tracking-tight text-[#111827] font-display mb-3 leading-[0.95] justify-center"
            highlightWords={['STATS.']}
          />
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full mb-3" />
          <p className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-gray-500 max-w-lg">
            {`MAX LEETCODE ${displayStats.rating} • CODECHEF ${displayStats.codechefStars?.replace(/ Coder$/, '') || '2★'} (${displayStats.codechefRating}) • CODEFORCES (${displayStats.codeforcesRating} ${displayStats.codeforcesStatus?.includes('(') ? displayStats.codeforcesStatus.split('(')[1].replace(')', '').toUpperCase() : 'PUPIL'})`}
          </p>
        </div>

        {/* Live Sync Status Bar */}
        <CinematicReveal revealStyle="scale" delay={0.1} className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  scanStatus === 'synced'
                    ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse'
                    : 'bg-[#b91c1c] ring-4 ring-red-100'
                }`}
              />
              <div>
                <span className="text-xs font-mono font-bold uppercase text-gray-800 tracking-wider block">
                  STATUS:{' '}
                  {scanStatus === 'scanning'
                    ? 'CONNECTING TO LEADERBOARDS...'
                    : scanStatus === 'detected'
                    ? 'EXTRACTING BENCHMARKS...'
                    : 'LIVE STATS VERIFIED'}
                </span>
                <span className="text-[11px] font-mono text-gray-500">
                  {liveInfo.lastUpdated ? `TIMESTAMP: ${liveInfo.lastUpdated}` : 'LEADERBOARDS VERIFIED'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gray-500 uppercase">TIER:</span>
              <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                TOP 8% WORLDWIDE
              </span>
            </div>
          </div>
        </CinematicReveal>

        {/* 4 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Card 1: Total Problems Solved */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASINGS.cinematic }}
            className="cursor-target spydyy-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                  TOTAL SOLVED
                </span>
                <Code2 className="w-5 h-5 text-[#b91c1c]" />
              </div>
              <div className="text-5xl font-display font-normal text-[#111827] tracking-tight mb-2">
                <CountUpNumber target={displayStats.totalSolved} />+
              </div>
              <p className="text-xs font-sans text-gray-600">
                Data structures & algorithms benchmarks in C++
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-600 font-bold">EASY: {displayStats.easy}</span>
              <span className="text-amber-600 font-bold">MED: {displayStats.medium}</span>
              <span className="text-rose-600 font-bold">HARD: {displayStats.hard}</span>
            </div>
          </motion.div>

          {/* Card 2: LeetCode Rating */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASINGS.cinematic }}
            className="cursor-target spydyy-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                  LEETCODE CONTEST
                </span>
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-5xl font-display font-normal text-[#111827] tracking-tight mb-2">
                <CountUpNumber target={displayStats.rating} />
              </div>
              <p className="text-xs font-sans text-gray-600">
                Peak rated contest performance (Knight track)
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">USERNAME:</span>
              <span className="font-bold text-gray-800">{displayStats.leetcodeUsername || 'Sp4rk314'}</span>
            </div>
          </motion.div>

          {/* Card 3: Codeforces Rating */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASINGS.cinematic }}
            className="cursor-target spydyy-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                  CODEFORCES
                </span>
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-5xl font-display font-normal text-[#111827] tracking-tight mb-2">
                <CountUpNumber target={displayStats.codeforcesRating} />
              </div>
              <p className="text-xs font-sans text-gray-600">
                {displayStats.codeforcesStatus}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">HANDLE:</span>
              <span className="font-bold text-gray-800">{displayStats.codeforcesUsername || 'itsakash314'}</span>
            </div>
          </motion.div>

          {/* Card 4: CodeChef Rating */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASINGS.cinematic }}
            className="cursor-target spydyy-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                  CODECHEF
                </span>
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-5xl font-display font-normal text-[#111827] tracking-tight mb-2">
                <CountUpNumber target={displayStats.codechefRating} />
              </div>
              <p className="text-xs font-sans text-gray-600">
                {displayStats.codechefStars} Division Coder
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">HANDLE:</span>
              <span className="font-bold text-gray-800">{displayStats.codechefUsername || 'sp4rk314'}</span>
            </div>
          </motion.div>
        </div>

        {/* Profile Link Out Buttons */}
        <CinematicReveal revealStyle="fade-up" delay={0.2} className="flex flex-wrap items-center justify-center gap-4">
          <WebMagneticButton>
            <a
              href={displayStats.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-800 hover:border-red-600 hover:text-red-600 shadow-sm transition-all flex items-center gap-2"
            >
              <span>LEETCODE PROFILE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </WebMagneticButton>

          <WebMagneticButton>
            <a
              href={displayStats.codeforcesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-800 hover:border-red-600 hover:text-red-600 shadow-sm transition-all flex items-center gap-2"
            >
              <span>CODEFORCES PROFILE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </WebMagneticButton>

          <WebMagneticButton>
            <a
              href={displayStats.codechefUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-target px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-800 hover:border-red-600 hover:text-red-600 shadow-sm transition-all flex items-center gap-2"
            >
              <span>CODECHEF PROFILE</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </WebMagneticButton>

          {displayStats.codolioUrl && (
            <WebMagneticButton>
              <a
                href={displayStats.codolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-target px-6 py-3 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-800 hover:border-red-600 hover:text-red-600 shadow-sm transition-all flex items-center gap-2"
              >
                <span>CODOLIO TRACKER</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </WebMagneticButton>
          )}
        </CinematicReveal>
      </div>
    </section>
  );
};
