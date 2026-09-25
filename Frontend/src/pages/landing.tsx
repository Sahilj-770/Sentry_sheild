import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { TopNoticeBar } from '../components/TopNoticeBar';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { NetworkFeaturesSection } from '../components/NetworkFeaturesSection';
import { DashboardPreview } from '../components/DashboardPreview';
import { ContactUsSection } from '../components/ContactUsSection';
import { Footer } from '../components/Footer';

function LandingPageApp() {
  const handleOpenAuth = (mode: 'login' | 'signup') => {
    window.location.href = mode === 'login' ? '/login.html' : '/signup.html';
  };

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'homepage') {
      window.location.href = '/homepage.html';
      return;
    }
    if (sectionId === 'dashboard') {
      window.location.href = '/dashboard.html';
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <TopNoticeBar />
      <Navbar onOpenAuth={handleOpenAuth} onNavigateSection={handleNavigateSection} />
      <main className="flex-1 flex flex-col">
        <HeroSection 
          onExploreFeatures={() => handleNavigateSection('network-features')}
        />
        <NetworkFeaturesSection />
        <DashboardPreview />
        <ContactUsSection />
      </main>
      <Footer />
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <LandingPageApp />
    </StrictMode>
  );
}
