import React, { useState } from 'react';
import { 
  Shield, 
  Cpu, 
  Users, 
  FileCheck2, 
  DownloadCloud, 
  Lightbulb, 
  ArrowRight, 
  Compass, 
  Sparkles, 
  Activity, 
  Layers, 
  Lock,
  ArrowLeft
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HomePageViewProps {
  onBackToLanding: () => void;
  onExplore: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  currentUser?: { name: string; email: string } | null;
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  onBackToLanding,
  onExplore,
  onOpenAuth,
  currentUser,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  const stats = [
    {
      id: 'users',
      number: '14,850+',
      rawSketchText: 'xyz users',
      label: 'Active Network Engineers & Auditors',
      icon: <Users className="w-4 h-4 text-cyan-400" />,
      tilt: '-rotate-2',
      glow: 'shadow-cyan-500/10 border-cyan-500/30'
    },
    {
      id: 'reports',
      number: '92,400+',
      rawSketchText: 'abc reports generated',
      label: 'CIS & NIST Audit Reports Generated',
      icon: <FileCheck2 className="w-4 h-4 text-emerald-400" />,
      tilt: '-rotate-1',
      glow: 'shadow-emerald-500/10 border-emerald-500/30'
    },
    {
      id: 'downloads',
      number: '38,200+',
      rawSketchText: '123 downloads',
      label: 'Remediation CLI & Playbook Downloads',
      icon: <DownloadCloud className="w-4 h-4 text-blue-400" />,
      tilt: 'rotate-1',
      glow: 'shadow-blue-500/10 border-blue-500/30'
    },
    {
      id: 'suggestions',
      number: '21,650+',
      rawSketchText: '432 suggestions',
      label: 'AI Remediation Suggestions Implemented',
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
      tilt: 'rotate-2',
      glow: 'shadow-amber-500/10 border-amber-500/30'
    }
  ];

  const features = [
    {
      id: 1,
      title: 'Feature 1',
      name: 'Continuous Drift Auditing',
      description: 'Zero-latency telemetry tracking configuration drift across hybrid switches & routers against national cybersecurity baselines.',
      tags: ['CIS v8', 'Real-time Drift', 'Zero False Alarm'],
      icon: <Activity className="w-7 h-7 text-cyan-400" />,
      accent: 'border-cyan-500/40 bg-[#161c28] text-cyan-300 shadow-sm',
      size: 'w-52 h-52 sm:w-60 sm:h-60',
      offsetY: 'lg:translate-y-4'
    },
    {
      id: 2,
      title: 'Feature 2',
      name: 'AI Neural Heuristic Engine',
      description: 'Generative LLM-assisted compliance gap discovery identifying stealth lateral movement paths and writing patch scripts.',
      tags: ['Neural Synthesis', 'Auto-Remediate', 'Synthetic Attack Mesh'],
      icon: <Sparkles className="w-8 h-8 text-cyan-400" />,
      accent: 'border-cyan-500/50 bg-[#161c28] text-slate-100 shadow-sm scale-105 sm:scale-110',
      size: 'w-60 h-60 sm:w-72 sm:h-72',
      offsetY: 'lg:-translate-y-4'
    },
    {
      id: 3,
      title: 'Feature 3',
      name: 'Crypto QR Verification',
      description: 'Instant zero-touch hardware cryptographic registration with tamper-evident physical QR signatures at rack & port level.',
      tags: ['Ed25519 Keys', 'Tamper Evident', 'Zero Rogue Nodes'],
      icon: <Lock className="w-8 h-8 text-emerald-400" />,
      accent: 'border-emerald-500/40 bg-[#161c28] text-emerald-300 shadow-sm',
      size: 'w-56 h-56 sm:w-64 sm:h-64',
      offsetY: 'lg:translate-y-2'
    },
    {
      id: 4,
      title: 'Feature 4',
      name: 'Multi-Vendor AST Parser',
      description: 'Universal syntax normalization across Cisco IOS, Juniper Junos, Fortinet FortiOS, Arista EOS, and pfSense appliances.',
      tags: ['18+ OEM Parsers', 'Unified ACLs', 'Zero Vendor Lock-in'],
      icon: <Layers className="w-6 h-6 text-slate-300" />,
      accent: 'border-slate-700 bg-[#161c28] text-slate-300 shadow-sm',
      size: 'w-48 h-48 sm:w-56 sm:h-56',
      offsetY: 'lg:translate-y-6'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 cyber-grid relative overflow-x-hidden">
      
      {/* Top Browser Bar matching wireframe: "homepage" */}
      <div className="w-full bg-[#131722] border-b border-slate-800 text-xs text-slate-400 py-2 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-400">
            <span className="text-slate-500">https://</span>
            <span className="text-white font-semibold">sentry.network/home</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser.name}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs text-cyan-400 hover:text-white cursor-pointer"
              >
                Sign In
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => onOpenAuth('signup')}
                className="text-xs text-slate-300 hover:text-cyan-400 cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col justify-between relative z-10">
        
        {/* ========================================================= */}
        {/* 1. TOP LEFT: "Name + logo" (Matching wireframe box)       */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          
          <div className="p-3 sm:p-4 rounded-2xl bg-[#161c28] border border-slate-700/80 hover:border-cyan-400/60 shadow-xl flex items-center gap-3.5 transition-all">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/25 via-blue-600/15 to-indigo-900/40 border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
              <Shield className="w-7 h-7 text-cyan-400" />
              <Cpu className="w-4 h-4 text-emerald-400 absolute" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  Sentry <span className="font-semibold text-slate-300">Shield</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700 font-mono font-bold uppercase">
                  SIH
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide font-mono">
                Autonomous Network Security Portal
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SIH Operational Mesh • Grid Status Normal</span>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 2. ARCHING STAT CARDS (xyz users, abc reports, etc.)      */}
        {/* ========================================================= */}
        <div className="mb-12">
          
          {/* Subtle Arch Layout Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className={`p-5 rounded-2xl bg-[#161c28] border ${stat.glow} backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform ${stat.tilt}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {stat.rawSketchText}
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {stat.number}
                </div>

                <p className="text-xs text-slate-400 mt-1 font-medium leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. CIRCULAR FEATURE NODES (Feature 1, 2, 3, 4)            */}
        {/* (Arranged in a wavy dynamic constellation matching sketch)*/}
        {/* ========================================================= */}
        <div className="my-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => setSelectedFeature(feature.id === selectedFeature ? null : feature.id)}
              className={`relative rounded-full border-2 p-6 flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-2xl cursor-pointer transition-all duration-500 hover:scale-110 group select-none ${feature.size} ${feature.accent} ${feature.offsetY}`}
            >
              {/* Outer decorative ring */}
              <div className="absolute inset-2 rounded-full border border-dashed border-white/10 animate-shield-rotate pointer-events-none"></div>

              {/* Icon */}
              <div className="mb-2 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Wireframe Title: "Feature 1", "Feature 2", etc. */}
              <div className="text-xs sm:text-sm font-mono font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
                {feature.title}
              </div>

              {/* Sub-name */}
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight mt-0.5 px-2">
                {feature.name}
              </h3>

              {/* Description scribble / lines as drawn in sketch */}
              <div className="w-16 h-1 my-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-60"></div>
              
              <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-2 px-3 leading-snug hidden sm:block">
                {feature.description}
              </p>

              {/* Interactive badge */}
              <span className="mt-2 text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-slate-300 border border-white/10">
                Click to inspect
              </span>
            </div>
          ))}
        </div>

        {/* Expanded Feature Telemetry Modal/Drawer if clicked */}
        {selectedFeature !== null && (
          <div className="max-w-2xl mx-auto w-full p-5 rounded-2xl bg-[#1a2130] border border-cyan-500/40 shadow-2xl mb-8 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                {features[selectedFeature - 1].title} Diagnostics
              </span>
              <h4 className="text-base font-bold text-white">
                {features[selectedFeature - 1].name}
              </h4>
              <p className="text-xs text-slate-300">
                {features[selectedFeature - 1].description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {features[selectedFeature - 1].tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedFeature(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 shrink-0 cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. BOTTOM CENTER: "explore" Button                        */}
        {/* (Matching the large centered rectangular explore button)  */}
        {/* ========================================================= */}
        <div className="mt-6 mb-4 flex flex-col items-center justify-center">
          
          <button
            onClick={onExplore}
            className="w-full sm:w-80 py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base sm:text-lg tracking-widest uppercase shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 cursor-pointer border border-cyan-300/40"
          >
            <Compass className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '10s' }} />
            <span>explore</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>

          <p className="text-xs text-slate-400 font-mono mt-3 text-center">
            Tap explore to launch the full network topology & compliance dashboard
          </p>

        </div>

      </div>

    </div>
  );
};
