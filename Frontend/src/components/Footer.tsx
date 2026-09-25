import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                Sentry <span className="font-normal text-[var(--text-secondary)]">Shield</span>
              </span>
              <span className="sentry-tag bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                SIH 2026
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-xs max-w-sm leading-relaxed">
              Autonomous multi-vendor network security compliance auditing platform engineered for configuration drift detection, CIS &amp; NIST baseline verification, and deterministic remediation.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-mono">
              <span>Platform Core:</span>
              <span className="text-[var(--text-primary)]">sentry-engine-v2.4</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-[var(--text-primary)] font-bold mb-3 uppercase tracking-wider text-[11px] font-mono">
              Platform Links
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
              <li><a href="/index.html" className="hover:text-[var(--text-primary)] transition-colors">Landing Overview</a></li>
              <li><a href="/homepage.html" className="hover:text-[var(--text-primary)] transition-colors">Capabilities &amp; Matrix</a></li>
              <li><a href="/dashboard.html" className="hover:text-[var(--text-primary)] transition-colors">SecOps Dashboard</a></li>
              <li><a href="/upload.html" className="hover:text-[var(--text-primary)] transition-colors">Upload &amp; Audit Pipeline</a></li>
              <li><a href="/result.html" className="hover:text-[var(--text-primary)] transition-colors">Compliance Results</a></li>
            </ul>
          </div>

          {/* Col 3: Standards & Evaluation */}
          <div>
            <h4 className="text-[var(--text-primary)] font-bold mb-3 uppercase tracking-wider text-[11px] font-mono">
              Auditing Standards
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
              <li><span className="text-[var(--text-secondary)]">CIS Controls v8</span></li>
              <li><span className="text-[var(--text-secondary)]">NIST SP 800-53 Rev 5</span></li>
              <li><span className="text-[var(--text-secondary)]">DISA STIG Network Hardening</span></li>
              <li><span className="text-[var(--text-secondary)]">CERT-In Security Baselines</span></li>
              <li><span className="text-[var(--text-secondary)]">ISO/IEC 27001 Annex A</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--text-muted)] font-mono">
          <div>
            &copy; {new Date().getFullYear()} Sentry Shield. Smart India Hackathon (SIH 2026).
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
            <span>Deterministic Security Engine Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
