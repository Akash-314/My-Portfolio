import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import { HangingSpiderMan } from './SpiderManSuspensions';
import { AdminShieldTrigger } from './admin/AdminShieldTrigger';

export const Skills: React.FC = () => {
  const { skills } = usePortfolio();

  return (
    <section id="skills" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2 flex items-center justify-center gap-1.5">
            <span>ARSENAL & EXPERTISE</span>
            <AdminShieldTrigger className="opacity-20 hover:opacity-100 text-[#b91c1c]" iconSize={12} />
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-3">
            TECHNICAL SKILLS<span className="text-[#b91c1c]">.</span>
          </h2>
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: 2-Column Skill Cards Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {skills.map((skill, idx) => (
              <motion.div
                key={skill.id || skill.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="spydyy-card p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${skill.highlight ? 'bg-[#b91c1c] ring-4 ring-red-100' : 'bg-gray-400'}`} />
                  <div>
                    <h3 className="text-sm font-extrabold text-[#111827] font-sans tracking-wide flex items-center gap-2">
                      {skill.name}
                      {skill.highlight && (
                        <span className="text-[9px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                          CORE
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider block">
                      {skill.category}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full ${
                    skill.level === 'ADVANCED'
                      ? 'bg-red-50 text-[#b91c1c] border border-red-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {skill.level}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Upside Down Hanging Spider-Man (Matching Reference Screenshot 3) */}
          <div className="lg:col-span-4 hidden lg:flex justify-center relative -mt-20">
            <HangingSpiderMan className="w-48 xl:w-56" />
          </div>
        </div>
      </div>
    </section>
  );
};
