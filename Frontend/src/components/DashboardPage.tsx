import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Cpu, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  FileText, 
  Download,
  AlertTriangle,
  Search,
  ExternalLink,
  Activity,
  Plus
} from 'lucide-react';
import { 
  getAuditHistory, 
  getAuditRecord, 
  downloadAuditPdf, 
  getStoredUser, 
  logoutUser, 
  isAuthenticated 
} from '../utils/api';
import type { UserProfile } from '../utils/api';
import { ThemeToggle } from './ThemeToggle';

const SUPPORTED_VENDORS = [
  { id: 'cisco', name: 'Cisco IOS / IOS-XE', desc: 'Enterprise Routers & Switches' },
  { id: 'juniper', name: 'Juniper Junos OS', desc: 'Datacenter & Core Switches' },
  { id: 'fortinet', name: 'Fortinet FortiOS', desc: 'Security Gateway & NGFW' },
  { id: 'arista', name: 'Arista EOS', desc: 'Cloud & Mesh Spine/Leaf' },
  { id: 'pfsense', name: 'Netgate pfSense', desc: 'Perimeter Firewall & VPN' },
  { id: 'paloalto', name: 'Palo Alto PAN-OS', desc: 'Next-Gen Perimeter Firewall' },
  { id: 'huawei', name: 'Huawei VRP', desc: 'Enterprise Core Router' },
];

export const DashboardPage: React.FC = () => {
  const [realAudits, setRealAudits] = useState<any[]>([]);
  const [loadingAudits, setLoadingAudits] = useState<boolean>(true);
  const [currentUser] = useState<UserProfile | null>(getStoredUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [openingAuditId, setOpeningAuditId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }
    setLoadingAudits(true);
    getAuditHistory(true)
      .then(records => {
        setRealAudits(Array.isArray(records) ? records : []);
      })
      .catch(() => {
        setRealAudits([]);
      })
      .finally(() => {
        setLoadingAudits(false);
      });
  }, []);

  const handleSelectVendor = (vendorName: string) => {
    localStorage.setItem('aegisnet_selected_vendor', vendorName);
    window.location.href = '/upload.html';
  };

  const handleViewAuditDetails = async (rec: any) => {
    try {
      setOpeningAuditId(rec.audit_id);
      const detailed = await getAuditRecord(rec.audit_id);
      const payload = {
        audit_id: detailed.audit_id,
        fileName: detailed.filename || `${detailed.hostname || 'device'}.cfg`,
        fileSize: 'Uploaded Config',
        vendor: detailed.vendor,
        deviceCount: 1,
        uploadedAt: detailed.timestamp || new Date().toLocaleTimeString(),
        complianceScore: detailed.security_score,
        vulnerabilitiesFound: detailed.total_findings || (detailed.findings ? detailed.findings.length : 0),
        findings: detailed.findings || [],
        risk: {
          security_score: detailed.security_score,
          risk_level: detailed.risk_level,
          high_findings: detailed.high_findings || 0,
          medium_findings: detailed.medium_findings || 0,
          low_findings: detailed.low_findings || 0
        },
        ai_explanation: detailed.risk_data?.ai_explanation,
        stages: []
      };
      localStorage.setItem('aegisnet_audit_data', JSON.stringify(payload));
      window.location.href = '/result.html';
    } catch (err) {
      console.error('Failed to load audit record details:', err);
      // Fallback: construct payload from row summary
      const fallbackPayload = {
        audit_id: rec.audit_id,
        fileName: rec.filename || `${rec.hostname || 'device'}.cfg`,
        fileSize: 'Database Record',
        vendor: rec.vendor,
        complianceScore: rec.security_score,
        vulnerabilitiesFound: rec.total_findings,
        findings: [],
        risk: {
          security_score: rec.security_score,
          risk_level: rec.risk_level,
          high_findings: rec.high_findings || 0,
          medium_findings: rec.medium_findings || 0,
          low_findings: rec.low_findings || 0
        }
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
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 cyber-grid relative overflow-x-hidden">
      
      {/* Top Browser Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#131722]/95 backdrop-blur-md border-b border-slate-800 text-xs text-slate-400 py-2.5 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-700/80 font-mono text-[11px] text-cyan-400">
            <span className="text-slate-500">https://</span>
            <span className="text-white font-semibold">sentry.network</span>
            <span className="text-cyan-400">/dashboard</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            SecOps Node Active
          </span>
        </div>

        {/* Global Page Links & Theme Toggle */}
        <nav className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
          <a href="/index.html" className="text-slate-400 hover:text-cyan-400 transition-colors hidden md:inline">
            Landing
          </a>
          <a href="/homepage.html" className="text-slate-400 hover:text-cyan-400 transition-colors hidden sm:inline">
            Home
          </a>
          <a href="/upload.html" className="text-cyan-400 hover:text-white transition-colors">
            Upload &amp; Audit
          </a>
          <a href="/result.html" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Results
          </a>
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">{currentUser.name}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold hidden sm:inline">
                {currentUser.role}
              </span>
              <button
                onClick={async () => { await logoutUser(); window.location.href = '/login.html'; }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-500/50 hover:bg-red-950/40 text-slate-200 hover:text-red-300 transition-colors cursor-pointer text-xs"
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
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col space-y-6 relative z-10">
        
        {/* Brand Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 shadow-md">
              <Shield className="w-6 h-6 text-cyan-400" />
              <Cpu className="w-3.5 h-3.5 text-emerald-400 absolute" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Sentry <span className="font-semibold text-slate-300">Shield</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono font-bold uppercase">
                  Auditor Console
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Centralized Network Compliance &amp; Vulnerability Records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/upload.html"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-cyan-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Audit Run</span>
            </a>
          </div>
        </div>

        {/* Real Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium">Total Audits Executed</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {loadingAudits ? '—' : totalAudits}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Persisted in database
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium">Mean Compliance Score</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={`text-3xl font-extrabold font-mono ${
              avgScore >= 80 ? 'text-emerald-400' : avgScore >= 40 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {loadingAudits ? '—' : `${avgScore}%`}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Across all evaluated devices
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium">Critical &amp; High Gaps</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              {loadingAudits ? '—' : totalCritical + totalHigh}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              {totalCritical} critical, {totalHigh} high severity
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-medium">Hardware Vendors</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {loadingAudits ? '—' : (uniqueVendors > 0 ? uniqueVendors : 7)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              AST parsers active
            </div>
          </div>

        </div>

        {/* Quick Audit Launcher by Vendor */}
        <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Quick Audit Dispatcher
              </h2>
              <p className="text-sm font-semibold text-white mt-0.5">
                Select target vendor to configure and upload running-configurations
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Clicking a vendor opens the upload pipeline
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {SUPPORTED_VENDORS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectVendor(v.name)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {v.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  {v.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Architecture & Integrations Status */}
        <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Enterprise Ecosystem Architecture
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono border border-slate-800">
              API Status
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                <span>SIEM &amp; SOC Webhook</span>
                <span className="text-[10px] font-mono text-amber-400">Ready</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Splunk HEC, Elastic &amp; QRadar CEF audit event pipeline.
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Webhook endpoint: Unconfigured in standalone mode</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                <span>ITSM &amp; Remediation Tickets</span>
                <span className="text-[10px] font-mono text-amber-400">Ready</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Jira &amp; ServiceNow automated ticket dispatch.
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>API integration: Unconfigured in standalone mode</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                <span>Attack Surface Scanner</span>
                <span className="text-[10px] font-mono text-cyan-400">Available</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Nmap integration validating perimeter services against rules.
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                <span>Nmap engine available on host</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real Persisted Audit Records Table */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#161c28] border border-slate-800 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Persisted Compliance Audit History
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                  SQLite Database
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Authentic audit runs recorded in the local backend database
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID, vendor, or host..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {loadingAudits ? (
            <div className="text-center py-12 text-xs text-slate-400 font-mono">
              <Activity className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
              Loading database audit records...
            </div>
          ) : realAudits.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 px-4 max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Network Audits Recorded Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your database contains no historical audit logs. Upload your first network configuration to initiate real-time compliance benchmarking.
              </p>
              <div className="pt-2">
                <a
                  href="/upload.html"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Configuration</span>
                </a>
              </div>
            </div>
          ) : filteredAudits.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-mono">
              No audit records match "{searchQuery}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/80 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Vendor &amp; Host</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Findings</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredAudits.map((rec) => (
                    <tr key={rec.audit_id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3 text-cyan-400 font-bold">
                        {rec.audit_id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-white font-semibold">{rec.vendor}</div>
                        <div className="text-[10px] text-slate-400">{rec.hostname || rec.filename || 'Device'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {rec.audit_status || 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold">
                        <span className={
                          Number(rec.security_score) >= 80 ? 'text-emerald-400' :
                          Number(rec.security_score) >= 40 ? 'text-amber-400' : 'text-red-400'
                        }>
                          {rec.security_score}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          rec.risk_level === 'Low'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : rec.risk_level === 'Medium'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-red-950/80 text-red-300 border border-red-800/60'
                        }`}>
                          {rec.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {rec.total_findings} total ({rec.critical_findings || 0} crit, {rec.high_findings || 0} high)
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewAuditDetails(rec)}
                            disabled={openingAuditId === rec.audit_id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-[11px] transition-colors cursor-pointer"
                            title="Inspect audit findings and remediation"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{openingAuditId === rec.audit_id ? 'Loading...' : 'View'}</span>
                          </button>

                          <button
                            onClick={() => downloadAuditPdf(rec.audit_id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors cursor-pointer"
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

    </div>
  );
};
