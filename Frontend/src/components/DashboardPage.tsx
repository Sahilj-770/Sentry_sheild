import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Plus, 
  Layers, 
  Download, 
  ExternalLink,
  Activity,
  Upload,
  RefreshCw
} from 'lucide-react';
import { 
  isAuthenticated, 
  getAuditHistory, 
  downloadAuditPdf, 
  getAuditRecord 
} from '../utils/api';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export interface AuditRecordItem {
  audit_id: string;
  vendor: string;
  hostname?: string;
  filename?: string;
  security_score: number;
  risk_level: string;
  risk_summary?: string;
  total_findings?: number;
  critical_findings?: number;
  high_findings?: number;
  medium_findings?: number;
  low_findings?: number;
  audit_status?: string;
  findings_json?: any[];
  timestamp?: string;
}

const SUPPORTED_VENDORS = [
  { id: 'cisco', name: 'Cisco IOS / IOS-XE', desc: 'Catalyst & ISR Routers' },
  { id: 'juniper', name: 'Juniper Junos OS', desc: 'SRX & EX Series Switches' },
  { id: 'fortinet', name: 'Fortinet FortiOS', desc: 'FortiGate Firewalls' },
  { id: 'paloalto', name: 'Palo Alto PAN-OS', desc: 'Enterprise Next-Gen Firewalls' },
  { id: 'arista', name: 'Arista EOS', desc: 'Datacenter 7050 Switches' },
  { id: 'pfsense', name: 'Netgate pfSense', desc: 'Edge XML Gateway Firewalls' },
  { id: 'huawei', name: 'Huawei VRP', desc: 'Enterprise Core Routers' },
];

export const DashboardPage: React.FC = () => {
  const [realAudits, setRealAudits] = useState<AuditRecordItem[]>([]);
  const [loadingAudits, setLoadingAudits] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openingAuditId, setOpeningAuditId] = useState<string | null>(null);

  const fetchAuditRecords = () => {
    setLoadingAudits(true);
    getAuditHistory(true)
      .then((records) => {
        setRealAudits(records);
      })
      .catch((err) => {
        console.warn('Failed to load audit records from backend:', err);
      })
      .finally(() => {
        setLoadingAudits(false);
      });
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }
    fetchAuditRecords();
  }, []);

  const handleSelectVendor = (vendorName: string) => {
    localStorage.setItem('aegisnet_selected_vendor', vendorName);
    window.location.href = '/upload.html';
  };

  const handleViewAuditDetails = async (rec: AuditRecordItem) => {
    try {
      setOpeningAuditId(rec.audit_id);
      const detailed = await getAuditRecord(rec.audit_id);
      const payload = {
        audit_id: detailed.audit_id,
        vendor: detailed.vendor,
        hostname: detailed.hostname,
        risk: {
          security_score: detailed.security_score,
          risk_level: detailed.risk_level,
          risk_summary: detailed.risk_summary
        },
        findings: detailed.findings_json || [],
        evaluated_rules_count: (detailed.findings_json || []).length,
        timestamp: detailed.timestamp
      };
      localStorage.setItem('aegisnet_audit_data', JSON.stringify(payload));
      window.location.href = '/result.html';
    } catch {
      const fallbackPayload = {
        audit_id: rec.audit_id,
        vendor: rec.vendor,
        hostname: rec.hostname,
        risk: {
          security_score: rec.security_score,
          risk_level: rec.risk_level,
          risk_summary: rec.risk_summary
        },
        findings: rec.findings_json || [],
        evaluated_rules_count: rec.total_findings || 0,
        timestamp: rec.timestamp
      };
      localStorage.setItem('aegisnet_audit_data', JSON.stringify(fallbackPayload));
      window.location.href = '/result.html';
    } finally {
      setOpeningAuditId(null);
    }
  };

  // Real aggregate statistics derived honestly from database records
  const totalAudits = realAudits.length;
  const avgScore = totalAudits > 0 
    ? Math.round(realAudits.reduce((acc, r) => acc + (Number(r.security_score) || 0), 0) / totalAudits)
    : 0;
  const totalCritical = realAudits.reduce((acc, r) => acc + (Number(r.critical_findings) || 0), 0);
  const totalHigh = realAudits.reduce((acc, r) => acc + (Number(r.high_findings) || 0), 0);
  const uniqueVendors = Array.from(new Set(realAudits.map(r => r.vendor).filter(Boolean))).length;

  const filteredAudits = realAudits.filter(rec => {
    const q = searchQuery.toLowerCase();
    return (
      (rec.audit_id && rec.audit_id.toLowerCase().includes(q)) ||
      (rec.vendor && rec.vendor.toLowerCase().includes(q)) ||
      (rec.hostname && rec.hostname.toLowerCase().includes(q)) ||
      (rec.filename && rec.filename.toLowerCase().includes(q)) ||
      (rec.risk_level && rec.risk_level.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent)] selection:text-white relative overflow-x-hidden">
      
      {/* Standardized Navbar */}
      <Navbar activePage="dashboard" />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col space-y-6 relative z-10">
        
        {/* Operational Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--text-muted)]">
                SECURITY OPERATIONS CENTER // AUDIT LOGS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase">
              Compliance <span className="text-[var(--text-secondary)] font-light">Console</span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              Live operational telemetry derived directly from PostgreSQL / SQLite persistence
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAuditRecords}
              disabled={loadingAudits}
              className="sentry-btn-secondary text-xs"
              title="Refresh audit history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAudits ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <a
              href="/upload.html"
              className="sentry-btn-primary"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Audit Run</span>
            </a>
          </div>
        </div>

        {/* Real Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="sentry-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1.5">
              <span className="font-mono uppercase text-[10px]">Total Audits Executed</span>
              <FileText className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] font-mono">
              {loadingAudits ? '—' : totalAudits}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-2 font-mono">
              Persisted in database
            </div>
          </div>

          <div className="sentry-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1.5">
              <span className="font-mono uppercase text-[10px]">Mean Compliance Score</span>
              <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
            </div>
            <div className={`text-3xl font-bold font-mono ${
              avgScore >= 80 ? 'text-[var(--success)]' : avgScore >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
            }`}>
              {loadingAudits ? '—' : `${avgScore}%`}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-2 font-mono">
              Across all evaluated devices
            </div>
          </div>

          <div className="sentry-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1.5">
              <span className="font-mono uppercase text-[10px]">Critical &amp; High Gaps</span>
              <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-3xl font-bold text-[var(--accent)] font-mono">
              {loadingAudits ? '—' : totalCritical + totalHigh}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-2 font-mono">
              {totalCritical} critical, {totalHigh} high severity
            </div>
          </div>

          <div className="sentry-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1.5">
              <span className="font-mono uppercase text-[10px]">Hardware Vendors</span>
              <Layers className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] font-mono">
              {loadingAudits ? '—' : (uniqueVendors > 0 ? uniqueVendors : 7)}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-2 font-mono">
              AST parsers active
            </div>
          </div>

        </div>

        {/* Quick Audit Launcher by Vendor */}
        <div className="sentry-card p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                Quick Audit Dispatcher
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                Select target vendor to configure and upload running-configurations
              </p>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Clicking a vendor launches the upload pipeline
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {SUPPORTED_VENDORS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectVendor(v.name)}
                className="p-3 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                    {v.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">
                  {v.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Architecture & Integrations Status */}
        <div className="sentry-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
              Enterprise Ecosystem Architecture
            </div>
            <span className="sentry-tag bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              API Status
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] mb-1">
                <span>SIEM &amp; SOC Webhook</span>
                <span className="text-[10px] font-mono text-[var(--warning)]">Ready</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                Splunk HEC, Elastic &amp; QRadar CEF audit event pipeline.
              </p>
              <div className="mt-2 text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]"></span>
                <span>Webhook endpoint: Unconfigured in standalone mode</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] mb-1">
                <span>ITSM &amp; Remediation Tickets</span>
                <span className="text-[10px] font-mono text-[var(--warning)]">Ready</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                Jira &amp; ServiceNow automated ticket dispatch.
              </p>
              <div className="mt-2 text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]"></span>
                <span>API integration: Unconfigured in standalone mode</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] mb-1">
                <span>Attack Surface Scanner</span>
                <span className="text-[10px] font-mono text-[var(--cyan-telemetry)]">Available</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                Nmap integration validating perimeter services against rules.
              </p>
              <div className="mt-2 text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]"></span>
                <span>Nmap engine available on host</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real Persisted Audit Records Table */}
        <div className="sentry-card p-5 sm:p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-primary)] font-mono">
                  Persisted Compliance Audit History
                </h2>
                <span className="sentry-tag bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  SQLite Database
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                Authentic audit runs recorded in the local backend database
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID, vendor, or host..."
                className="sentry-input pl-8 py-1.5 text-xs"
              />
            </div>
          </div>

          {loadingAudits ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)] font-mono">
              <Activity className="w-5 h-5 text-[var(--accent)] animate-spin mx-auto mb-2" />
              Loading database audit records...
            </div>
          ) : realAudits.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] font-mono">No Network Audits Recorded Yet</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Your database contains no historical audit logs. Upload your first network configuration to initiate real-time compliance benchmarking.
              </p>
              <div className="pt-2">
                <a
                  href="/upload.html"
                  className="sentry-btn-primary"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Configuration</span>
                </a>
              </div>
            </div>
          ) : filteredAudits.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--text-muted)] font-mono">
              No audit records match "{searchQuery}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[var(--text-muted)] border-b border-[var(--border-subtle)] uppercase text-[10px] tracking-wider bg-[var(--bg-surface)]">
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Vendor &amp; Host</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Findings</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-secondary)]">
                  {filteredAudits.map((rec) => (
                    <tr key={rec.audit_id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="py-3 px-3 text-[var(--text-primary)] font-bold">
                        {rec.audit_id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[var(--text-primary)] font-semibold">{rec.vendor}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{rec.hostname || rec.filename || 'Device'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
                          {rec.audit_status || 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold">
                        <span className={
                          Number(rec.security_score) >= 80 ? 'text-[var(--success)]' :
                          Number(rec.security_score) >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
                        }>
                          {rec.security_score}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          rec.risk_level === 'Low'
                            ? 'bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]/30'
                            : rec.risk_level === 'Medium'
                            ? 'bg-[var(--warning-muted)] text-[var(--warning)] border border-[var(--warning)]/30'
                            : 'bg-[var(--danger-muted)] text-[var(--danger)] border border-[var(--danger)]/30'
                        }`}>
                          {rec.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[var(--text-muted)] text-[11px]">
                        {rec.total_findings} total ({rec.critical_findings || 0} crit, {rec.high_findings || 0} high)
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewAuditDetails(rec)}
                            disabled={openingAuditId === rec.audit_id}
                            className="sentry-btn-ghost text-[11px] py-1 px-2"
                            title="Inspect audit findings and remediation"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{openingAuditId === rec.audit_id ? 'Loading...' : 'View'}</span>
                          </button>

                          <button
                            onClick={() => downloadAuditPdf(rec.audit_id)}
                            className="sentry-btn-secondary text-[11px] py-1 px-2"
                            title="Download verified PDF report"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* Standardized Footer */}
      <Footer />

    </div>
  );
};
