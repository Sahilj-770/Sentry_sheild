import { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 


  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';

import { loginUser, registerUser } from '../utils/api';
import { ThemeToggle } from './ThemeToggle';

interface AuthPageProps {
  initialView?: 'login' | 'signup';
  onBackToHome: () => void;
  onAuthSuccess: (user: { name: string; email: string; role?: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialView = 'login',
  onBackToHome,
  onAuthSuccess,
}) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  
  // Form fields matching sketches
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocusedOnPassword, setIsFocusedOnPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleFillAuditor = () => {
    if (view === 'login') {
      setEmail('auditor@aegisnet-sih.gov.in');
      setPassword('CyberSecurity@2025');
    } else {
      setName('SIH Lead Auditor');
      setEmail('auditor@aegisnet-sih.gov.in');
      setPassword('CyberSecurity@2025');
      setConfirmPassword('CyberSecurity@2025');
    }
    setError(null);
  };

  const handleFillAdmin = () => {
    setEmail('admin@aegisnet-sih.gov.in');
    setPassword('AdminSecurity@2025');
    if (view === 'signup') {
      setName('Chief SecOps Administrator');
      setConfirmPassword('AdminSecurity@2025');
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (view === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (view === 'login') {
        const result = await loginUser(email, password);
        setSuccessMessage(`Access Granted: Welcome back, ${result.user.name} (${result.user.role.toUpperCase()})`);
        setTimeout(() => {
          onAuthSuccess({
            name: result.user.name,
            email: result.user.email,
            role: result.user.role
          });
        }, 700);
      } else {
        const result = await registerUser(name, email, password);
        setSuccessMessage(`Account initialized for ${result.user.name}! Assigned role: AUDITOR.`);
        setTimeout(() => {
          onAuthSuccess({
            name: result.user.name,
            email: result.user.email,
            role: result.user.role
          });
        }, 700);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('Enterprise Google Zero-Trust SSO is not configured in this standalone evaluation environment. Please use the pre-seeded Auditor or Admin credentials.');
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 cyber-grid relative overflow-x-hidden">
      
      {/* Top Browser Bar matching sketches "nameLogin.com" & "...Sign up page" */}
      <div className="w-full bg-[#131722] border-b border-slate-800 text-xs text-slate-400 py-2 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-400">
            <span className="text-slate-500">https://</span>
            <span className="text-white font-semibold">
              {view === 'login' ? 'sentry.network/login' : 'sentry.network/signup'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">Smart India Hackathon</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] text-emerald-400 font-mono font-medium">SSL 256-bit Secure</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Decorative ambient glows */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Content Area matching the Wireframe layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: Friendly Robot gesturing towards the card       */}
          {/* (Directly matching both sketches!)                       */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
              
              {/* Subtle tech shield contour in background */}
              <div className="absolute inset-4 rounded-full border border-dashed border-cyan-500/20 animate-shield-rotate pointer-events-none"></div>
              
              {/* SVG Robot Gesturing Towards the Right Card */}
              <svg
                viewBox="0 0 400 440"
                className="w-full h-full filter drop-shadow-[0_0_20px_rgba(0,242,254,0.25)] select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="robotWhiteGrad" x1="0" y1="0" x2="300" y2="400" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="50%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                  <linearGradient id="darkVisorGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#020617" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* Antenna */}
                <line x1="150" y1="65" x2="150" y2="30" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                <circle cx="150" cy="26" r="9" fill="#00f2fe" className="animate-pulse" />
                <line x1="110" y1="75" x2="90" y2="48" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                <circle cx="86" cy="44" r="6" fill="#38bdf8" />

                {/* Robot Head (Rounded, friendly chassis as drawn) */}
                <rect x="75" y="65" width="150" height="105" rx="42" fill="url(#robotWhiteGrad)" stroke="#475569" strokeWidth="3" />

                {/* Robot Visor / Digital Face */}
                <rect x="92" y="85" width="116" height="65" rx="22" fill="url(#darkVisorGrad)" stroke="#1e293b" strokeWidth="2" />

                {/* Expressive Visor Eyes */}
                {isFocusedOnPassword ? (
                  // Shy / Privacy eye mode when typing password
                  <g stroke="#00f2fe" strokeWidth="4" strokeLinecap="round">
                    <path d="M112 118 Q122 108 132 118" />
                    <path d="M168 118 Q178 108 188 118" />
                    <circle cx="122" cy="100" r="2" fill="#00f2fe" />
                    <circle cx="178" cy="100" r="2" fill="#00f2fe" />
                  </g>
                ) : (
                  // Attentive, friendly eyes looking towards the form card (rightwards)
                  <g>
                    <ellipse cx="128" cy="115" rx="10" ry="12" fill="#00f2fe" />
                    <circle cx="132" cy="112" r="4" fill="#fff" />
                    
                    <ellipse cx="182" cy="115" rx="10" ry="12" fill="#00f2fe" />
                    <circle cx="186" cy="112" r="4" fill="#fff" />

                    {/* Cute smile on visor */}
                    <path d="M148 132 Q155 138 162 132" stroke="#00f2fe" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </g>
                )}

                {/* Neck Joint */}
                <rect x="135" y="170" width="30" height="16" rx="4" fill="#334155" />

                {/* Robot Torso (Rounded / shield-like body matching the sketch) */}
                <path
                  d="M80 186 C80 186, 70 340, 150 350 C230 340, 220 186, 220 186 Z"
                  fill="url(#robotWhiteGrad)"
                  stroke="#475569"
                  strokeWidth="3.5"
                />

                {/* Chest Security Emblem / Sensor */}
                <rect x="110" y="208" width="80" height="46" rx="12" fill="#0b1329" stroke="#1e293b" strokeWidth="2" />
                <circle cx="150" cy="231" r="14" fill="none" stroke="#00f2fe" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M145 231 L150 225 L155 231" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

                {/* =================================================== */}
                {/* 2 ARMS GESTURING TOWARDS THE RIGHT CARD (as sketched)*/}
                {/* =================================================== */}

                {/* Upper Arm extending rightward with 3 fingers */}
                <g className="animate-float" style={{ animationDuration: '3.5s' }}>
                  {/* Arm segment */}
                  <path
                    d="M195 220 C225 210, 280 205, 315 208"
                    stroke="url(#robotWhiteGrad)"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  {/* Wrist joint */}
                  <circle cx="318" cy="208" r="10" fill="#475569" />
                  {/* 3 Robotic fingers/claws pointing right */}
                  <line x1="324" y1="202" x2="352" y2="194" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                  <line x1="328" y1="208" x2="360" y2="208" stroke="#00f2fe" strokeWidth="5" strokeLinecap="round" />
                  <line x1="324" y1="214" x2="352" y2="222" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                </g>

                {/* Lower Arm extending rightward with 3 fingers */}
                <g className="animate-float" style={{ animationDuration: '4s' }}>
                  {/* Arm segment */}
                  <path
                    d="M175 275 C215 275, 275 272, 310 274"
                    stroke="url(#robotWhiteGrad)"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  {/* Wrist joint */}
                  <circle cx="312" cy="274" r="10" fill="#475569" />
                  {/* 3 Robotic fingers/claws pointing right */}
                  <line x1="318" y1="268" x2="346" y2="260" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                  <line x1="322" y1="274" x2="356" y2="274" stroke="#00f2fe" strokeWidth="5" strokeLinecap="round" />
                  <line x1="318" y1="280" x2="346" y2="288" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
                </g>

                {/* Base Thrusters */}
                <ellipse cx="150" cy="360" rx="32" ry="7" fill="#00f2fe" opacity="0.75" className="animate-pulse" />
              </svg>

            </div>

            {/* Robot Prompt Tag */}
            <div className="mt-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 flex items-center gap-2 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {view === 'login'
                  ? 'Sentry is ready to verify your auditor credentials'
                  : 'Join the SIH Zero-Trust Network Defense Team'}
              </span>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: The Form Card (Matching both sketches!)       */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex justify-center">
            
            <div className="w-full max-w-md p-7 sm:p-9 rounded-3xl bg-[#161c28] border border-slate-700/80 shadow-2xl relative">
              
              {/* Card Top Border Glow */}
              <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

              {/* Wireframe Header with side lines: "— LOG IN —" or "— SIGN UP —" */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex-1 h-[2px] bg-slate-700"></div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest font-mono uppercase">
                  {view === 'login' ? 'LOG IN' : 'SIGN UP'}
                </h2>
                <div className="flex-1 h-[2px] bg-slate-700"></div>
              </div>

              {/* View Switcher Tabs (Seamless navigation between Login and Sign Up) */}
              <div className="flex p-1 mb-5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    view === 'login'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setView('signup'); setError(null); }}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    view === 'signup'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Evaluation Quick-Fill Buttons */}
              <div className="mb-5 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-cyan-300">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SIH Demo Credentials:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillAuditor}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-800/60 transition-colors cursor-pointer"
                  >
                    Auditor Demo
                  </button>
                  <button
                    type="button"
                    onClick={handleFillAdmin}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-900/60 border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-800/60 transition-colors cursor-pointer"
                  >
                    Admin Demo
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* The Form matching sketches */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                {/* Field: Name (Only in Sign Up Sketch) */}
                {view === 'signup' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                      Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Field: Email (In both sketches) */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="auditor@sentry-sih.gov.in"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                    />
                  </div>
                </div>

                {/* Field: Password (In both sketches, with * in sign up) */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                    {view === 'signup' ? 'Password*' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onFocus={() => setIsFocusedOnPassword(true)}
                      onBlur={() => setIsFocusedOnPassword(false)}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Wireframe element: "Forgot Password?" below password in Login */}
                  {view === 'login' && (
                    <div className="text-right mt-1.5">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Field: Confirm password* (In Sign Up sketch) */}
                {view === 'signup' && (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5 text-xs">
                      Confirm password*
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onFocus={() => setIsFocusedOnPassword(true)}
                        onBlur={() => setIsFocusedOnPassword(false)}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>{view === 'login' ? 'Log In to Console' : 'Complete Sign Up'}</span>
                  )}
                </button>

              </form>

              {/* Wireframe section: "Other options / sign in with google" */}
              <div className="mt-7 pt-6 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  Other options
                </span>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
                  >
                    {/* Official Google 'G' vector logo */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93Z"
                      />
                    </svg>
                    <span>Sign in with Google (Enterprise SSO — Demo Disabled)</span>
                  </button>
                </div>

                {/* Switch link at bottom */}
                <div className="mt-4 text-xs text-slate-400">
                  {view === 'login' ? (
                    <span>
                      Don't have an account?{' '}
                      <button
                        onClick={() => { setView('signup'); setError(null); }}
                        className="text-cyan-400 font-bold hover:underline cursor-pointer"
                      >
                        Sign Up now
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already registered?{' '}
                      <button
                        onClick={() => { setView('login'); setError(null); }}
                        className="text-cyan-400 font-bold hover:underline cursor-pointer"
                      >
                        Log In here
                      </button>
                    </span>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#1a2130] border border-slate-700/80 text-slate-200">
            <h3 className="text-base font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enterprise SMTP gateway is not configured in this standalone demo. For SIH evaluation, please use the pre-seeded credentials or register a new auditor account.
            </p>

            {forgotSubmitted ? (
              <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs mb-4">
                Enterprise SMTP relay unavailable in evaluation mode. Please use the pre-seeded credentials to sign in.
              </div>
            ) : (
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="auditor@sentry-sih.gov.in"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs mb-4 focus:outline-none focus:border-cyan-400"
              />
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setForgotPasswordOpen(false); setForgotSubmitted(false); }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              {!forgotSubmitted && (
                <button
                  type="button"
                  onClick={() => setForgotSubmitted(true)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"
                >
                  Send Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
