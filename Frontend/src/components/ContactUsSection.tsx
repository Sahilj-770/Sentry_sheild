import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Building, User, Sparkles } from 'lucide-react';

export const ContactUsSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Smart India Hackathon (SIH) Evaluation');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
      }, 500);
    }, 700);
  };

  return (
    <section id="contact" className="py-20 bg-[#0f1117] border-t border-slate-800 relative overflow-hidden">
      
      {/* Glow highlight */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Us Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Contact Us</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Get in Touch with the <br />
              <span className="text-cyan-400">Sentry Shield SIH Team</span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed">
              Have questions regarding our autonomous network security audit engine, AI heuristic models, or Smart India Hackathon evaluation? Connect directly with our engineering team.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Direct Dispatch Email</div>
                  <div className="font-semibold text-white font-mono">team.sentry@sih-gov.in</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Smart India Hackathon ID</div>
                  <div className="font-semibold text-white font-mono">SIH-2024-CYBER-AUDIT-09</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Primary Deployment Target</div>
                  <div className="font-semibold text-white font-mono">Vercel Edge Network & On-Premises Mesh</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#161c28] border border-slate-700/80 shadow-2xl relative">
              
              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Transmission Recorded (Demo)</h3>
                  <p className="text-slate-400 text-xs max-w-md">
                    In a production deployment, this dispatches via enterprise webhook. For SIH evaluation queries, please contact <span className="text-cyan-400 font-mono">team.sentry@sih-gov.in</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-300">Auditor Dispatch Message</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                      Evaluation Demo Form
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Your Name / Title</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Evaluator Name"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Auditor / Work Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="evaluator@sih.gov.in"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Subject / Inquiry Topic</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-400 text-xs"
                    >
                      <option>Smart India Hackathon (SIH) Evaluation</option>
                      <option>Network Architecture & Multi-Vendor Ingestion</option>
                      <option>Hardware QR Verification Protocol</option>
                      <option>Enterprise Pilot Deployment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Message / Requirements</label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Provide details or questions regarding the network audit engine..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Transmit Message</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
