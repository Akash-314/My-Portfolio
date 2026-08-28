import React from 'react';

// Hanging upside down Spider-Man visual with pendulum sway animation
export const HangingSpiderMan: React.FC<{ className?: string }> = ({ className = "w-44 sm:w-56" }) => {
  return (
    <div className={`relative flex flex-col items-center select-none pointer-events-none animate-spider-hang ${className}`}>
      {/* Hanging Web Thread Line from Header */}
      <div className="w-0.5 h-32 sm:h-44 bg-gradient-to-b from-[#111827] via-gray-400 to-[#b91c1c] shadow-sm" />

      {/* Real Hanging Spider-Man Image spydy_hang.png */}
      <img
        src="/assets/spider/spydy_hang.png"
        alt="Hanging Spider-Man"
        className="w-full h-auto drop-shadow-2xl"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );
};

// Standing Spider-Man character visual using spydy_stand.png
export const StandingSpiderMan: React.FC<{ className?: string }> = ({ className = "w-48 sm:w-60" }) => {
  return (
    <div className={`relative flex flex-col items-center select-none pointer-events-none ${className}`}>
      <img
        src="/assets/spider/spydy_stand.png"
        alt="Standing Spider-Man"
        className="w-full h-auto drop-shadow-2xl"
      />
    </div>
  );
};

// Spider-Web Corner Images with Hanging Sway Animations
export const CornerWebTopLeft: React.FC<{ className?: string }> = ({ className = "w-72 sm:w-96" }) => (
  <div className={`absolute top-0 left-0 pointer-events-none z-0 opacity-25 animate-web-sway-left ${className}`}>
    <img src="/assets/spider/web.png" alt="Spider Web Corner" className="w-full h-auto" />
  </div>
);

export const CornerWebTopRight: React.FC<{ className?: string }> = ({ className = "w-72 sm:w-96" }) => (
  <div className={`absolute top-0 right-0 pointer-events-none z-0 opacity-25 animate-web-sway-right ${className}`}>
    <img src="/assets/spider/web.png" alt="Spider Web Corner" className="w-full h-auto transform scale-x-[-1]" />
  </div>
);

export const CornerWebBottomRight: React.FC<{ className?: string }> = ({ className = "w-72 sm:w-96" }) => (
  <div className={`absolute bottom-0 right-0 pointer-events-none z-0 opacity-20 animate-web-sway-right ${className}`}>
    <img src="/assets/spider/web.png" alt="Spider Web Corner" className="w-full h-auto transform scale-y-[-1] scale-x-[-1]" />
  </div>
);
