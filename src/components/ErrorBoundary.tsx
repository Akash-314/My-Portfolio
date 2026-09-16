import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Portfolio ErrorBoundary intercepted an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#0c1017] border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden">
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase font-semibold">
                  STARK HUD // PROTOCOL 404
                </span>
                <h1 className="text-xl font-black font-sans tracking-wide text-white">
                  System Exception Detected
                </h1>
              </div>
            </div>

            <p className="text-sm text-gray-400 font-sans leading-relaxed mb-6">
              The portfolio interface encountered an unexpected interruption. System integrity remains intact.
            </p>

            <div className="p-3.5 rounded-lg bg-black/40 border border-gray-800 text-xs font-mono text-gray-400 mb-6 truncate">
              {this.state.error?.message || 'Unknown runtime exception'}
            </div>

            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
