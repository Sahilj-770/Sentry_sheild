import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { HomePageView } from '../components/HomePageView';

function HomePageApp() {
  return (
    <HomePageView
      onBackToLanding={() => { window.location.href = '/index.html'; }}
      onExplore={() => { window.location.href = '/upload.html'; }}
      onOpenAuth={(mode) => { window.location.href = mode === 'login' ? '/login.html' : '/signup.html'; }}
    />
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <HomePageApp />
    </StrictMode>
  );
}
