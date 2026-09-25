import { useState, useEffect } from 'react';
import { TopNoticeBar } from './components/TopNoticeBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { NetworkFeaturesSection } from './components/NetworkFeaturesSection';
import { DashboardPreview } from './components/DashboardPreview';
import { ContactUsSection } from './components/ContactUsSection';
import { Footer } from './components/Footer';
import { AuthPage } from './components/AuthPage';
import { HomePageView } from './components/HomePageView';

export function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'homepage' | 'login' | 'signup'>('landing');
  const [authenticatedUser, setAuthenticatedUser] = useState<{ name: string; email: string } | null>(null);

  // Sync with browser hash (#homepage, #login, #signup, #hero)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#login') {
        setCurrentPage('login');
      } else if (hash === '#signup') {
        setCurrentPage('signup');
      } else if (hash === '#homepage' || hash === '#home') {
        setCurrentPage('homepage');
      } else {
        setCurrentPage('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setCurrentPage(mode);
    window.location.hash = mode;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToHomePage = () => {
    setCurrentPage('homepage');
    window.location.hash = 'homepage';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'homepage') {
      handleGoToHomePage();
      return;
    }

    if (currentPage !== 'landing') {
      setCurrentPage('landing');
      window.location.hash = '';
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. If user is on dedicated Login or Sign Up page
  if (currentPage === 'login' || currentPage === 'signup') {
    return (
      <AuthPage
        initialView={currentPage}
        onBackToHome={handleBackToLanding}
        onAuthSuccess={(user) => {
          setAuthenticatedUser(user);
          // Redirect to Home Page after successful authentication
          setTimeout(() => {
            handleGoToHomePage();
          }, 800);
        }}
      />
    );
  }

  // 2. If user is on the new dedicated Home Page matching the latest sketch
  if (currentPage === 'homepage') {
    return (
      <HomePageView
        onBackToLanding={handleBackToLanding}
        onExplore={() => handleNavigateSection('network-features')}
        onOpenAuth={handleOpenAuth}
        currentUser={authenticatedUser}
      />
    );
  }

  // 3. Default: The complete landing page flow
  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* 1. Top Bar matching wireframe: 'name of project SIH - vercel' */}
      <TopNoticeBar />

      {/* 2. Top Header Navigation with Name + Logo & Login / Signup */}
      <Navbar 
        onOpenAuth={handleOpenAuth} 
        onNavigateSection={handleNavigateSection} 
      />

      {/* Authenticated user notification banner if logged in */}
      {authenticatedUser && (
        <div className="w-full bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-1.5 text-xs text-emerald-300 text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Logged in as <strong>{authenticatedUser.name}</strong> ({authenticatedUser.email})</span>
          <button
            onClick={handleGoToHomePage}
            className="ml-2 font-bold underline text-cyan-400 hover:text-white cursor-pointer"
          >
            Go to Home Page
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setAuthenticatedUser(null)}
            className="underline text-slate-400 hover:text-white cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Main Landing Page Flow */}
      <main className="flex-1 flex flex-col">
        
        {/* Page 1: Hero Section */}
        {/* Heading: 'Find the gaps. Secure the network' */}
        {/* Subhead: 'AI-powered network security compliance auditing for modern network environments.' */}
        {/* Robot on side with shield behind it, showing open lock which closes */}
        <HeroSection 
          onExploreFeatures={() => handleNavigateSection('network-features')}
        />

        {/* Page 2 (upon scrolling): Features in the Network (Landing Pg 2.0) */}
        {/* Center Node: 'Name' (Sentry Core) */}
        {/* 5 Connected Shield Nodes: QR verification, Multi vendor support, AI powered analysis, Actionable reports, Compliance monitoring */}
        <NetworkFeaturesSection />

        {/* Dashboard Section (matching wireframe Dashboard banner below network) */}
        <DashboardPreview />

        {/* Contact Us Footer Section (matching wireframe Contact Us) */}
        <ContactUsSection />

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;
