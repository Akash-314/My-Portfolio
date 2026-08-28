import { useState, useEffect } from 'react';
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

export function App() {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');

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

  return (
    <div className="relative min-h-screen bg-[#fcfcfc] text-[#111827] font-sans overflow-x-hidden">
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

          {/* Footer */}
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
