import React from 'react';

export const MarqueeRibbons: React.FC = () => {
  const items = [
    'UI/UX DESIGN',
    'GSAP ANIMATIONS',
    'REACT NATIVE',
    'FULL STACK ENGINEER',
    'C++ & DSA SPECIALIST',
    'LEETCODE 500+ SOLVED',
    'ARJUNA 2.0 WINNER'
  ];

  return (
    <div className="relative py-12 overflow-hidden select-none z-20 my-6">
      {/* Top Banner (Crimson Red, Tilted -2.5 deg) */}
      <div className="relative transform -rotate-2 bg-[#b91c1c] text-white py-3.5 shadow-xl border-y border-red-900 overflow-hidden z-10">
        <div className="animate-marquee whitespace-nowrap flex items-center font-extrabold italic tracking-wider text-sm sm:text-base font-sans uppercase">
          {items.concat(items).map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 px-4">
              <span>{item}</span>
              <span className="text-amber-300">🕷️</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Banner (Dark Charcoal Black, Tilted +1.8 deg, Overlapping) */}
      <div className="relative transform rotate-2 bg-[#111827] text-red-500 py-3.5 shadow-2xl border-y border-gray-800 overflow-hidden -mt-6 z-20">
        <div className="animate-marquee-reverse whitespace-nowrap flex items-center font-extrabold italic tracking-wider text-sm sm:text-base font-sans uppercase">
          {items.concat(items).map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 px-4">
              <span>{item}</span>
              <span className="text-white">🕷️</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
