import React from 'react';
import { CheckCircle } from 'lucide-react';
import { RobotShieldIllustration } from './RobotShieldIllustration';

interface HeroSectionProps {
  onExploreFeatures: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreFeatures,
}) => {
  return (
    <section id="hero" className="relative min-h-[calc(100vh-72px)] flex items-center justify-center py-12 lg:py-16 cyber-grid overflow-hidden">
      {/* Background Radial Glow - subtle restrained ambient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Subheading & Action */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-cyan-300 shadow-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Next-Gen SIH Cybersecurity Initiative</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle className="w-3 h-3" />
                Audit Engine 2.0
              </span>
            </div>

            {/* Disciplined Heading: "Find the gaps. Secure the network." */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 tracking-tight leading-[1.12]">
              Find the gaps.
              <span className="block text-cyan-400 font-semibold mt-1">
                Secure the network.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
              AI-powered network security compliance auditing for modern enterprise infrastructure.
            </p>

            <p className="text-sm text-slate-400 max-w-xl">
              Continuously discovers configuration drifts, misconfigured firewalls, rogue devices, and compliance gaps across hybrid infrastructures before attackers exploit them.
            </p>

            {/* Refined Action */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={onExploreFeatures}
                className="px-6 py-3 rounded-xl bg-[#161c28] hover:bg-[#1a2130] border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 hover:text-white text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
              >
                <span>Explore Feature Topology</span>
                <span className="text-cyan-400 group-hover:translate-y-0.5 transition-transform font-mono">↓</span>
              </button>
            </div>

            {/* Trust Metrics / Specs */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 w-full max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                  100%
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">
                  Automated CIS Audits
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                  &lt; 30s
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">
                  Zero-Drift Detection
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-200 font-mono">
                  15+
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">
                  Hardware Vendors
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Robot in front with Shield behind it */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <RobotShieldIllustration />
          </div>

        </div>
      </div>
    </section>
  );
};
