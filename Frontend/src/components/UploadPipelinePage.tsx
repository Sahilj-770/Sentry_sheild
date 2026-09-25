import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  ArrowDown, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Terminal,
  Mail
} from 'lucide-react';
import { SegmentedStatusBar } from './SegmentedStatusBar';
import type { PipelineStage } from '../types';
import { ThemeToggle } from './ThemeToggle';

const INITIAL_STAGES: PipelineStage[] = [
  {
    id: 'upload',
    title: 'upload / drag drop',
    status: 'complete',
    progressPercent: 100,
    details: 'Config file parsed and integrity verified (SHA-256 validated)'
  },
  {
    id: 'detection',
    title: 'automatic detection',
    status: 'complete',
    progressPercent: 100,
    details: 'Identified syntax: Cisco IOS-XE 17.6 (Catalyst 9300 Core Layer)'
  },
  {
    id: 'compliance',
    title: 'compliance checker',
    status: 'in-progress',
    progressPercent: 50,
    details: 'Benchmarking against CIS Controls v8 & NIST SP 800-53 (50% evaluated)'
  },
  {
    id: 'vulnerability',
    title: 'vulnerability detection',
    status: 'in-progress',
    progressPercent: 10,
    details: 'Checking open ports, default SNMP strings, and CVE records'
  },
  {
    id: 'classification',
    title: 'security classification',
    status: 'not-started',
    progressPercent: 0,
    details: 'Categorizing assets by blast radius and data sensitivity'
  },
  {
    id: 'score',
    title: 'compliance score',
    status: 'not-started',
    progressPercent: 0,
    details: 'Calculating weighted compliance score index'
  },
  {
    id: 'report',
    title: 'generate report',
    status: 'not-started',
    progressPercent: 0,
    details: 'Synthesizing executive PDF summary & AI recommendations'
  }
];

import { uploadAndAuditConfig, isAuthenticated, getStoredUser, logoutUser } from '../utils/api';

const SAMPLE_CONFIGS: Record<string, { vendor: string; content: string }> = {
  'cisco-core-catalyst.cfg': {
    vendor: 'Cisco IOS-XE',
    content: `hostname AEGIS-ROUTER-01\nversion 17.9\ninterface GigabitEthernet0/0\n description WAN Interface\n ip address 192.168.1.1 255.255.255.0\n no shutdown\ninterface GigabitEthernet0/1\n description LAN Interface\n ip address 10.0.0.1 255.255.255.0\n no shutdown\nusername admin privilege 15 password admin123\nusername operator privilege 1 password operator123\nenable password cisco123\nip domain-name aegisnet.local\ncrypto key generate rsa modulus 1024\nip ssh version 1\nline vty 0 4\n password telnet123\n login\n transport input telnet\nline console 0\n password console123\n login\nip http server\nsnmp-server community public RO\nno logging console\nntp server 10.0.0.10\ncdp run\nsecurity passwords min-length 6\naccess-list 10 permit any\nend`
  },
  'fortigate-fw-cluster.conf': {
    vendor: 'Fortinet FortiOS',
    content: `config system global\n    set hostname FortiGate-FW-Cluster\n    set admin-sport 80\n    set admintimeout 480\nend\nconfig system admin\n    edit "admin"\n        set password "admin"\n    next\nend`
  },
  'juniper-qfx-spine.conf': {
    vendor: 'Juniper Junos',
    content: `system {\n    host-name Juniper-QFX-Spine;\n    services {\n        ssh {\n            root-login allow;\n        }\n        telnet;\n    }\n}\nsnmp {\n    community public {\n        authorization read-only;\n    }\n}`
  }
};

export const UploadPipelinePage: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [activeFileName, setActiveFileName] = useState<string>('cisco-core-catalyst.cfg');
  const [activeVendor, setActiveVendor] = useState<string>('Cisco IOS-XE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [auditLog, setAuditLog] = useState<string[]>([
    'System ready. Sample config "cisco-core-catalyst.cfg" loaded.',
    'Awaiting pipeline audit execution...'
  ]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Redirect if not authenticated, and load any previously selected vendor
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

  // Execute pipeline using real backend API
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

    // Reset stages
    setStages(stages.map(s => ({ ...s, status: 'not-started' as const, progressPercent: 0 })));

    try {
      // Determine file to audit
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

      // Call FastAPI endpoint
      const backendResult = await uploadAndAuditConfig(fileToAudit);

      const stepDelays = [
        { index: 1, percent: 100, msg: `Stage 2 Complete: Detected vendor "${backendResult.vendor}" (Host: ${backendResult.hostname || 'Network Node'})` },
        { index: 2, percent: 100, msg: `Stage 3 Complete: CIS benchmark scan finished. ${backendResult.findings.length} security rules evaluated.` },
        { index: 3, percent: 100, msg: `Stage 4 Complete: Risk level "${backendResult.risk.risk_level}". Identified ${backendResult.findings.length} vulnerabilities.` },
        { index: 4, percent: 100, msg: `Stage 5 Complete: Security classification tagged ${backendResult.hostname || 'Core Layer'} asset tier.` },
        { index: 5, percent: 100, msg: `Stage 6 Complete: Overall compliance score finalized at ${backendResult.risk.security_score}%.` },
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

          if (i === stepDelays.length - 1) {
            setIsAuditing(false);
            const auditPayload: any = {
              audit_id: backendResult.audit_id,
              fileName: backendResult.filename || activeFileName,
              fileSize: `${(fileToAudit.size / 1024).toFixed(1)} KB`,
              vendor: backendResult.vendor,
              deviceCount: 32,
              uploadedAt: new Date().toLocaleTimeString(),
              complianceScore: backendResult.risk.security_score,
              vulnerabilitiesFound: backendResult.findings.length,
              findings: backendResult.findings,
              risk: backendResult.risk,
              ai_explanation: backendResult.ai_explanation,
              stages: stages.map(s => ({ ...s, progressPercent: 100, status: 'complete' }))
            };
            localStorage.setItem('aegisnet_audit_data', JSON.stringify(auditPayload));
          }
        }, (i + 1) * 600);
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
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 cyber-grid relative overflow-x-hidden">
      
      {/* Top Browser Bar matching wireframe: "upload page" */}
      <div className="w-full bg-[#131722] border-b border-slate-800 text-xs text-slate-400 py-2 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-400">
            <span className="text-slate-500">https://</span>
            <span className="text-white font-semibold">sentry.network/upload</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
            Pipeline Engine v2.4
          </span>
        </div>

        {/* Global Page Links */}
        <nav className="flex items-center gap-4 text-xs font-semibold">
          <a href="/index.html" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Landing
          </a>
          <a href="/homepage.html" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Home
          </a>
          <a href="/dashboard.html" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Dashboard
          </a>
          <a href="/result.html" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Results
          </a>
          {getStoredUser() ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">{getStoredUser()?.name}</span>
              <button
                onClick={async () => { await logoutUser(); window.location.href = '/login.html'; }}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 hover:text-red-400 hover:border-red-800 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <a href="/login.html" className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 hover:text-white">
              Sign In
            </a>
          )}
          <ThemeToggle />
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col justify-between relative z-10">
        
        {/* Header matching wireframe */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Network Config <span className="text-cyan-400">Upload & Audit Pipeline</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Multi-stage compliance analysis & vulnerability verification
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunPipeline}
              disabled={isAuditing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-60"
            >
              <Play className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditing Pipeline...' : 'Run Pipeline Audit'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white cursor-pointer"
              title="Reset to sample state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`mb-8 p-6 rounded-3xl border-2 border-dashed transition-all text-center ${
            isDragOver 
              ? 'border-cyan-400 bg-cyan-950/40 shadow-xl' 
              : 'border-slate-800 bg-[#161c28] hover:border-cyan-500/50'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Current File:</span>
                  <span className="font-mono text-cyan-400">{activeFileName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                    {activeVendor}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drag and drop another config here, or choose a pre-loaded sample
                </p>
              </div>
            </div>

            {/* Quick Sample & File Browse Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              <label className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/50 text-[11px] text-cyan-300 hover:text-white font-mono cursor-pointer flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".cfg,.conf,.json,.yaml"
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
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white font-mono cursor-pointer"
              >
                Cisco Sample
              </button>
              <button
                onClick={() => handleSelectSample('fortigate-fw-cluster.conf', 'Fortinet FortiOS')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white font-mono cursor-pointer"
              >
                FortiGate Sample
              </button>
              <button
                onClick={() => handleSelectSample('juniper-qfx-spine.conf', 'Juniper Junos')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white font-mono cursor-pointer"
              >
                Juniper Sample
              </button>
            </div>
          </div>

          {/* Supported Vendors List */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
            <span className="text-slate-500 uppercase">Supported Engines:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Cisco IOS/IOS-XE', 'Juniper Junos', 'Fortinet FortiOS', 'Palo Alto PAN-OS', 'Huawei VRP', 'Arista EOS', 'pfSense Netgate'].map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {v}
                </span>
              ))}
            </div>
            <span className="text-cyan-400 font-semibold">Formats: .cfg, .conf, .json, .yaml</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 7 PIPELINE STAGES CONNECTED WITH ARROWS (from sketch)     */}
        {/* 1. upload / drag drop                                     */}
        {/* 2. automatic detection                                    */}
        {/* 3. compliance checker                                     */}
        {/* 4. vulnerability detection                                */}
        {/* 5. security classification                                */}
        {/* 6. compliance score                                       */}
        {/* 7. generate report                                        */}
        {/* ========================================================= */}
        <div className="space-y-3 mb-8">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              
              {/* Stage Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#161c28] border border-slate-800 hover:border-cyan-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
                
                {/* Left: Stage Index & Name */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-cyan-400 shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white capitalize">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {stage.details}
                    </p>
                  </div>
                </div>

                {/* Right: 10-Piece Segmented Status Bar as explicitly requested */}
                <SegmentedStatusBar progressPercent={stage.progressPercent} />

              </div>

              {/* Connecting Arrow between stages (matching the blue arrows in the sketch) */}
              {index < stages.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

            </React.Fragment>
          ))}
        </div>

        {/* Proceed to Result Page CTA if 100% complete */}
        {allComplete && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-cyan-950/70 to-blue-950/70 border-2 border-emerald-500/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
                  Audit Completed Successfully (100%)
                </h4>
                <p className="text-xs text-emerald-300">
                  All 7 pipeline stages have finalized. Ready to view full security report and AI recommendations.
                </p>
              </div>
            </div>

            <a
              href="/result.html"
              className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
            >
              <span>Present Security Report</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Live Diagnostics Log Drawer */}
        <div className="p-4 rounded-2xl bg-[#131722] border border-slate-800 text-xs font-mono text-slate-400 space-y-1 mb-8">
          <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Real-Time Pipeline Telemetry Log</span>
          </div>
          {auditLog.slice(-4).map((line, idx) => (
            <div key={idx} className="text-slate-300 text-[11px] leading-relaxed">
              {line}
            </div>
          ))}
        </div>

        {/* Footer matching wireframe: "contact us" */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400" />
            <a href="/index.html#contact" className="hover:text-cyan-400 font-semibold underline underline-offset-2">
              contact us
            </a>
            <span className="text-slate-600">|</span>
            <span>Sentry Security Team (team.sentry@sih-gov.in)</span>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            © {new Date().getFullYear()} Sentry Shield • Smart India Hackathon
          </div>
        </div>

      </div>

    </div>
  );
};
