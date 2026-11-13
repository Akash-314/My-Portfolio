import React, { useRef, useState, useEffect } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
  borderColor?: string;
  maxTilt?: number;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  spotlightColor = 'rgba(185, 28, 28, 0.08)',
  borderColor = 'rgba(185, 28, 28, 0.4)',
  maxTilt = 3.5,
  className = '',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      typeof window !== 'undefined' &&
        (window.matchMedia('(pointer: coarse)').matches ||
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0)
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });

    // Subtle 3D tilt calculation
    const rx = -((y / rect.height) - 0.5) * (maxTilt * 2);
    const ry = ((x / rect.width) - 0.5) * (maxTilt * 2);
    setTilt({ rx, ry });
  };

  const handleMouseEnter = () => {
    if (!isTouch) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: isHovered ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`relative overflow-hidden rounded-3xl will-change-transform ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Radial Mask */}
      {isHovered && !isTouch && (
        <div
          className="pointer-events-none absolute -inset-px opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(550px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 60%)`,
          }}
        />
      )}

      {/* Dynamic Border Shimmer on Hover */}
      {isHovered && !isTouch && (
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl z-10 transition-opacity duration-300"
          style={{
            border: `1px solid ${borderColor}`,
          }}
        />
      )}

      {children}
    </div>
  );
};

