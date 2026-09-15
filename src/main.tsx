import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { IngressoPublicPage } from './components/IngressoPublicPage.tsx';
import { PortariaPage } from './components/PortariaPage.tsx';
import './index.css';

function Router() {
  const path = window.location.pathname;

  // /ingresso/{token} — Página pública do ingresso
  if (path.startsWith('/ingresso/')) {
    const token = path.replace('/ingresso/', '').split('/')[0].split('?')[0];
    return <IngressoPublicPage token={token} />;
  }

  // /portaria — Área da portaria
  if (path === '/portaria' || path === '/portaria/') {
    return <PortariaPage />;
  }

  // Qualquer outro caminho — App principal
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
);
