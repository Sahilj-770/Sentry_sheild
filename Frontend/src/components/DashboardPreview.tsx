import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
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
    <section id="dashboard" className="py-16 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="sentry-badge mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
              <span>LIVE AUDITOR CONSOLE PREVIEW</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight uppercase">
              Network Compliance <span className="text-[var(--text-secondary)] font-light">Console</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mt-1 max-w-xl">
              Inspect verified device nodes, monitor CIS v8 benchmark compliance in real time, and trigger automated gap remedies.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunAudit}
              disabled={isScanning}
              className="sentry-btn-primary"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Auditing Mesh...' : 'Simulate Scan (Demo)'}</span>
            </button>

            <a
              href="/dashboard.html"
              className="sentry-btn-secondary"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <div className="sentry-card p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1.5">
              <span>Overall Compliance Score</span>
              <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">96.8%</div>
            <div className="text-[11px] text-[var(--success)] mt-1 flex items-center gap-1 font-mono font-medium">
              <span>↑ +4.2% since scheduled cycle</span>
            </div>
          </div>

          <div className="sentry-card p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1.5">
              <span>Active Network Devices</span>
              <Server className="w-4 h-4 text-[var(--cyan-telemetry)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">148 Nodes</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
              Multi-vendor topology
            </div>
          </div>

          <div className="sentry-card p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1.5">
              <span>Open Remediation Gaps</span>
              <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--accent)] font-mono">3 Flagged</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
              2 FortiOS drift, 1 Telnet
            </div>
          </div>

          <div className="sentry-card p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] text-xs mb-1.5">
              <span>QR Hardware Verified</span>
              <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">100%</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
              Ed25519 hash signed
            </div>
          </div>

        </div>

        {/* Dashboard Content Panel */}
        <div className="sentry-card overflow-hidden">
          
          {/* Table Controls */}
          <div className="p-3.5 sm:p-4 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('devices')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                  activeTab === 'devices' 
                    ? 'bg-[var(--accent)] text-white' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                Network Nodes ({filteredDevices.length})
              </button>
              <button
                onClick={() => setActiveTab('findings')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                  activeTab === 'findings' 
                    ? 'bg-[var(--accent)] text-white' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                Active CIS Findings (3)
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors ${
                  activeTab === 'logs' 
                    ? 'bg-[var(--accent)] text-white' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                Real-Time Audit Log
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter hostname or IP..."
                className="sentry-input pl-8 py-1 text-xs"
              />
            </div>

          </div>

          {/* Table or Viewport */}
          {activeTab === 'devices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--text-secondary)]">
                <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="py-3 px-4">Device Hostname</th>
                    <th className="py-3 px-4">Vendor & Model</th>
                    <th className="py-3 px-4">Management IP</th>
                    <th className="py-3 px-4">Compliance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Last Audited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredDevices.map((device, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>{device.hostname}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[var(--text-primary)] font-medium">{device.vendor}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{device.model}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                        {device.ip}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                device.complianceScore >= 95 ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
                              }`}
                              style={{ width: `${device.complianceScore}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[var(--text-primary)]">
                            {device.complianceScore}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          device.status === 'Compliant'
                            ? 'bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]/30'
                            : 'bg-[var(--warning-muted)] text-[var(--warning)] border border-[var(--warning)]/30'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            device.status === 'Compliant' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
                          }`}></span>
                          {device.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[var(--text-muted)]">
                        {device.lastScan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="p-5 space-y-3">
              <div className="p-3.5 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-subtle)] flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-[var(--text-primary)] font-mono">CIS 2.3.1: Telnet Service Active on edge-gw-fw.sih.net</div>
                  <p className="text-[var(--text-secondary)]">Insecure plaintext management protocol detected on management interface. Remediation: Disable telnet, enforce SSHv2 with Ed25519 keypair only.</p>
                  <div className="font-mono text-[var(--text-muted)] pt-0.5 text-[11px]">$ sentry-cli fix --target edge-gw-fw --rule CIS-2.3.1 --auto</div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-muted)]/40 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-[var(--text-primary)] font-mono">NIST SP 800-53 AC-4: Insecure SNMP Community on dmz-vpn-node</div>
                  <p className="text-[var(--text-secondary)]">Public default SNMP community string configured. Recommended restriction to SNMPv3 with SHA authentication.</p>
                  <div className="font-mono text-[var(--text-muted)] pt-0.5 text-[11px]">$ sentry-cli snmp-harden --device dmz-vpn-node --v3-only</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-4 font-mono text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] space-y-1">
              <div className="text-[var(--text-muted)]">[13:34:02 UTC] [CORE-DISPATCH] Starting scheduled automated CIS mesh inspection...</div>
              <div className="text-[var(--success)]">[13:34:05 UTC] [CIS-EVAL] dist-spine02.sih.net: 184/184 benchmark items passed. (100%)</div>
              <div className="text-[var(--text-primary)]">[13:34:08 UTC] [QR-VERIFY] Hardware chassis hash Ed25519 authenticated for Catalyst 9300.</div>
              <div className="text-[var(--warning)]">[13:34:11 UTC] [DRIFT-ALERT] Configuration drift noticed on FortiGate 100F (NTP stratum mismatch).</div>
              <div className="text-[var(--text-secondary)]">[13:34:15 UTC] [AI-REASON] Auto-generating synthetic remediation playbook for SecOps approval...</div>
              <div className="text-[var(--success)]">[13:34:20 UTC] [MESH-SECURE] Robot shield verification status: SECURED &amp; MONITORED.</div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
