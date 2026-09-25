import React from 'react';
import { 
  Shield, 
  Cpu, 
  Server, 
  FileCheck2, 
  ArrowRight, 
  Layers, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Terminal,
  FileText,
  Activity
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HomePageViewProps {
  onBackToLanding: () => void;
  onExplore: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  currentUser?: { name: string; email: string; role?: string } | null;
}

const SUPPORTED_VENDORS = [
  { name: 'Cisco IOS / IOS-XE', category: 'Router & Switch', format: '.cfg / .conf', status: 'Parser Active' },
  { name: 'Juniper Junos OS', category: 'Spine & Leaf Switch', format: 'hierarchical .conf', status: 'Parser Active' },
  { name: 'Fortinet FortiOS', category: 'Next-Gen Firewall', format: 'set-syntax .conf', status: 'Parser Active' },
  { name: 'Arista EOS', category: 'Datacenter Switch', format: '.cfg / text', status: 'Parser Active' },
  { name: 'Netgate pfSense', category: 'Edge Gateway / Firewall', format: 'XML configuration', status: 'Parser Active' },
  { name: 'Palo Alto PAN-OS', category: 'Enterprise Firewall', format: 'XML / set-format', status: 'Parser Active' },
  { name: 'Huawei VRP', category: 'Core Network Router', format: '.cfg / display current', status: 'Parser Active' },
];

const COMPLIANCE_FRAMEWORKS = [
  { code: 'CIS Controls v8', scope: 'Enterprise Infrastructure & Network Devices', coverage: 'Baseline Security' },
  { code: 'NIST SP 800-53', scope: 'Access Enforcement (AC-17) & Boundary Protection (SC-7)', coverage: 'Federal Standard' },
  { code: 'DISA STIG', scope: 'Department of Defense Network Infrastructure Hardening', coverage: 'High-Assurance' },
  { code: 'CERT-In Baselines', scope: 'National Cybersecurity Configuration Advisory', coverage: 'Statutory' },
];

const CORE_CAPABILITIES = [
  {
    icon: <Layers className="w-5 h-5 text-cyan-400" />,
    title: 'Multi-Vendor AST Normalization',
    description: 'Universal syntax parser translating heterogeneous device configurations into unified security models without vendor lock-in.'
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    title: 'Deterministic Benchmark Auditing',
    description: 'Strict programmatic evaluation against CIS & NIST baselines with reproducible 0–100 scoring and zero hallucinations.'
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    title: 'Offline CVE Threat Intelligence',
    description: 'Built-in CVE database correlating misconfigurations (Telnet, weak crypto, permissive ACLs) with actual CVSS threat metrics.'
  },
  {
    icon: <Activity className="w-5 h-5 text-cyan-400" />,
    title: 'Continuous Drift Detection',
    description: 'Identifies unauthorized administrative protocol changes, insecure SNMP strings, and boundary policy deviations.'
  },
  {
    icon: <Terminal className="w-5 h-5 text-emerald-400" />,
    title: 'One-Click Remediation Playbooks',
    description: 'Generates ready-to-deploy, vendor-specific CLI configuration blocks to patch identified gaps without manual research.'
  },
  {
    icon: <FileText className="w-5 h-5 text-slate-300" />,
    title: 'Auditor-Certified PDF Export',
    description: 'Server-side ReportLab document generator with cryptographic Ed25519 verification QR tags for compliance proof.'
  }
];

export const HomePageView: React.FC<HomePageViewProps> = ({
  onBackToLanding,
  onExplore,
  onOpenAuth,
  currentUser,
}) => {
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 cyber-grid relative overflow-x-hidden">
      
      {/* Top Browser Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#131722]/95 backdrop-blur-md border-b border-slate-800 text-xs text-slate-400 py-2.5 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/index.html" className="flex items-center gap-2 mr-1">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Shield className="w-4 h-4" />
              <Cpu className="w-2.5 h-2.5 text-emerald-400 absolute" />
            </div>
            <span className="font-bold text-white text-xs tracking-tight hidden lg:inline">
              Sentry <span className="text-slate-300 font-semibold">Shield</span>
            </span>
          </a>

          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-400">
            <span className="text-slate-500">https://</span>
            <span className="text-white font-semibold">sentry.network</span>
            <span className="text-cyan-400">/home</span>
          </div>
        </div>

        {/* Global Page Links & Theme Toggle */}
        <nav className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
          <a href="/index.html" className="text-slate-400 hover:text-cyan-400 transition-colors hidden md:inline">
            Landing
          </a>
          <a href="/dashboard.html" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Dashboard
          </a>
          <a href="/upload.html" className="text-cyan-400 hover:text-white transition-colors">
            Upload &amp; Audit
          </a>
          <a href="/result.html" className="text-slate-400 hover:text-cyan-400 transition-colors hidden sm:inline">
            Results
          </a>
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">{currentUser.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs text-cyan-400 hover:text-white cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
          <ThemeToggle />
        </nav>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col space-y-8 relative z-10">
        
        {/* Header Hero Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#161c28] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Autonomous Network Compliance Portal</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Network Security &amp; Compliance Hub
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Sentry Shield automatically parses raw running-configurations from multi-vendor network switches, firewalls, and edge routers. It identifies security misconfigurations, cross-references known CVE vulnerabilities, and scores compliance against CIS Controls v8 and NIST SP 800-53 standards.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/upload.html"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-cyan-500/10"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Configuration</span>
              </a>

              <a
                href="/dashboard.html"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Auditor Console</span>
              </a>

              <a
                href="/result.html"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>View Security Reports</span>
              </a>
            </div>
          </div>
        </div>

        {/* Section: Core Technical Capabilities */}
        <div>
          <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Core Technical Capabilities
            </h2>
            <p className="text-lg font-bold text-white mt-0.5">
              Automated Audit &amp; Threat Intelligence Engine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORE_CAPABILITIES.map((cap, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
                    {cap.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Multi-Vendor Hardware Support */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Multi-Vendor Compatibility
              </h2>
              <p className="text-lg font-bold text-white mt-0.5">
                Supported Network Device Formats
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-400">
              Zero Proprietary Agents
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {SUPPORTED_VENDORS.map((vendor, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#161c28] border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-white">{vendor.name}</div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[11px] text-slate-400">{vendor.category}</div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">{vendor.format}</span>
                  <span className="text-emerald-400 font-semibold">{vendor.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Security Frameworks Covered */}
        <div className="p-6 rounded-3xl bg-[#161c28] border border-slate-800">
          <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Regulatory &amp; Security Standards
            </h2>
            <p className="text-base font-bold text-white mt-0.5">
              Deterministic Rule Mapping &amp; Compliance Rubrics
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPLIANCE_FRAMEWORKS.map((fw, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div className="text-xs font-bold text-cyan-400 font-mono mb-1">{fw.code}</div>
                <div className="text-xs text-slate-300 font-medium mb-1.5">{fw.scope}</div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono border border-slate-800">
                  {fw.coverage}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Call to Action */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#161c28] via-[#1a2130] to-[#161c28] border border-slate-700/80 text-center flex flex-col items-center space-y-3">
          <h3 className="text-xl font-bold text-white">
            Ready to audit your network infrastructure?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Upload your configuration file or test our built-in vulnerable test configuration to inspect real-time detection, threat scoring, and CLI remediation.
          </p>
          <div className="pt-2">
            <a
              href="/upload.html"
              onClick={(e) => {
                if (onExplore) {
                  e.preventDefault();
                  onExplore();
                }
              }}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-cyan-500/10 transition-all"
            >
              <span>Launch Configuration Audit Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </main>

    </div>
  );
};
