import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Terminal, ExternalLink, Code2, Flame, BarChart3, Award, Star } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { GithubIcon } from './Icons';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';
import { getLiveCodingStats, type LiveStatsResult } from '../services/codingStatsService';

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
  const { codingStats } = usePortfolio();
  const [displayStats, setDisplayStats] = useState(codingStats);
  const [liveInfo, setLiveInfo] = useState<Partial<LiveStatsResult>>({
    isLive: false,
    lastUpdated: codingStats.lastUpdated || 'Archive Verified'
  });

  // Attempt non-blocking background fetch from official/public APIs
  useEffect(() => {
    let isMounted = true;
    getLiveCodingStats(codingStats).then((res) => {
      if (isMounted) {
        setDisplayStats(res.stats);
        setLiveInfo(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [codingStats]);

  const total = (displayStats.easy || 0) + (displayStats.medium || 0) + (displayStats.hard || 0) || 1;
  const easyPct = (((displayStats.easy || 0) / total) * 100).toFixed(1);
  const medPct = (((displayStats.medium || 0) / total) * 100).toFixed(1);
  const hardPct = (((displayStats.hard || 0) / total) * 100).toFixed(1);

  return (
    <section id="coding" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#b91c1c]" /> COMPETITIVE PROGRAMMING METRICS
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-3">
            THE GRIND<span className="text-[#b91c1c]">.</span>
          </h2>
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full" />
        </div>

        {/* Dashboard Box */}
        <div className="spydyy-card p-6 sm:p-10 border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-8 border-b border-gray-200 font-mono text-xs text-gray-600">
            <div className="flex items-center gap-2 text-[#b91c1c] font-bold">
              <Terminal className="w-4 h-4" /> CODE_METRICS_HUD // C++ CORE
            </div>
            <div className="flex items-center gap-4">
              {liveInfo.isLive ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {liveInfo.lastUpdated}
                </span>
              ) : (
                <span className="text-gray-500 font-semibold">{liveInfo.lastUpdated}</span>
              )}
              <span className="text-blue-600 font-bold">STATUS: ACTIVE COMPETITOR</span>
              <span>PRIMARY: C++</span>
              <AdminShieldTrigger className="opacity-25 hover:opacity-100 text-gray-400" iconSize={12} />
            </div>
          </div>

          {/* 4 Clickable Core Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* LeetCode Solved Card */}
            <motion.a
              href={displayStats.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center group hover:border-[#b91c1c] hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wider">
                  LEETCODE SOLVED
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#b91c1c] transition-colors" />
              </div>
              <div className="text-4xl font-extrabold text-[#b91c1c] font-mono my-1">
                <CountUpNumber target={displayStats.totalSolved} />
              </div>
              <span className="text-[10px] font-mono text-gray-500 font-bold flex items-center gap-1 group-hover:text-[#b91c1c] transition-colors">
                {displayStats.totalSolved} PROBLEMS SOLVED • VIEW PROFILE →
              </span>
            </motion.a>

            {/* Max LeetCode Rating Card */}
            <motion.a
              href={displayStats.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center group hover:border-amber-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wider">
                  MAX LEETCODE
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <div className="text-4xl font-extrabold text-amber-500 font-mono flex items-center justify-center gap-1 my-1">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                <CountUpNumber target={displayStats.rating} />
              </div>
              <span className="text-[10px] font-mono text-amber-600 font-bold group-hover:underline transition-colors">
                TOP 7% GLOBAL CONTEST →
              </span>
            </motion.a>

            {/* Codeforces Max Rating Card */}
            <motion.a
              href={displayStats.codeforcesUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center group hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wider">
                  MAX CODEFORCES
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="text-4xl font-extrabold text-blue-600 font-mono my-1">
                <CountUpNumber target={displayStats.codeforcesRating} />
              </div>
              <span className="text-[10px] font-mono text-blue-600 font-bold group-hover:underline transition-colors">
                {displayStats.codeforcesStatus || '1109 MAX RATING'} →
              </span>
            </motion.a>

            {/* CodeChef Rating Card */}
            <motion.a
              href={displayStats.codechefUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center group hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wider">
                  CODECHEF RATING
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="text-4xl font-extrabold text-emerald-600 font-mono my-1">
                <CountUpNumber target={displayStats.codechefRating} />
              </div>
              <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase flex items-center gap-1 group-hover:underline transition-colors">
                <Award className="w-3 h-3 text-emerald-600" /> {displayStats.codechefStars} →
              </span>
            </motion.a>
          </div>

          {/* Difficulty Breakdown Visual Chart */}
          <div className="mb-8 p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-gray-800 font-bold uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#b91c1c]" /> LEETCODE DIFFICULTY BREAKDOWN
              </span>
              <span className="text-xs font-mono text-gray-600 font-bold">
                TOTAL: {total} SOLVED
              </span>
            </div>

            <div className="h-3.5 w-full bg-gray-200 rounded-full overflow-hidden flex mb-6 border border-gray-300">
              <div
                style={{ width: `${easyPct}%` }}
                className="h-full bg-emerald-500"
                title={`Easy: ${displayStats.easy}`}
              />
              <div
                style={{ width: `${medPct}%` }}
                className="h-full bg-amber-500"
                title={`Medium: ${displayStats.medium}`}
              />
              <div
                style={{ width: `${hardPct}%` }}
                className="h-full bg-red-600"
                title={`Hard: ${displayStats.hard}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-700 font-bold uppercase block">EASY</span>
                  <span className="text-xl font-bold font-mono text-emerald-900">
                    <CountUpNumber target={displayStats.easy} />
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700">{easyPct}%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-amber-700 font-bold uppercase block">MEDIUM</span>
                  <span className="text-xl font-bold font-mono text-amber-900">
                    <CountUpNumber target={displayStats.medium} />
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700">{medPct}%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-red-700 font-bold uppercase block">HARD</span>
                  <span className="text-xl font-bold font-mono text-red-900">
                    <CountUpNumber target={displayStats.hard} />
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-red-700">{hardPct}%</span>
              </div>
            </div>
          </div>

          {/* Profile Links & Codolio Central Hub */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Codolio Central Profile Button */}
            {displayStats.codolioUrl && (
              <a
                href={displayStats.codolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-700 to-red-800 hover:brightness-110 flex items-center gap-2 transition-all shadow-md transform hover:scale-[1.02]"
              >
                <span>VIEW COMPLETE CODING PROFILE (CODOLIO)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <a
              href={displayStats.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white bg-[#111827] hover:bg-black flex items-center gap-2 transition-colors shadow-sm"
            >
              <GithubIcon className="w-4 h-4" /> GITHUB REPO
            </a>

            <a
              href={displayStats.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-[#111827] bg-white border border-gray-300 hover:border-[#b91c1c] flex items-center gap-2 transition-colors shadow-sm"
            >
              <Code2 className="w-4 h-4 text-amber-600" /> LEETCODE <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={displayStats.codeforcesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-[#111827] bg-white border border-gray-300 hover:border-blue-600 flex items-center gap-2 transition-colors shadow-sm"
            >
              <Terminal className="w-4 h-4 text-blue-600" /> CODEFORCES <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={displayStats.codechefUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-[#111827] bg-white border border-gray-300 hover:border-emerald-600 flex items-center gap-2 transition-colors shadow-sm"
            >
              <Award className="w-4 h-4 text-emerald-600" /> CODECHEF <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
