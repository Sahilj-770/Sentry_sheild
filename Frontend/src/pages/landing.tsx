import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
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

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col">
      <Navbar activePage="landing" onOpenAuth={handleOpenAuth} />
      <main className="flex-1 flex flex-col">
        <HeroSection />
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
