import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { UploadPipelinePage } from '../components/UploadPipelinePage';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <UploadPipelinePage />
    </StrictMode>
  );
}
