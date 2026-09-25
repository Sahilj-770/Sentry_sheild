import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { DashboardPage } from '../components/DashboardPage';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <DashboardPage />
    </StrictMode>
  );
}
