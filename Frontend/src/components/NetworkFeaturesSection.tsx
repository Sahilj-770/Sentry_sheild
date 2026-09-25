import React, { useState } from 'react';
import { 
  Shield, 
  QrCode, 
  Layers, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  Activity, 
  Cpu, 
  ArrowRight
} from 'lucide-react';
import type { ShieldFeature } from '../types';

const FEATURES: ShieldFeature[] = [
  {
    id: 'qr-verification',
    name: 'QR Verification',
    shortName: 'QR Verification',
    position: 'top',
    tag: 'Hardware Zero-Trust',
    description: 'Instant cryptographic physical device verification and tamper-proof inventory registration via dynamic QR tags.',
    details: [
      'Zero-touch hardware onboarding into SIH network mesh',
      'Tamper-evident cryptographic signature verification',
      'Prevents rogue hardware insertions at rack & switch level',
      'Mobile scanning app support for field technicians'
    ],
    metrics: [
      { label: 'Verify Time', value: '< 1.2s' },
      { label: 'Spoof Resistance', value: '100% Ed25519' },
    ]
  },
  {
    id: 'multi-vendor',
    name: 'Multi Vendor Support',
    shortName: 'Multi Vendor Support',
    position: 'top-right',
    tag: 'Heterogeneous Mesh',
    description: 'Universal syntax normalization and audit engine for Cisco IOS, Juniper Junos, FortiOS, Arista EOS, pfSense, and Mikrotik.',
    details: [
      'Abstract syntax tree parser for cross-vendor ACLs',
      'Unified policy mapping against national security baselines',
      'Automatic translation of rules across mixed OEM switches',
      'No proprietary agent installation required'
    ],
    metrics: [
      { label: 'Supported OEMs', value: '18+ Vendors' },
      { label: 'Config Parsers', value: 'Instant AST' },
    ]
  },
  {
    id: 'ai-analysis',
    name: 'AI Powered Analysis',
    shortName: 'AI Powered Analysis',
    position: 'bottom-right',
    tag: 'Neural Heuristics',
    description: 'Self-learning threat heuristics and LLM-assisted compliance gap discovery identifying stealth lateral paths.',
    details: [
      'Semantic reasoning over raw network running-configs',
      'Automated root-cause diagnosis for failed audit items',
      'Predictive drift warnings before configuration push',
      'Synthetic breach attack path simulation'
    ],
    metrics: [
      { label: 'Detection Rate', value: '99.8%' },
      { label: 'False Positives', value: '< 0.05%' },
    ]
  },
  {
    id: 'actionable-reports',
    name: 'Actionable Reports',
    shortName: 'Actionable Reports',
    position: 'bottom-left',
    tag: 'Remediation Ready',
    description: 'One-click executive compliance scorecards with copy-paste CLI remediation scripts and auditor-certified PDF exports.',
    details: [
      'Executive CISO dashboards & granular engineer CLI diffs',
      'One-click remediation scripts (Bash, Python, Ansible)',
      'Automated CIS Benchmark compliance stamps',
      'Historical audit trail for regulatory certifications'
    ],
    metrics: [
      { label: 'Remediation Speed', value: '5x Faster' },
      { label: 'Export Formats', value: 'PDF, JSON, CSV' },
    ]
  },
  {
    id: 'compliance-monitoring',
    name: 'Compliance Monitoring',
    shortName: 'Compliance Monitoring',
    position: 'top-left',
    tag: 'Continuous Audit',
    description: 'Real-time telemetry and continuous compliance tracking for CIS Controls, NIST SP 800-53, ISO 27001, and CERT-In.',
    details: [
      'Real-time configuration drift detection & alerting',
      'Automated baseline compliance auditing against CIS v8',
      'Zero-trust network access (ZTNA) policy validation',
      'Continuous audit trail logging for SIH verification'
    ],
    metrics: [
      { label: 'Audit Cycle', value: 'Continuous' },
      { label: 'Frameworks', value: 'CIS / NIST / ISO' },
    ]
  }
];

export const NetworkFeaturesSection: React.FC = () => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('compliance-monitoring');

  const selectedFeature = FEATURES.find(f => f.id === selectedFeatureId) || FEATURES[0];

  return (
    <section id="network-features" className="relative py-20 bg-[#0f1117] border-t border-slate-800/80 overflow-hidden">
      
      {/* Subtle Background Circuit Lines */}
      <div className="absolute inset-0 cyber-dot-grid opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header matching wireframe "Landing Pg 2.0" */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold mb-3">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Landing Pg 2.0 • Network Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Features in the <span className="text-cyan-400">Network</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-3">
            A unified constellation of five defensive security pillars interconnected directly with the Sentry AI Core.
          </p>
        </div>

        {/* The Network Diagram Area matching wireframe 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Constellation Network Graph (Left / Center) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            {/* Interactive SVG Network Constellation */}
            <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center p-4">
              
              {/* Background Network Connecting Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Hub-and-spoke Lines: Center (250, 250) to 5 shield nodes */}
                {/* 1. Top (QR Verification): 250, 85 */}
                <line x1="250" y1="250" x2="250" y2="85" stroke="url(#lineGrad)" strokeWidth="2.5" strokeDasharray="5 5" className="animate-pulse" />
                
                {/* 2. Top-Right (Multi Vendor Support): 395, 175 */}
                <line x1="250" y1="250" x2="395" y2="175" stroke="url(#lineGrad)" strokeWidth="2.5" strokeDasharray="5 5" className="animate-pulse" />

                {/* 3. Bottom-Right (AI Powered Analysis): 360, 390 */}
                <line x1="250" y1="250" x2="360" y2="390" stroke="url(#lineGrad)" strokeWidth="2.5" strokeDasharray="5 5" className="animate-pulse" />

                {/* 4. Bottom-Left (Actionable Reports): 140, 390 */}
                <line x1="250" y1="250" x2="140" y2="390" stroke="url(#lineGrad)" strokeWidth="2.5" strokeDasharray="5 5" className="animate-pulse" />

                {/* 5. Top-Left (Compliance Monitoring): 105, 175 */}
                <line x1="250" y1="250" x2="105" y2="175" stroke="url(#lineGrad)" strokeWidth="2.5" strokeDasharray="5 5" className="animate-pulse" />

                {/* Inter-shield Outer Network Perimeter Lines (as drawn in wireframe sketch) */}
                <path
                  d="M 105 175 L 250 85 L 395 175 L 360 390 L 140 390 Z"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Moving Packet / Particle across the active lines */}
                <circle cx="250" cy="167" r="4" fill="#00f2fe" filter="url(#neonGlow)">
                  <animate attributeName="cy" values="250;85;250" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="322" cy="212" r="4" fill="#38bdf8" filter="url(#neonGlow)">
                  <animate attributeName="cx" values="250;395;250" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="250;175;250" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="177" cy="212" r="4" fill="#10b981" filter="url(#neonGlow)">
                  <animate attributeName="cx" values="250;105;250" dur="3.5s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="250;175;250" dur="3.5s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* =================================================== */}
              {/* CENTER NODE: "Name" (Sentry Shield Core Hub)        */}
              {/* =================================================== */}
              <div 
                className="absolute z-30 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#161c28] border-2 border-cyan-500/60 shadow-lg shadow-cyan-500/10 cursor-pointer hover:border-cyan-400 transition-all text-center p-2 group"
                onClick={() => setSelectedFeatureId('compliance-monitoring')}
              >
                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-20"></div>
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-1 group-hover:scale-110 transition-transform">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                    Sentry
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase">
                    Audit Core
                  </span>
                </div>
              </div>

              {/* =================================================== */}
              {/* 5 SHIELD FEATURE NODES (Matching wireframe sketch)  */}
              {/* =================================================== */}

              {/* Node 1: QR Verification (Top Center) */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('qr-verification')}
                className={`absolute top-[4%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center cursor-pointer transition-all transform hover:scale-110 group ${
                  selectedFeatureId === 'qr-verification' ? 'scale-110' : 'scale-95 opacity-90'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<QrCode className="w-5 h-5" />}
                  label="QR Verification"
                  isSelected={selectedFeatureId === 'qr-verification'}
                />
              </button>

              {/* Node 2: Multi Vendor Support (Top Right) */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('multi-vendor')}
                className={`absolute top-[22%] right-[2%] z-30 flex flex-col items-center cursor-pointer transition-all transform hover:scale-110 group ${
                  selectedFeatureId === 'multi-vendor' ? 'scale-110' : 'scale-95 opacity-90'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<Layers className="w-5 h-5" />}
                  label="Multi Vendor Support"
                  isSelected={selectedFeatureId === 'multi-vendor'}
                />
              </button>

              {/* Node 3: AI Powered Analysis (Bottom Right) */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('ai-analysis')}
                className={`absolute bottom-[10%] right-[8%] z-30 flex flex-col items-center cursor-pointer transition-all transform hover:scale-110 group ${
                  selectedFeatureId === 'ai-analysis' ? 'scale-110' : 'scale-95 opacity-90'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<Sparkles className="w-5 h-5" />}
                  label="AI Powered Analysis"
                  isSelected={selectedFeatureId === 'ai-analysis'}
                />
              </button>

              {/* Node 4: Actionable Reports (Bottom Left) */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('actionable-reports')}
                className={`absolute bottom-[10%] left-[8%] z-30 flex flex-col items-center cursor-pointer transition-all transform hover:scale-110 group ${
                  selectedFeatureId === 'actionable-reports' ? 'scale-110' : 'scale-95 opacity-90'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<FileText className="w-5 h-5" />}
                  label="Actionable Reports"
                  isSelected={selectedFeatureId === 'actionable-reports'}
                />
              </button>

              {/* Node 5: Compliance Monitoring (Top Left) */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('compliance-monitoring')}
                className={`absolute top-[22%] left-[2%] z-30 flex flex-col items-center cursor-pointer transition-all transform hover:scale-110 group ${
                  selectedFeatureId === 'compliance-monitoring' ? 'scale-110' : 'scale-95 opacity-90'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<Shield className="w-5 h-5" />}
                  label="Compliance Monitoring"
                  isSelected={selectedFeatureId === 'compliance-monitoring'}
                />
              </button>

            </div>

            {/* Quick Helper Note */}
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Click on any shield node to inspect live security telemetry
            </p>
          </div>

          {/* Detailed Feature Inspector Card (Right Column) */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#161c28] border border-slate-700/80 shadow-2xl relative overflow-hidden transition-all duration-300">
              
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400/80"></div>

              {/* Node Identity Header */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono uppercase font-bold tracking-wider">
                      {selectedFeature.tag}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-wide mt-1">
                      {selectedFeature.name}
                    </h3>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {selectedFeature.description}
              </p>

              {/* Key Capabilities List */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Operational Capabilities
                </h4>
                <div className="space-y-2">
                  {selectedFeature.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Telemetry Metrics Bar */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-6">
                {selectedFeature.metrics.map((m, idx) => (
                  <div key={idx}>
                    <div className="text-[11px] text-slate-400">{m.label}</div>
                    <div className="text-base font-extrabold text-white font-mono mt-0.5">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  Status: <span className="text-emerald-400 font-bold">100% Active</span>
                </span>
                <a
                  href="#dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>Test in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

// =========================================================
// Shield Node Badge Component (Directly mimics drawn shield)
// =========================================================
interface ShieldNodeBadgeProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
}

const ShieldNodeBadge: React.FC<ShieldNodeBadgeProps> = ({
  icon,
  label,
  isSelected,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* SVG Shield Icon Frame matching the wireframe */}
      <div 
        className={`relative w-20 h-24 sm:w-24 sm:h-28 flex flex-col items-center justify-center p-2 transition-all duration-300 ${
          isSelected 
            ? 'filter drop-shadow-[0_0_8px_rgba(34,211,238,0.25)] scale-105' 
            : 'filter drop-shadow-[0_0_4px_rgba(15,23,42,0.5)] opacity-85 hover:opacity-100'
        }`}
      >
        {/* Shield SVG Vector Background */}
        <svg
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          <path
            d="M50 4 L92 20 C92 78, 72 105, 50 116 C28 105, 8 78, 8 20 Z"
            fill={isSelected ? "#161c28" : "#0f1117"}
            stroke={isSelected ? "#22d3ee" : "#334155"}
            strokeWidth={isSelected ? "2.5" : "1.5"}
          />
          {/* Inner Accent Line */}
          <path
            d="M50 12 L84 25 C84 72, 68 95, 50 104 C32 95, 16 72, 16 25 Z"
            fill="none"
            stroke={isSelected ? "rgba(0, 242, 254, 0.4)" : "rgba(51, 65, 85, 0.3)"}
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
        </svg>

        {/* Shield Contents */}
        <div className="relative z-10 flex flex-col items-center text-center px-1">
          <div className={`mb-1 transition-colors ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`}>
            {icon}
          </div>
          <span className={`text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2 ${
            isSelected ? 'text-cyan-200' : 'text-slate-300'
          }`}>
            {label}
          </span>
        </div>

        {/* Selected Indicator Ping */}
        {isSelected && (
          <div className="absolute -top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
        )}
      </div>
    </div>
  );
};
