import React from 'react';
import { 
  Server, 
  FileCheck2, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Terminal, 
  FileText, 
  Activity 
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface HomePageViewProps {
  onBackToLanding?: () => void;
  onExplore?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
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
    icon: <Layers className="w-5 h-5 text-[var(--accent)]" />,
    title: 'Multi-Vendor AST Normalization',
    description: 'Universal syntax parser translating heterogeneous device configurations into unified security models without vendor lock-in.'
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />,
    title: 'Deterministic Benchmark Auditing',
    description: 'Strict programmatic evaluation against CIS & NIST baselines with reproducible 0–100 scoring and zero hallucinations.'
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />,
    title: 'Offline CVE Threat Intelligence',
    description: 'Built-in CVE database correlating misconfigurations (Telnet, weak crypto, permissive ACLs) with actual CVSS threat metrics.'
  },
  {
    icon: <Activity className="w-5 h-5 text-[var(--cyan-telemetry)]" />,
    title: 'Continuous Drift Detection',
    description: 'Identifies unauthorized administrative protocol changes, insecure SNMP strings, and boundary policy deviations.'
  },
  {
    icon: <Terminal className="w-5 h-5 text-[var(--text-primary)]" />,
    title: 'One-Click Remediation Playbooks',
    description: 'Generates ready-to-deploy, vendor-specific CLI configuration blocks to patch identified gaps without manual research.'
  },
  {
    icon: <FileText className="w-5 h-5 text-[var(--text-secondary)]" />,
    title: 'Auditor-Certified PDF Export',
    description: 'Server-side ReportLab document generator with cryptographic Ed25519 verification QR tags for compliance proof.'
  }
];

export const HomePageView: React.FC<HomePageViewProps> = ({
  onExplore,
  onOpenAuth,
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent)] selection:text-white relative overflow-x-hidden">
      
      {/* Standardized Navbar */}
      <Navbar activePage="home" onOpenAuth={onOpenAuth} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col space-y-10 relative z-10">
        
        {/* Header Hero Section */}
        <div className="sentry-card p-6 sm:p-8 relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="sentry-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
              <span>AUTONOMOUS NETWORK COMPLIANCE PLATFORM</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight uppercase">
              Enterprise Network Security <br className="hidden sm:inline" />
              <span className="text-[var(--text-secondary)] font-light">&amp; Compliance Hub</span>
            </h1>
            
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Sentry Shield automatically parses raw running-configurations from multi-vendor network switches, firewalls, and edge routers. It identifies security misconfigurations, cross-references known CVE vulnerabilities, and scores compliance against CIS Controls v8 and NIST SP 800-53 standards.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/upload.html"
                className="sentry-btn-primary"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Configuration</span>
              </a>

              <a
                href="/dashboard.html"
                className="sentry-btn-secondary"
              >
                <Server className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>SecOps Console</span>
              </a>

              <a
                href="/result.html"
                className="sentry-btn-secondary"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[var(--success)]" />
                <span>Security Results</span>
              </a>
            </div>
          </div>
        </div>

        {/* Section: Core Technical Capabilities */}
        <div>
          <div className="mb-5">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
              Core Technical Capabilities
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
              Automated Audit &amp; Threat Intelligence Engine
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORE_CAPABILITIES.map((cap, idx) => (
              <div 
                key={idx}
                className="sentry-card p-5 sentry-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-3">
                    {cap.icon}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5 font-mono">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Multi-Vendor Hardware Support */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                Multi-Vendor Compatibility
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mt-0.5">
                Supported Appliance Configuration Formats
              </h2>
            </div>
            <span className="sentry-tag bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              7 Active AST Parsers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {SUPPORTED_VENDORS.map((vendor, idx) => (
              <div
                key={idx}
                className="sentry-card p-4 sentry-card-hover"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-xs font-bold text-[var(--text-primary)] font-mono">{vendor.name}</div>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">{vendor.category}</div>
                <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[var(--text-muted)]">{vendor.format}</span>
                  <span className="text-[var(--success)] font-semibold">{vendor.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Security Frameworks Covered */}
        <div className="sentry-card p-6 sm:p-7">
          <div className="mb-5">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
              Regulatory &amp; Security Standards
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
              Deterministic Rule Mapping &amp; Compliance Rubrics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {COMPLIANCE_FRAMEWORKS.map((fw, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <div className="text-xs font-bold text-[var(--accent)] font-mono mb-1">{fw.code}</div>
                <div className="text-xs text-[var(--text-primary)] font-medium mb-1.5">{fw.scope}</div>
                <span className="sentry-tag bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  {fw.coverage}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Call to Action */}
        <div className="sentry-card p-6 sm:p-8 text-center flex flex-col items-center space-y-3">
          <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight">
            Ready to audit your network infrastructure?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl">
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
              className="sentry-btn-primary"
            >
              <span>Launch Configuration Audit Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </main>

      {/* Standardized Footer */}
      <Footer />

    </div>
  );
};
