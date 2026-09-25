import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, ArrowRight, LogOut, UserCheck } from 'lucide-react';
import { getStoredUser, logoutUser, getCurrentUserProfile } from '../utils/api';
import type { UserProfile } from '../utils/api';
import { ThemeToggle } from './ThemeToggle';

export interface NavbarProps {
  activePage?: 'landing' | 'home' | 'dashboard' | 'upload' | 'results' | 'auth';
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());

  useEffect(() => {
    // Verify session state on mount
    getCurrentUserProfile()
      .then(profile => setUser(profile))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    window.location.href = '/index.html';
  };

  // Determine current active page from pathname if not explicitly passed
  const getCurrentPage = (): string => {
    if (activePage) return activePage;
    if (typeof window === 'undefined') return 'landing';
    const path = window.location.pathname.toLowerCase();
    if (path.includes('homepage')) return 'home';
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('upload')) return 'upload';
    if (path.includes('result')) return 'results';
    if (path.includes('login') || path.includes('signup')) return 'auth';
    return 'landing';
  };

  const current = getCurrentPage();

  const navItems = [
    { id: 'landing', label: 'Landing', href: '/index.html' },
    { id: 'home', label: 'Home', href: '/homepage.html' },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard.html' },
    { id: 'upload', label: 'Upload & Audit', href: '/upload.html' },
    { id: 'results', label: 'Results', href: '/result.html' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full sentry-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <a 
          href="/index.html"
          className="flex items-center gap-3 group select-none"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] group-hover:border-[var(--border-strong)] transition-all">
            <Shield className="w-5 h-5 text-[var(--text-primary)] group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--accent)]"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                Sentry <span className="font-normal text-[var(--text-secondary)]">Shield</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold tracking-wider uppercase border border-[var(--border-subtle)] text-[var(--text-muted)] bg-[var(--bg-surface)]">
                v2.4
              </span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = current === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                )}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Actions: Theme Toggle + User Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2">
              {/* User Identity Chip */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                <span className="text-[var(--text-primary)] font-medium max-w-[120px] truncate">{user.name}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {user.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="sentry-btn-ghost text-xs"
                title="Sign out of Sentry"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <a
                href="/login.html"
                onClick={(e) => {
                  if (onOpenAuth) {
                    e.preventDefault();
                    onOpenAuth('login');
                  }
                }}
                className="sentry-btn-ghost text-xs"
              >
                Sign In
              </a>
              <a
                href="/signup.html"
                onClick={(e) => {
                  if (onOpenAuth) {
                    e.preventDefault();
                    onOpenAuth('signup');
                  }
                }}
                className="sentry-btn-primary text-xs"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Quick Login button for mobile if unauthenticated */}
          {!user && (
            <a
              href="/login.html"
              className="sm:hidden sentry-btn-primary text-xs px-2.5 py-1"
            >
              Sign In
            </a>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 flex flex-col gap-1.5 shadow-lg animate-in fade-in duration-150">
          {navItems.map((item) => {
            const isActive = current === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive 
                    ? 'text-[var(--text-primary)] bg-[var(--bg-card)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                )}
              </a>
            );
          })}

          <div className="pt-2 mt-1 border-t border-[var(--border-subtle)] flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[var(--success)]" />
                  <span className="text-xs text-[var(--text-primary)]">{user.name}</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">({user.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="sentry-btn-danger text-xs px-2.5 py-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <a
                  href="/login.html"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 sentry-btn-secondary text-xs text-center justify-center py-2"
                >
                  Sign In
                </a>
                <a
                  href="/signup.html"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 sentry-btn-primary text-xs text-center justify-center py-2"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
