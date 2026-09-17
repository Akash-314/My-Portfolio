import React from 'react';
import { Shield } from 'lucide-react';

interface AdminShieldTriggerProps {
  className?: string;
  iconSize?: number;
  title?: string;
  onClick?: () => void;
}

/**
 * Universal trigger to open the Admin Security Gate from any shield instance
 */
const openAdminGate = () => {
  window.dispatchEvent(new CustomEvent('spydyy-open-admin'));
  if (window.location.hash !== '#admin') {
    window.history.pushState(null, '', '#admin');
  }
};

export const AdminShieldTrigger: React.FC<AdminShieldTriggerProps> = ({
  className = '',
  iconSize = 14,
  title = 'System Security Protocol',
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    openAdminGate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      title={title}
      aria-label="Security Token"
      data-web-target="admin-trigger"
      className={`cursor-target group relative inline-flex items-center justify-center p-1 rounded-full text-gray-500/40 hover:text-red-500 transition-all duration-300 transform hover:scale-110 active:scale-95 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] focus:outline-none cursor-pointer ${className}`}
    >
      <Shield
        style={{ width: iconSize, height: iconSize }}
        className="transition-transform duration-300 group-hover:rotate-6"
      />
    </button>
  );
};
