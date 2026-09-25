import React from 'react';
import { Globe, ShieldCheck, Sparkles } from 'lucide-react';

export const TopNoticeBar: React.FC = () => {
  return (
    <div className="w-full bg-[#131722] border-b border-slate-800 text-xs text-slate-400 py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 z-50">
      {/* Mock Browser/Vercel URL bar matching wireframe 'name of project SIH - vercel' */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 font-mono text-[11px] text-cyan-300">
          <Globe className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span className="text-slate-400">https://</span>
          <span className="text-white font-semibold">sentry-shield-sih</span>
          <span className="text-cyan-400">.vercel.app</span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Vercel Production Active
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[11px] text-slate-300">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="font-semibold text-amber-300">Smart India Hackathon (SIH)</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Cybersecurity & Network Auditing</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
          <ShieldCheck className="w-3 h-3" />
          <span>CIS & NIST Verified</span>
        </div>
      </div>
    </div>
  );
};
