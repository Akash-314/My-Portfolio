import { useState, useEffect } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Loader } from './components/Loader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarqueeRibbons } from './components/MarqueeRibbons';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Achievements } from './components/Achievements';
import { CodingStats } from './components/CodingStats';
import { Journey } from './components/Journey';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GlobalCursor } from './components/GlobalCursor';

function PortfolioMain() {
  const { isAuthenticated } = usePortfolio();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check URL hash (#admin) and keyboard shortcuts (Ctrl+Shift+A)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#dashboard') {
        if (isAuthenticated) {
          setIsAdminOpen(true);
        } else {
          setShowAuthModal(true);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAuthenticated) {
          setIsAdminOpen(true);
        } else {
          setShowAuthModal(true);
        }
      }
    };

    const handleCustomOpen = () => {
      if (isAuthenticated) {
        setIsAdminOpen(true);
      } else {
        setShowAuthModal(true);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('spydyy-open-admin', handleCustomOpen);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('spydyy-open-admin', handleCustomOpen);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (loading) return;

    const sections = ['hero', 'about', 'skills', 'projects', 'achievements', 'coding', 'journey', 'contact'];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.25 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);

  const handleExploreClick = () => {
    const projectsEl = document.getElementById('projects');
    if (projectsEl) {
      projectsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdminTrigger = () => {
    if (isAuthenticated) {
      setIsAdminOpen(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleExitAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin' || window.location.hash === '#dashboard') {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsAdminOpen(true);
  };

  // If Admin is authenticated and open, display full-screen Command Center Dashboard
  if (isAdminOpen && isAuthenticated) {
    return <AdminDashboard onExit={handleExitAdmin} />;
  }

  return (
    <div className="relative min-h-screen bg-[#fcfcfc] text-[#111827] font-sans overflow-x-hidden">
      {/* Global Interactive Cursor Reticle across entire document */}
      <GlobalCursor />

      {/* Initial Loader */}
      {loading ? (
        <Loader onFinish={() => setLoading(false)} />
      ) : (
        <>
          {/* Top Fixed Header */}
          <Navbar activeSection={activeSection} />

          {/* Main Portfolio Sections */}
          <main className="relative z-10">
            <Hero onExploreClick={handleExploreClick} />
            <MarqueeRibbons />
            <About />
            <Skills />
            <Projects />
            <Achievements />
            <CodingStats />
            <Journey />
            <Contact />
          </main>

          {/* Footer with Stealth Admin Trigger */}
          <Footer onOpenAdmin={handleOpenAdminTrigger} />

          {/* Master Passcode Auth Gate Modal */}
          <AdminAuthModal
            isOpen={showAuthModal}
            onClose={() => {
              setShowAuthModal(false);
              if (window.location.hash === '#admin' || window.location.hash === '#dashboard') {
                window.history.pushState(null, '', window.location.pathname);
              }
            }}
            onSuccess={handleAuthSuccess}
          />
        </>
      )}
    </div>
  );
}

export function App() {
  return (
    <PortfolioProvider>
      <PortfolioMain />
    </PortfolioProvider>
  );
}

export default App;
