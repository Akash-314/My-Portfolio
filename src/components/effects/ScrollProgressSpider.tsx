import React, { useEffect, useState } from 'react';

export const ScrollProgressSpider: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const progress = Math.min(1, Math.max(0, scrollY / docHeight));
        setScrollProgress(progress);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Vertical travel range on desktop: from 10% to 90% of screen height
  const topPercent = 8 + scrollProgress * 84;

  return (
    <div
      className="hidden md:block fixed right-4 top-0 bottom-0 w-6 pointer-events-none z-40 select-none"
      aria-hidden="true"
    >
      {/* Vertical Thread Line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-red-500/25 to-transparent" />

      {/* Crawling Spider Icon Container */}
      <div
        className="absolute left-1/2 -translate-x-1/2 transition-all duration-150 ease-out"
        style={{ top: `${topPercent}%` }}
      >
        {/* Minimal Stylized Spider Silhouette */}
        <div className="relative flex items-center justify-center w-5 h-5 -translate-y-1/2">
          {/* Subtle Red Beacon Glow */}
          <div className="absolute inset-0 rounded-full bg-red-600/20 blur-[3px]" />

          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-[#b91c1c] drop-shadow-[0_1px_3px_rgba(185,28,28,0.5)] transform -rotate-180"
          >
            {/* Spider Head & Abdomen */}
            <ellipse cx="12" cy="9" rx="2.5" ry="3" />
            <circle cx="12" cy="14" r="3.5" />
            {/* Legs Left */}
            <path
              d="M10 8 C7 6 5 4 4 2 M10 10 C6 9 4 9 3 11 M10 12 C6 13 4 15 3 18 M10 14 C7 17 5 20 4 22"
              stroke="#b91c1c"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Legs Right */}
            <path
              d="M14 8 C17 6 19 4 20 2 M14 10 C18 9 20 9 21 11 M14 12 C18 13 20 15 21 18 M14 14 C17 17 19 20 20 22"
              stroke="#b91c1c"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
