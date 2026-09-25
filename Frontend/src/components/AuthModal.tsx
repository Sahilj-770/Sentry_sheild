import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, User, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

import { loginUser, registerUser } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: { name: string; email: string; role: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const result = await loginUser(email, password);
        setSuccessToast(true);
        setTimeout(() => {
          onSuccess({
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          });
          setSuccessToast(false);
          onClose();
        }, 700);
      } else {
        const result = await registerUser(name, email, password);
        setSuccessToast(true);
        setTimeout(() => {
          onSuccess({
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
          });
          setSuccessToast(false);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFillAuditor = () => {
    setEmail('auditor@aegisnet-sih.gov.in');
    setPassword('CyberSecurity@2025');
    setName('SIH Lead Auditor');
    setErrorMessage(null);
  };

  const handleDemoFillAdmin = () => {
    setEmail('admin@aegisnet-sih.gov.in');
    setPassword('AdminSecurity@2025');
    setName('Chief SecOps Administrator');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-[#0b1126] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow header accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400"></div>

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {mode === 'login' ? 'Access Security Console' : 'Initialize Auditor Account'}
              </h3>
              <p className="text-xs text-slate-400">
                Sentry Network Compliance Platform (SIH)
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 mb-6 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Demo Quick Fill for SIH Judges / Evaluators */}
          <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIH Demo Fill:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDemoFillAuditor}
                className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 hover:text-white cursor-pointer"
              >
                Auditor Demo
              </button>
              <button
                type="button"
                onClick={handleDemoFillAdmin}
                className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-900/60 border border-blue-500/40 text-blue-300 hover:text-white cursor-pointer"
              >
                Admin Demo
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sahil / Team SIH"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Auditor Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@network-sec.gov.in"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Master Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Authenticate Session' : 'Create Auditor Key'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Success Toast banner */}
          {successToast && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-2 text-xs animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verification successful! Access granted to Sentry SIH console.</span>
            </div>
          )}

          <div className="mt-5 text-center text-[11px] text-slate-500">
            Protected by hardware-grade 256-bit TLS & Zero-Trust Token Auth
          </div>
        </div>
      </div>
    </div>
  );
};
