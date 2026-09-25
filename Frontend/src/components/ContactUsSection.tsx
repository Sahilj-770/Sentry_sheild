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
    }, 600);
  };

  return (
    <section id="contact" className="py-16 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Contact Us Info */}
          <div className="lg:col-span-5 space-y-5">
            <div className="sentry-badge">
              <Mail className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>TEAM CONTACT &amp; EVALUATION</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-tight uppercase">
              Get in Touch with the <br />
              <span className="text-[var(--text-secondary)] font-light">Sentry Shield Team</span>
            </h2>

            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Have technical questions regarding our autonomous network security audit engine, deterministic benchmark models, or Smart India Hackathon evaluation? Connect directly with our development team.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Direct Contact</div>
                  <div className="font-semibold text-[var(--text-primary)] font-mono">team.sentry@sih-gov.in</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--success)] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Smart India Hackathon ID</div>
                  <div className="font-semibold text-[var(--text-primary)] font-mono">SIH-2026-CYBER-AUDIT-09</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--cyan-telemetry)] shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Jury &amp; Evaluation Support</div>
                  <div className="font-semibold text-[var(--text-primary)] font-mono">Available 24/7 for Technical Review</div>
                </div>
              </div>
            </div>

            {/* Honest Demo notice */}
            <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] text-[var(--text-muted)] space-y-1">
              <span className="font-mono font-bold text-[var(--text-secondary)] block">Evaluation Demo Form</span>
              <p>Form submissions in this standalone evaluation environment simulate local dispatch without transmitting data over external mail servers.</p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="sentry-card p-6 sm:p-8">
              
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">
                    Direct Inquiry Dispatch
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Direct communication with Sentry platform engineers
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
              </div>

              {submitted ? (
                <div className="p-6 rounded-lg bg-[var(--success-muted)] border border-[var(--success)]/40 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[var(--success)] mx-auto" />
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Inquiry Recorded (Simulated)
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                    Thank you. In this standalone SIH environment, your simulated dispatch has been acknowledged. Connect directly with the team during jury evaluation.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="sentry-btn-secondary text-xs"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                        Full Name / Evaluator
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. S. Sharma / SIH Jury"
                          className="sentry-input pl-8"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                        Official Email
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="evaluator@sih.gov.in"
                          className="sentry-input pl-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="sentry-input"
                    >
                      <option value="Smart India Hackathon (SIH) Evaluation">Smart India Hackathon (SIH) Evaluation</option>
                      <option value="Multi-Vendor AST Parser Architecture">Multi-Vendor AST Parser Architecture</option>
                      <option value="CIS / NIST Compliance Rule Engine">CIS / NIST Compliance Rule Engine</option>
                      <option value="Enterprise Integration &amp; Webhooks">Enterprise Integration &amp; Webhooks</option>
                      <option value="Other Technical Query">Other Technical Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-[var(--text-secondary)] mb-1">
                      Message / Evaluation Feedback
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-3" />
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Provide details about your evaluation query, architecture verification, or technical assessment..."
                        className="sentry-input pl-8 resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="sentry-btn-primary w-full py-2.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Dispatching...' : 'Dispatch Message to Sentry Team'}</span>
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
