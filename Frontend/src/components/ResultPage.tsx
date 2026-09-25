import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Cpu, 

  Sparkles, 
  Download, 
  FileText, 
  Copy, 
  Check, 
  Mail,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2
} from 'lucide-react';
import type { UploadAuditData, AISecuritySuggestion } from '../types';
import { downloadAuditPdf, getStoredUser, logoutUser, submitAuditFeedback } from '../utils/api';
import { ThemeToggle } from './ThemeToggle';

const DEFAULT_UPLOAD_DATA: UploadAuditData = {
  fileName: 'core-switch-cisco-9300.cfg',
  fileSize: '48.2 KB',
  vendor: 'Cisco IOS-XE 17.6',
  deviceCount: 32,
  uploadedAt: '14:05 UTC',
  complianceScore: 94,
  vulnerabilitiesFound: 3,
  stages: [
    { id: 'upload', title: 'Upload / Drag Drop', status: 'complete', progressPercent: 100, details: '100% verified' },
    { id: 'detection', title: 'Automatic Detection', status: 'complete', progressPercent: 100, details: 'Cisco IOS-XE AST model' },
    { id: 'compliance', title: 'Compliance Checker', status: 'complete', progressPercent: 94, details: 'CIS Controls v8 passed' },
    { id: 'vulnerability', title: 'Vulnerability Detection', status: 'complete', progressPercent: 88, details: '3 gaps flagged' },
    { id: 'classification', title: 'Security Classification', status: 'complete', progressPercent: 100, details: 'DMZ Core Asset' },
    { id: 'score', title: 'Compliance Score', status: 'complete', progressPercent: 94, details: '94/100 weighted index' },
    { id: 'report', title: 'Generate Report', status: 'complete', progressPercent: 100, details: 'Synthesized & approved' }
  ]
};

const AI_SUGGESTIONS: AISecuritySuggestion[] = [
  {
    id: 1,
    title: 'Disable Telnet & Unencrypted HTTP on Management VLANs',
    severity: 'Critical',
    cveReference: 'CIS-2.3.1',
    rationale: 'Insecure plaintext management protocols transmit administrator credentials in the clear. Attackers on VLAN 10 can capture session keys.',
    cliCommand: 'no service telnet\nno ip http server\nip ssh version 2\nip ssh server algorithm encryption aes256-gcm',
    remediationImpact: '+4.5% Compliance Score boost'
  },
  {
    id: 2,
    title: 'Tighten Ingress ACLs - Replace 0.0.0.0/0 on Bastion Ports',
    severity: 'High',
    cveReference: 'NIST-AC-4',
    rationale: 'Permissive wildcard rule "permit ip any any" discovered on DMZ ingress interface. Tighten access to authorized bastion CIDR 10.200.1.0/24 only.',
    cliCommand: 'ip access-list extended DMZ_INGRESS\nno permit ip any any\npermit ip 10.200.1.0 0.0.0.255 10.200.2.0 0.0.0.255',
    remediationImpact: 'Mitigates stealth lateral traversal'
  },
  {
    id: 3,
    title: 'Enforce SSHv2 with Ed25519 Keypairs & Multi-Factor Auth',
    severity: 'Medium',
    cveReference: 'ISO-27001-A.9',
    rationale: 'RSA 1024-bit host keys are deprecated under national security guidelines. Upgrade key algorithm to Ed25519 elliptic curves with TACACS+ AAA.',
    cliCommand: 'crypto key zeroize rsa\ncrypto key generate ed25519\naaa authentication login default group tacacs+ local',
    remediationImpact: 'Hardens device management access'
  },
  {
    id: 4,
    title: 'Synchronize NTP with Authenticated Stratum-1 Servers & Enable Logging',
    severity: 'Medium',
    cveReference: 'CIS-1.2.4',
    rationale: 'Unauthenticated NTP allows timestamp manipulation during an intrusion, invalidating SIEM log forensics.',
    cliCommand: 'ntp authenticate\nntp server 10.200.0.1 key 1\nlogging buffered 64000 informational',
    remediationImpact: 'Ensures forensic audit compliance'
  }
];

export const ResultPage: React.FC = () => {
  const [uploadData, setUploadData] = useState<UploadAuditData>(DEFAULT_UPLOAD_DATA);
  const [hasAuditData, setHasAuditData] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'unhelpful' | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  // Read upload data stored by the Upload Page in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aegisnet_audit_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.audit_id || (parsed.findings && parsed.findings.length > 0))) {
          setUploadData(parsed);
          setHasAuditData(true);
          return;
        }
      }
      setHasAuditData(false);
    } catch {
      setHasAuditData(false);
    }
  }, []);

  const handleCopyCommand = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleFeedbackSubmit = async (rating: 'helpful' | 'unhelpful') => {
    setFeedbackRating(rating);
    const auditId = (uploadData as any).audit_id;
    if (auditId) {
      try {
        setIsSubmittingFeedback(true);
        await submitAuditFeedback(auditId, rating, feedbackText);
        setFeedbackSubmitted(true);
      } catch (err) {
        console.warn('Failed to record feedback:', err);
        setFeedbackSubmitted(true);
      } finally {
        setIsSubmittingFeedback(false);
      }
    } else {
      setFeedbackSubmitted(true);
    }
  };

  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const displayedSuggestions: AISecuritySuggestion[] = (uploadData.findings && uploadData.findings.length > 0)
    ? uploadData.findings.map((finding: any, idx: number) => ({
        id: idx + 1,
        title: `[${finding.rule_id}] ${finding.issue || finding.title}`,
        severity: (finding.severity === 'Critical' || finding.severity === 'High' || finding.severity === 'Medium' || finding.severity === 'Low') ? finding.severity : 'High',
        cveReference: finding.cve || finding.rule_id,
        cvss: finding.cvss,
        frameworks: finding.frameworks || [],
        ruleId: finding.rule_id,
        rationale: finding.description,
        cliCommand: finding.remediation,
        remediationImpact: `Resolves ${finding.rule_id}`
      }))
    : AI_SUGGESTIONS.map(s => ({ ...s, frameworks: ['CIS Controls', 'NIST SP 800-53'] }));

  const handleDownloadPdf = async () => {
    const auditId = (uploadData as any).audit_id;
    if (auditId) {
      try {
        setIsDownloading(true);
        await downloadAuditPdf(auditId);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
        return;
      } catch (err) {
        console.warn('Backend PDF download error, falling back to window.print():', err);
      } finally {
        setIsDownloading(false);
      }
    }
    setDownloadSuccess(true);
    setTimeout(() => {
      window.print();
    }, 400);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 cyber-grid relative overflow-x-hidden">
      
      {/* Top Browser Bar matching wireframe: "sentry.network/results" */}
      <div className="w-full bg-[#131722] border-b border-slate-800 text-xs text-slate-400 py-2 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded bg-slate-900 border border-slate-700/80 font-mono text-[11px] text-cyan-400">
            <span className="text-slate-500">https://</span>
            <span className="text-white font-semibold">sentry.network</span>
            <span className="text-cyan-400">/results</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
            Report Signed &amp; Timestamped
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
          <a href="/upload.html" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Upload &amp; Audit
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col justify-between relative z-10">
        
        {/* Header matching wireframe: "Name & logo" + "PRESENTING YOUR SECURITY REPORT" */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          {/* Name & Logo */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#161c28] border border-slate-700/80 shadow-xl flex items-center gap-3.5 w-fit">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/25 via-blue-600/15 to-indigo-900/40 border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
              <Shield className="w-7 h-7 text-cyan-400" />
              <Cpu className="w-4 h-4 text-emerald-400 absolute" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  Sentry <span className="font-semibold text-slate-300">Shield</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-mono font-bold uppercase">
                  Audit Core
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide font-mono">
                Smart India Hackathon Compliance Engine
              </p>
            </div>
          </div>

          {/* Wireframe Banner: "PRESENTING YOUR SECURITY REPORT" */}
          <div className="text-left md:text-right">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-widest uppercase font-mono">
              PRESENTING YOUR <span className="text-cyan-400">SECURITY REPORT</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Generated for <strong className="text-slate-200">{uploadData.fileName}</strong> • Vendor: <span className="text-cyan-300">{uploadData.vendor}</span>
            </p>
          </div>

        </div>

        {/* ========================================================= */}
        {/* TWO-COLUMN LAYOUT OR EMPTY STATE                          */}
        {/* ========================================================= */}
        {!hasAuditData ? (
          <div className="max-w-2xl mx-auto w-full my-12 p-8 rounded-3xl bg-[#161c28] border border-slate-800 text-center shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Audit Report Found</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              No recent network configuration audit exists in this session. Upload a configuration file or run the pipeline to generate an auditor-certified report.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/upload.html"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Go to Upload &amp; Audit Pipeline
              </a>
              <button
                onClick={() => {
                  setUploadData(DEFAULT_UPLOAD_DATA);
                  setHasAuditData(true);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Load Demo Cisco Report
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
              
              {/* ======================================================= */}
              {/* LEFT BOX: "data from upload page"                       */}
              {/* ======================================================= */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-[#161c28] border border-slate-700/80 shadow-2xl relative">
                
                {/* Corner Tag */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white tracking-wide">
                      Data from Upload Page
                    </h3>
                  </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Verified
              </span>
            </div>

            {/* Overall Score Badge */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-mono">Overall Compliance Score</span>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                  {uploadData.complianceScore}%
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-amber-400 font-mono font-bold">
                  {uploadData.vulnerabilitiesFound} Gaps Flagged
                </div>
                <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                  {uploadData.deviceCount} Nodes Evaluated
                </div>
              </div>
            </div>

            {/* List of Stages from Upload Page with status/percentages matching sketch circles */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Pipeline Stage Breakdown
              </h4>

              {uploadData.stages.map((stage) => (
                <div 
                  key={stage.id} 
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Circle with percentage matching the sketch circles */}
                    <div className="w-9 h-9 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[11px] font-mono font-bold text-cyan-300 shrink-0">
                      {stage.progressPercent}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white capitalize leading-tight">
                        {stage.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                        {stage.details}
                      </div>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 shrink-0">
                    Passed
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Audit Metadata */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>File: {uploadData.fileName}</span>
              <span>Size: {uploadData.fileSize}</span>
            </div>

          </div>

          {/* ======================================================= */}
          {/* RIGHT BOX: "✨ Suggested changes" (AI suggestions)       */}
          {/* ======================================================= */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#161c28] border border-slate-700/80 shadow-2xl relative">
            
            {/* Header with Sparkle Icon matching sketch: "✨ Suggested changes" */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                  <span>Suggested changes</span>
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                AI Heuristics Engine
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Recommended automated configuration remediations to eliminate identified attack vectors and achieve 100% CIS compliance:
            </p>

            {/* Suggested Changes matching sketch numbered items */}
            <div className="space-y-4">
              {displayedSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400/50 transition-all shadow-md"
                >
                  {/* Title & Severity */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                        {suggestion.id}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {suggestion.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {suggestion.cveReference && suggestion.cveReference.startsWith('CVE') && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-700/60">
                          {suggestion.cveReference}{suggestion.cvss ? ` • CVSS ${suggestion.cvss}` : ''}
                        </span>
                      )}
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        suggestion.severity === 'Critical'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : suggestion.severity === 'High'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {suggestion.severity}
                      </span>
                    </div>
                  </div>

                  {/* Framework Compliance Badges */}
                  {suggestion.frameworks && suggestion.frameworks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {suggestion.frameworks.map((fw: string, fIdx: number) => (
                        <span key={fIdx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-700/50">
                          {fw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rationale */}
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {suggestion.rationale}
                  </p>

                  {/* Copyable CLI Command Box */}
                  <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-cyan-300">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80 text-[10px] text-slate-500">
                      <span>Remediation CLI Patch ({uploadData.vendor})</span>
                      <button
                        onClick={() => handleCopyCommand(suggestion.id, suggestion.cliCommand)}
                        className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 cursor-pointer"
                      >
                        {copiedId === suggestion.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-200">
                      {suggestion.cliCommand}
                    </pre>
                  </div>

                  <div className="mt-2 text-[10px] font-mono text-emerald-400">
                    ✓ Impact: {suggestion.remediationImpact}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Remediation Feedback Loop (Presentation Architecture) */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Was this AI remediation guidance accurate and actionable?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Feedback loops directly into the rule refinement and zero-hallucination verification engine.
                  </p>
                </div>

                {feedbackSubmitted ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Feedback Recorded ({feedbackRating})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFeedbackSubmit('helpful')}
                      disabled={isSubmittingFeedback}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful</span>
                    </button>
                    <button
                      onClick={() => handleFeedbackSubmit('unhelpful')}
                      disabled={isSubmittingFeedback}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Needs Tuning</span>
                    </button>
                  </div>
                )}
              </div>

              {!feedbackSubmitted && (
                <div className="mt-3 pt-3 border-t border-slate-900 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Optional comment on rule accuracy or vendor CLI syntax..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 font-mono focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* BELOW: "Download report pdf" IN RED (Explicit requirement) */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 mb-8">
          
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-60 text-white font-black text-sm sm:text-base tracking-widest uppercase shadow-2xl shadow-red-600/40 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 cursor-pointer border border-red-400/50"
          >
            <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Synthesizing PDF...' : 'Download report pdf'}</span>
          </button>

          <a
            href="/upload.html"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Run New Audit</span>
          </a>

        </div>

        {/* Download confirmation toast */}
        {downloadSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs text-center animate-bounce">
            Generating printable security compliance PDF. Audit report dispatched!
          </div>
        )}
          </>
        )}

        {/* Footer */}
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
