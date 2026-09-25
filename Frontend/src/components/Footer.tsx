import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#131722] border-t border-slate-800 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-white">
                Sentry <span className="font-semibold text-slate-300">Shield</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-mono">
                SIH Edition
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              AI-driven network compliance auditing engine engineered for real-time drift discovery, hardware QR cryptographic verification, and multi-vendor security assurance.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span>Vercel Deploy ID:</span>
              <span className="text-cyan-400">sih-audit-prod-v2.0</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px] font-mono">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#network-features" className="hover:text-cyan-400 transition-colors">Compliance Monitoring</a></li>
              <li><a href="#network-features" className="hover:text-cyan-400 transition-colors">QR Verification</a></li>
              <li><a href="#network-features" className="hover:text-cyan-400 transition-colors">Multi Vendor Support</a></li>
              <li><a href="#network-features" className="hover:text-cyan-400 transition-colors">AI Powered Analysis</a></li>
              <li><a href="#network-features" className="hover:text-cyan-400 transition-colors">Actionable Reports</a></li>
            </ul>
          </div>

          {/* Col 3: Resources & Standards */}
          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px] font-mono">
              Standards & Evaluation
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#dashboard" className="hover:text-cyan-400 transition-colors">CIS Benchmark v8</a></li>
              <li><a href="#dashboard" className="hover:text-cyan-400 transition-colors">NIST SP 800-53 Control Set</a></li>
              <li><a href="#dashboard" className="hover:text-cyan-400 transition-colors">ISO/IEC 27001 Posture</a></li>
              <li><a href="#contact" className="hover:text-cyan-400 transition-colors">SIH Jury Whitepaper</a></li>
              <li><a href="#contact" className="hover:text-cyan-400 transition-colors">System Architecture RFC</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Sentry Shield. Developed for Smart India Hackathon (SIH). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Security Systems Operational
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
