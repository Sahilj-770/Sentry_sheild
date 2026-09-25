import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Cpu, 
  Upload, 
  Server, 
  Award, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Layers,
  FileText,
  Download
} from 'lucide-react';
import { getAuditHistory, downloadAuditPdf, getStoredUser, logoutUser, isAuthenticated } from '../utils/api';
import type { UserProfile } from '../utils/api';
import { ThemeToggle } from './ThemeToggle';

const INITIAL_VENDORS = [
  { id: 'cisco', name: 'Cisco IOS / IOS-XE', devices: 12, compliance: 98 },
  { id: 'fortinet', name: 'Fortinet FortiOS', devices: 6, compliance: 92 },
  { id: 'juniper', name: 'Juniper Junos', devices: 4, compliance: 100 },
  { id: 'arista', name: 'Arista EOS', devices: 8, compliance: 95 },
  { id: 'pfsense', name: 'pfSense Netgate', devices: 2, compliance: 88 }
];

export const DashboardPage: React.FC = () => {
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [selectedVendor, setSelectedVendor] = useState('cisco');
  const [deviceCount, setDeviceCount] = useState(32);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorDeviceCount, setNewVendorDeviceCount] = useState(4);
  const [isLocked] = useState(true);
  const [realAudits, setRealAudits] = useState<any[]>([]);
  const [loadingAudits, setLoadingAudits] = useState<boolean>(false);
  const [currentUser] = useState<UserProfile | null>(getStoredUser());

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login.html';
      return;
    }
    setLoadingAudits(true);
    getAuditHistory()
      .then(records => setRealAudits(records))
      .catch(() => setRealAudits([]))
      .finally(() => setLoadingAudits(false));
  }, []);

  const currentVendorData = vendors.find(v => v.id === selectedVendor) || vendors[0];

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const id = newVendorName.toLowerCase().replace(/\s+/g, '-');
    const newEntry = {
      id,
      name: newVendorName.trim(),
      devices: Number(newVendorDeviceCount) || 1,
      compliance: 94
    };

    setVendors(prev => [...prev, newEntry]);
    setSelectedVendor(id);
    setDeviceCount(prev => prev + (Number(newVendorDeviceCount) || 1));
    setNewVendorName('');
    setShowAddVendorModal(false);

    // Persist to localStorage
    localStorage.setItem('aegisnet_selected_vendor', newEntry.name);
    localStorage.setItem('aegisnet_device_count', String(deviceCount + (Number(newVendorDeviceCount) || 1)));
  };

  const handleSelectVendor = (vendorId: string) => {
    setSelectedVendor(vendorId);
    const v = vendors.find(item => item.id === vendorId);
    if (v) {
      localStorage.setItem('aegisnet_selected_vendor', v.name);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 cyber-grid relative overflow-x-hidden">
      
      {/* Top Browser Bar matching wireframe: "sentry.network/dashboard" */}
      <div className="w-full bg-[#131722] border-b border-slate-800 text-xs text-slate-400 py-2 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded bg-slate-900 border border-slate-700/80 font-mono text-[11px] text-cyan-400">
            <span className="text-slate-500">https://</span>
            <span className="text-white font-semibold">sentry.network</span>
            <span className="text-cyan-400">/dashboard</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            SIH Mesh Active
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
          <a href="/upload.html" className="text-cyan-400 hover:text-white transition-colors">
            Upload & Audit
          </a>
          <a href="/result.html" className="text-slate-400 hover:text-cyan-400 transition-colors">
            Results
          </a>
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">{currentUser.name}</span>
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col justify-between relative z-10">
        
        {/* Header matching wireframe: "Name + logo" */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#161c28] border border-slate-700/80 hover:border-cyan-400/50 shadow-xl flex items-center gap-3.5 transition-all">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/25 via-blue-600/15 to-indigo-900/40 border border-cyan-400/40 shadow-lg shadow-cyan-500/10">
              <Shield className="w-7 h-7 text-cyan-400" />
              <Cpu className="w-4 h-4 text-emerald-400 absolute" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">
                  Sentry <span className="font-semibold text-slate-300">Shield</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-mono font-bold uppercase">
                  Console
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide font-mono">
                Central Network Security Auditing Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Zero-Trust Posture: Hardened</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STACKED ACTION OPTIONS MATCHING THE WIREFRAME SKETCH      */}
        {/* 1. Upload your network config                             */}
        {/* 2. Select your vendor                                     */}
        {/* 3. Get your security score                                */}
        {/* 4. No. of devices in your config                          */}
        {/* 5. + to add more vendors                                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-4">
          
          {/* Left Column: Stacked Cards */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Card 1: Upload your network config */}
            <a
              href="/upload.html"
              className="group block p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-blue-950/40 border-2 border-cyan-500/40 hover:border-cyan-400 shadow-xl shadow-cyan-950/30 transition-all transform hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Upload your network config
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Drag and drop .cfg, .conf, or raw JSON running-configs into the automated audit pipeline
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider group-hover:bg-cyan-400 transition-colors">
                  <span>Start Upload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>

            {/* Card 2: Select your vendor */}
            <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">Select your vendor</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Active: <strong className="text-cyan-400">{currentVendorData.name}</strong>
                </span>
              </div>

              {/* Vendor Badges / Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {vendors.map(vendor => (
                  <button
                    key={vendor.id}
                    type="button"
                    onClick={() => handleSelectVendor(vendor.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedVendor === vendor.id
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight line-clamp-1">{vendor.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      {vendor.devices} devices • {vendor.compliance}% CIS
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Get your security score */}
            <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Get your security score</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculated against CIS Controls v8, NIST SP 800-53, and CERT-In baselines
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {currentVendorData.compliance}%
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Benchmark Score</div>
                </div>
                <a
                  href="/result.html"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-semibold text-cyan-400 hover:text-white transition-colors"
                >
                  View Report
                </a>
              </div>
            </div>

            {/* Card 4: No. of devices in your config */}
            <div className="p-5 rounded-2xl bg-[#161c28] border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">No. of devices in your config</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Total aggregated network nodes, firewalls, switches, and access routers
                  </p>
                </div>
              </div>

              {/* Counter Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeviceCount(Math.max(1, deviceCount - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 font-bold cursor-pointer"
                >
                  -
                </button>
                <div className="px-4 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-lg text-cyan-400 min-w-[50px] text-center">
                  {deviceCount}
                </div>
                <button
                  onClick={() => setDeviceCount(deviceCount + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Card 5: + to add more vendors */}
            <button
              type="button"
              onClick={() => setShowAddVendorModal(true)}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400/80 bg-slate-900/50 hover:bg-slate-900/80 text-slate-300 hover:text-white flex items-center justify-center gap-3 transition-all cursor-pointer font-bold text-sm"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Plus className="w-4 h-4" />
              </div>
              <span>+ to add more vendors</span>
            </button>

          </div>

          {/* Right Column / Bottom Left Graphic: Prominent Padlock Illustration */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#161c28] border-2 border-slate-800 relative shadow-2xl">
            
            <div className="text-center mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Cryptographic Perimeter
              </span>
              <h4 className="text-base font-bold text-white">Network Lock Shield</h4>
            </div>

            {/* Large Padlock SVG matching sketch bottom left */}
            <div className="relative w-48 h-60 flex items-center justify-center">
              <svg
                viewBox="0 0 200 240"
                className="w-full h-full filter drop-shadow-[0_0_20px_rgba(0,242,254,0.3)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Shackle (Arch) */}
                <path
                  d="M60 110 V65 C60 35, 140 35, 140 65 V110"
                  stroke={isLocked ? "#00f2fe" : "#f59e0b"}
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Lock Body */}
                <rect
                  x="30"
                  y="100"
                  width="140"
                  height="120"
                  rx="24"
                  fill="#0c142c"
                  stroke="#334155"
                  strokeWidth="4"
                />

                {/* Inner Border Glow */}
                <rect
                  x="40"
                  y="110"
                  width="120"
                  height="100"
                  rx="18"
                  fill="#070c1e"
                  stroke={isLocked ? "rgba(0,242,254,0.3)" : "rgba(245,158,11,0.3)"}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Keyhole */}
                <circle cx="100" cy="150" r="14" fill={isLocked ? "#00f2fe" : "#f59e0b"} className="animate-pulse" />
                <path
                  d="M95 155 L105 155 L108 185 L92 185 Z"
                  fill={isLocked ? "#00f2fe" : "#f59e0b"}
                />
              </svg>
            </div>

            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mesh Encrypted & Locked
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                All 32 nodes running verified configurations under continuous integrity checks.
              </p>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* Enterprise Integrations & Active Scanner Grid             */}
        {/* ========================================================= */}
        <div className="mt-8 mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
            <span>Enterprise Integrations &amp; Attack Surface Scanner</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Architecture Status
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#161c28] border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">SIEM / SOC Webhook</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                    Integration Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mb-3">
                  Splunk HEC, Elastic &amp; QRadar CEF audit event pipeline.
                </p>
              </div>
              <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
                <span>Status: Integration not configured</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#161c28] border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">ITSM / Ticketing</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                    Integration Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mb-3">
                  Jira &amp; ServiceNow automated remediation dispatch.
                </p>
              </div>
              <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
                <span>Status: Integration not configured</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#161c28] border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Network Port Scanner</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                    Nmap Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mb-3">
                  Live port scanner validating open services against rules.
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>Status: Nmap integration available — scanner not configured</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Real Database Audits Table (SQLAlchemy SQLite)            */}
        {/* ========================================================= */}
        <div className="mt-4 p-6 rounded-3xl bg-[#161c28] border-2 border-slate-800 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Persisted Compliance Audits</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                    SQLite / SQLAlchemy
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {currentUser ? `Viewing records for ${currentUser.name} (${currentUser.role})` : 'Recent audit transactions'}
                </p>
              </div>
            </div>

            <a
              href="/upload.html"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Audit</span>
            </a>
          </div>

          {loadingAudits ? (
            <div className="text-center py-8 text-xs text-slate-400 font-mono">
              Fetching database audit logs...
            </div>
          ) : realAudits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/80">
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Vendor / Host</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Findings</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {realAudits.map((rec) => (
                    <tr key={rec.audit_id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-3 text-cyan-400 font-bold">
                        {rec.audit_id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-white font-semibold">{rec.vendor}</div>
                        <div className="text-[10px] text-slate-500">{rec.hostname || rec.filename || 'Device'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {rec.audit_status || 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        {rec.security_score}%
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          rec.risk_level === 'Low'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : rec.risk_level === 'Medium'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}>
                          {rec.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {rec.total_findings} total ({rec.critical_findings || 0} crit, {rec.high_findings || 0} high)
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => downloadAuditPdf(rec.audit_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 hover:text-white text-[11px] transition-colors cursor-pointer"
                          title="Download PDF report with QR verification"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs font-mono">
              <p>No audit records in the database yet.</p>
              <a href="/upload.html" className="text-cyan-400 underline mt-1 inline-block">
                Run your first configuration audit →
              </a>
            </div>
          )}
        </div>

        {/* Footer matching wireframe: "contact us" */}
        <div className="pt-8 mt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
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

      {/* Modal: + to add more vendors */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#1a2130] border border-slate-700/80 text-slate-200">
            <h3 className="text-base font-bold text-white mb-1">Add Network Vendor</h3>
            <p className="text-xs text-slate-400 mb-4">
              Integrate configuration parsing support for custom hardware or appliances.
            </p>

            <form onSubmit={handleAddVendor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Vendor Name / Model Family</label>
                <input
                  type="text"
                  required
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="e.g. Palo Alto PAN-OS, Mikrotik RouterOS"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Number of Deployed Devices</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={newVendorDeviceCount}
                  onChange={(e) => setNewVendorDeviceCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
