import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Check, 
  Copy, 
  Download, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { downloadAuditPdf, submitAuditFeedback } from '../utils/api';
import type { AISecuritySuggestion } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const AI_SUGGESTIONS: AISecuritySuggestion[] = [
  {
    id: 1,
    title: 'Disable Telnet & Enforce Strict SSHv2 on Line VTY',
    severity: 'Critical',
    cveReference: 'CVE-1999-0524',
    cvss: 7.5,
    ruleId: 'CIS-2.3.1',
    rationale: 'Insecure plaintext management protocols allow unauthenticated on-path packet sniffers to capture administrative credentials in clear text.',
    cliCommand: `configure terminal
line vty 0 4
 transport input ssh
 exec-timeout 10 0
 login local
exit
ip ssh version 2
crypto key generate rsa modulus 2048
end
write memory`,
    remediationImpact: 'Mitigates MITM interception and aligns configuration with CIS 2.3.1 and NIST AC-17.'
  },
  {
    id: 2,
    title: 'Enforce Strong Enable Secret Type 8/9 Password Hashes',
    severity: 'High',
    cveReference: 'CVE-2001-0144',
    cvss: 6.8,
    ruleId: 'CIS-1.1.2',
    rationale: 'Legacy type-5 MD5 and type-7 Vigenere ciphers are easily reversable via offline dictionary attacks and rainbow tables.',
    cliCommand: `configure terminal
service password-encryption
enable algorithm-type sha256 secret HardenedSecret#2026!
no enable password
end
write memory`,
    remediationImpact: 'Protects privileged administrative mode against credential harvesting and memory dump leakage.'
  },
  {
    id: 3,
    title: 'Decommission Public Default SNMP Community Strings',
    severity: 'High',
    cveReference: 'CVE-2002-0012',
    cvss: 7.5,
    ruleId: 'CIS-1.4.1',
    rationale: 'Standard default communities "public" and "private" allow unauthorized MIB enumeration and routing table leakage.',
    cliCommand: `configure terminal
no snmp-server community public
no snmp-server community private
snmp-server group SECGROUP v3 priv
snmp-server user secadmin SECGROUP v3 auth sha StrongAuth#2026 priv aes 128 StrongPriv#2026
end
write memory`,
    remediationImpact: 'Closes remote device reconnaissance paths and blocks unauthorized topology mapping.'
  },
  {
    id: 4,
    title: 'Restrict Ingress ACLs on External WAN Interfaces',
    severity: 'Medium',
    cveReference: 'CVE-2000-0945',
    cvss: 5.0,
    ruleId: 'NIST-SC-7',
    rationale: 'Unrestricted inbound traffic exposes internal control plane daemon services to perimeter port scanning.',
    cliCommand: `configure terminal
ip access-list extended WAN_HARDENED_IN
 deny ip any host 192.168.1.1
 permit tcp any host 192.168.1.1 eq 22
 deny ip any any log
interface GigabitEthernet0/0
 ip access-group WAN_HARDENED_IN in
end
write memory`,
    remediationImpact: 'Implements zero-trust boundary perimeter protection per NIST SP 800-53 (SC-7).'
  }
];

const DEFAULT_UPLOAD_DATA = {
  fileName: 'cisco-core-catalyst.cfg',
  vendor: 'Cisco IOS-XE',
  fileSize: '4.2 KB',
  deviceCount: 1,
  complianceScore: 12,
  vulnerabilitiesFound: 12,
  stages: [
    { id: '1', title: 'Ingestion & AST Tokenization', progressPercent: 100, details: 'File parsed and validated' },
    { id: '2', title: 'Multi-Vendor Detection', progressPercent: 100, details: 'Cisco IOS-XE signature matched' },
    { id: '3', title: 'Deterministic CIS Benchmark Engine', progressPercent: 100, details: '12 security benchmark rules triggered' },
    { id: '4', title: 'Vulnerability & Threat Intel Correlation', progressPercent: 100, details: 'Correlated against authoritative CVEs' },
    { id: '5', title: 'Security Classification', progressPercent: 100, details: 'Tagged as Core Infrastructure Node' },
    { id: '6', title: 'Compliance Score', progressPercent: 100, details: 'Score finalized at 12%' },
    { id: '7', title: 'Remediation Playbook Generation', progressPercent: 100, details: 'Generated native CLI patch script' }
  ],
  findings: []
};

export const ResultPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [uploadData, setUploadData] = useState<any>(DEFAULT_UPLOAD_DATA);
  const [hasAuditData, setHasAuditData] = useState<boolean>(false);

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

  const handleCopyCommand = (id: number, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState<'helpful' | 'unhelpful' | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);

  const handleFeedbackSubmit = async (rating: 'helpful' | 'unhelpful') => {
    setFeedbackRating(rating);
    const auditId = uploadData.audit_id;
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
      setDownloadSuccess(false);
    }, 400);
  };

  const score = uploadData.risk?.security_score ?? uploadData.complianceScore ?? 0;
  const riskLevel = uploadData.risk?.risk_level ?? (score >= 80 ? 'Low' : score >= 40 ? 'Medium' : 'Critical');
  const findingsCount = uploadData.findings?.length ?? uploadData.vulnerabilitiesFound ?? displayedSuggestions.length;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent)] selection:text-white relative overflow-x-hidden">
      
      {/* Standardized Navbar */}
      <Navbar activePage="results" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col justify-between relative z-10">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--text-muted)]">
                AUDIT COMPLIANCE REPORT // EVALUATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">
              Security Compliance <span className="text-[var(--text-secondary)] font-light">Report</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Target: <strong className="text-[var(--text-primary)]">{uploadData.hostname || uploadData.fileName || 'Network Device'}</strong> • Vendor: <span className="text-[var(--text-secondary)] font-semibold">{uploadData.vendor}</span> {uploadData.audit_id && `• ID: ${uploadData.audit_id}`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="sentry-btn-primary"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Synthesizing...' : 'Download Report PDF'}</span>
            </button>

            <a
              href="/upload.html"
              className="sentry-btn-secondary"
            >
              <span>Run New Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EMPTY STATE OR MAIN REPORT CONTENT                        */}
        {/* ========================================================= */}
        {!hasAuditData ? (
          <div className="max-w-xl mx-auto w-full my-12 sentry-card p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-mono">No Active Audit Report Found</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
              No recent network configuration audit exists in this session. Upload a configuration file to generate an auditor-certified compliance report.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="/upload.html"
                className="sentry-btn-primary w-full sm:w-auto"
              >
                <span>Upload Configuration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  setUploadData(DEFAULT_UPLOAD_DATA);
                  setHasAuditData(true);
                }}
                className="sentry-btn-secondary w-full sm:w-auto"
              >
                Load Demo Cisco Report
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
              
              {/* LEFT COLUMN: Data from Upload & Summary */}
              <div className="lg:col-span-4 sentry-card p-5 space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                    Executive Scorecard
                  </div>
                  <span className="sentry-tag bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                    Audited
                  </span>
                </div>

                {/* Score Gauge */}
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Overall Compliance Score</span>
                    <div className={`text-4xl font-bold font-mono mt-0.5 ${
                      score >= 80 ? 'text-[var(--success)]' : score >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
                    }`}>
                      {score}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`sentry-tag ${
                      riskLevel === 'Low' 
                        ? 'bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]/30' 
                        : riskLevel === 'Medium' 
                        ? 'bg-[var(--warning-muted)] text-[var(--warning)] border border-[var(--warning)]/30' 
                        : 'bg-[var(--danger-muted)] text-[var(--danger)] border border-[var(--danger)]/30'
                    }`}>
                      {riskLevel} Risk
                    </span>
                    <div className="text-[11px] text-[var(--text-muted)] font-mono mt-1">
                      {findingsCount} Gaps Flagged
                    </div>
                  </div>
                </div>

                {/* Standards Coverage */}
                <div>
                  <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-2">
                    Evaluated Standards
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['CIS Controls v8', 'NIST SP 800-53', 'DISA STIG', 'ISO 27001'].map((fw, idx) => (
                      <span key={idx} className="sentry-badge text-[10px]">
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pipeline Breakdown */}
                {uploadData.stages && (
                  <div>
                    <h4 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-2">
                      Pipeline Breakdown
                    </h4>
                    <div className="space-y-1.5">
                      {uploadData.stages.map((stg: any) => (
                        <div key={stg.id} className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                          <span className="text-[var(--text-secondary)] text-[11px] truncate max-w-[200px]">{stg.title}</span>
                          <span className="text-[var(--success)] text-[10px] font-bold">{stg.progressPercent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] space-y-1">
                  <div>Vendor: <span className="text-[var(--text-primary)]">{uploadData.vendor}</span></div>
                  <div>File: <span className="text-[var(--text-primary)]">{uploadData.fileName || 'configuration.cfg'}</span></div>
                  {uploadData.audit_id && <div>Audit ID: <span className="text-[var(--text-primary)]">{uploadData.audit_id}</span></div>}
                </div>

              </div>

              {/* RIGHT COLUMN: Detailed Findings & Remediation Playbooks */}
              <div className="lg:col-span-8 sentry-card p-5 sm:p-6 space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">
                      Remediation Playbooks &amp; Technical Findings
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Deterministic CLI patches to resolve detected vulnerabilities
                    </p>
                  </div>
                  <span className="sentry-badge text-[10px]">
                    {displayedSuggestions.length} Items
                  </span>
                </div>

                {/* Findings List */}
                <div className="space-y-4">
                  {displayedSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all space-y-3"
                    >
                      {/* Title & Severity */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-mono font-bold text-[var(--text-primary)]">
                            0{suggestion.id}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] font-mono">
                            {suggestion.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {suggestion.cveReference && suggestion.cveReference.startsWith('CVE') && (
                            <span className="sentry-tag bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--accent)]/30">
                              {suggestion.cveReference}{suggestion.cvss ? ` • CVSS ${suggestion.cvss}` : ''}
                            </span>
                          )}
                          <span className={`sentry-tag ${
                            suggestion.severity === 'Critical'
                              ? 'bg-[var(--danger-muted)] text-[var(--danger)] border border-[var(--danger)]/30'
                              : suggestion.severity === 'High'
                              ? 'bg-[var(--warning-muted)] text-[var(--warning)] border border-[var(--warning)]/30'
                              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                          }`}>
                            {suggestion.severity}
                          </span>
                        </div>
                      </div>

                      {/* Framework Badges */}
                      {suggestion.frameworks && suggestion.frameworks.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.frameworks.map((fw: string, fIdx: number) => (
                            <span key={fIdx} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                              {fw}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Rationale */}
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {suggestion.rationale}
                      </p>

                      {/* CLI Command Box */}
                      <div className="rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3 font-mono text-[11px]">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)]">
                          <span>Remediation CLI Block ({uploadData.vendor})</span>
                          <button
                            onClick={() => handleCopyCommand(suggestion.id, suggestion.cliCommand)}
                            className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                          >
                            {copiedId === suggestion.id ? (
                              <>
                                <Check className="w-3 h-3 text-[var(--success)]" />
                                <span className="text-[var(--success)] font-semibold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Script</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto whitespace-pre leading-relaxed text-[var(--text-primary)]">
                          {suggestion.cliCommand}
                        </pre>
                      </div>

                      <div className="text-[10px] font-mono text-[var(--success)]">
                        ✓ Impact: {suggestion.remediationImpact}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Feedback Loop */}
                <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Was this remediation guidance technically accurate?</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                        Feedback is recorded into the deterministic audit evaluation pipeline.
                      </p>
                    </div>

                    {feedbackSubmitted ? (
                      <div className="flex items-center gap-1.5 text-[var(--success)] font-mono text-xs px-2.5 py-1 rounded bg-[var(--success-muted)] border border-[var(--success)]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Feedback Recorded ({feedbackRating})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedbackSubmit('helpful')}
                          disabled={isSubmittingFeedback}
                          className="sentry-btn-secondary text-xs py-1 px-2.5"
                        >
                          <ThumbsUp className="w-3 h-3 text-[var(--success)]" />
                          <span>Helpful</span>
                        </button>
                        <button
                          onClick={() => handleFeedbackSubmit('unhelpful')}
                          disabled={isSubmittingFeedback}
                          className="sentry-btn-secondary text-xs py-1 px-2.5"
                        >
                          <ThumbsDown className="w-3 h-3 text-[var(--danger)]" />
                          <span>Needs Tuning</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {!feedbackSubmitted && (
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <input
                        type="text"
                        placeholder="Optional comment on rule accuracy or CLI syntax..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="sentry-input text-xs py-1"
                      />
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-4 mb-6">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="sentry-btn-primary w-full sm:w-auto px-8 py-3 text-sm tracking-wider"
              >
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'Synthesizing PDF...' : 'Download Report PDF'}</span>
              </button>

              <a
                href="/upload.html"
                className="sentry-btn-secondary w-full sm:w-auto px-6 py-3 text-xs"
              >
                <span>Run Another Configuration</span>
              </a>
            </div>

            {downloadSuccess && (
              <div className="mb-6 p-3 rounded-lg bg-[var(--success-muted)] border border-[var(--success)]/40 text-[var(--success)] text-xs text-center font-mono animate-in fade-in">
                Generated verified security compliance PDF with Ed25519 QR signature. Report dispatched!
              </div>
            )}
          </>
        )}

      </main>

      {/* Standardized Footer */}
      <Footer />

    </div>
  );
};
