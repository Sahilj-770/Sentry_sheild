import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { ResultPage } from '../components/ResultPage';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ResultPage />
    </StrictMode>
  );
}
