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

  // Orchestrate the animated sequence noted in wireframe:
  // "Shield will come on screen & robot will come & show an open lock which then closes."
  useEffect(() => {
    let t1: any, t2: any, t3: any, t4: any;

    const runSequence = () => {
      setAnimationStep('shield-enter');
      setIsLocked(false);

      // 1. Robot enters shortly after shield
      t1 = setTimeout(() => {
        setAnimationStep('robot-enter');
      }, 600);

      // 2. Robot shows open lock (Gap detected)
      t2 = setTimeout(() => {
        setAnimationStep('lock-open');
        setIsLocked(false);
      }, 1400);

      // 3. Scanning laser activates
      t3 = setTimeout(() => {
        setAnimationStep('scanning');
      }, 2600);

      // 4. Lock snaps shut securely
      t4 = setTimeout(() => {
        setAnimationStep('lock-closed');
        setIsLocked(true);
        if (onScanCompleted) onScanCompleted();

        // Cyber particle celebration
        try {
          confetti({
            particleCount: 28,
            spread: 55,
            origin: { y: 0.65, x: 0.72 },
            colors: ['#00f2fe', '#10b981', '#3b82f6'],
          });
        } catch (e) {
          // ignore if canvas-confetti is not loaded
        }
      }, 3800);
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

    setTimeout(() => setAnimationStep('robot-enter'), 400);
    setTimeout(() => {
      setAnimationStep('lock-open');
      setIsLocked(false);
    }, 1200);
    setTimeout(() => setAnimationStep('scanning'), 2200);
    setTimeout(() => {
      setAnimationStep('lock-closed');
      setIsLocked(true);
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.65, x: 0.72 },
          colors: ['#00f2fe', '#10b981', '#3b82f6'],
        });
      } catch (e) {}
    }, 3200);
  };

  const handleToggleLock = () => {
    setIsLocked((prev) => !prev);
    setAnimationStep(prev => prev === 'lock-closed' ? 'lock-open' : 'lock-closed');
  };

  return (
    <div className="relative w-full max-w-[540px] mx-auto flex flex-col items-center select-none">
      
      {/* Decorative restrained ambient glows */}
      <div className="absolute -top-10 -left-8 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-8 -right-8 w-60 h-60 bg-slate-700/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Technical Perimeter Frame around illustration */}
      <div className="w-full relative rounded-2xl border border-slate-800/80 bg-[#131722]/40 backdrop-blur-sm p-2 sm:p-4 cyber-dot-grid overflow-hidden">
        
        {/* Perimeter Telemetry Header Markers */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pb-2 mb-2 border-b border-slate-800/60 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">+</span>
            <span className="text-slate-400">PERIMETER:</span>
            <span className="text-cyan-400 font-semibold">{isLocked ? 'PROTECTED_MESH' : 'ANOMALY_DETECTED'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">TELEMETRY:</span>
            <span className="text-slate-300 font-semibold">CIS_v8_AUDIT</span>
            <span className="text-cyan-400 font-bold">+</span>
          </div>
        </div>

        {/* Main Illustration Viewport */}
        <div className="relative w-full h-[430px] sm:h-[460px] flex items-center justify-center">
          
          {/* ========================================================= */}
          {/* 1. THE SHIELD (Behind the robot, as drawn in sketch)      */}
          {/* ========================================================= */}
          <div 
            className={`absolute transition-all duration-1000 ease-out transform ${
              animationStep === 'shield-enter' 
                ? 'scale-75 opacity-20 -translate-y-6' 
                : 'scale-100 opacity-100 translate-y-0'
            }`}
            style={{ zIndex: 10 }}
          >
            {/* Outer rotating cyber rings */}
            <div className="absolute -inset-10 border border-dashed border-cyan-500/20 rounded-full animate-shield-rotate pointer-events-none"></div>
            <div className="absolute -inset-16 border border-cyan-400/10 rounded-full pointer-events-none"></div>

            {/* SVG Shield shape matching the wireframe outline */}
            <svg
              width="340"
              height="400"
              viewBox="0 0 340 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shield-glow filter drop-shadow-[0_0_15px_rgba(0,242,254,0.18)]"
            >
            <defs>
              <linearGradient id="shieldGrad" x1="170" y1="0" x2="170" y2="400" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#091024" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="shieldBorder" x1="0" y1="0" x2="340" y2="400" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={isLocked ? "#10b981" : "#00f2fe"} />
                <stop offset="50%" stopColor={isLocked ? "#059669" : "#3b82f6"} />
                <stop offset="100%" stopColor={isLocked ? "#34d399" : "#6366f1"} />
              </linearGradient>
              <pattern id="shieldGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 242, 254, 0.08)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Main Shield Body */}
            <path
              d="M170 12 L310 55 C310 240, 245 345, 170 390 C95 345, 30 240, 30 55 Z"
              fill="url(#shieldGrad)"
              stroke="url(#shieldBorder)"
              strokeWidth="4"
            />

            {/* Inner Shield Accent Inset */}
            <path
              d="M170 30 L290 68 C290 225, 235 322, 170 365 C105 322, 50 225, 50 68 Z"
              fill="url(#shieldGrid)"
              stroke={isLocked ? "rgba(16, 185, 129, 0.4)" : "rgba(0, 242, 254, 0.35)"}
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />

            {/* Center Core Emblems on Shield */}
            <circle cx="170" cy="180" r="70" fill="none" stroke={isLocked ? "#10b981" : "#00f2fe"} strokeOpacity="0.15" strokeWidth="2" />
            <circle cx="170" cy="180" r="95" fill="none" stroke={isLocked ? "#10b981" : "#00f2fe"} strokeOpacity="0.08" strokeWidth="1" strokeDasharray="8 6" />

            {/* Shield Tech Lines */}
            <line x1="170" y1="35" x2="170" y2="105" stroke={isLocked ? "#10b981" : "#00f2fe"} strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="60" y1="180" x2="100" y2="180" stroke={isLocked ? "#10b981" : "#00f2fe"} strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="240" y1="180" x2="280" y2="180" stroke={isLocked ? "#10b981" : "#00f2fe"} strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="170" y1="255" x2="170" y2="355" stroke={isLocked ? "#10b981" : "#00f2fe"} strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>

        {/* ========================================================= */}
        {/* 2. THE ROBOT (In front of the shield, matching sketch)     */}
        {/* ========================================================= */}
        <div 
          className={`relative transition-all duration-700 ease-out transform ${
            animationStep === 'shield-enter'
              ? 'opacity-0 scale-75 translate-y-8'
              : 'opacity-100 scale-100 translate-y-0 animate-float'
          }`}
          style={{ zIndex: 20 }}
        >
          {/* Main Robot SVG Figure */}
          <svg
            width="280"
            height="360"
            viewBox="0 0 280 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="robotBodyGrad" x1="0" y1="0" x2="280" y2="360" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="robotVisorGrad" x1="70" y1="65" x2="210" y2="125" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            {/* Antennas & Communication node */}
            <line x1="140" y1="42" x2="140" y2="16" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="140" cy="14" r="7" fill={isLocked ? "#10b981" : "#00f2fe"} className="animate-pulse" />
            <line x1="90" y1="56" x2="72" y2="34" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="70" cy="32" r="5" fill="#38bdf8" />
            <line x1="190" y1="56" x2="208" y2="34" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="210" cy="32" r="5" fill="#38bdf8" />

            {/* Robot Head (Rounded friendly cyber chassis) */}
            <rect x="68" y="42" width="144" height="96" rx="36" fill="url(#robotBodyGrad)" stroke="#475569" strokeWidth="2.5" />
            
            {/* Robot Visor / Digital Face */}
            <rect x="84" y="60" width="112" height="60" rx="20" fill="url(#robotVisorGrad)" stroke="#1e293b" strokeWidth="2" />
            
            {/* Visor Cyber Eyes (Expression changes depending on lock state) */}
            {isLocked ? (
              // Happy / Secure Eyes (curved arc eyes)
              <g stroke="#10b981" strokeWidth="4" strokeLinecap="round">
                <path d="M102 92 Q112 80 122 92" />
                <path d="M158 92 Q168 80 178 92" />
                <circle cx="112" cy="74" r="2" fill="#10b981" />
                <circle cx="168" cy="74" r="2" fill="#10b981" />
              </g>
            ) : animationStep === 'scanning' ? (
              // Scanning laser eyes
              <g>
                <circle cx="112" cy="90" r="10" fill="#00f2fe" />
                <circle cx="168" cy="90" r="10" fill="#00f2fe" />
                <line x1="90" y1="90" x2="190" y2="90" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
              </g>
            ) : (
              // Alert / Open Lock Eyes
              <g>
                <circle cx="112" cy="88" r="8" fill="#f59e0b" />
                <circle cx="168" cy="88" r="8" fill="#f59e0b" />
                <circle cx="114" cy="86" r="3" fill="#fff" />
                <circle cx="170" cy="86" r="3" fill="#fff" />
              </g>
            )}

            {/* Head Ear Nodes */}
            <rect x="58" y="70" width="10" height="34" rx="4" fill="#64748b" stroke="#334155" />
            <rect x="212" y="70" width="10" height="34" rx="4" fill="#64748b" stroke="#334155" />

            {/* Neck Joint */}
            <rect x="124" y="138" width="32" height="14" rx="4" fill="#334155" />

            {/* Robot Torso / Chassis */}
            <path
              d="M74 152 L206 152 L216 260 L64 260 Z"
              fill="url(#robotBodyGrad)"
              stroke="#475569"
              strokeWidth="2.5"
            />

            {/* Chest Core / Heart Energy Gauge */}
            <rect x="98" y="166" width="84" height="48" rx="12" fill="#0b1329" stroke="#1e293b" strokeWidth="2" />
            
            {/* Chest Telemetry Lines */}
            <circle cx="120" cy="190" r="10" fill="none" stroke={isLocked ? "#10b981" : "#00f2fe"} strokeWidth="2.5" />
            <path d="M115 190 L120 184 L125 190" stroke={isLocked ? "#10b981" : "#00f2fe"} strokeWidth="1.5" />
            <line x1="140" y1="182" x2="170" y2="182" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <line x1="140" y1="190" x2="162" y2="190" stroke={isLocked ? "#10b981" : "#f59e0b"} strokeWidth="2" strokeLinecap="round" />
            <line x1="140" y1="198" x2="166" y2="198" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

            {/* Shoulders & Articulated Arms */}
            {/* Left Arm holding data beam */}
            <path d="M64 162 C40 180, 42 225, 54 250" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />
            <circle cx="54" cy="254" r="11" fill="#475569" />

            {/* Right Arm presenting the Padlock */}
            <path d="M216 162 C242 185, 235 220, 220 248" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />
            <circle cx="218" cy="252" r="11" fill="#475569" />

            {/* Cyber Hover Thrusters Base */}
            <rect x="100" y="260" width="80" height="14" rx="4" fill="#334155" />
            <ellipse cx="140" cy="278" rx="26" ry="6" fill={isLocked ? "#10b981" : "#00f2fe"} opacity="0.8" className="animate-pulse" />
          </svg>

          {/* ========================================================= */}
          {/* 3. THE LOCK ANIMATION (Open lock which then closes)       */}
          {/* ========================================================= */}
          <div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
            onClick={handleToggleLock}
            title="Click to toggle lock state"
          >
            {/* Hologram Pedestal Base */}
            <div className="relative">
              
              {/* Holographic Projection Beam */}
              <div 
                className={`w-36 h-28 -mb-6 bg-gradient-to-t opacity-40 blur-md pointer-events-none transition-colors duration-500 ${
                  isLocked ? 'from-emerald-500 via-emerald-500/20 to-transparent' : 'from-amber-500 via-amber-500/20 to-transparent'
                }`}
              ></div>

              {/* The Padlock Card */}
              <div 
                className={`relative px-5 py-3.5 rounded-2xl backdrop-blur-xl border transition-all duration-500 shadow-2xl flex items-center gap-3.5 transform ${
                  isLocked 
                    ? 'bg-emerald-950/90 border-emerald-500/80 shadow-emerald-500/30 scale-105 animate-lock-snap' 
                    : 'bg-amber-950/90 border-amber-500/80 shadow-amber-500/30 scale-100'
                }`}
              >
                {/* Padlock Icon & State */}
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                    isLocked 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-400/50 animate-bounce'
                  }`}
                >
                  {isLocked ? (
                    <Lock className="w-6 h-6 animate-lock-snap" />
                  ) : (
                    <Unlock className="w-6 h-6" />
                  )}
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-black tracking-wider uppercase font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Network Secured
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 text-xs font-black tracking-wider uppercase font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vulnerability Gap
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    {isLocked ? 'CIS Benchmark: 100% Passed' : 'Port 445 Exposed (Audit in progress)'}
                  </p>
                </div>
              </div>

              {/* Laser scanning beam line effect during scanning step */}
              {animationStep === 'scanning' && (
                <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_12px_#00f2fe] animate-laser rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Perimeter Telemetry Footer Markers */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 mt-1 border-t border-slate-800/60 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">[</span>
            <span className="text-slate-400">CIPHER:</span>
            <span className="text-slate-300">ED25519_SHA256</span>
            <span className="text-slate-600 font-bold">]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">[</span>
            <span className="text-slate-400">LATENCY:</span>
            <span className="text-emerald-400">&lt; 14ms</span>
            <span className="text-slate-600 font-bold">]</span>
          </div>
        </div>

      </div>

      {/* Floating Status Badges & Controls below illustration */}
      <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#161c28] border border-slate-800 text-xs shadow-sm">
        
        {/* State description badge */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLocked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`}></span>
          <span className="text-slate-400">Sequence State:</span>
          <span className={`font-mono font-semibold ${isLocked ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isLocked ? 'SHIELD DEPLOYED • LOCK CLOSED' : animationStep === 'scanning' ? 'AI SCANNING GAP...' : 'OPEN LOCK (GAP FOUND)'}
          </span>
        </div>

        {/* Replay action */}
        <button
          onClick={handleManualReplay}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-[11px] font-medium transition-all cursor-pointer font-mono"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span>Replay Sequence</span>
        </button>
      </div>

    </div>
  );
};
