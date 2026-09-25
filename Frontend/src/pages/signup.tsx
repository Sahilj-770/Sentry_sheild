import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { AuthPage } from '../components/AuthPage';

function SignupPageApp() {
  return (
    <AuthPage
      initialView="signup"
      onBackToHome={() => { window.location.href = '/index.html'; }}
      onAuthSuccess={() => { window.location.href = '/dashboard.html'; }}
    />
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <SignupPageApp />
    </StrictMode>
  );
}
