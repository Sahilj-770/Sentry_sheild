import React, { useState, useEffect } from 'react';
import { Lock, Unlock, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RobotShieldIllustrationProps {
  onScanCompleted?: () => void;
}

export const RobotShieldIllustration: React.FC<RobotShieldIllustrationProps> = ({ onScanCompleted }) => {
  // Timeline states: 'shield-enter' -> 'robot-enter' -> 'lock-open' -> 'scanning' -> 'lock-closed'
  const [animationStep, setAnimationStep] = useState<'shield-enter' | 'robot-enter' | 'lock-open' | 'scanning' | 'lock-closed'>('shield-enter');
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Orchestrate the controlled security engine sequence:
  useEffect(() => {
    let t1: any, t2: any, t3: any, t4: any;

    const runSequence = () => {
      setAnimationStep('shield-enter');
      setIsLocked(false);

      // 1. Robot enters shortly after shield
      t1 = setTimeout(() => {
        setAnimationStep('robot-enter');
      }, 500);

      // 2. Robot displays detected configuration gap (open lock)
      t2 = setTimeout(() => {
        setAnimationStep('lock-open');
        setIsLocked(false);
      }, 1200);

      // 3. Precise scanning line activates
      t3 = setTimeout(() => {
        setAnimationStep('scanning');
      }, 2200);

      // 4. Lock snaps shut securely
      t4 = setTimeout(() => {
        setAnimationStep('lock-closed');
        setIsLocked(true);
        if (onScanCompleted) onScanCompleted();

        try {
          confetti({
            particleCount: 24,
            spread: 50,
            origin: { y: 0.65, x: 0.72 },
            colors: ['#d71920', '#10b981', '#f8fafc'],
          });
        } catch {
          // ignore if canvas-confetti is not loaded
        }
      }, 3400);
    };

    runSequence();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onScanCompleted]);

  const handleManualReplay = () => {
    setAnimationStep('shield-enter');
    setIsLocked(false);

    setTimeout(() => setAnimationStep('robot-enter'), 350);
    setTimeout(() => {
      setAnimationStep('lock-open');
      setIsLocked(false);
    }, 1000);
    setTimeout(() => setAnimationStep('scanning'), 1900);
    setTimeout(() => {
      setAnimationStep('lock-closed');
      setIsLocked(true);
      try {
        confetti({
          particleCount: 28,
          spread: 55,
          origin: { y: 0.65, x: 0.72 },
          colors: ['#d71920', '#10b981', '#f8fafc'],
        });
      } catch {}
    }, 2900);
  };

  const handleToggleLock = () => {
    setIsLocked(prev => !prev);
    setAnimationStep(prev => prev === 'lock-closed' ? 'lock-open' : 'lock-closed');
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto flex flex-col items-center select-none">
      
      {/* Engineered Perimeter Enclosure */}
      <div className="w-full relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 sm:p-5 cyber-dot-grid overflow-hidden shadow-sm">
        
        {/* Perimeter Telemetry Header Markers */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pb-2.5 mb-2 border-b border-[var(--border-subtle)] select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--accent)] font-bold">+</span>
            <span>ENGINE:</span>
            <span className="text-[var(--text-primary)] font-semibold">
              {isLocked ? 'SURFACE_VERIFIED' : 'ANOMALY_FLAGGED'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-[var(--success)]' : 'bg-[var(--accent)] animate-pulse'}`}></span>
            <span>RULESET:</span>
            <span className="text-[var(--text-secondary)] font-semibold">CIS_v8_STIG</span>
            <span className="text-[var(--text-muted)] font-bold">+</span>
          </div>
        </div>

        {/* Main Illustration Viewport */}
        <div className="relative w-full h-[400px] sm:h-[430px] flex items-center justify-center">
          
          {/* ========================================================= */}
          {/* 1. THE SHIELD (Behind the robot)                          */}
          {/* ========================================================= */}
          <div 
            className={`absolute transition-all duration-700 ease-out transform ${
              animationStep === 'shield-enter' 
                ? 'scale-90 opacity-20 -translate-y-4' 
                : 'scale-100 opacity-100 translate-y-0'
            }`}
            style={{ zIndex: 10 }}
          >
            {/* Precise circular calibration rings */}
            <div className="absolute -inset-6 border border-dashed border-[var(--border-subtle)] rounded-full pointer-events-none opacity-60"></div>
            <div className="absolute -inset-12 border border-[var(--border-subtle)] rounded-full pointer-events-none opacity-30"></div>

            {/* SVG Shield outline */}
            <svg
              width="310"
              height="365"
              viewBox="0 0 340 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-colors duration-500"
            >
              <defs>
                <linearGradient id="shieldGrad" x1="170" y1="0" x2="170" y2="400" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#141923" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#0f131c" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0a0d14" stopOpacity="0.98" />
                </linearGradient>
                <pattern id="shieldGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Main Shield Body */}
              <path
                d="M170 12 L310 55 C310 240, 245 345, 170 390 C95 345, 30 240, 30 55 Z"
                fill="url(#shieldGrad)"
                stroke={isLocked ? "var(--success)" : "var(--accent)"}
                strokeWidth="2.5"
                className="transition-colors duration-500"
              />

              {/* Inner Shield Grid Inset */}
              <path
                d="M170 30 L290 68 C290 225, 235 322, 170 365 C105 322, 50 225, 50 68 Z"
                fill="url(#shieldGrid)"
                stroke="var(--border-subtle)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />

              {/* Center Core Reticle on Shield */}
              <circle cx="170" cy="180" r="64" fill="none" stroke="var(--border-subtle)" strokeWidth="1.5" />
              <circle cx="170" cy="180" r="88" fill="none" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="6 6" />

              {/* Thin Technical Crosshairs */}
              <line x1="170" y1="40" x2="170" y2="90" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="70" y1="180" x2="110" y2="180" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="230" y1="180" x2="270" y2="180" stroke="var(--border-strong)" strokeWidth="1" />
              <line x1="170" y1="270" x2="170" y2="340" stroke="var(--border-strong)" strokeWidth="1" />
            </svg>
          </div>

          {/* ========================================================= */}
          {/* 2. THE ROBOT (In front of the shield)                     */}
          {/* ========================================================= */}
          <div 
            className={`relative transition-all duration-700 ease-out transform ${
              animationStep === 'shield-enter'
                ? 'opacity-0 scale-85 translate-y-6'
                : 'opacity-100 scale-100 translate-y-0 animate-float'
            }`}
            style={{ zIndex: 20 }}
          >
            {/* Robot SVG Figure */}
            <svg
              width="250"
              height="325"
              viewBox="0 0 280 360"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="robotBodyGrad" x1="0" y1="0" x2="280" y2="360" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="60%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="robotVisorGrad" x1="70" y1="65" x2="210" y2="125" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#090d14" />
                  <stop offset="100%" stopColor="#141b28" />
                </linearGradient>
              </defs>

              {/* Antennas & Communication node */}
              <line x1="140" y1="42" x2="140" y2="16" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="140" cy="14" r="6" fill={isLocked ? "var(--success)" : "var(--accent)"} className="transition-colors duration-300" />
              <line x1="90" y1="56" x2="72" y2="34" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="70" cy="32" r="4.5" fill="#64748b" />
              <line x1="190" y1="56" x2="208" y2="34" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="210" cy="32" r="4.5" fill="#64748b" />

              {/* Robot Head */}
              <rect x="68" y="42" width="144" height="96" rx="36" fill="url(#robotBodyGrad)" stroke="#334155" strokeWidth="2" />
              
              {/* Robot Visor / Digital Face */}
              <rect x="84" y="60" width="112" height="60" rx="18" fill="url(#robotVisorGrad)" stroke="#1e293b" strokeWidth="1.5" />
              
              {/* Visor State */}
              {isLocked ? (
                // Secure state: clean emerald arcs
                <g stroke="var(--success)" strokeWidth="3.5" strokeLinecap="round">
                  <path d="M102 92 Q112 82 122 92" />
                  <path d="M158 92 Q168 82 178 92" />
                  <circle cx="112" cy="74" r="2" fill="var(--success)" />
                  <circle cx="168" cy="74" r="2" fill="var(--success)" />
                </g>
              ) : animationStep === 'scanning' ? (
                // Scanning state: focused laser
                <g>
                  <circle cx="112" cy="90" r="8" fill="#e2e8f0" />
                  <circle cx="168" cy="90" r="8" fill="#e2e8f0" />
                  <line x1="94" y1="90" x2="186" y2="90" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 2" />
                </g>
              ) : (
                // Alert state: amber/red alert eyes
                <g>
                  <circle cx="112" cy="88" r="7" fill="var(--accent)" />
                  <circle cx="168" cy="88" r="7" fill="var(--accent)" />
                  <circle cx="114" cy="86" r="2.5" fill="#fff" />
                  <circle cx="170" cy="86" r="2.5" fill="#fff" />
                </g>
              )}

              {/* Head Ear Nodes */}
              <rect x="58" y="70" width="10" height="34" rx="4" fill="#64748b" stroke="#334155" />
              <rect x="212" y="70" width="10" height="34" rx="4" fill="#64748b" stroke="#334155" />

              {/* Neck Joint */}
              <rect x="124" y="138" width="32" height="14" rx="3" fill="#334155" />

              {/* Robot Torso */}
              <path
                d="M74 152 L206 152 L216 260 L64 260 Z"
                fill="url(#robotBodyGrad)"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Chest Core Gauge */}
              <rect x="98" y="166" width="84" height="48" rx="10" fill="#0c111a" stroke="#1e293b" strokeWidth="1.5" />
              
              {/* Chest Telemetry Gauge */}
              <circle cx="120" cy="190" r="9" fill="none" stroke={isLocked ? "var(--success)" : "var(--accent)"} strokeWidth="2" />
              <line x1="140" y1="182" x2="170" y2="182" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="140" y1="190" x2="162" y2="190" stroke={isLocked ? "var(--success)" : "var(--accent)"} strokeWidth="1.5" strokeLinecap="round" />
              <line x1="140" y1="198" x2="166" y2="198" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

              {/* Articulated Arms */}
              <path d="M64 162 C40 180, 42 225, 54 250" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />
              <circle cx="54" cy="254" r="10" fill="#475569" />

              <path d="M216 162 C242 185, 235 220, 220 248" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />
              <circle cx="218" cy="252" r="10" fill="#475569" />

              {/* Thruster Base */}
              <rect x="100" y="260" width="80" height="12" rx="3" fill="#334155" />
              <ellipse cx="140" cy="276" rx="22" ry="5" fill={isLocked ? "var(--success)" : "var(--accent)"} opacity="0.6" />
            </svg>

            {/* ========================================================= */}
            {/* 3. THE LOCK ANIMATION (Open lock which then closes)       */}
            {/* ========================================================= */}
            <div 
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
              onClick={handleToggleLock}
              title="Click to toggle lock state"
            >
              {/* Padlock Card */}
              <div 
                className={`relative px-4 py-2.5 rounded-lg border transition-all duration-300 shadow-md flex items-center gap-3 ${
                  isLocked 
                    ? 'bg-[var(--bg-card)] border-[var(--success)] animate-lock-snap' 
                    : 'bg-[var(--bg-card)] border-[var(--accent)]'
                }`}
              >
                {/* Padlock Icon & State */}
                <div 
                  className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors duration-300 ${
                    isLocked 
                      ? 'bg-[var(--success-muted)] text-[var(--success)]' 
                      : 'bg-[var(--accent-muted)] text-[var(--accent)]'
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-4 h-4 animate-lock-snap" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-[var(--success)] text-[11px] font-bold uppercase font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        Infrastructure Secured
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[var(--accent)] text-[11px] font-bold uppercase font-mono">
                        <AlertTriangle className="w-3 h-3" />
                        Vulnerability Detected
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                    {isLocked ? 'CIS Benchmark: 100% Passed' : 'Port 23 / Telnet Active (Evaluating)'}
                  </p>
                </div>
              </div>

              {/* Laser scanning beam line during scanning step */}
              {animationStep === 'scanning' && (
                <div className="absolute inset-x-0 h-0.5 bg-[var(--accent)] animate-laser rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Perimeter Telemetry Footer */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-2.5 mt-1 border-t border-[var(--border-subtle)] select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">[</span>
            <span>CIPHER:</span>
            <span className="text-[var(--text-secondary)]">ED25519_SHA256</span>
            <span className="text-[var(--text-muted)]">]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">[</span>
            <span>LATENCY:</span>
            <span className="text-[var(--success)]">&lt; 14ms</span>
            <span className="text-[var(--text-muted)]">]</span>
          </div>
        </div>

      </div>

      {/* Floating Status & Controls below illustration */}
      <div className="w-full mt-2.5 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-[var(--success)]' : 'bg-[var(--accent)] animate-pulse'}`}></span>
          <span className="text-[var(--text-muted)] text-[11px]">Audit Engine:</span>
          <span className={`font-mono text-[11px] font-semibold ${isLocked ? 'text-[var(--success)]' : 'text-[var(--accent)]'}`}>
            {isLocked ? 'SHIELD ARMED • ZERO GAPS' : animationStep === 'scanning' ? 'ANALYZING CONFIGURATION...' : 'UNSECURED PARAMETERS IDENTIFIED'}
          </span>
        </div>

        <button
          onClick={handleManualReplay}
          className="sentry-btn-ghost text-[10px] py-1 px-2 font-mono flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3 text-[var(--text-secondary)]" />
          <span>Replay</span>
        </button>
      </div>

    </div>
  );
};
