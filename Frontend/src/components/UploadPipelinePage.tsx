import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  ArrowDown, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  Terminal
} from 'lucide-react';
import { SegmentedStatusBar } from './SegmentedStatusBar';
import type { PipelineStage } from '../types';
import { uploadAndAuditConfig, isAuthenticated } from '../utils/api';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const INITIAL_STAGES: PipelineStage[] = [
  {
    id: '1',
    title: '1. Ingestion & AST Tokenization',
    status: 'complete',
    progressPercent: 100,
    details: 'Lexical parsing of router/switch running-configuration into structured AST.'
  },
  {
    id: '2',
    title: '2. Multi-Vendor Detection',
    status: 'complete',
    progressPercent: 100,
    details: 'Signature matching against Cisco IOS, Junos, FortiOS, Arista, and pfSense.'
  },
  {
    id: '3',
    title: '3. Deterministic CIS Benchmark Engine',
    status: 'in-progress',
    progressPercent: 60,
    details: 'Evaluating access lists, weak SSH/Telnet protocols, AAA, and SNMP strings.'
  },
  {
    id: '4',
    title: '4. Vulnerability & Threat Intel Correlation',
    status: 'not-started',
    progressPercent: 0,
    details: 'Cross-referencing configuration weaknesses against offline CVE & CVSS database.'
  },
  {
    id: '5',
    title: '5. Security Classification & Asset Tiering',
    status: 'not-started',
    progressPercent: 0,
    details: 'Tagging core vs edge boundary protection based on interface IP topology.'
  },
  {
    id: '6',
    title: '6. Compliance Score & Risk Posture Matrix',
    status: 'not-started',
    progressPercent: 0,
    details: 'Computing deterministic 0–100 compliance index and risk severity tiers.'
  },
  {
    id: '7',
    title: '7. Remediation Playbook & Verified PDF Gen',
    status: 'not-started',
    progressPercent: 0,
    details: 'Synthesizing CLI patch commands and Ed25519-signed verification report.'
  }
];

const SAMPLE_CONFIGS: Record<string, { content: string; vendor: string }> = {
  'cisco-core-catalyst.cfg': {
    vendor: 'Cisco IOS-XE',
    content: `hostname CORE-ROUTER-01
version 17.9
service password-encryption
enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0
!
username admin privilege 15 secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0
!
interface GigabitEthernet0/0
 description Primary WAN Uplink
 ip address 192.168.1.1 255.255.255.0
 no shutdown
!
line vty 0 4
 transport input ssh
 login local
 exec-timeout 10 0
!`
  },
  'fortigate-fw-cluster.conf': {
    vendor: 'Fortinet FortiOS',
    content: `config system global
    set hostname "FG-EDGE-01"
    set timezone 04
    set admin-sport 8443
    set admin-ssh-port 22
end
config system interface
    edit "port1"
        set mode static
        set ip 10.200.1.254 255.255.255.0
        set allowaccess ping https ssh
    next
end`
  },
  'juniper-qfx-spine.conf': {
    vendor: 'Juniper Junos',
    content: `system {
    host-name SPINE-SW-01;
    root-authentication {
        encrypted-password "$6$rounds=656000$test";
    }
    services {
        ssh {
            protocol-version v2;
        }
    }
}`
  }
};

export const UploadPipelinePage: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('cisco-core-catalyst.cfg');
  const [activeVendor, setActiveVendor] = useState<string>('Cisco IOS-XE');
  const [auditLog, setAuditLog] = useState<string[]>([
    'Pipeline initialized. Ready to upload device running configuration.',
    'Parser engine: Cisco IOS, Juniper Junos, Fortinet, Arista, pfSense, Palo Alto, Huawei.'
  ]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }
    const savedVendor = localStorage.getItem('aegisnet_selected_vendor');
    if (savedVendor) {
      setActiveVendor(savedVendor);
    }
  }, []);

  const allComplete = stages.every(s => s.progressPercent === 100);

  const handleRunPipeline = async () => {
    if (!isAuthenticated()) {
      setAuditLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ⚠️ Authentication Required: Please sign in with an Auditor or Admin account to run pipeline audits.`
      ]);
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
      return;
    }

    setIsAuditing(true);
    setAuditLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Initiating automated network audit pipeline via FastAPI...`]);

    setStages(stages.map(s => ({ ...s, status: 'not-started' as const, progressPercent: 0 })));

    try {
      let fileToAudit = selectedFile;
      if (!fileToAudit) {
        const sample = SAMPLE_CONFIGS[activeFileName] || SAMPLE_CONFIGS['cisco-core-catalyst.cfg'];
        fileToAudit = new File([sample.content], activeFileName, { type: 'text/plain' });
      }

      setStages(prev => {
        const n = [...prev];
        n[0] = { ...n[0], status: 'complete', progressPercent: 100, details: `File "${fileToAudit.name}" uploaded and parsed (${(fileToAudit.size / 1024).toFixed(1)} KB)` };
        return n;
      });
      setAuditLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Stage 1 Complete: Config file "${fileToAudit.name}" uploaded and tokenized.`]);

      const backendResult = await uploadAndAuditConfig(fileToAudit);

      const stepDelays = [
        { index: 1, percent: 100, msg: `Stage 2 Complete: Detected vendor "${backendResult.vendor}" (Host: ${backendResult.hostname || 'Network Node'})` },
        { index: 2, percent: 100, msg: `Stage 3 Complete: CIS benchmark scan finished. ${backendResult.findings.length} security rules evaluated.` },
        { index: 3, percent: 100, msg: `Stage 4 Complete: Risk level "${backendResult.risk.risk_level}". Identified ${backendResult.findings.length} vulnerabilities.` },
        { index: 4, percent: 100, msg: `Stage 5 Complete: Security classification tagged ${backendResult.hostname || 'Core Layer'} asset tier.` },
        { index: 5, percent: 100, msg: `Stage 6 Complete: Security score finalized at ${backendResult.risk.security_score}% | Compliance: ${backendResult.compliance_status || backendResult.risk.compliance_status || 'Evaluated'}.` },
        { index: 6, percent: 100, msg: `Stage 7 Complete: Security report generated with Audit ID ${backendResult.audit_id}.` }
      ];

      stepDelays.forEach((step, i) => {
        setTimeout(() => {
          setStages(prev => {
            const next = [...prev];
            next[step.index] = {
              ...next[step.index],
              progressPercent: 100,
              status: 'complete'
            };
            return next;
          });
          setAuditLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.msg}`]);

          if (step.index === 6) {
            setIsAuditing(false);
            localStorage.setItem('aegisnet_audit_data', JSON.stringify({
              ...backendResult,
              timestamp: new Date().toISOString()
            }));
          }
        }, (i + 1) * 500);
      });

    } catch (err: any) {
      setIsAuditing(false);
      setAuditLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Audit execution failed: ${err.message || 'Server connection error'}`
      ]);
    }
  };

  const handleReset = () => {
    setStages(INITIAL_STAGES);
    setSelectedFile(null);
    setAuditLog(['Pipeline reset to sample initial state.']);
  };

  const handleSelectSample = (name: string, vendor: string) => {
    setActiveFileName(name);
    setActiveVendor(vendor);
    setSelectedFile(null);
    setAuditLog(prev => [...prev, `Loaded sample configuration: ${name} (${vendor})`]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setActiveFileName(file.name);
      setAuditLog(prev => [...prev, `Dropped file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent)] selection:text-white relative overflow-x-hidden">
      
      {/* Standardized Navbar */}
      <Navbar activePage="upload" />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col justify-between relative z-10">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--text-muted)]">
                ANALYSIS PIPELINE ENGINE // v2.4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">
              Configuration <span className="text-[var(--text-secondary)] font-light">Audit Pipeline</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Multi-stage deterministic compliance analysis &amp; vulnerability correlation
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunPipeline}
              disabled={isAuditing}
              className="sentry-btn-primary"
            >
              <Play className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditing Pipeline...' : 'Run Pipeline Audit'}</span>
            </button>

            <button
              onClick={handleReset}
              className="sentry-btn-secondary p-2.5"
              title="Reset to sample state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`mb-6 p-5 sm:p-6 rounded-xl border border-dashed transition-all text-center ${
            isDragOver 
              ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' 
              : 'border-[var(--border-strong)] bg-[var(--bg-card)]'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span>Target File:</span>
                  <span className="font-mono text-[var(--accent)]">{activeFileName}</span>
                  <span className="sentry-tag bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    {activeVendor}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Drag and drop another config here, or load a pre-configured sample
                </p>
              </div>
            </div>

            {/* Quick Sample & File Browse Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <label className="sentry-btn-primary text-xs py-1.5 px-3 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".cfg,.conf,.json,.yaml,.txt,.xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                      setActiveFileName(file.name);
                      setAuditLog(prev => [...prev, `Selected file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`]);
                    }
                  }}
                />
              </label>

              <button
                onClick={() => handleSelectSample('cisco-core-catalyst.cfg', 'Cisco IOS-XE')}
                className="sentry-btn-secondary text-[11px] py-1.5 px-2.5 font-mono"
              >
                Cisco Sample
              </button>
              <button
                onClick={() => handleSelectSample('fortigate-fw-cluster.conf', 'Fortinet FortiOS')}
                className="sentry-btn-secondary text-[11px] py-1.5 px-2.5 font-mono"
              >
                FortiGate Sample
              </button>
              <button
                onClick={() => handleSelectSample('juniper-qfx-spine.conf', 'Juniper Junos')}
                className="sentry-btn-secondary text-[11px] py-1.5 px-2.5 font-mono"
              >
                Juniper Sample
              </button>
            </div>
          </div>

          {/* Supported Vendors List */}
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[var(--text-muted)]">
            <span className="uppercase font-bold">Active Parsers:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Cisco IOS/IOS-XE', 'Juniper Junos', 'Fortinet FortiOS', 'Palo Alto PAN-OS', 'Huawei VRP', 'Arista EOS', 'pfSense XML'].map((v, i) => (
                <span key={i} className="sentry-tag bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {v}
                </span>
              ))}
            </div>
            <span className="text-[var(--text-muted)]">Formats: .cfg, .conf, .json, .yaml, .txt, .xml</span>
          </div>
        </div>

        {/* 7 PIPELINE STAGES */}
        <div className="space-y-2.5 mb-6">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              
              {/* Stage Card */}
              <div className="sentry-card p-4 sm:p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                
                {/* Stage Index & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center font-mono font-bold text-xs text-[var(--text-primary)] shrink-0">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {stage.details}
                    </p>
                  </div>
                </div>

                {/* Segmented Status Bar */}
                <SegmentedStatusBar progressPercent={stage.progressPercent} />

              </div>

              {/* Connecting Indicator between stages */}
              {index < stages.length - 1 && (
                <div className="flex justify-center py-0.2">
                  <ArrowDown className="w-3.5 h-3.5 text-[var(--border-strong)]" />
                </div>
              )}

            </React.Fragment>
          ))}
        </div>

        {/* Proceed to Result Page CTA if 100% complete */}
        {allComplete && (
          <div className="mb-6 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--success)] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] border border-[var(--success)]/40 flex items-center justify-center text-[var(--success)] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[var(--text-primary)] font-mono">
                  Audit Completed Successfully (100%)
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  All 7 pipeline stages have finalized. Ready to inspect detailed security findings, CVE correlation, and CLI remediation.
                </p>
              </div>
            </div>

            <a
              href="/result.html"
              className="sentry-btn-primary shrink-0"
            >
              <span>Present Security Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Live Diagnostics Log Drawer */}
        <div className="sentry-card p-4 text-xs font-mono text-[var(--text-muted)] space-y-1 mb-6">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold mb-2">
            <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>REAL-TIME PIPELINE TELEMETRY LOG</span>
          </div>
          {auditLog.slice(-4).map((line, idx) => (
            <div key={idx} className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
              {line}
            </div>
          ))}
        </div>

      </main>

      {/* Standardized Footer */}
      <Footer />

    </div>
  );
};
