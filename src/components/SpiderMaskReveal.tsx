import React, { useState, useRef } from 'react';

interface SpiderMaskRevealProps {
  developerImage?: string;
  spidermanImage?: string;
  className?: string;
  /** Reveal circle lens radius in pixels, default 300px */
  revealRadius?: number;
}

export const SpiderMaskReveal: React.FC<SpiderMaskRevealProps> = ({
  developerImage = '/assets/spider/reveal_image.png',
  spidermanImage = '/assets/spider/hero.png',
  className = '',
  revealRadius = 300
}) => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [devImgError, setDevImgError] = useState(false);
  const [spiderImgError, setSpiderImgError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Mask logic:
  // When NOT hovered: radius is 0px (Spider-Man mask hero.png is 100% solid visible; reveal_image is 100% INVISIBLE).
  // When hovered: radial lens opens ONLY at the hover spot to expose reveal_image.png underneath!
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: hovered
      ? `radial-gradient(circle ${revealRadius}px at ${mousePos.x}% ${mousePos.y}%, transparent 0%, transparent 45%, rgba(0,0,0,0.5) 75%, black 100%)`
      : 'radial-gradient(circle 0px at 50% 50%, black 0%, black 100%)',
    maskImage: hovered
      ? `radial-gradient(circle ${revealRadius}px at ${mousePos.x}% ${mousePos.y}%, transparent 0%, transparent 45%, rgba(0,0,0,0.5) 75%, black 100%)`
      : 'radial-gradient(circle 0px at 50% 50%, black 0%, black 100%)',
    transition: 'mask-image 0.15s ease-out, -webkit-mask-image 0.15s ease-out'
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className={`relative w-screen h-screen min-h-screen select-none cursor-pointer overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Layer 1: Background Revealed Image (reveal_image.png - 100vw / 100vh Full Fit) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
        {!devImgError ? (
          <img
            src={developerImage}
            alt="Akash Kumar Reveal Background"
            className="w-full h-full object-cover object-center pointer-events-none"
            onError={() => setDevImgError(true)}
          />
        ) : (
          /* Fallback Visual */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
            <span className="text-4xl font-extrabold font-sans">AKASH KUMAR</span>
            <span className="text-lg font-mono text-[#b91c1c] uppercase mt-2">B.TECH IT • REC BANDA</span>
          </div>
        )}
      </div>

      {/* Layer 2: Foreground Spider-Man Mask Image (hero.png - 100vw / 100vh Full Fit, Only unmasked on hover) */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
        style={maskStyle}
      >
        {!spiderImgError ? (
          <img
            src={spidermanImage}
            alt="Spider-Man Hero Mask"
            className="w-full h-full object-cover object-center pointer-events-none"
            onError={() => setSpiderImgError(true)}
          />
        ) : (
          /* Fallback Mask Render */
          <svg viewBox="0 0 200 240" className="w-full h-full text-white">
            <rect width="200" height="240" fill="#dc2626" />
          </svg>
        )}
      </div>
    </div>
  );
};
