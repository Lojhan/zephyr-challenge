import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Support both SSR hydration and CSR modes
if (container.innerHTML.trim()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
