import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  Sparkles 
} from 'lucide-react';
import { loginUser, registerUser } from '../utils/api';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AuthPageProps {
  initialView?: 'login' | 'signup';
  onBackToHome?: () => void;
  onAuthSuccess: (user: { name: string; email: string; role?: string }) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialView = 'login',
  onAuthSuccess,
}) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Robot expression state (eyes react when user focuses password)
  const [isFocusedOnPassword, setIsFocusedOnPassword] = useState(false);

  // Async state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Pre-seed credentials helper
  const handleFillAuditor = () => {
    setView('login');
    setEmail('auditor@aegisnet-sih.gov.in');
    setPassword('Auditor@2026!');
    setError(null);
  };

  const handleFillAdmin = () => {
    setView('login');
    setEmail('admin@aegisnet-sih.gov.in');
    setPassword('Admin@2026!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (view === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
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
        }, 600);
      } else {
        const result = await registerUser(name, email, password);
        setSuccessMessage(`Account initialized for ${result.user.name}! Assigned role: AUDITOR.`);
        setTimeout(() => {
          onAuthSuccess({
            name: result.user.name,
            email: result.user.email,
            role: result.user.role
          });
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('Enterprise Google Zero-Trust SSO is unconfigured in this standalone evaluation environment. Please use the pre-seeded Auditor or Admin credentials.');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent)] selection:text-white relative overflow-x-hidden">
      
      {/* Standardized Navbar */}
      <Navbar activePage="auth" />

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT SIDE: Robot Visual Identity */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            
            <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center">
              
              {/* Outer boundary ring */}
              <div className="absolute inset-4 rounded-full border border-dashed border-[var(--border-subtle)] opacity-40 pointer-events-none"></div>
              
              {/* SVG Robot Gesturing Towards the Right Card */}
              <svg
                viewBox="0 0 400 440"
                className="w-full h-full select-none"
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
                    <stop offset="0%" stopColor="#090d14" />
                    <stop offset="100%" stopColor="#141a24" />
                  </linearGradient>
                </defs>

                {/* Antenna */}
                <line x1="150" y1="65" x2="150" y2="30" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                <circle cx="150" cy="26" r="8" fill="var(--accent)" />
                <line x1="110" y1="75" x2="90" y2="48" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                <circle cx="86" cy="44" r="5" fill="#64748b" />

                {/* Robot Head */}
                <rect x="75" y="65" width="150" height="105" rx="42" fill="url(#robotWhiteGrad)" stroke="#334155" strokeWidth="2.5" />

                {/* Robot Visor / Digital Face */}
                <rect x="92" y="85" width="116" height="65" rx="20" fill="url(#darkVisorGrad)" stroke="#1e293b" strokeWidth="1.5" />

                {/* Visor Eyes */}
                {isFocusedOnPassword ? (
                  <g stroke="var(--accent)" strokeWidth="3" strokeLinecap="round">
                    <path d="M112 118 Q122 108 132 118" />
                    <path d="M168 118 Q178 108 188 118" />
                    <circle cx="122" cy="100" r="2" fill="var(--accent)" />
                    <circle cx="178" cy="100" r="2" fill="var(--accent)" />
                  </g>
                ) : (
                  <g>
                    <ellipse cx="128" cy="115" rx="9" ry="11" fill="var(--text-primary)" />
                    <circle cx="132" cy="112" r="3" fill="var(--accent)" />
                    
                    <ellipse cx="182" cy="115" rx="9" ry="11" fill="var(--text-primary)" />
                    <circle cx="186" cy="112" r="3" fill="var(--accent)" />

                    <path d="M148 132 Q155 137 162 132" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </g>
                )}

                {/* Neck Joint */}
                <rect x="135" y="170" width="30" height="16" rx="3" fill="#334155" />

                {/* Robot Torso */}
                <path
                  d="M80 186 C80 186, 70 340, 150 350 C230 340, 220 186, 220 186 Z"
                  fill="url(#robotWhiteGrad)"
                  stroke="#334155"
                  strokeWidth="2.5"
                />

                {/* Chest Emblem */}
                <rect x="110" y="208" width="80" height="46" rx="10" fill="#090d14" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="150" cy="231" r="12" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
                <path d="M145 231 L150 225 L155 231" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" />

                {/* Upper Arm extending rightward */}
                <g className="animate-float" style={{ animationDuration: '3.5s' }}>
                  <path
                    d="M195 220 C225 210, 280 205, 315 208"
                    stroke="url(#robotWhiteGrad)"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <circle cx="318" cy="208" r="9" fill="#475569" />
                  <line x1="324" y1="202" x2="352" y2="194" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                  <line x1="328" y1="208" x2="360" y2="208" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="324" y1="214" x2="352" y2="222" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                </g>

                {/* Lower Arm extending rightward */}
                <g className="animate-float" style={{ animationDuration: '4s' }}>
                  <path
                    d="M175 275 C215 275, 275 272, 310 274"
                    stroke="url(#robotWhiteGrad)"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <circle cx="312" cy="274" r="9" fill="#475569" />
                  <line x1="318" y1="268" x2="346" y2="260" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                  <line x1="322" y1="274" x2="356" y2="274" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
                  <line x1="318" y1="280" x2="346" y2="288" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                </g>

                {/* Base Thruster */}
                <ellipse cx="150" cy="360" rx="28" ry="6" fill="var(--accent)" opacity="0.6" />
              </svg>

            </div>

            <div className="sentry-badge mt-2">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>
                {view === 'login'
                  ? 'Sentry Zero-Trust Auditor Authentication'
                  : 'Register New Operator Credentials'}
              </span>
            </div>

          </div>

          {/* RIGHT SIDE: The Form Card */}
          <div className="lg:col-span-6 flex justify-center">
            
            <div className="w-full max-w-md sentry-card p-6 sm:p-8">
              
              {/* Header with Title */}
              <div className="text-center pb-4 mb-5 border-b border-[var(--border-subtle)]">
                <h2 className="text-xl font-black text-[var(--text-primary)] tracking-widest font-mono uppercase">
                  {view === 'login' ? 'ACCESS PORTAL' : 'INITIALIZE ACCOUNT'}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                  Enterprise Authentication &amp; RBAC Control
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex p-1 mb-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); }}
                  className={`flex-1 py-1.5 rounded-md font-mono transition-all cursor-pointer ${
                    view === 'login'
                      ? 'bg-[var(--accent)] text-white shadow-sm font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setView('signup'); setError(null); }}
                  className={`flex-1 py-1.5 rounded-md font-mono transition-all cursor-pointer ${
                    view === 'signup'
                      ? 'bg-[var(--accent)] text-white shadow-sm font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Evaluation Quick-Fill Chips */}
              <div className="mb-4 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-mono">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>Demo Logins:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleFillAuditor}
                    className="sentry-btn-secondary text-[10px] py-1 px-2 font-mono"
                  >
                    Auditor
                  </button>
                  <button
                    type="button"
                    onClick={handleFillAdmin}
                    className="sentry-btn-secondary text-[10px] py-1 px-2 font-mono"
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-[var(--danger-muted)] border border-[var(--danger)]/30 text-[var(--danger)] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-lg bg-[var(--success-muted)] border border-[var(--success)]/30 text-[var(--success)] text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                
                {/* Field: Name (Only in Sign Up) */}
                {view === 'signup' && (
                  <div>
                    <label className="block text-[var(--text-secondary)] font-mono font-medium mb-1 text-xs">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Security Analyst"
                        className="sentry-input pl-8 text-xs py-1.5"
                      />
                    </div>
                  </div>
                )}

                {/* Field: Email */}
                <div>
                  <label className="block text-[var(--text-secondary)] font-mono font-medium mb-1 text-xs">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="auditor@sentry-sih.gov.in"
                      className="sentry-input pl-8 text-xs py-1.5"
                    />
                  </div>
                </div>

                {/* Field: Password */}
                <div>
                  <label className="block text-[var(--text-secondary)] font-mono font-medium mb-1 text-xs">
                    {view === 'signup' ? 'Password*' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onFocus={() => setIsFocusedOnPassword(true)}
                      onBlur={() => setIsFocusedOnPassword(false)}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="sentry-input pl-8 pr-8 text-xs py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {view === 'login' && (
                    <div className="text-right mt-1">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-[11px] text-[var(--accent)] hover:underline cursor-pointer font-mono"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Field: Confirm password (Sign Up only) */}
                {view === 'signup' && (
                  <div>
                    <label className="block text-[var(--text-secondary)] font-mono font-medium mb-1 text-xs">
                      Confirm Password*
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onFocus={() => setIsFocusedOnPassword(true)}
                        onBlur={() => setIsFocusedOnPassword(false)}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="sentry-input pl-8 pr-8 text-xs py-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="sentry-btn-primary w-full py-2.5 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>{view === 'login' ? 'Authenticate Session' : 'Register Operator'}</span>
                  )}
                </button>

              </form>

              {/* Other Options / Google SSO */}
              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] text-center">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-mono">
                  Enterprise SSO
                </span>

                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="sentry-btn-secondary w-full py-2 text-xs"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                    <span>Google Zero-Trust SSO (Demo Notice)</span>
                  </button>
                </div>

                <div className="mt-3.5 text-xs text-[var(--text-muted)]">
                  {view === 'login' ? (
                    <span>
                      Need an account?{' '}
                      <button
                        onClick={() => { setView('signup'); setError(null); }}
                        className="text-[var(--accent)] font-semibold hover:underline cursor-pointer"
                      >
                        Register now
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already registered?{' '}
                      <button
                        onClick={() => { setView('login'); setError(null); }}
                        className="text-[var(--accent)] font-semibold hover:underline cursor-pointer"
                      >
                        Sign in here
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm p-6 sentry-card shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)] font-mono mb-2">Reset Password</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              Enterprise SMTP relay gateway is unconfigured in this standalone evaluation environment. For SIH evaluation, please use the pre-seeded credentials or register a new auditor account.
            </p>

            {forgotSubmitted ? (
              <div className="p-3 rounded-lg bg-[var(--warning-muted)] border border-[var(--warning)]/30 text-[var(--warning)] text-xs mb-4">
                Enterprise SMTP relay unavailable in evaluation mode. Please use the pre-seeded credentials to sign in.
              </div>
            ) : (
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="auditor@sentry-sih.gov.in"
                className="sentry-input text-xs mb-4"
              />
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setForgotPasswordOpen(false); setForgotSubmitted(false); }}
                className="sentry-btn-ghost text-xs"
              >
                Close
              </button>
              {!forgotSubmitted && (
                <button
                  type="button"
                  onClick={() => setForgotSubmitted(true)}
                  className="sentry-btn-primary text-xs"
                >
                  Send Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standardized Footer */}
      <Footer />

    </div>
  );
};
