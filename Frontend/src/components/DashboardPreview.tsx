import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Server, 
  Search
} from 'lucide-react';
import type { AuditDevice } from '../types';

const SAMPLE_DEVICES: AuditDevice[] = [
  {
    hostname: 'core-sw01.sih.net',
    vendor: 'Cisco IOS-XE',
    model: 'Catalyst 9300',
    ip: '10.200.1.1',
    complianceScore: 98,
    criticalGaps: 0,
    status: 'Compliant',
    lastScan: 'Just now'
  },
  {
    hostname: 'edge-gw-fw.sih.net',
    vendor: 'Fortinet FortiOS',
    model: 'FortiGate 100F',
    ip: '10.200.1.254',
    complianceScore: 92,
    criticalGaps: 1,
    status: 'Remediation Needed',
    lastScan: '2m ago'
  },
  {
    hostname: 'dist-spine02.sih.net',
    vendor: 'Juniper Junos',
    model: 'QFX5120',
    ip: '10.200.2.1',
    complianceScore: 100,
    criticalGaps: 0,
    status: 'Compliant',
    lastScan: '5m ago'
  },
  {
    hostname: 'leaf-tor-04.sih.net',
    vendor: 'Arista EOS',
    model: '7050SX3',
    ip: '10.200.3.4',
    complianceScore: 95,
    criticalGaps: 0,
    status: 'Compliant',
    lastScan: '12m ago'
  },
  {
    hostname: 'dmz-vpn-node.sih.net',
    vendor: 'pfSense',
    model: 'Netgate 6100',
    ip: '192.168.99.1',
    complianceScore: 88,
    criticalGaps: 2,
    status: 'Remediation Needed',
    lastScan: '18m ago'
  }
];

export const DashboardPreview: React.FC = () => {
  const [devices, setDevices] = useState<AuditDevice[]>(SAMPLE_DEVICES);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'findings' | 'logs'>('devices');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRunAudit = () => {
    setIsScanning(true);
    setTimeout(() => {
      setDevices(prev => 
        prev.map(d => ({
          ...d,
          complianceScore: Math.min(100, d.complianceScore + 4),
          criticalGaps: Math.max(0, d.criticalGaps - 1),
          status: d.criticalGaps <= 1 ? 'Compliant' : 'Remediation Needed',
          lastScan: 'Just now'
        }))
      );
      setIsScanning(false);
    }, 1200);
  };

  const filteredDevices = devices.filter(d => 
    d.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.ip.includes(searchQuery)
  );

  return (
    <section id="dashboard" className="py-20 bg-[#0f1117] border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Live Auditor Console
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Network Compliance <span className="text-cyan-400">Dashboard</span>
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Inspect verified device nodes, monitor CIS v8 benchmark compliance in real time, and trigger automated gap remedies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAudit}
              disabled={isScanning}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm hover:shadow-cyan-500/10 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Auditing Mesh...' : 'Run Network Scan (Demo)'}</span>
            </button>

            <button
              onClick={() => { window.location.href = '/dashboard.html'; }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Open Dashboard Console</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          <div className="p-5 rounded-2xl bg-[#161c28] border border-cyan-500/25 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Overall Compliance Score</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">96.8%</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span>↑ +4.2% since last automated cycle</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Active Network Devices</span>
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">148 Nodes</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Multi-vendor mesh verified
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Open Remediation Gaps</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">3 Flagged</div>
            <div className="text-[11px] text-slate-400 mt-1">
              2 FortiOS drift, 1 NTP sync
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>QR Hardware Verified</span>
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400 font-mono">100%</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Cryptographic hash valid
            </div>
          </div>

        </div>

        {/* Dashboard Content Panel */}
        <div className="rounded-3xl bg-[#161c28] border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Table Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('devices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'devices' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Network Nodes ({filteredDevices.length})
              </button>
              <button
                onClick={() => setActiveTab('findings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'findings' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Active CIS Findings (3)
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'logs' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Real-Time Audit Log
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by hostname or IP..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

          </div>

          {/* Table or Viewport */}
          {activeTab === 'devices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">Device Hostname</th>
                    <th className="py-3.5 px-4">Vendor & Model</th>
                    <th className="py-3.5 px-4">Management IP</th>
                    <th className="py-3.5 px-4">Compliance</th>
                    <th className="py-3.5 px-4">Audit Status</th>
                    <th className="py-3.5 px-4 text-right">Last Audited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDevices.map((device, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-semibold text-white flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{device.hostname}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{device.vendor}</div>
                        <div className="text-[11px] text-slate-500">{device.model}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {device.ip}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                device.complianceScore >= 95 ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${device.complianceScore}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-bold">
                            {device.complianceScore}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          device.status === 'Compliant'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            device.status === 'Compliant' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                          }`}></span>
                          {device.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {device.lastScan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-amber-300">CIS 2.3.1: Telnet Service Active on edge-gw-fw.sih.net</div>
                  <p className="text-slate-300">Insecure plaintext management protocol detected on management interface. Remediation: Disable telnet, enforce SSHv2 with Ed25519 keypair only.</p>
                  <div className="font-mono text-cyan-400 pt-1 text-[11px]">$ sentry-cli fix --target edge-gw-fw --rule CIS-2.3.1 --auto</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-amber-300">NIST SP 800-53 AC-4: Unrestricted Ingress Port on dmz-vpn-node</div>
                  <p className="text-slate-300">Permissive wildcard allow rule 0.0.0.0/0 on port 8080. Recommended restriction to authorized bastion CIDR.</p>
                  <div className="font-mono text-cyan-400 pt-1 text-[11px]">$ sentry-cli acl-patch --device dmz-vpn-node --tighten</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-5 font-mono text-xs text-slate-300 bg-slate-950/70 space-y-1.5">
              <div className="text-slate-500">[13:34:02 UTC] [CORE-DISPATCH] Starting scheduled automated CIS mesh inspection...</div>
              <div className="text-emerald-400">[13:34:05 UTC] [CIS-EVAL] dist-spine02.sih.net: 184/184 benchmark items passed. (100%)</div>
              <div className="text-cyan-400">[13:34:08 UTC] [QR-VERIFY] Hardware chassis hash Ed25519 authenticated for Catalyst 9300.</div>
              <div className="text-amber-400">[13:34:11 UTC] [DRIFT-ALERT] Configuration drift noticed on FortiGate 100F (NTP stratum mismatch).</div>
              <div className="text-cyan-300">[13:34:15 UTC] [AI-REASON] Auto-generating synthetic remediation playbook for SecOps approval...</div>
              <div className="text-emerald-400">[13:34:20 UTC] [MESH-SECURE] Robot shield verification status: SECURED & MONITORED.</div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
