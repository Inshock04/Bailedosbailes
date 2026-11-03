import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const IngressoPublicPage = lazy(() =>
  import('./components/IngressoPublicPage.tsx').then((m) => ({ default: m.IngressoPublicPage }))
);
const PortariaPage = lazy(() =>
  import('./components/PortariaPage.tsx').then((m) => ({ default: m.PortariaPage }))
);

function RouteFallback() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#05030a] text-[#fca5a5] flex items-center justify-center font-pixel text-xs tracking-widest">
      CARREGANDO...
    </div>
  );
}

function Router() {
  const path = window.location.pathname;

  // /ingresso/{token} — Página pública do ingresso
  if (path.startsWith('/ingresso/')) {
    const token = path.replace('/ingresso/', '').split('/')[0].split('?')[0];
    return (
      <Suspense fallback={<RouteFallback />}>
        <IngressoPublicPage token={token} />
      </Suspense>
    );
  }

  // /portaria — Área da portaria
  if (path === '/portaria' || path === '/portaria/') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <PortariaPage />
      </Suspense>
    );
  }

  // Qualquer outro caminho — App principal
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
);
