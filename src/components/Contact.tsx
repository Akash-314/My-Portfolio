import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { usePortfolio } from '../context/PortfolioContext';
import { GithubIcon, LinkedinIcon } from './Icons';
import { CornerWebBottomRight } from './SpiderManSuspensions';
import { WebMagneticButton } from './WebMagneticButton';
import { SplitWordReveal } from '../motion/SplitWordReveal';
import { CinematicReveal } from '../motion/CinematicReveal';

export const Contact: React.FC = () => {
  const { contact } = portfolioData.personal;
  const { addMessage } = usePortfolio();

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your message.');
      return;
    }

    setStatus('submitting');

    // Save message to admin inbox in context/localStorage and Neon Postgres
    addMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
    });

    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    }, 600);
  };

  const contactCards = [
    {
      title: 'GitHub',
      value: 'Akash-314',
      link: contact.github,
      icon: GithubIcon,
    },
    {
      title: 'Phone',
      value: contact.phone,
      link: `tel:${contact.phone}`,
      icon: Phone,
    },
    {
      title: 'Email',
      value: contact.email,
      link: `mailto:${contact.email}`,
      icon: Mail,
    },
    {
      title: 'LinkedIn',
      value: 'sp4rk314',
      link: contact.linkedin,
      icon: LinkedinIcon,
    },
  ];

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      {/* Corner Graphic */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-25">
        <CornerWebBottomRight className="w-64 sm:w-80" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <CinematicReveal revealStyle="fade-up">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#b91c1c] font-sans mb-2">
              SIGNAL BEACON
            </div>
          </CinematicReveal>

          <SplitWordReveal
            text="GET IN TOUCH."
            as="h2"
            className="text-5xl sm:text-7xl font-normal uppercase tracking-tight text-[#111827] font-display mb-3 leading-[0.95] justify-center"
            highlightWords={['TOUCH.']}
          />
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full mb-3" />
          <p className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-gray-500 max-w-lg">
            HAVE A PROJECT, QUESTION OR COLLABORATION IN MIND? SEND A SIGNAL.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            <CinematicReveal revealStyle="slide-left" delay={0.1}>
              <div className="mb-6">
                <h3 className="text-2xl font-display font-normal uppercase tracking-tight text-[#111827] mb-2">
                  DIRECT CHANNELS
                </h3>
                <p className="text-sm text-gray-600 font-sans leading-relaxed">
                  Connect through any of my official handles or submit the dispatch form on the right.
                </p>
              </div>
            </CinematicReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {contactCards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <CinematicReveal key={c.title} revealStyle="fade-up" delay={0.15 + i * 0.08}>
                    <a
                      href={c.link}
                      target={c.link.startsWith('http') ? '_blank' : '_self'}
                      rel={c.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="cursor-target spydyy-card p-4 flex items-center gap-4 group transition-transform hover:-translate-x-1"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#b91c1c] group-hover:bg-[#b91c1c] group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase text-gray-400 block tracking-wider">
                          {c.title}
                        </span>
                        <span className="text-sm font-bold text-gray-800 font-sans group-hover:text-[#b91c1c] transition-colors">
                          {c.value}
                        </span>
                      </div>
                    </a>
                  </CinematicReveal>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <CinematicReveal revealStyle="slide-right" delay={0.2} className="lg:col-span-7">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xl relative">
              <h3 className="text-2xl sm:text-3xl font-display font-normal uppercase tracking-tight text-[#111827] mb-2">
                TRANSMIT MESSAGE
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-sans mb-8">
                Your transmission is routed directly to the command inbox.
              </p>

              {status === 'success' && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Message sent successfully! I will get back to you shortly.</span>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-mono font-bold uppercase text-gray-700 tracking-wider mb-2">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Peter Parker"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:bg-white transition-all font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-mono font-bold uppercase text-gray-700 tracking-wider mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="spidey@dailybugle.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:bg-white transition-all font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-mono font-bold uppercase text-gray-700 tracking-wider mb-2">
                    TRANSMISSION / MESSAGE
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your signal here..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:bg-white transition-all font-sans resize-none"
                  />
                </div>

                <div className="pt-2">
                  <WebMagneticButton>
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="cursor-target w-full sm:w-auto px-8 py-4 rounded-full text-sm font-display uppercase tracking-wider text-white bg-[#b91c1c] hover:bg-[#991b1b] shadow-lg shadow-red-950/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{status === 'submitting' ? 'DISPATCHING...' : 'SEND SIGNAL'}</span>
                    </button>
                  </WebMagneticButton>
                </div>
              </form>
            </div>
          </CinematicReveal>
        </div>
      </div>
    </section>
  );
};
