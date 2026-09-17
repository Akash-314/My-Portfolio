import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { portfolioData } from '../data/portfolio';
import { usePortfolio } from '../context/PortfolioContext';
import { GithubIcon, LinkedinIcon } from './Icons';
import { HangingSpiderMan, CornerWebBottomRight } from './SpiderManSuspensions';

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

    // Save message to admin inbox in context/localStorage
    addMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim()
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
    }
  ];

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#fcfcfc] overflow-hidden">
      <CornerWebBottomRight className="w-72 sm:w-96" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-14 text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#b91c1c] font-sans mb-2 flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#b91c1c] rounded-sm" />
            GET IN TOUCH
          </div>
          <h2 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-[#111827] text-3d-red uppercase font-sans mb-3">
            CONTACT<span className="text-[#b91c1c]">.</span>
          </h2>
          <div className="h-1.5 w-16 bg-[#b91c1c] rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Direct Info Cards */}
          <div className="lg:col-span-4 space-y-3">
            <div className="spydyy-card p-6">
              <h3 className="text-lg font-extrabold text-[#111827] font-sans mb-2">
                Direct Channels
              </h3>
              <p className="text-xs text-gray-600 font-sans leading-relaxed mb-4 font-medium">
                Reach out for software engineering internships, hackathons, or technical opportunities.
              </p>

              <div className="space-y-3">
                {contactCards.map((c) => {
                  const Icon = c.icon;
                  return (
                    <a
                      key={c.title}
                      href={c.link}
                      target={c.link.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      data-web-target="contact-card"
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3 hover:border-[#b91c1c] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-white border border-gray-200 text-[#b91c1c] group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase block">
                          {c.title}
                        </span>
                        <span className="text-xs font-bold text-[#111827] font-mono group-hover:text-[#b91c1c] transition-colors">
                          {c.value}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Central Form Card */}
          <div className="lg:col-span-5">
            <div className="spydyy-card p-8 sm:p-10 border border-gray-200 shadow-xl relative">
              {status === 'success' ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mb-3">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-[#111827] font-sans mb-1">
                    Signal Transmitted!
                  </h4>
                  <p className="text-xs text-gray-600 font-sans max-w-xs">
                    Thank you for reaching out, Akash will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-5 py-2 rounded-full text-xs font-mono font-bold uppercase text-white bg-[#111827]"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {status === 'error' && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1.5">
                      YOUR NAME
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Peter Parker"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#b91c1c] font-sans shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1.5">
                      YOUR EMAIL
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="peter@stark.com"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#b91c1c] font-sans shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-mono font-bold uppercase text-gray-700 mb-1.5">
                      MESSAGE
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Let's build something amazing together..."
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#b91c1c] font-sans resize-none shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    data-web-target="cta-button"
                    className="cursor-target w-full py-4 rounded-full text-xs font-black uppercase tracking-wider text-white bg-[#b91c1c] hover:bg-[#a71919] shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                  >
                    {status === 'submitting' ? (
                      <span className="flex items-center gap-2 font-mono">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        TRANSMITTING...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> SEND MESSAGE
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Hanging Upside Down Spider-Man Visual */}
          <div className="lg:col-span-3 hidden lg:flex justify-center relative -mt-16">
            <HangingSpiderMan className="w-44" />
          </div>
        </div>
      </div>
    </section>
  );
};
