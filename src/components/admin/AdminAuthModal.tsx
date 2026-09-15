import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { login, resetAdminPasscode } = usePortfolio();
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the admin password.');
      return;
    }

    setLoading(true);
    setError('');
    setResetNotice('');

    const success = await login(passcode.trim());
    setLoading(false);

    if (success) {
      setPasscode('');
      setError('');
      setResetNotice('');
      onSuccess();
    } else {
      setError('Invalid admin credentials. If you changed & forgot it, use your master key or click Reset.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-[#0f1118] border-2 border-red-600/80 rounded-3xl p-8 shadow-2xl shadow-red-950/50 relative overflow-hidden"
      >
        {/* Background Spider-Web SVG Watermark */}
        <div className="absolute -right-8 -top-8 w-40 h-40 opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full stroke-red-500 fill-none">
            <circle cx="50" cy="50" r="40" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" strokeWidth="1" />
            <line x1="10" y1="50" x2="90" y2="50" strokeWidth="1" />
            <line x1="50" y1="10" x2="50" y2="90" strokeWidth="1" />
          </svg>
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono font-black uppercase tracking-wider text-red-500">
            <Lock className="w-4 h-4 text-red-500 animate-pulse" />
            ADMIN SECURITY GATE
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Return to Portfolio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="mb-6 relative z-10">
          <h3 className="text-2xl font-black italic tracking-tight text-white font-sans uppercase">
            RESTRICTED ACCESS<span className="text-red-500">.</span>
          </h3>
          <p className="text-xs text-gray-400 font-sans mt-1.5 leading-relaxed font-medium">
            This administration hub is private and restricted. Authorized clearance credentials required to proceed.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-950/60 border border-red-600/60 text-red-300 text-xs font-mono flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Reset Confirmation Notice */}
        {resetNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetNotice}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-gray-400 mb-2">
              ADMIN PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter admin password..."
                autoFocus
                className="w-full px-4 py-3.5 pl-11 pr-11 rounded-2xl bg-[#171924] border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 font-mono shadow-inner tracking-wider"
              />
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                resetAdminPasscode();
                setPasscode('');
                setError('');
                setResetNotice('Custom password cleared! Enter your master recovery key to unlock.');
              }}
              className="text-[11px] font-mono text-gray-400 hover:text-red-400 transition-colors underline cursor-pointer"
            >
              Forgot changed password? Reset
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2 font-mono">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                VERIFYING CLEARANCE...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> UNLOCK COMMAND CENTER
              </>
            )}
          </button>
        </form>

        {/* Security footer */}
        <div className="mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1.5 text-gray-500">
            <Lock className="w-3 h-3 text-red-500/80" /> ENCRYPTED PROTOCOL // PRIVATE ACCESS
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white uppercase font-bold underline cursor-pointer"
          >
            Cancel & Exit
          </button>
        </div>
      </motion.div>
    </div>
  );
};
