import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ContinuousSpiderWebThread: React.FC = () => {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Calculate coordinates across sections on layout resize
  useEffect(() => {
    const updateThreadGeometry = () => {
      const sectionIds = [
        'hero',
        'about',
        'skills',
        'projects',
        'achievements',
        'coding',
        'journey',
        'contact',
      ];

      const newPoints: { x: number; y: number }[] = [];
      const winWidth = window.innerWidth;

      sectionIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const y = rect.top + scrollTop + rect.height * 0.45;

          // Alternate anchor position gracefully along the margins so text is never obscured
          // Desktop: weaving between 6% left, 94% right, 12% left, etc.
          let xRatio = 0.08;
          if (index % 2 === 1) {
            xRatio = winWidth < 768 ? 0.92 : 0.94;
          } else {
            xRatio = winWidth < 768 ? 0.08 : 0.06;
          }

          newPoints.push({ x: winWidth * xRatio, y });
        }
      });

      if (newPoints.length > 0) {
        setPoints(newPoints);
      }
    };

    updateThreadGeometry();
    window.addEventListener('resize', updateThreadGeometry, { passive: true });
    // Re-check when images or fonts settle
    const t = setTimeout(updateThreadGeometry, 600);

    return () => {
      window.removeEventListener('resize', updateThreadGeometry);
      clearTimeout(t);
    };
  }, []);

  if (points.length < 2) return null;

  // Build a smooth cubic bezier SVG path string connecting the section nodes
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midY = (p0.y + p1.y) / 2;
    // Cubic bezier curving down through viewport
    pathD += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }

  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full pointer-events-none z-[5] select-none overflow-hidden"
      style={{ height: `${docHeight}px` }}
      aria-hidden="true"
    >
      <svg className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="webThreadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#dc2626" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.7" />
          </linearGradient>
          <filter id="threadGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#b91c1c" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Faint static guide thread */}
        <path
          d={pathD}
          fill="none"
          stroke="rgba(185, 28, 28, 0.08)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Dynamic scroll-drawn Web of Impact strand */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#webThreadGradient)"
          strokeWidth="1.5"
          filter="url(#threadGlow)"
          style={{ pathLength: smoothProgress }}
        />

        {/* Connection anchor nodes */}
        {points.map((pt, idx) => (
          <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
            {/* Outer pulsating ring */}
            <circle
              r="6"
              fill="none"
              stroke="#b91c1c"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
            {/* Solid core node */}
            <circle
              r="2.5"
              fill="#b91c1c"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};
