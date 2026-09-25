import React, { useState, useEffect } from 'react';
import { Shield, Cpu, LogIn, Menu, X, ArrowRight, LogOut, UserCheck } from 'lucide-react';
import { getStoredUser, logoutUser, getCurrentUserProfile } from '../utils/api';
import type { UserProfile } from '../utils/api';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onNavigateSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());

  useEffect(() => {
    // Verify session on mount
    getCurrentUserProfile()
      .then(profile => setUser(profile))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = '/index.html';
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0f1117]/90 border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo matching wireframe "Name + logo" */}
        <a 
          href="/index.html"
          className="flex items-center gap-3 group select-none"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-indigo-900/40 border border-cyan-400/40 shadow-lg shadow-cyan-500/10 group-hover:border-cyan-400 transition-all">
            <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <Cpu className="w-3.5 h-3.5 text-emerald-400 absolute" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Sentry <span className="font-semibold text-slate-300">Shield</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 font-mono font-bold uppercase">
                SIH AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
              Network Security &amp; Compliance Platform
            </p>
          </div>
        </a>

        {/* Desktop Nav Links - Separate Page Hyperlinks */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-300">
          <a 
            href="/index.html" 
            className="hover:text-cyan-400 transition-colors"
          >
            Landing
          </a>
          <a 
            href="/homepage.html" 
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            Home Page
          </a>
          <a 
            href="/dashboard.html" 
            className="hover:text-cyan-400 transition-colors"
          >
            Dashboard
          </a>
          <a 
            href="/upload.html" 
            className="hover:text-cyan-400 transition-colors"
          >
            Upload & Audit
          </a>
          <a 
            href="/result.html" 
            className="hover:text-cyan-400 transition-colors"
          >
            Security Results
          </a>
          <a 
            href="/index.html#contact" 
            onClick={(e) => {
              if (onNavigateSection) {
                e.preventDefault();
                onNavigateSection('contact');
              }
            }}
            className="hover:text-cyan-400 transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Action Buttons for User Session or Login / Signup + Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-white font-medium">{user.name}</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                  user.role === 'admin' 
                    ? 'bg-purple-950 text-purple-300 border border-purple-700/60' 
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                }`}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer"
                title="Sign out of Sentry"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <>
              <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
                <a
                  href="/login.html"
                  onClick={(e) => {
                    if (onOpenAuth) {
                      e.preventDefault();
                      onOpenAuth('login');
                    }
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </a>
                <div className="w-[1px] h-4 bg-slate-700"></div>
                <a
                  href="/signup.html"
                  onClick={(e) => {
                    if (onOpenAuth) {
                      e.preventDefault();
                      onOpenAuth('signup');
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {/* Quick Login for small devices */}
              <a
                href="/login.html"
                className="sm:hidden px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-slate-950 flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </a>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#131722] border-b border-slate-800 px-6 py-4 flex flex-col gap-3 text-sm">
          <a href="/index.html" className="text-left py-2 text-slate-300 hover:text-cyan-400">
            Landing
          </a>
          <a href="/homepage.html" className="text-left py-2 text-slate-300 hover:text-cyan-400">
            Home Page
          </a>
          <a href="/dashboard.html" className="text-left py-2 text-slate-300 hover:text-cyan-400">
            Dashboard
          </a>
          <a href="/upload.html" className="text-left py-2 text-slate-300 hover:text-cyan-400">
            Upload & Audit Pipeline
          </a>
          <a href="/result.html" className="text-left py-2 text-slate-300 hover:text-cyan-400">
            Security Results
          </a>
          <a href="/index.html#contact" className="text-left py-2 text-slate-300 hover:text-cyan-400">
            Contact Team
          </a>
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <a
              href="/login.html"
              className="flex-1 py-2 rounded-lg border border-slate-700 text-center text-xs font-bold text-slate-200"
            >
              Sign In
            </a>
            <a
              href="/signup.html"
              className="flex-1 py-2 rounded-lg bg-cyan-500 text-slate-950 text-center text-xs font-bold"
            >
              Register Free
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
