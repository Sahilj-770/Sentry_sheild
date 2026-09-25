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
    id: 'compliance-monitoring',
    name: 'Compliance Monitoring',
    shortName: 'Compliance Monitoring',
    position: 'top-left',
    tag: 'Continuous Audit',
    description: 'Deterministic policy evaluation against CIS Controls v8, NIST SP 800-53, DISA STIG, and national cybersecurity baselines.',
    details: [
      'Programmatic AST evaluation of running configurations',
      'Real-time compliance drift detection and scoring',
      'Zero-trust access policy validation for administrative interfaces',
      'Automated evidence trail generation for audit readiness'
    ],
    metrics: [
      { label: 'Evaluation Mode', value: 'Deterministic' },
      { label: 'Coverage', value: 'CIS / NIST / STIG' },
    ]
  },
  {
    id: 'multi-vendor',
    name: 'Multi Vendor Support',
    shortName: 'Multi Vendor Support',
    position: 'top-right',
    tag: 'Universal Parser',
    description: 'Universal syntax normalization engine supporting Cisco IOS/IOS-XE, Juniper Junos, Fortinet FortiOS, Arista EOS, and pfSense.',
    details: [
      'Normalized abstract syntax trees across heterogeneous OEMs',
      'Unified policy mapping eliminating vendor-specific syntax quirks',
      'Automatic parsing of ACLs, cryptographic suites, and management planes',
      'Zero proprietary agent or local appliance requirement'
    ],
    metrics: [
      { label: 'Supported OEMs', value: '7 Core Vendors' },
      { label: 'Parser Engine', value: 'Lexical AST' },
    ]
  },
  {
    id: 'ai-analysis',
    name: 'AI Threat Intelligence',
    shortName: 'AI Threat Intelligence',
    position: 'bottom-right',
    tag: 'Vulnerability Correlation',
    description: 'Built-in CVE database correlating misconfigured services (Telnet, weak SNMP, cleartext credentials) with actual CVSS threat metrics.',
    details: [
      'Direct mapping of configuration flaws to CVE identifiers',
      'Automated risk level classification (Critical, High, Medium, Low)',
      'Deterministic 0–100 security posture scoring without AI hallucinations',
      'Threat telemetry linking severity to MITRE ATT&CK vectors'
    ],
    metrics: [
      { label: 'Knowledge Base', value: 'Authoritative CVEs' },
      { label: 'Scoring Precision', value: '100% Deterministic' },
    ]
  },
  {
    id: 'actionable-reports',
    name: 'Remediation Playbooks',
    shortName: 'Remediation Playbooks',
    position: 'bottom-left',
    tag: 'Zero-Drift Patching',
    description: 'Generates ready-to-deploy, vendor-specific CLI configuration blocks to safely close identified vulnerabilities.',
    details: [
      'Precise syntax tailored to target appliance OS version',
      'Step-by-step hardened replacement commands',
      'Auditor-certified PDF reports with Ed25519 verification QR codes',
      'One-click clipboard copy for immediate change execution'
    ],
    metrics: [
      { label: 'Remediation Format', value: 'Native CLI' },
      { label: 'Export Verification', value: 'ReportLab PDF' },
    ]
  },
  {
    id: 'qr-verification',
    name: 'Cryptographic QR Verification',
    shortName: 'QR Verification',
    position: 'top',
    tag: 'Report Integrity',
    description: 'Every generated compliance report embeds a cryptographically signed QR code verifying audit authenticity and timestamp.',
    details: [
      'Cryptographic hash verification of generated audit reports',
      'Prevents tampering or post-audit report alteration',
      'Offline verifiable by compliance inspectors and security juries',
      'Deterministic tie between configuration checksum and audit report'
    ],
    metrics: [
      { label: 'Signature Standard', value: 'Ed25519 / SHA256' },
      { label: 'Integrity Check', value: 'Tamper-Evident' },
    ]
  }
];

export const NetworkFeaturesSection: React.FC = () => {
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('compliance-monitoring');

  const selectedFeature = FEATURES.find(f => f.id === selectedFeatureId) || FEATURES[0];

  return (
    <section id="network-features" className="relative py-16 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="sentry-badge mb-3">
            <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>DEFENSIVE NETWORK TOPOLOGY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight uppercase">
            Defensive Security <span className="text-[var(--text-secondary)] font-light">Pillars</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-2">
            A unified constellation of defensive capabilities interconnected directly with the Sentry Audit Engine.
          </p>
        </div>

        {/* Network Diagram Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Constellation Network Graph */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center p-4">
              
              {/* Connecting Lines SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
                {/* Hub-and-spoke Lines */}
                <line x1="250" y1="250" x2="250" y2="85" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="250" y1="250" x2="395" y2="175" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="250" y1="250" x2="360" y2="390" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="250" y1="250" x2="140" y2="390" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="250" y1="250" x2="105" y2="175" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Perimeter Inter-node Links */}
                <path
                  d="M 105 175 L 250 85 L 395 175 L 360 390 L 140 390 Z"
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Moving Packet */}
                <circle cx="250" cy="167" r="3.5" fill="var(--accent)">
                  <animate attributeName="cy" values="250;85;250" dur="3s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* CENTER HUB */}
              <div 
                className="absolute z-30 flex flex-col items-center justify-center w-28 h-28 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-md cursor-pointer hover:border-[var(--accent)] transition-all text-center p-2 group"
                onClick={() => setSelectedFeatureId('compliance-monitoring')}
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--accent)] mb-1">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  SENTRY
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                  Audit Core
                </span>
              </div>

              {/* 5 SHIELD NODES */}
              {/* Node 1: QR Verification */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('qr-verification')}
                className={`absolute top-[4%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center cursor-pointer transition-all ${
                  selectedFeatureId === 'qr-verification' ? 'scale-105' : 'scale-95 opacity-80 hover:opacity-100'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<QrCode className="w-4 h-4" />}
                  label="QR Verification"
                  isSelected={selectedFeatureId === 'qr-verification'}
                />
              </button>

              {/* Node 2: Multi Vendor */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('multi-vendor')}
                className={`absolute top-[22%] right-[2%] z-30 flex flex-col items-center cursor-pointer transition-all ${
                  selectedFeatureId === 'multi-vendor' ? 'scale-105' : 'scale-95 opacity-80 hover:opacity-100'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<Layers className="w-4 h-4" />}
                  label="Multi Vendor"
                  isSelected={selectedFeatureId === 'multi-vendor'}
                />
              </button>

              {/* Node 3: AI Threat Intel */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('ai-analysis')}
                className={`absolute bottom-[10%] right-[8%] z-30 flex flex-col items-center cursor-pointer transition-all ${
                  selectedFeatureId === 'ai-analysis' ? 'scale-105' : 'scale-95 opacity-80 hover:opacity-100'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Threat Intel"
                  isSelected={selectedFeatureId === 'ai-analysis'}
                />
              </button>

              {/* Node 4: Remediation Playbooks */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('actionable-reports')}
                className={`absolute bottom-[10%] left-[8%] z-30 flex flex-col items-center cursor-pointer transition-all ${
                  selectedFeatureId === 'actionable-reports' ? 'scale-105' : 'scale-95 opacity-80 hover:opacity-100'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<FileText className="w-4 h-4" />}
                  label="Remediation"
                  isSelected={selectedFeatureId === 'actionable-reports'}
                />
              </button>

              {/* Node 5: Compliance Monitoring */}
              <button
                type="button"
                onClick={() => setSelectedFeatureId('compliance-monitoring')}
                className={`absolute top-[22%] left-[2%] z-30 flex flex-col items-center cursor-pointer transition-all ${
                  selectedFeatureId === 'compliance-monitoring' ? 'scale-105' : 'scale-95 opacity-80 hover:opacity-100'
                }`}
              >
                <ShieldNodeBadge 
                  icon={<Shield className="w-4 h-4" />}
                  label="Compliance"
                  isSelected={selectedFeatureId === 'compliance-monitoring'}
                />
              </button>

            </div>

            <p className="text-[11px] text-[var(--text-muted)] mt-2 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
              Select a node to inspect architectural specifications
            </p>
          </div>

          {/* Detailed Inspector Card */}
          <div className="lg:col-span-5">
            <div className="sentry-card p-6 sm:p-7 relative overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="sentry-tag bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {selectedFeature.tag}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                      {selectedFeature.name}
                    </h3>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
              </div>

              {/* Description */}
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mb-5">
                {selectedFeature.description}
              </p>

              {/* Capabilities */}
              <div className="space-y-2.5 mb-5">
                <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                  Engine Specifications
                </h4>
                <div className="space-y-2">
                  {selectedFeature.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <CheckCircle className="w-3.5 h-3.5 text-[var(--success)] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-5">
                {selectedFeature.metrics.map((m, idx) => (
                  <div key={idx}>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase">{m.label}</div>
                    <div className="text-sm font-bold text-[var(--text-primary)] font-mono mt-0.5">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  Status: <span className="text-[var(--success)] font-semibold">Active &amp; Tested</span>
                </span>
                <a
                  href="/homepage.html"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  <span>View Compatibility</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

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
    <div className={`px-3 py-2 rounded-lg border text-center transition-all ${
      isSelected 
        ? 'bg-[var(--bg-card)] border-[var(--accent)] text-[var(--text-primary)] shadow-sm' 
        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
    }`}>
      <div className={`flex justify-center mb-1 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-mono font-medium block whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};
