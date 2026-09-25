import React from 'react';
import { ArrowRight, Terminal } from 'lucide-react';
import { RobotShieldIllustration } from './RobotShieldIllustration';

interface HeroSectionProps {
  onExploreFeatures?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section id="hero" className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-10 lg:py-16 cyber-grid overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subheading & Precision CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Technical System Chip */}
            <div className="sentry-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
              <span className="text-[var(--text-primary)] font-bold">SENTRY SHIELD</span>
              <span className="text-[var(--text-muted)]">//</span>
              <span className="text-[var(--text-secondary)]">PLATFORM v2.4</span>
            </div>

            {/* Structured Display Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-[1.08] uppercase">
                Find the gaps.
                <span className="block text-[var(--text-secondary)] font-light mt-1">
                  Secure the network.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--accent)] font-mono font-medium tracking-tight">
                AI-Driven Multi-Vendor Network Security Compliance Auditor
              </p>
            </div>

            {/* Concise Technical Explanation */}
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl font-normal leading-relaxed">
              Continuously analyzes heterogeneous device configurations, detects security misconfigurations and compliance drift against CIS and NIST baselines, and generates deterministic CLI remediation playbooks before attackers exploit vulnerabilities.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/upload.html"
                className="sentry-btn-primary"
              >
                <span>Start Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="/homepage.html"
                className="sentry-btn-secondary"
              >
                <Terminal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Explore Platform</span>
              </a>
            </div>

            {/* Trust Metrics / Technical Specs Strip */}
            <div className="pt-6 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-6 w-full max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-mono">
                  100%
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium uppercase font-mono">
                  CIS Benchmarks
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--success)] font-mono">
                  &lt; 30s
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium uppercase font-mono">
                  Drift Detection
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-mono">
                  7 Vendors
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium uppercase font-mono">
                  Active Parsers
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Engineered Robot Shield Illustration */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <RobotShieldIllustration />
          </div>

        </div>
      </div>
    </section>
  );
};
